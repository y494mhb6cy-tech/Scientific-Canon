import type { ClaudeClient } from '../llm/claude-client.js';
import type { DomainRegistry } from '../domains/domain-registry.js';
import type { InvariantCandidate, UnifyingSchema, ApplicationTest } from '../types/engine.types.js';
import type { TriadicMapping, BalanceResult, BalanceViolation } from '../types/canon.types.js';
import { generateSchemaPrompt, applicationTestPrompt } from '../llm/prompts.js';
import { parseSchemaForm, parseApplicationTest } from '../llm/response-parser.js';
import { checkBalance } from '../canon/balance-checker.js';
import { computeSemanticCost } from '../canon/semantic-cost.js';

/**
 * Schema generation step.
 *
 * Takes the selected invariant and its per-domain triadic mappings,
 * asks the LLM to produce a compact schema form (symbolic or textual
 * representation), then runs canon checks:
 *   1. Balance check across all mappings.
 *   2. Semantic cost computation per domain.
 *
 * @param client    - The LLM client.
 * @param invariant - The chosen invariant candidate.
 * @param mappings  - Triadic mappings for each domain.
 * @returns The complete UnifyingSchema.
 */
export async function generateSchema(
  client: ClaudeClient,
  invariant: InvariantCandidate,
  mappings: TriadicMapping[],
): Promise<UnifyingSchema> {
  // Ask the LLM to produce the schema form.
  const { system, user } = generateSchemaPrompt(invariant.statement, mappings);
  const raw = await client.complete(system, user);
  const schemaForm = parseSchemaForm(raw);

  // Run balance check across all mappings.
  const allViolations: BalanceViolation[] = [];
  let allBalanced = true;

  for (const mapping of mappings) {
    const result = checkBalance(mapping);
    if (!result.balanced) {
      allBalanced = false;
      allViolations.push(...result.violations);
    }
  }

  const balanceResult: BalanceResult = {
    balanced: allBalanced,
    violations: allViolations,
  };

  // Compute semantic cost for each domain mapping.
  const semanticCosts = mappings.map((mapping) => ({
    domain: mapping.domain,
    cost: computeSemanticCost(mapping),
  }));

  return {
    invariant: invariant.statement,
    mappings,
    schemaForm,
    balanceResult,
    semanticCosts,
  };
}

/**
 * Application testing step.
 *
 * Tests the schema against at least 2 domains by asking the LLM
 * whether the invariant holds under each domain's mapping.
 *
 * @param client    - The LLM client.
 * @param schema    - The generated unifying schema.
 * @param registry  - Domain registry for metadata lookup.
 * @param domainIds - The domains to test against (uses at least 2).
 * @returns Array of application test results.
 */
export async function runApplicationTests(
  client: ClaudeClient,
  schema: UnifyingSchema,
  registry: DomainRegistry,
  domainIds: string[],
): Promise<ApplicationTest[]> {
  // Ensure we test at least 2 domains.
  const testIds = domainIds.length >= 2 ? domainIds : domainIds;
  if (testIds.length < 2) {
    throw new Error(
      'runApplicationTests: at least 2 domains are required for application testing.',
    );
  }

  const tests = await Promise.all(
    testIds.map(async (domainId) => {
      const mapping = schema.mappings.find((m) => m.domain === domainId);

      if (!mapping) {
        return {
          domain: domainId,
          mapping: schema.mappings[0],
          holds: false,
          explanation: `No mapping found for domain "${domainId}".`,
        } satisfies ApplicationTest;
      }

      const { system, user } = applicationTestPrompt(schema, domainId, mapping);

      const raw = await client.complete(system, user);
      return parseApplicationTest(raw);
    }),
  );

  return tests;
}
