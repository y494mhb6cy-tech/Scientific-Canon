/**
 * Domain Registry
 *
 * Central registry for DomainPack instances.  All six built-in packs are
 * auto-registered on construction so they are available immediately.
 */

import type { DomainPack } from '../types/domain.types.js';

import physics from './packs/physics.js';
import cognition from './packs/cognition.js';
import language from './packs/language.js';
import ai from './packs/ai.js';
import systemsDesign from './packs/systems-design.js';
import economics from './packs/economics.js';

/** All built-in packs shipped with the engine. */
const BUILT_IN_PACKS: DomainPack[] = [
  physics,
  cognition,
  language,
  ai,
  systemsDesign,
  economics,
];

/**
 * A registry that holds domain packs keyed by their unique id.
 *
 * ```ts
 * const registry = new DomainRegistry();
 * const pack = registry.get('physics');
 * ```
 */
export class DomainRegistry {
  private packs: Map<string, DomainPack> = new Map();

  constructor() {
    for (const pack of BUILT_IN_PACKS) {
      this.register(pack);
    }
  }

  /**
   * Register a domain pack.  Throws if a pack with the same id is already
   * registered (use `has()` to check first).
   */
  register(pack: DomainPack): void {
    if (this.packs.has(pack.id)) {
      throw new Error(
        `DomainRegistry: a pack with id "${pack.id}" is already registered.`,
      );
    }
    this.packs.set(pack.id, pack);
  }

  /** Retrieve a pack by id, or undefined if not found. */
  get(id: string): DomainPack | undefined {
    return this.packs.get(id);
  }

  /** Return all registered packs in insertion order. */
  list(): DomainPack[] {
    return Array.from(this.packs.values());
  }

  /** Check whether a pack with the given id exists. */
  has(id: string): boolean {
    return this.packs.has(id);
  }
}
