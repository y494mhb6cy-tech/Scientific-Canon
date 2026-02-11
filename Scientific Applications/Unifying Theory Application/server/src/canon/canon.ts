/**
 * canon.ts — Parsed law, role definitions, and axiom constants.
 *
 * The triadic canon: Frame / Gradient / Vector.
 * Every well-formed mapping assigns exactly one concept to each role,
 * and no role may dominate, collapse into, or substitute for another.
 */

import type { CanonRoleLabel } from '../types/canon.types.js';

// ---------------------------------------------------------------------------
// Canon text — the governing law
// ---------------------------------------------------------------------------

export const CANON_TEXT = `
The Unifying Theory Engine operates under a single structural law:
every domain of knowledge can be decomposed into exactly three
irreducible canonical roles — Frame, Gradient, and Vector — whose
balance is the necessary and sufficient condition for structural
coherence.

Frame  : the standpoint, scope, or boundary from which observation occurs.
Gradient: the constraints, rules, laws, forces, or invariants that govern.
Vector  : the directed action, motion, change, flow, or transformation.

No role may be omitted (completeness).
No role may dominate the others (no dominance).
No two roles may collapse into a single concept (no collapse).
No role may substitute for another (no substitution).
Composite or value-laden terms may not serve as primitives (no composite primitives).
`.trim();

// ---------------------------------------------------------------------------
// Role definitions
// ---------------------------------------------------------------------------

export interface RoleDefinition {
  label: CanonRoleLabel;
  shortName: string;
  description: string;
  keywords: readonly string[];
}

export const FRAME_DEFINITION: RoleDefinition = {
  label: 'Frame',
  shortName: 'F',
  description: 'The standpoint, scope, or boundary from which observation occurs.',
  keywords: [
    'perspective', 'scope', 'boundary', 'context', 'observer',
    'standpoint', 'frame', 'reference', 'viewpoint', 'lens',
    'horizon', 'domain', 'space', 'position', 'coordinate',
    'setting', 'environment', 'background', 'field', 'basis',
  ] as const,
};

export const GRADIENT_DEFINITION: RoleDefinition = {
  label: 'Gradient',
  shortName: 'G',
  description: 'The constraints, rules, laws, forces, or invariants that govern.',
  keywords: [
    'constraint', 'rule', 'law', 'force', 'invariant',
    'differential', 'gradient', 'regulation', 'principle', 'norm',
    'condition', 'limit', 'bound', 'restriction', 'requirement',
    'pressure', 'tension', 'potential', 'field', 'structure',
  ] as const,
};

export const VECTOR_DEFINITION: RoleDefinition = {
  label: 'Vector',
  shortName: 'V',
  description: 'The directed action, motion, change, flow, or transformation.',
  keywords: [
    'action', 'motion', 'direction', 'change', 'flow',
    'transformation', 'output', 'vector', 'movement', 'drive',
    'process', 'evolution', 'transition', 'shift', 'trajectory',
    'impulse', 'momentum', 'propagation', 'emission', 'execution',
  ] as const,
};

export const ROLE_DEFINITIONS: Record<CanonRoleLabel, RoleDefinition> = {
  Frame: FRAME_DEFINITION,
  Gradient: GRADIENT_DEFINITION,
  Vector: VECTOR_DEFINITION,
};

export const ALL_ROLES: readonly CanonRoleLabel[] = ['Frame', 'Gradient', 'Vector'] as const;

// ---------------------------------------------------------------------------
// Axiom constants
// ---------------------------------------------------------------------------

/** Every mapping must assign a concept to all three roles. */
export const COMPLETENESS = 'COMPLETENESS' as const;

/** No single role's confidence may exceed another's by more than 0.3. */
export const NO_DOMINANCE = 'NO_DOMINANCE' as const;

/** No two roles may be assigned the same concept (semantic identity). */
export const NO_COLLAPSE = 'NO_COLLAPSE' as const;

/** A concept assigned to one role must not be a better fit for a different role. */
export const NO_SUBSTITUTION = 'NO_SUBSTITUTION' as const;

/** Composite or value-laden terms may not serve as canonical primitives. */
export const NO_COMPOSITE_PRIMITIVES = 'NO_COMPOSITE_PRIMITIVES' as const;

export const AXIOMS = [
  COMPLETENESS,
  NO_DOMINANCE,
  NO_COLLAPSE,
  NO_SUBSTITUTION,
  NO_COMPOSITE_PRIMITIVES,
] as const;

export type Axiom = (typeof AXIOMS)[number];
