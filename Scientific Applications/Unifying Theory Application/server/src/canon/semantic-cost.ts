/**
 * semantic-cost.ts — Delta-S calculation.
 *
 * For each role in a TriadicMapping, compute how well the assigned concept
 * fits using keyword overlap with the role definition. The semantic cost
 * deltaS is the average of (1 - fit) across all three roles.
 *
 * deltaS = 0 means perfect fit; deltaS = 1 means total mismatch.
 */

import type {
  TriadicMapping,
  CanonRoleLabel,
  SemanticCost,
} from '../types/canon.types.js';
import { ROLE_DEFINITIONS } from './canon.js';
import { keywordOverlap } from './roles.js';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function computeSemanticCost(mapping: TriadicMapping): SemanticCost {
  const entries: { role: CanonRoleLabel; concept: string }[] = [
    { role: 'Frame', concept: mapping.frame.concept },
    { role: 'Gradient', concept: mapping.gradient.concept },
    { role: 'Vector', concept: mapping.vector.concept },
  ];

  const breakdown: SemanticCost['breakdown'] = [];

  for (const entry of entries) {
    const definition = ROLE_DEFINITIONS[entry.role];
    const fit = keywordOverlap(entry.concept, definition);

    let strain: string;
    if (fit >= 0.8) {
      strain = 'Excellent fit — concept aligns strongly with role keywords.';
    } else if (fit >= 0.5) {
      strain = 'Moderate fit — some keyword overlap, but not fully aligned.';
    } else if (fit > 0) {
      strain = 'Weak fit — minimal keyword overlap with role definition.';
    } else {
      strain = 'No keyword overlap — concept is novel or misassigned.';
    }

    breakdown.push({ role: entry.role, fit, strain });
  }

  const totalStrain = breakdown.reduce((sum, b) => sum + (1 - b.fit), 0);
  const deltaS = totalStrain / breakdown.length;

  return { deltaS, breakdown };
}
