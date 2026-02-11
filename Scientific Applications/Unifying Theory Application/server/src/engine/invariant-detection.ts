import type { ClaudeClient } from '../llm/claude-client.js';
import type { DomainRegistry } from '../domains/domain-registry.js';
import type { DomainConcept } from '../types/domain.types.js';
import type { InvariantCandidate } from '../types/engine.types.js';
import { detectInvariantsPrompt } from '../llm/prompts.js';
import { parseInvariantCandidates } from '../llm/response-parser.js';
import { rankInvariants } from '../canon/invariant-ranker.js';

/**
 * Invariant detection step.
 *
 * Sends the extracted concepts across all selected domains to the LLM,
 * asking it to identify cross-domain invariants — statements that hold
 * true in every domain under examination.
 *
 * After the LLM proposes candidates, they are ranked by the canon's
 * invariant-ranker (which scores structural fit without needing mappings yet).
 *
 * @param client    - The LLM client.
 * @param registry  - Domain registry for metadata lookup.
 * @param domainIds - The selected domain ids.
 * @param concepts  - Pre-extracted concepts keyed by domain id.
 * @returns Ranked list of invariant candidates (best first).
 */
export async function detectInvariants(
  client: ClaudeClient,
  registry: DomainRegistry,
  domainIds: string[],
  concepts: Record<string, DomainConcept[]>,
): Promise<InvariantCandidate[]> {
  // Build domain metadata for the prompt.
  const domains = domainIds.map((id) => registry.get(id)!);

  const { system, user } = detectInvariantsPrompt(domains, concepts);
  const raw = await client.complete(system, user);
  const candidates = parseInvariantCandidates(raw);

  if (candidates.length === 0) {
    throw new Error(
      'detectInvariants: LLM returned no invariant candidates. ' +
      'The selected domains may be too dissimilar for cross-domain invariants.',
    );
  }

  // Rank candidates using canon heuristics.
  // rankInvariants expects an empty mappings array at this stage —
  // mappings have not been produced yet.
  const ranked = rankInvariants(candidates, []);
  return ranked;
}
