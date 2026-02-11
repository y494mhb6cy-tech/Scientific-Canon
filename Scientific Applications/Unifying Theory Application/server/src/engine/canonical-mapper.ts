import type { ClaudeClient } from '../llm/claude-client.js';
import type { DomainRegistry } from '../domains/domain-registry.js';
import type { DomainConcept } from '../types/domain.types.js';
import type { TriadicMapping, BalanceResult, BalanceViolation } from '../types/canon.types.js';
import { mapToCanonPrompt } from '../llm/prompts.js';
import { parseTriadicMapping } from '../llm/response-parser.js';
import { checkBalance } from '../canon/balance-checker.js';

/**
 * Canonical mapping step.
 *
 * For each domain, asks the LLM to assign its concepts to the triadic
 * roles (Frame, Gradient, Vector) relative to the chosen invariant.
 * Each mapping is then validated by the canon's balance checker.
 *
 * Design decision: this function does NOT throw when a mapping fails
 * the balance check. Instead it aggregates all violations into a
 * combined BalanceResult so the caller (pipeline / UI) can decide
 * whether to halt, warn, or proceed.
 *
 * @param client    - The LLM client.
 * @param invariant - The chosen invariant statement.
 * @param registry  - Domain registry for metadata lookup.
 * @param domainIds - The selected domain ids.
 * @param concepts  - Pre-extracted concepts keyed by domain id.
 * @returns The mappings and a combined balance result.
 */
export async function mapToCanon(
  client: ClaudeClient,
  invariant: string,
  registry: DomainRegistry,
  domainIds: string[],
  concepts: Record<string, DomainConcept[]>,
): Promise<{ mappings: TriadicMapping[]; balance: BalanceResult }> {
  const allViolations: BalanceViolation[] = [];
  let allBalanced = true;

  // Map each domain in parallel.
  const mappings = await Promise.all(
    domainIds.map(async (domainId) => {
      const pack = registry.get(domainId);
      const domainConcepts = concepts[domainId] ?? [];

      if (!pack) {
        throw new Error(`Domain pack "${domainId}" not found in registry.`);
      }

      const { system, user } = mapToCanonPrompt(invariant, pack, domainConcepts);

      const raw = await client.complete(system, user);
      const mapping = parseTriadicMapping(raw, domainId);

      // Run the canon balance check.
      const balanceResult = checkBalance(mapping);
      if (!balanceResult.balanced) {
        allBalanced = false;
        allViolations.push(...balanceResult.violations);
      }

      return mapping;
    }),
  );

  const balance: BalanceResult = {
    balanced: allBalanced,
    violations: allViolations,
  };

  return { mappings, balance };
}
