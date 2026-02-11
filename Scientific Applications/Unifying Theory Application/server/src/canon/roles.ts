/**
 * roles.ts — F/G/V type definitions and validators.
 *
 * Provides a keyword-heuristic validator that scores how well a given
 * concept string fits a canonical role.
 */

import type { CanonRoleLabel } from '../types/canon.types.js';
import { ROLE_DEFINITIONS, ALL_ROLES } from './canon.js';
import type { RoleDefinition } from './canon.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Tokenise a concept string into lowercase words, stripping punctuation.
 */
function tokenize(concept: string): string[] {
  return concept
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Compute a keyword overlap score between a concept and a role definition.
 * Returns a value in [0, 1].
 */
export function keywordOverlap(concept: string, definition: RoleDefinition): number {
  const tokens = tokenize(concept);
  if (tokens.length === 0) return 0;

  const keywords = definition.keywords as readonly string[];
  let hits = 0;

  for (const token of tokens) {
    for (const kw of keywords) {
      // Match if the token contains the keyword or the keyword contains the token
      // (handles stemming-like partial matches for short tokens)
      if (
        token === kw ||
        (token.length >= 4 && kw.startsWith(token)) ||
        (kw.length >= 4 && token.startsWith(kw))
      ) {
        hits++;
        break;
      }
    }
  }

  return hits / tokens.length;
}

/**
 * Score how well a concept fits each of the three roles.
 * Returns a record keyed by role label.
 */
export function scoreFitAll(concept: string): Record<CanonRoleLabel, number> {
  return {
    Frame: keywordOverlap(concept, ROLE_DEFINITIONS.Frame),
    Gradient: keywordOverlap(concept, ROLE_DEFINITIONS.Gradient),
    Vector: keywordOverlap(concept, ROLE_DEFINITIONS.Vector),
  };
}

// ---------------------------------------------------------------------------
// Public validator
// ---------------------------------------------------------------------------

export interface RoleValidation {
  valid: boolean;
  reason: string;
}

/**
 * Validate whether a concept string is a reasonable fit for the given role.
 *
 * Uses keyword heuristics:
 *  - Computes overlap with all three role keyword sets.
 *  - The concept is valid for the role if:
 *      1. It has non-zero overlap with the target role, OR
 *      2. It has zero overlap with ALL roles (novel concept — benefit of the doubt).
 *  - The concept is invalid if it has strictly higher overlap with a different role.
 */
export function isValidRole(
  concept: string,
  role: CanonRoleLabel,
): RoleValidation {
  if (!concept || concept.trim().length === 0) {
    return { valid: false, reason: 'Concept is empty.' };
  }

  if (!ALL_ROLES.includes(role)) {
    return { valid: false, reason: `Unknown role: ${role}` };
  }

  const scores = scoreFitAll(concept);
  const targetScore = scores[role];

  // Find the best-fitting role(s)
  let bestRole: CanonRoleLabel = role;
  let bestScore = -1;
  for (const r of ALL_ROLES) {
    if (scores[r] > bestScore) {
      bestScore = scores[r];
      bestRole = r;
    }
  }

  // If no keywords match any role, the concept is novel — accept it
  if (bestScore === 0) {
    return {
      valid: true,
      reason: `No keyword overlap detected for any role; "${concept}" accepted as novel concept for ${role}.`,
    };
  }

  // If the target role has the best (or tied-for-best) score, accept
  if (targetScore >= bestScore) {
    return {
      valid: true,
      reason: `"${concept}" fits ${role} (score ${targetScore.toFixed(2)}).`,
    };
  }

  // Target role has some overlap but another role scores strictly higher
  if (targetScore > 0 && bestScore > targetScore) {
    return {
      valid: true,
      reason: `"${concept}" partially fits ${role} (score ${targetScore.toFixed(2)}), though ${bestRole} scores higher (${bestScore.toFixed(2)}).`,
    };
  }

  // Target role has zero overlap, but another role does match
  if (targetScore === 0 && bestScore > 0) {
    return {
      valid: false,
      reason: `"${concept}" has no keyword overlap with ${role} but matches ${bestRole} (score ${bestScore.toFixed(2)}). Consider assigning it to ${bestRole} instead.`,
    };
  }

  return {
    valid: true,
    reason: `"${concept}" accepted for ${role}.`,
  };
}
