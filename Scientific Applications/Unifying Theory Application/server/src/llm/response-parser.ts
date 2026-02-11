import type { TriadicMapping } from '../types/canon.types.js';
import type { DomainConcept, ExtractionResult } from '../types/domain.types.js';
import type { InvariantCandidate, ApplicationTest } from '../types/engine.types.js';

// ---------------------------------------------------------------------------
// Core JSON extractor
// ---------------------------------------------------------------------------

/**
 * Extract and parse JSON from an LLM response.
 *
 * Looks for content inside ```json ... ``` code blocks first.
 * Falls back to parsing the entire string as JSON.
 * Throws a descriptive error if parsing fails.
 */
export function parseJSON<T>(raw: string): T {
  // Attempt to extract from a ```json code block.
  const codeBlockMatch = raw.match(/```json\s*([\s\S]*?)```/);
  const jsonText = codeBlockMatch ? codeBlockMatch[1].trim() : raw.trim();

  try {
    return JSON.parse(jsonText) as T;
  } catch {
    // Second attempt: look for any JSON-like structure (object or array).
    const fallbackMatch = jsonText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (fallbackMatch) {
      try {
        return JSON.parse(fallbackMatch[1]) as T;
      } catch {
        // Fall through to the error below.
      }
    }
    throw new Error(
      `Failed to parse JSON from LLM response. Raw text (first 500 chars): ${raw.slice(0, 500)}`
    );
  }
}

// ---------------------------------------------------------------------------
// Typed parsers
// ---------------------------------------------------------------------------

/**
 * Parse concept extraction output into an ExtractionResult.
 */
export function parseExtractionResult(raw: string, domain: string): ExtractionResult {
  try {
    const concepts = parseJSON<DomainConcept[]>(raw);
    // Validate minimal shape.
    if (!Array.isArray(concepts)) {
      throw new Error('Expected a JSON array of DomainConcept objects.');
    }
    return {
      domain,
      concepts: concepts.map(normalizeConcept),
      rawResponse: raw,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      domain,
      concepts: [],
      rawResponse: raw,
    };
  }
}

/**
 * Parse invariant detection output into InvariantCandidate[].
 */
export function parseInvariantCandidates(raw: string): InvariantCandidate[] {
  try {
    const candidates = parseJSON<InvariantCandidate[]>(raw);
    if (!Array.isArray(candidates)) {
      throw new Error('Expected a JSON array of InvariantCandidate objects.');
    }
    return candidates.map((c) => ({
      statement: c.statement ?? '',
      domains: Array.isArray(c.domains) ? c.domains : [],
      confidence: typeof c.confidence === 'number' ? c.confidence : 0,
      rationale: c.rationale ?? '',
    }));
  } catch {
    return [];
  }
}

/**
 * Parse triadic mapping output into a TriadicMapping.
 */
export function parseTriadicMapping(raw: string, domain: string): TriadicMapping {
  try {
    const mapping = parseJSON<TriadicMapping>(raw);
    return {
      frame: {
        role: 'Frame',
        concept: mapping.frame?.concept ?? 'Unknown',
        confidence: mapping.frame?.confidence ?? 0,
        rationale: mapping.frame?.rationale ?? '',
      },
      gradient: {
        role: 'Gradient',
        concept: mapping.gradient?.concept ?? 'Unknown',
        confidence: mapping.gradient?.confidence ?? 0,
        rationale: mapping.gradient?.rationale ?? '',
      },
      vector: {
        role: 'Vector',
        concept: mapping.vector?.concept ?? 'Unknown',
        confidence: mapping.vector?.confidence ?? 0,
        rationale: mapping.vector?.rationale ?? '',
      },
      domain: mapping.domain ?? domain,
    };
  } catch {
    return {
      frame: { role: 'Frame', concept: 'Unknown', confidence: 0, rationale: 'Parse failed' },
      gradient: { role: 'Gradient', concept: 'Unknown', confidence: 0, rationale: 'Parse failed' },
      vector: { role: 'Vector', concept: 'Unknown', confidence: 0, rationale: 'Parse failed' },
      domain,
    };
  }
}

/**
 * Parse schema form output into a plain string.
 */
export function parseSchemaForm(raw: string): string {
  try {
    const result = parseJSON<string>(raw);
    if (typeof result === 'string') {
      return result;
    }
    // If the LLM wrapped it in an object, try to extract a string field.
    if (typeof result === 'object' && result !== null) {
      const obj = result as Record<string, unknown>;
      return (
        (obj['schemaForm'] as string) ??
        (obj['schema'] as string) ??
        (obj['form'] as string) ??
        JSON.stringify(result)
      );
    }
    return String(result);
  } catch {
    // Last resort: return any text between the code fences, or the raw string trimmed.
    const codeBlockMatch = raw.match(/```json\s*([\s\S]*?)```/);
    return codeBlockMatch ? codeBlockMatch[1].trim().replace(/^"|"$/g, '') : raw.trim();
  }
}

/**
 * Parse application test output into an ApplicationTest.
 */
export function parseApplicationTest(raw: string): ApplicationTest {
  try {
    const result = parseJSON<ApplicationTest>(raw);
    return {
      domain: result.domain ?? 'unknown',
      mapping: result.mapping ?? {
        frame: { role: 'Frame', concept: 'Unknown', confidence: 0, rationale: '' },
        gradient: { role: 'Gradient', concept: 'Unknown', confidence: 0, rationale: '' },
        vector: { role: 'Vector', concept: 'Unknown', confidence: 0, rationale: '' },
        domain: result.domain ?? 'unknown',
      },
      holds: typeof result.holds === 'boolean' ? result.holds : false,
      explanation: result.explanation ?? '',
    };
  } catch {
    return {
      domain: 'unknown',
      mapping: {
        frame: { role: 'Frame', concept: 'Unknown', confidence: 0, rationale: 'Parse failed' },
        gradient: { role: 'Gradient', concept: 'Unknown', confidence: 0, rationale: 'Parse failed' },
        vector: { role: 'Vector', concept: 'Unknown', confidence: 0, rationale: 'Parse failed' },
        domain: 'unknown',
      },
      holds: false,
      explanation: 'Failed to parse application test result from LLM response.',
    };
  }
}

/**
 * Parse audit text output into an invariant + array of triadic mappings.
 */
export function parseAuditResult(raw: string): { invariant: string; mappings: TriadicMapping[] } {
  try {
    const result = parseJSON<{ invariant: string; mappings: TriadicMapping[] }>(raw);
    return {
      invariant: result.invariant ?? '',
      mappings: Array.isArray(result.mappings)
        ? result.mappings.map((m) => ({
            frame: {
              role: 'Frame' as const,
              concept: m.frame?.concept ?? 'Unknown',
              confidence: m.frame?.confidence ?? 0,
              rationale: m.frame?.rationale ?? '',
            },
            gradient: {
              role: 'Gradient' as const,
              concept: m.gradient?.concept ?? 'Unknown',
              confidence: m.gradient?.confidence ?? 0,
              rationale: m.gradient?.rationale ?? '',
            },
            vector: {
              role: 'Vector' as const,
              concept: m.vector?.concept ?? 'Unknown',
              confidence: m.vector?.confidence ?? 0,
              rationale: m.vector?.rationale ?? '',
            },
            domain: m.domain ?? 'unknown',
          }))
        : [],
    };
  } catch {
    return {
      invariant: '',
      mappings: [],
    };
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function normalizeConcept(c: Partial<DomainConcept>): DomainConcept {
  return {
    name: c.name ?? 'Unnamed',
    description: c.description ?? '',
    suggestedRole:
      c.suggestedRole === 'Frame' || c.suggestedRole === 'Gradient' || c.suggestedRole === 'Vector'
        ? c.suggestedRole
        : undefined,
  };
}
