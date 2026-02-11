/**
 * drift-detector.ts — Flags role collapse, illicit primitives, confidence
 * skew, missing roles, and semantic overlap across a set of mappings.
 *
 * Unlike balance-checker (which examines a single mapping), drift-detector
 * analyses patterns across ALL mappings to surface systemic issues.
 */

import type {
  TriadicMapping,
  DriftReport,
  DriftItem,
  CanonRoleLabel,
} from '../types/canon.types.js';
import { ALL_ROLES } from './canon.js';
import { scoreFitAll } from './roles.js';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function normaliseConcept(concept: string): string {
  return concept.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getRoleConcept(mapping: TriadicMapping, role: CanonRoleLabel): string {
  switch (role) {
    case 'Frame': return mapping.frame.concept;
    case 'Gradient': return mapping.gradient.concept;
    case 'Vector': return mapping.vector.concept;
  }
}

function getRoleConfidence(mapping: TriadicMapping, role: CanonRoleLabel): number {
  switch (role) {
    case 'Frame': return mapping.frame.confidence;
    case 'Gradient': return mapping.gradient.confidence;
    case 'Vector': return mapping.vector.confidence;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function detectDrift(mappings: TriadicMapping[]): DriftReport {
  const drifts: DriftItem[] = [];

  if (mappings.length === 0) {
    return { clean: true, drifts: [] };
  }

  // ----- 1. Role collapse patterns -----
  // If the same normalised concept appears in two different roles across mappings,
  // that is a collapse pattern (the system is reusing one idea for multiple roles).
  const conceptToRoles = new Map<string, Set<CanonRoleLabel>>();

  for (const mapping of mappings) {
    for (const role of ALL_ROLES) {
      const concept = normaliseConcept(getRoleConcept(mapping, role));
      if (!concept) continue;
      if (!conceptToRoles.has(concept)) {
        conceptToRoles.set(concept, new Set());
      }
      conceptToRoles.get(concept)!.add(role);
    }
  }

  for (const [concept, roles] of conceptToRoles) {
    if (roles.size > 1) {
      const affectedRoles = Array.from(roles);
      drifts.push({
        type: 'role_collapse',
        severity: 'error',
        description:
          `Concept "${concept}" appears under multiple roles (${affectedRoles.join(', ')}) ` +
          `across mappings. This signals role collapse.`,
        affectedRoles,
      });
    }
  }

  // ----- 2. Illicit primitives -----
  // Composite / value-laden terms used as primitives in any mapping.
  const VALUE_LADEN = /\b(good|bad|evil|just|unjust|moral|immoral|right|wrong|beautiful|ugly|sacred|profane|pure|corrupt|should|ought)\b/i;

  for (const mapping of mappings) {
    for (const role of ALL_ROLES) {
      const concept = getRoleConcept(mapping, role);
      if (!concept) continue;
      const words = concept.trim().split(/\s+/);
      if (words.length >= 4 || VALUE_LADEN.test(concept)) {
        drifts.push({
          type: 'illicit_primitive',
          severity: 'warning',
          description:
            `"${concept}" in ${role} (domain: ${mapping.domain}) is a composite or ` +
            `value-laden term that should not serve as a canonical primitive.`,
          affectedRoles: [role],
        });
      }
    }
  }

  // ----- 3. Confidence skew across domains -----
  // For each role, compute the mean and check if any single mapping's
  // confidence deviates significantly (> 0.3) from the mean.
  for (const role of ALL_ROLES) {
    const confidences = mappings.map(m => getRoleConfidence(m, role));
    const mean = confidences.reduce((a, b) => a + b, 0) / confidences.length;

    for (let i = 0; i < mappings.length; i++) {
      const deviation = Math.abs(confidences[i] - mean);
      if (deviation > 0.3) {
        drifts.push({
          type: 'confidence_skew',
          severity: 'warning',
          description:
            `${role} confidence in domain "${mappings[i].domain}" is ${confidences[i].toFixed(2)}, ` +
            `deviating ${deviation.toFixed(2)} from the cross-domain mean of ${mean.toFixed(2)}.`,
          affectedRoles: [role],
        });
      }
    }
  }

  // ----- 4. Missing roles -----
  // Any mapping where a role has an empty or missing concept.
  for (const mapping of mappings) {
    for (const role of ALL_ROLES) {
      const concept = getRoleConcept(mapping, role);
      if (!concept || concept.trim().length === 0) {
        drifts.push({
          type: 'missing_role',
          severity: 'error',
          description:
            `${role} is missing or empty in domain "${mapping.domain}".`,
          affectedRoles: [role],
        });
      }
    }
  }

  // ----- 5. Semantic overlap between roles across domains -----
  // If the concepts assigned to different roles across domains have high
  // keyword overlap with the same role definition, that signals blurring.
  // Specifically: for each pair of (roleA in mappingX, roleB in mappingY)
  // where roleA !== roleB, check if both concepts score highest for the
  // same role definition.
  // To avoid O(n^2) explosion on large mapping sets, we aggregate:
  // collect, per role, the set of best-fitting role definitions.
  const roleFitMap = new Map<CanonRoleLabel, Map<string, CanonRoleLabel>>();

  for (const role of ALL_ROLES) {
    roleFitMap.set(role, new Map());
    for (const mapping of mappings) {
      const concept = getRoleConcept(mapping, role);
      if (!concept || concept.trim().length === 0) continue;
      const scores = scoreFitAll(concept);
      let bestRole: CanonRoleLabel = role;
      let bestScore = -1;
      for (const r of ALL_ROLES) {
        if (scores[r] > bestScore) {
          bestScore = scores[r];
          bestRole = r;
        }
      }
      // Only flag if the best fit is a *different* role and score > 0
      if (bestRole !== role && bestScore > 0) {
        roleFitMap.get(role)!.set(mapping.domain, bestRole);
      }
    }
  }

  for (const [assignedRole, domainBestMap] of roleFitMap) {
    if (domainBestMap.size > 0) {
      // Group by what role the concepts actually fit
      const bestFits = new Map<CanonRoleLabel, string[]>();
      for (const [domain, bestRole] of domainBestMap) {
        if (!bestFits.has(bestRole)) bestFits.set(bestRole, []);
        bestFits.get(bestRole)!.push(domain);
      }
      for (const [bestRole, domains] of bestFits) {
        if (domains.length >= 2) {
          drifts.push({
            type: 'semantic_overlap',
            severity: 'warning',
            description:
              `Concepts assigned to ${assignedRole} in domains [${domains.join(', ')}] ` +
              `semantically overlap with ${bestRole}. The roles may be blurring.`,
            affectedRoles: [assignedRole, bestRole],
          });
        }
      }
    }
  }

  return {
    clean: drifts.length === 0,
    drifts,
  };
}
