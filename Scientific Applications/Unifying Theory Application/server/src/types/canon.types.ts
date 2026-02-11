/** The three irreducible canonical roles */
export type CanonRoleLabel = 'Frame' | 'Gradient' | 'Vector';

/** A single canonical role with its assigned concept */
export interface CanonRole {
  role: CanonRoleLabel;
  concept: string;
  confidence: number; // 0–1
  rationale: string;
}

/** A triadic mapping: one concept assigned to each role */
export interface TriadicMapping {
  frame: CanonRole;
  gradient: CanonRole;
  vector: CanonRole;
  domain: string;
}

/** Result of balance checking */
export interface BalanceResult {
  balanced: boolean;
  violations: BalanceViolation[];
}

export interface BalanceViolation {
  type: 'dominance' | 'collapse' | 'substitution' | 'missing' | 'composite_primitive';
  description: string;
  roles: CanonRoleLabel[];
}

/** Drift report for a mapping or schema */
export interface DriftReport {
  clean: boolean;
  drifts: DriftItem[];
}

export interface DriftItem {
  type: 'role_collapse' | 'illicit_primitive' | 'confidence_skew' | 'missing_role' | 'semantic_overlap';
  severity: 'warning' | 'error';
  description: string;
  affectedRoles: CanonRoleLabel[];
}

/** Semantic cost for a mapping */
export interface SemanticCost {
  deltaS: number; // 0–1, lower is better
  breakdown: {
    role: CanonRoleLabel;
    fit: number; // 0–1, how well the concept fits
    strain: string; // description of any mismatch
  }[];
}
