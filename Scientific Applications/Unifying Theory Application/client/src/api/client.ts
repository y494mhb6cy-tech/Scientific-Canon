const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    let message: string;
    try {
      const parsed = JSON.parse(body);
      message = parsed.error || parsed.message || body;
    } catch {
      message = body || `Request failed with status ${res.status}`;
    }
    throw new Error(message);
  }
  return res.json();
}

export type ModeType = 'guided' | 'expert' | 'audit';

export interface SessionResponse {
  sessionId: string;
  mode: ModeType;
}

export interface DomainConcept {
  name: string;
  description: string;
  suggestedRole?: 'Frame' | 'Gradient' | 'Vector';
}

export interface DomainPack {
  id: string;
  name: string;
  description: string;
  concepts: DomainConcept[];
  exampleInvariants: string[];
}

export interface CanonRole {
  role: 'Frame' | 'Gradient' | 'Vector';
  concept: string;
  confidence: number;
  rationale: string;
}

export interface TriadicMapping {
  frame: CanonRole;
  gradient: CanonRole;
  vector: CanonRole;
  domain: string;
}

export interface BalanceViolation {
  type: string;
  description: string;
  roles: ('Frame' | 'Gradient' | 'Vector')[];
}

export interface BalanceResult {
  balanced: boolean;
  violations: BalanceViolation[];
}

export interface DriftItem {
  type: string;
  severity: 'warning' | 'error';
  description: string;
  affectedRoles: ('Frame' | 'Gradient' | 'Vector')[];
}

export interface DriftReport {
  clean: boolean;
  drifts: DriftItem[];
}

export interface SemanticCost {
  deltaS: number;
  breakdown: {
    role: 'Frame' | 'Gradient' | 'Vector';
    fit: number;
    strain: string;
  }[];
}

export interface InvariantCandidate {
  statement: string;
  domains: string[];
  confidence: number;
  rationale: string;
}

export interface UnifyingSchema {
  invariant: string;
  mappings: TriadicMapping[];
  schemaForm: string;
  balanceResult: BalanceResult;
  semanticCosts: { domain: string; cost: SemanticCost }[];
}

export interface ApplicationTest {
  domain: string;
  mapping: TriadicMapping;
  holds: boolean;
  explanation: string;
}

export interface PipelineResult {
  sessionId: string;
  invariant: InvariantCandidate;
  mappings: TriadicMapping[];
  schema: UnifyingSchema;
  applicationTests: ApplicationTest[];
  driftReport: DriftReport;
}

export interface PipelineStep {
  step: string;
  data: unknown;
}

// --- API Functions ---

export async function createSession(mode: ModeType): Promise<SessionResponse> {
  return request<SessionResponse>('/session', {
    method: 'POST',
    body: JSON.stringify({ mode }),
  });
}

export async function getSession(id: string): Promise<SessionResponse> {
  return request<SessionResponse>(`/session/${id}`);
}

export async function listDomains(): Promise<{ domains: DomainPack[] }> {
  return request<{ domains: DomainPack[] }>('/domains');
}

export async function createCustomDomain(data: {
  name: string;
  description: string;
  concepts: DomainConcept[];
  exampleInvariants?: string[];
}): Promise<DomainPack> {
  return request<DomainPack>('/domains/custom', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function runPipeline(data: {
  sessionId: string;
  domainIds: string[];
  userInvariant?: string;
}): Promise<{ result: PipelineResult }> {
  return request<{ result: PipelineResult }>('/engine/run', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function runStep(data: {
  sessionId: string;
  step: string;
  data?: unknown;
}): Promise<{ step: PipelineStep }> {
  return request<{ step: PipelineStep }>('/engine/step', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function auditValidate(data: {
  sessionId: string;
  text: string;
}): Promise<{ driftReport: DriftReport; mappings: TriadicMapping[]; invariant: InvariantCandidate }> {
  return request<{ driftReport: DriftReport; mappings: TriadicMapping[]; invariant: InvariantCandidate }>(
    '/audit/validate',
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}
