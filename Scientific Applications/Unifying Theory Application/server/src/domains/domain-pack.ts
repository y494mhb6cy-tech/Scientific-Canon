/**
 * Domain Pack factory and re-exports.
 *
 * Provides a validated factory for constructing DomainPack instances
 * while re-exporting the canonical type from the shared type module.
 */

export type { DomainPack, DomainConcept } from '../types/domain.types.js';

import type { DomainPack } from '../types/domain.types.js';

/**
 * Create a validated DomainPack.
 *
 * @throws {Error} if the pack is missing id, name, description, or has fewer
 *                 than 3 concepts.
 */
export function createDomainPack(config: DomainPack): DomainPack {
  if (!config.id || typeof config.id !== 'string') {
    throw new Error('DomainPack requires a non-empty string "id".');
  }
  if (!config.name || typeof config.name !== 'string') {
    throw new Error('DomainPack requires a non-empty string "name".');
  }
  if (!config.description || typeof config.description !== 'string') {
    throw new Error('DomainPack requires a non-empty string "description".');
  }
  if (!Array.isArray(config.concepts) || config.concepts.length < 3) {
    throw new Error(
      'DomainPack requires at least 3 concepts (received ' +
        (Array.isArray(config.concepts) ? config.concepts.length : 0) +
        ').',
    );
  }

  return {
    id: config.id,
    name: config.name,
    description: config.description,
    concepts: config.concepts,
    exampleInvariants: config.exampleInvariants ?? [],
  };
}
