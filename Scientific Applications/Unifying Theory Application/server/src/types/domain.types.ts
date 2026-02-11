/** A concept within a domain */
export interface DomainConcept {
  name: string;
  description: string;
  /** Suggested canonical role affinity, if any */
  suggestedRole?: 'Frame' | 'Gradient' | 'Vector';
}

/** A domain pack defining a field of knowledge */
export interface DomainPack {
  id: string;
  name: string;
  description: string;
  concepts: DomainConcept[];
  /** Example invariants native to this domain */
  exampleInvariants: string[];
}

/** Result of extracting concepts from a domain via LLM */
export interface ExtractionResult {
  domain: string;
  concepts: DomainConcept[];
  rawResponse: string;
}
