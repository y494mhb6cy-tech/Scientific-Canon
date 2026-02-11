import type { ClaudeClient } from '../llm/claude-client.js';
import type { DomainRegistry } from '../domains/domain-registry.js';
import type { DomainConcept } from '../types/domain.types.js';
import { extractConceptsPrompt } from '../llm/prompts.js';
import { parseExtractionResult } from '../llm/response-parser.js';

/**
 * Domain ingestion step.
 *
 * For each requested domain, fetches the domain pack from the registry,
 * calls the LLM to extract and expand concepts, then parses the response
 * into structured DomainConcept arrays.
 *
 * @param client    - The LLM client used to generate concept expansions.
 * @param registry  - The domain registry containing domain packs.
 * @param domainIds - The ids of domains to ingest.
 * @returns A map of domainId to its extracted concepts.
 */
export async function ingestDomains(
  client: ClaudeClient,
  registry: DomainRegistry,
  domainIds: string[],
): Promise<Record<string, DomainConcept[]>> {
  const results: Record<string, DomainConcept[]> = {};

  // Validate all domain ids before doing any LLM work.
  for (const id of domainIds) {
    if (!registry.has(id)) {
      throw new Error(`ingestDomains: unknown domain "${id}". Available: ${registry.list().map(d => d.id).join(', ')}`);
    }
  }

  // Process domains in parallel — each is independent.
  const entries = await Promise.all(
    domainIds.map(async (domainId) => {
      const domain = registry.get(domainId)!;
      const { system, user } = extractConceptsPrompt(domain);
      const raw = await client.complete(system, user);
      const extraction = parseExtractionResult(raw, domainId);
      return [domainId, extraction.concepts] as const;
    }),
  );

  for (const [domainId, concepts] of entries) {
    results[domainId] = concepts;
  }

  return results;
}
