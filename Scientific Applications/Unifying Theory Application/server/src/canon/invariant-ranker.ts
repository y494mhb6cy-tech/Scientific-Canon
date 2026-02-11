/**
 * invariant-ranker.ts — Ranks invariant candidates by structural stability.
 *
 * Sorting criteria (descending priority):
 *   1. Number of domains covered (more is better).
 *   2. Confidence (higher is better).
 *   3. Penalty for balance violations in associated mappings (fewer is better).
 *
 * Returns a new array sorted from best to worst. Does not mutate the input.
 */

import type { TriadicMapping } from '../types/canon.types.js';
import type { InvariantCandidate } from '../types/engine.types.js';
import { checkBalance } from './balance-checker.js';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Weight applied per balance violation to penalise structurally unstable candidates. */
const VIOLATION_PENALTY = 0.1;

interface ScoredCandidate {
  candidate: InvariantCandidate;
  domainCount: number;
  confidence: number;
  violationCount: number;
  compositeScore: number;
}

function scoreCandidate(
  candidate: InvariantCandidate,
  mappings: TriadicMapping[],
): ScoredCandidate {
  const domainCount = candidate.domains.length;
  const confidence = candidate.confidence;

  // Find mappings that belong to any of this candidate's domains
  const relevantMappings = mappings.filter(m =>
    candidate.domains.includes(m.domain),
  );

  // Count total balance violations across relevant mappings
  let violationCount = 0;
  for (const mapping of relevantMappings) {
    const result = checkBalance(mapping);
    violationCount += result.violations.length;
  }

  // Composite score: domain coverage and confidence are positive,
  // violations penalise.
  // Normalise domain count to [0,1] by using a soft cap (10 domains = 1.0).
  const normDomains = Math.min(domainCount / 10, 1);
  const penalty = Math.min(violationCount * VIOLATION_PENALTY, 1);
  const compositeScore = (normDomains * 0.4) + (confidence * 0.4) - (penalty * 0.2);

  return { candidate, domainCount, confidence, violationCount, compositeScore };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function rankInvariants(
  candidates: InvariantCandidate[],
  mappings: TriadicMapping[],
): InvariantCandidate[] {
  if (candidates.length === 0) return [];

  const scored = candidates.map(c => scoreCandidate(c, mappings));

  scored.sort((a, b) => {
    // Primary: composite score (descending)
    if (b.compositeScore !== a.compositeScore) {
      return b.compositeScore - a.compositeScore;
    }
    // Tiebreak 1: more domains is better
    if (b.domainCount !== a.domainCount) {
      return b.domainCount - a.domainCount;
    }
    // Tiebreak 2: higher confidence is better
    if (b.confidence !== a.confidence) {
      return b.confidence - a.confidence;
    }
    // Tiebreak 3: fewer violations is better
    return a.violationCount - b.violationCount;
  });

  return scored.map(s => s.candidate);
}
