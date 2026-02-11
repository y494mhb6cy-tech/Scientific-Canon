import type { TriadicMapping, BalanceResult, DriftReport, SemanticCost } from './canon.types.js';
import type { DomainConcept } from './domain.types.js';

/** A candidate invariant proposed by the LLM */
export interface InvariantCandidate {
  statement: string;
  domains: string[];
  confidence: number;
  rationale: string;
}

/** The unifying schema — minimal structural form */
export interface UnifyingSchema {
  invariant: string;
  mappings: TriadicMapping[];
  schemaForm: string; // compact symbolic or textual representation
  balanceResult: BalanceResult;
  semanticCosts: { domain: string; cost: SemanticCost }[];
}

/** Application test: verifying the schema in a specific domain */
export interface ApplicationTest {
  domain: string;
  mapping: TriadicMapping;
  holds: boolean;
  explanation: string;
}

/** Full pipeline result */
export interface PipelineResult {
  sessionId: string;
  invariant: InvariantCandidate;
  mappings: TriadicMapping[];
  schema: UnifyingSchema;
  applicationTests: ApplicationTest[];
  driftReport: DriftReport;
}

/** Step-by-step pipeline state for Guided mode */
export type PipelineStep =
  | { step: 0; name: 'domain_selection'; data: null }
  | { step: 1; name: 'concept_review'; data: { domains: string[]; concepts: Record<string, DomainConcept[]> } }
  | { step: 2; name: 'invariant_selection'; data: { candidates: InvariantCandidate[] } }
  | { step: 3; name: 'mapping_review'; data: { mappings: TriadicMapping[]; balance: BalanceResult } }
  | { step: 4; name: 'full_results'; data: PipelineResult };
