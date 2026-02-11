/**
 * Custom domain builder.
 *
 * Allows users to define ad-hoc domain packs at runtime by supplying a name,
 * description, and concept list.  The id is derived by slugifying the name.
 */

import type { DomainConcept, DomainPack } from '../types/domain.types.js';
import { createDomainPack } from './domain-pack.js';

/**
 * Turn an arbitrary string into a URL-safe, lower-case slug.
 *
 * "Systems Design" -> "systems-design"
 */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Build a custom DomainPack from user-supplied parameters.
 *
 * The pack id is generated automatically by slugifying the name and prefixing
 * it with "custom-" to avoid collisions with built-in packs.
 */
export function buildCustomDomain(
  name: string,
  description: string,
  concepts: DomainConcept[],
  exampleInvariants: string[] = [],
): DomainPack {
  const id = `custom-${slugify(name)}`;

  return createDomainPack({
    id,
    name,
    description,
    concepts,
    exampleInvariants,
  });
}
