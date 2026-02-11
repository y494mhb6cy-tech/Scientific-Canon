import type { DomainPack, DomainConcept } from '../types/domain.types.js';
import type { TriadicMapping } from '../types/canon.types.js';
import type { UnifyingSchema } from '../types/engine.types.js';

// ---------------------------------------------------------------------------
// Shared preamble injected into every system prompt
// ---------------------------------------------------------------------------
const SYSTEM_PREAMBLE = `You are a structural analyst for the Unifying Theory Engine. The canon defines three irreducible roles: Frame (standpoint/scope), Gradient (constraints/rules/invariants), Vector (directed action/motion). All output must respect triadic balance.`;

const JSON_INSTRUCTION = `Return your answer as JSON wrapped in a \`\`\`json code block. Do not include any text outside the code block except brief reasoning if needed.`;

/**
 * Helper to build {system, user} prompt pairs.
 */
function prompt(system: string, user: string) {
  return { system: `${SYSTEM_PREAMBLE}\n\n${system}`, user };
}

// ---------------------------------------------------------------------------
// 1. Extract / expand concepts from a domain pack
// ---------------------------------------------------------------------------
export function extractConceptsPrompt(domain: DomainPack): { system: string; user: string } {
  return prompt(
    `You are tasked with extracting and expanding the key concepts of a knowledge domain. For each concept, provide its name, a concise description, and optionally suggest which canonical role (Frame, Gradient, or Vector) it most naturally aligns with. ${JSON_INSTRUCTION}`,
    `Domain: "${domain.name}"
Description: ${domain.description}

Existing concepts:
${domain.concepts.map((c) => `- ${c.name}: ${c.description}${c.suggestedRole ? ` (suggested: ${c.suggestedRole})` : ''}`).join('\n')}

Example invariants native to this domain:
${domain.exampleInvariants.map((inv) => `- ${inv}`).join('\n')}

Extract and expand the concept list for this domain. Include the provided concepts (refining descriptions where helpful) and add any important concepts that are missing. Return a JSON array of objects with this shape:

\`\`\`json
[
  {
    "name": "string",
    "description": "string",
    "suggestedRole": "Frame" | "Gradient" | "Vector" | null
  }
]
\`\`\``
  );
}

// ---------------------------------------------------------------------------
// 2. Detect cross-domain invariants
// ---------------------------------------------------------------------------
export function detectInvariantsPrompt(
  domains: DomainPack[],
  concepts: Record<string, DomainConcept[]>
): { system: string; user: string } {
  const domainSummaries = domains
    .map((d) => {
      const cs = concepts[d.id] ?? d.concepts;
      return `### ${d.name} (${d.id})
${d.description}
Concepts: ${cs.map((c) => c.name).join(', ')}`;
    })
    .join('\n\n');

  return prompt(
    `You are tasked with discovering structural invariants that hold across multiple domains. An invariant is a statement about a relationship or pattern that recurs in structurally analogous ways across different fields. Focus on non-trivial, structurally grounded invariants. ${JSON_INSTRUCTION}`,
    `The following domains and their concepts are provided:

${domainSummaries}

Identify cross-domain invariants — structural patterns, relationships, or principles that appear (perhaps in different language) across two or more of these domains. For each invariant, state which domains it spans, your confidence (0-1), and a rationale.

Return a JSON array:

\`\`\`json
[
  {
    "statement": "string — the invariant in plain language",
    "domains": ["domain_id_1", "domain_id_2"],
    "confidence": 0.0,
    "rationale": "string — why this qualifies as a cross-domain invariant"
  }
]
\`\`\``
  );
}

// ---------------------------------------------------------------------------
// 3. Map concepts to Frame / Gradient / Vector for a given invariant + domain
// ---------------------------------------------------------------------------
export function mapToCanonPrompt(
  invariant: string,
  domain: DomainPack,
  concepts: DomainConcept[]
): { system: string; user: string } {
  return prompt(
    `You are tasked with mapping domain concepts onto the three canonical roles — Frame, Gradient, Vector — relative to a specific invariant. Each role must be filled by exactly one concept. Choose the best-fitting concept for each role and explain why. ${JSON_INSTRUCTION}`,
    `Invariant: "${invariant}"

Domain: "${domain.name}" (${domain.id})
${domain.description}

Available concepts:
${concepts.map((c) => `- ${c.name}: ${c.description}${c.suggestedRole ? ` (suggested: ${c.suggestedRole})` : ''}`).join('\n')}

Assign exactly one concept to each canonical role for this invariant within this domain. Return a JSON object:

\`\`\`json
{
  "frame": {
    "role": "Frame",
    "concept": "string — concept name",
    "confidence": 0.0,
    "rationale": "string"
  },
  "gradient": {
    "role": "Gradient",
    "concept": "string — concept name",
    "confidence": 0.0,
    "rationale": "string"
  },
  "vector": {
    "role": "Vector",
    "concept": "string — concept name",
    "confidence": 0.0,
    "rationale": "string"
  },
  "domain": "${domain.id}"
}
\`\`\``
  );
}

// ---------------------------------------------------------------------------
// 4. Generate a compact unifying schema form
// ---------------------------------------------------------------------------
export function generateSchemaPrompt(
  invariant: string,
  mappings: TriadicMapping[]
): { system: string; user: string } {
  const mappingSummaries = mappings
    .map(
      (m) =>
        `- ${m.domain}: Frame=${m.frame.concept}, Gradient=${m.gradient.concept}, Vector=${m.vector.concept}`
    )
    .join('\n');

  return prompt(
    `You are tasked with producing a minimal unifying schema form — a compact symbolic or textual representation that captures the structural invariant across all provided domain mappings. The schema form should be domain-agnostic and express the relationship between Frame, Gradient, and Vector abstractly. ${JSON_INSTRUCTION}`,
    `Invariant: "${invariant}"

Triadic mappings across domains:
${mappingSummaries}

Produce a minimal, compact schema form (symbolic, algebraic, or concise natural language) that captures this invariant in terms of Frame (F), Gradient (G), and Vector (V). Return a JSON string:

\`\`\`json
"F ◇ G → V (or whatever compact form best captures the relationship)"
\`\`\``
  );
}

// ---------------------------------------------------------------------------
// 5. Application test — verify schema in a specific domain
// ---------------------------------------------------------------------------
export function applicationTestPrompt(
  schema: UnifyingSchema,
  domain: string,
  mapping: TriadicMapping
): { system: string; user: string } {
  return prompt(
    `You are tasked with testing whether a unifying schema holds in a specific domain. Given the schema's invariant, its schema form, and the triadic mapping for this domain, evaluate whether the structural relationship actually holds. Be rigorous: note where it holds well and where it strains. ${JSON_INSTRUCTION}`,
    `Schema invariant: "${schema.invariant}"
Schema form: ${schema.schemaForm}

Domain: "${domain}"
Mapping:
  Frame: ${mapping.frame.concept} — ${mapping.frame.rationale}
  Gradient: ${mapping.gradient.concept} — ${mapping.gradient.rationale}
  Vector: ${mapping.vector.concept} — ${mapping.vector.rationale}

Does this schema hold in the domain "${domain}" with the given mapping? Evaluate the fit and explain. Return a JSON object:

\`\`\`json
{
  "domain": "${domain}",
  "mapping": ${JSON.stringify(mapping)},
  "holds": true,
  "explanation": "string — detailed evaluation of fit"
}
\`\`\``
  );
}

// ---------------------------------------------------------------------------
// 6. Audit arbitrary text — decompose into triadic mappings
// ---------------------------------------------------------------------------
export function auditTextPrompt(text: string): { system: string; user: string } {
  return prompt(
    `You are tasked with analyzing arbitrary theory text through the lens of the canonical triad. Decompose the text to identify an underlying invariant and map its key ideas onto Frame (standpoint/scope), Gradient (constraints/rules/invariants), and Vector (directed action/motion). You may produce multiple triadic mappings if the text spans several domains or sub-topics. ${JSON_INSTRUCTION}`,
    `Analyze the following text and decompose it into triadic structure(s):

---
${text}
---

Identify the core invariant expressed or implied by the text, then produce one or more triadic mappings. Return a JSON object:

\`\`\`json
{
  "invariant": "string — the core invariant you identified",
  "mappings": [
    {
      "frame": {
        "role": "Frame",
        "concept": "string",
        "confidence": 0.0,
        "rationale": "string"
      },
      "gradient": {
        "role": "Gradient",
        "concept": "string",
        "confidence": 0.0,
        "rationale": "string"
      },
      "vector": {
        "role": "Vector",
        "concept": "string",
        "confidence": 0.0,
        "rationale": "string"
      },
      "domain": "string — inferred domain or sub-topic"
    }
  ]
}
\`\`\``
  );
}
