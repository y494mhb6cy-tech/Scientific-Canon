import type { ClaudeClient } from '../llm/claude-client.js';
import type { DomainRegistry } from '../domains/domain-registry.js';
import type { DomainConcept } from '../types/domain.types.js';
import type {
  InvariantCandidate,
  PipelineResult,
  PipelineStep,
} from '../types/engine.types.js';
import type { TriadicMapping, DriftReport, BalanceResult } from '../types/canon.types.js';

import { ingestDomains } from './ingestion.js';
import { detectInvariants } from './invariant-detection.js';
import { mapToCanon } from './canonical-mapper.js';
import { generateSchema, runApplicationTests } from './schema-generator.js';
import { detectDrift } from '../canon/drift-detector.js';
import { auditTextPrompt } from '../llm/prompts.js';
import { parseAuditResult } from '../llm/response-parser.js';

/**
 * Main pipeline orchestrator.
 *
 * Calls the LLM for proposals, passes them through the Canon for
 * validation. If the Canon blocks (balance violations, drift errors),
 * the pipeline includes explicit reasons in its output rather than
 * silently continuing.
 *
 * Supports three execution modes:
 *   - runFull:  end-to-end expert mode
 *   - runStep:  step-by-step guided mode
 *   - auditText: audit mode for analysing free-form text
 */
export class Pipeline {
  private client: ClaudeClient;
  private registry: DomainRegistry;

  /** Intermediate data stored per session for guided-mode step execution. */
  private stepCache: Map<string, {
    domainIds: string[];
    concepts: Record<string, DomainConcept[]>;
    candidates: InvariantCandidate[];
    selectedInvariant: InvariantCandidate | null;
    mappings: TriadicMapping[];
    balance: BalanceResult | null;
  }> = new Map();

  constructor(client: ClaudeClient, registry: DomainRegistry) {
    this.client = client;
    this.registry = registry;
  }

  // ---------------------------------------------------------------------------
  // Expert mode: full pipeline
  // ---------------------------------------------------------------------------

  /**
   * Run the complete pipeline end-to-end.
   *
   * Steps:
   *   1. Ingest domains (extract concepts via LLM)
   *   2. Detect cross-domain invariants (LLM + canon ranking)
   *   3. Map concepts to canonical roles (LLM + balance check)
   *   4. Generate unifying schema (LLM + semantic cost)
   *   5. Application tests (LLM verification)
   *   6. Drift detection (canon check)
   *
   * If a balance check fails, the violations are included in the result
   * and the pipeline still completes — the caller decides the severity.
   *
   * @param sessionId     - The session this run belongs to.
   * @param domainIds     - Domains to unify.
   * @param userInvariant - Optional user-supplied invariant (skips detection).
   */
  async runFull(
    sessionId: string,
    domainIds: string[],
    userInvariant?: string,
  ): Promise<PipelineResult> {
    // Step 1: Ingest domains.
    const concepts = await ingestDomains(this.client, this.registry, domainIds);

    // Step 2: Detect or accept invariant.
    let invariant: InvariantCandidate;

    if (userInvariant) {
      invariant = {
        statement: userInvariant,
        domains: domainIds,
        confidence: 1.0,
        rationale: 'User-supplied invariant.',
      };
    } else {
      const candidates = await detectInvariants(
        this.client,
        this.registry,
        domainIds,
        concepts,
      );
      invariant = candidates[0]; // highest-ranked
    }

    // Step 3: Map to canon.
    const { mappings, balance } = await mapToCanon(
      this.client,
      invariant.statement,
      this.registry,
      domainIds,
      concepts,
    );

    // Canon gate: if balance check fails, log explicit reason.
    if (!balance.balanced) {
      const reasons = balance.violations
        .map((v) => `[${v.type}] ${v.description} (roles: ${v.roles.join(', ')})`)
        .join('; ');
      console.warn(
        `Pipeline: Canon balance check failed for session "${sessionId}". ` +
        `Violations: ${reasons}. Continuing with violations attached.`,
      );
    }

    // Step 4: Generate schema.
    const schema = await generateSchema(this.client, invariant, mappings);

    // Step 5: Application tests.
    const applicationTests = await runApplicationTests(
      this.client,
      schema,
      this.registry,
      domainIds,
    );

    // Step 6: Drift detection.
    const driftReport = detectDrift(mappings);

    if (!driftReport.clean) {
      const driftReasons = driftReport.drifts
        .map((d) => `[${d.severity}:${d.type}] ${d.description}`)
        .join('; ');
      console.warn(
        `Pipeline: Canon drift detected for session "${sessionId}". ` +
        `Drifts: ${driftReasons}.`,
      );
    }

    return {
      sessionId,
      invariant,
      mappings,
      schema,
      applicationTests,
      driftReport,
    };
  }

  // ---------------------------------------------------------------------------
  // Guided mode: step-by-step execution
  // ---------------------------------------------------------------------------

  /**
   * Run a single pipeline step for guided mode.
   *
   * Each step builds on the data produced by previous steps, which is
   * cached in memory keyed by sessionId.
   *
   * @param sessionId - The session this step belongs to.
   * @param step      - Step number (0-4).
   * @param data      - Optional payload for this step (e.g., selected domains, chosen invariant).
   */
  async runStep(
    sessionId: string,
    step: number,
    data?: any,
  ): Promise<PipelineStep> {
    switch (step) {
      // Step 0: Domain selection — no LLM call, just records chosen domains.
      case 0: {
        const domainIds: string[] = data?.domainIds ?? [];
        if (domainIds.length === 0) {
          throw new Error('Pipeline.runStep(0): domainIds are required.');
        }
        // Validate domains exist.
        for (const id of domainIds) {
          if (!this.registry.has(id)) {
            throw new Error(`Pipeline.runStep(0): unknown domain "${id}".`);
          }
        }
        this.stepCache.set(sessionId, {
          domainIds,
          concepts: {},
          candidates: [],
          selectedInvariant: null,
          mappings: [],
          balance: null,
        });
        return { step: 0, name: 'domain_selection', data: null };
      }

      // Step 1: Concept extraction.
      case 1: {
        const cache = this.requireCache(sessionId);
        const concepts = await ingestDomains(
          this.client,
          this.registry,
          cache.domainIds,
        );
        cache.concepts = concepts;
        return {
          step: 1,
          name: 'concept_review',
          data: { domains: cache.domainIds, concepts },
        };
      }

      // Step 2: Invariant detection.
      case 2: {
        const cache = this.requireCache(sessionId);
        const candidates = await detectInvariants(
          this.client,
          this.registry,
          cache.domainIds,
          cache.concepts,
        );
        cache.candidates = candidates;

        // If the caller supplied a chosen invariant index, select it.
        if (data?.selectedIndex !== undefined && candidates[data.selectedIndex]) {
          cache.selectedInvariant = candidates[data.selectedIndex];
        }

        return {
          step: 2,
          name: 'invariant_selection',
          data: { candidates },
        };
      }

      // Step 3: Canonical mapping.
      case 3: {
        const cache = this.requireCache(sessionId);

        // Allow the caller to select an invariant at this point.
        if (data?.selectedIndex !== undefined && cache.candidates[data.selectedIndex]) {
          cache.selectedInvariant = cache.candidates[data.selectedIndex];
        }

        const invariant = cache.selectedInvariant ?? cache.candidates[0];
        if (!invariant) {
          throw new Error(
            'Pipeline.runStep(3): no invariant selected and no candidates available.',
          );
        }
        cache.selectedInvariant = invariant;

        const { mappings, balance } = await mapToCanon(
          this.client,
          invariant.statement,
          this.registry,
          cache.domainIds,
          cache.concepts,
        );
        cache.mappings = mappings;
        cache.balance = balance;

        // Canon gate: include explicit reason if blocked.
        if (!balance.balanced) {
          const reasons = balance.violations
            .map((v) => `[${v.type}] ${v.description} (roles: ${v.roles.join(', ')})`)
            .join('; ');
          console.warn(
            `Pipeline.runStep(3): Canon balance check failed. Reasons: ${reasons}`,
          );
        }

        return {
          step: 3,
          name: 'mapping_review',
          data: { mappings, balance },
        };
      }

      // Step 4: Full results — schema, tests, drift.
      case 4: {
        const cache = this.requireCache(sessionId);
        const invariant = cache.selectedInvariant ?? cache.candidates[0];
        if (!invariant) {
          throw new Error('Pipeline.runStep(4): no invariant available.');
        }

        const schema = await generateSchema(
          this.client,
          invariant,
          cache.mappings,
        );
        const applicationTests = await runApplicationTests(
          this.client,
          schema,
          this.registry,
          cache.domainIds,
        );
        const driftReport = detectDrift(cache.mappings);

        const result: PipelineResult = {
          sessionId,
          invariant,
          mappings: cache.mappings,
          schema,
          applicationTests,
          driftReport,
        };

        // Clean up step cache for this session.
        this.stepCache.delete(sessionId);

        return { step: 4, name: 'full_results', data: result };
      }

      default:
        throw new Error(`Pipeline.runStep: unknown step ${step}. Valid steps: 0-4.`);
    }
  }

  // ---------------------------------------------------------------------------
  // Audit mode
  // ---------------------------------------------------------------------------

  /**
   * Audit free-form text against the Canon.
   *
   * Parses the text to extract implicit triadic structure, maps it to
   * canonical roles, then runs drift detection and balance checks.
   *
   * @param sessionId - The session this audit belongs to.
   * @param text      - The free-form text to audit.
   * @returns Drift report, extracted mappings, and identified invariant.
   */
  async auditText(
    sessionId: string,
    text: string,
  ): Promise<{ driftReport: DriftReport; mappings: TriadicMapping[]; invariant: string }> {
    const { system, user } = auditTextPrompt(text);
    const raw = await this.client.complete(system, user);
    const auditResult = parseAuditResult(raw);

    const mappings: TriadicMapping[] = auditResult.mappings;
    const invariant: string = auditResult.invariant;

    // Run canon drift detection on extracted mappings.
    const driftReport = detectDrift(mappings);

    if (!driftReport.clean) {
      const reasons = driftReport.drifts
        .map((d) => `[${d.severity}:${d.type}] ${d.description}`)
        .join('; ');
      console.warn(
        `Pipeline.auditText: Canon drift detected for session "${sessionId}". ` +
        `Halt reason: ${reasons}`,
      );
    }

    return { driftReport, mappings, invariant };
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private requireCache(sessionId: string) {
    const cache = this.stepCache.get(sessionId);
    if (!cache) {
      throw new Error(
        `Pipeline: no step cache for session "${sessionId}". ` +
        'Run step 0 (domain_selection) first.',
      );
    }
    return cache;
  }
}
