import type { ModeType } from './session.types.js';
import type { DomainPack, DomainConcept } from './domain.types.js';
import type { PipelineResult, PipelineStep, InvariantCandidate } from './engine.types.js';
import type { DriftReport } from './canon.types.js';

// --- Session ---
export interface CreateSessionRequest {
  mode: ModeType;
}

export interface CreateSessionResponse {
  sessionId: string;
  mode: ModeType;
}

// --- Domain ---
export interface ListDomainsResponse {
  domains: DomainPack[];
}

export interface CreateCustomDomainRequest {
  name: string;
  description: string;
  concepts: DomainConcept[];
  exampleInvariants?: string[];
}

// --- Engine ---
export interface RunPipelineRequest {
  sessionId: string;
  domainIds: string[];
  userInvariant?: string;
}

export interface RunPipelineResponse {
  result: PipelineResult;
}

export interface StepPipelineRequest {
  sessionId: string;
  step: number;
  data?: {
    domainIds?: string[];
    selectedInvariant?: InvariantCandidate;
    userInvariant?: string;
  };
}

export interface StepPipelineResponse {
  step: PipelineStep;
}

// --- Audit ---
export interface AuditValidateRequest {
  sessionId: string;
  text: string;
}

export interface AuditValidateResponse {
  driftReport: DriftReport;
  mappings: import('./canon.types.js').TriadicMapping[];
  invariant: string;
}
