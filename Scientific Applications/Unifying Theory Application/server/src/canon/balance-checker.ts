/**
 * balance-checker.ts — Detects collapse, dominance, and substitution.
 *
 * Implements five axiom checks against a TriadicMapping:
 *   1. COMPLETENESS   — all three roles present with non-empty concepts
 *   2. NO_DOMINANCE   — no confidence skew > 0.3 between any two roles
 *   3. NO_COLLAPSE    — no two roles share the same concept
 *   4. NO_SUBSTITUTION — no concept is a better fit for a different role
 *   5. NO_COMPOSITE_PRIMITIVES — value-laden / multi-word compound terms rejected
 */

import type {
  TriadicMapping,
  BalanceResult,
  BalanceViolation,
  CanonRoleLabel,
} from '../types/canon.types.js';
import { ALL_ROLES } from './canon.js';
import { scoreFitAll } from './roles.js';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Maximum allowed confidence gap between any two roles. */
const DOMINANCE_THRESHOLD = 0.3;

/** Value-laden or composite terms that cannot serve as primitives. */
const VALUE_LADEN_PATTERNS: RegExp[] = [
  /\b(good|bad|evil|just|unjust|moral|immoral|right|wrong)\b/i,
  /\b(beautiful|ugly|sacred|profane|pure|corrupt)\b/i,
  /\b(should|ought|must not|forbidden|obligatory)\b/i,
];

/**
 * A concept is considered composite if it has 4+ words or contains
 * value-laden language that smuggles normative content into a structural role.
 */
function isCompositePrimitive(concept: string): boolean {
  const words = concept.trim().split(/\s+/);
  if (words.length >= 4) return true;
  for (const pat of VALUE_LADEN_PATTERNS) {
    if (pat.test(concept)) return true;
  }
  return false;
}

/**
 * Normalise a concept for semantic identity comparison.
 */
function normaliseConcept(concept: string): string {
  return concept.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Extract the three CanonRole entries from a mapping in a stable order.
 */
function rolesOf(mapping: TriadicMapping) {
  return [
    { ...mapping.frame, _key: 'Frame' as CanonRoleLabel },
    { ...mapping.gradient, _key: 'Gradient' as CanonRoleLabel },
    { ...mapping.vector, _key: 'Vector' as CanonRoleLabel },
  ];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function checkBalance(mapping: TriadicMapping): BalanceResult {
  const violations: BalanceViolation[] = [];

  const entries = [
    { label: 'Frame' as CanonRoleLabel, role: mapping.frame },
    { label: 'Gradient' as CanonRoleLabel, role: mapping.gradient },
    { label: 'Vector' as CanonRoleLabel, role: mapping.vector },
  ];

  // ----- 1. COMPLETENESS -----
  for (const entry of entries) {
    if (!entry.role || !entry.role.concept || entry.role.concept.trim().length === 0) {
      violations.push({
        type: 'missing',
        description: `${entry.label} role is missing or has an empty concept.`,
        roles: [entry.label],
      });
    }
  }

  // If any role is missing, remaining checks may not apply cleanly, but we
  // still run them on whatever is present — they'll just skip missing data.

  // ----- 2. NO DOMINANCE (confidence skew) -----
  const present = entries.filter(e => e.role && e.role.concept);
  for (let i = 0; i < present.length; i++) {
    for (let j = i + 1; j < present.length; j++) {
      const gap = Math.abs(present[i].role.confidence - present[j].role.confidence);
      if (gap > DOMINANCE_THRESHOLD) {
        const dominant = present[i].role.confidence > present[j].role.confidence
          ? present[i]
          : present[j];
        const subordinate = dominant === present[i] ? present[j] : present[i];
        violations.push({
          type: 'dominance',
          description:
            `${dominant.label} (confidence ${dominant.role.confidence.toFixed(2)}) dominates ` +
            `${subordinate.label} (confidence ${subordinate.role.confidence.toFixed(2)}) ` +
            `— gap of ${gap.toFixed(2)} exceeds threshold ${DOMINANCE_THRESHOLD}.`,
          roles: [dominant.label, subordinate.label],
        });
      }
    }
  }

  // ----- 3. NO COLLAPSE (semantic identity) -----
  for (let i = 0; i < present.length; i++) {
    for (let j = i + 1; j < present.length; j++) {
      const a = normaliseConcept(present[i].role.concept);
      const b = normaliseConcept(present[j].role.concept);
      if (a === b) {
        violations.push({
          type: 'collapse',
          description:
            `${present[i].label} and ${present[j].label} share the same concept ` +
            `("${present[i].role.concept}"). Roles must be conceptually distinct.`,
          roles: [present[i].label, present[j].label],
        });
      }
    }
  }

  // ----- 4. NO SUBSTITUTION (role-fit check) -----
  for (const entry of present) {
    const scores = scoreFitAll(entry.role.concept);
    const assigned = entry.label;
    const assignedScore = scores[assigned];

    for (const otherRole of ALL_ROLES) {
      if (otherRole === assigned) continue;
      if (scores[otherRole] > assignedScore && scores[otherRole] > 0) {
        violations.push({
          type: 'substitution',
          description:
            `"${entry.role.concept}" is assigned to ${assigned} (fit ${assignedScore.toFixed(2)}) ` +
            `but better fits ${otherRole} (fit ${scores[otherRole].toFixed(2)}). ` +
            `This looks like role substitution.`,
          roles: [assigned, otherRole],
        });
        break; // report only the best alternative
      }
    }
  }

  // ----- 5. NO COMPOSITE PRIMITIVES -----
  for (const entry of present) {
    if (isCompositePrimitive(entry.role.concept)) {
      violations.push({
        type: 'composite_primitive',
        description:
          `"${entry.role.concept}" assigned to ${entry.label} is a composite or value-laden term ` +
          `and cannot serve as a canonical primitive.`,
        roles: [entry.label],
      });
    }
  }

  return {
    balanced: violations.length === 0,
    violations,
  };
}
