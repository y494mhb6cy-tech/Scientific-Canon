import { Router } from 'express';
import type { Request, Response } from 'express';
import type { DomainRegistry } from '../domains/domain-registry.js';
import type { CreateCustomDomainRequest, ListDomainsResponse } from '../types/api.types.js';
import { buildCustomDomain } from '../domains/custom-domain.js';

/**
 * Create the domain route group.
 *
 * GET  /api/domains        — list all registered domain packs
 * POST /api/domains/custom — create and register a custom domain pack
 */
export function createDomainRoutes(registry: DomainRegistry): Router {
  const router = Router();

  /**
   * GET /api/domains
   * Returns: { domains: DomainPack[] }
   */
  router.get('/api/domains', (_req: Request, res: Response) => {
    try {
      const response: ListDomainsResponse = {
        domains: registry.list(),
      };
      res.json(response);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Internal server error';
      res.status(500).json({ error: message });
    }
  });

  /**
   * POST /api/domains/custom
   * Body: { name, description, concepts, exampleInvariants? }
   * Returns: the newly created DomainPack
   */
  router.post('/api/domains/custom', (req: Request, res: Response) => {
    try {
      const { name, description, concepts, exampleInvariants } = req.body as CreateCustomDomainRequest;

      if (!name || typeof name !== 'string') {
        res.status(400).json({ error: 'Missing or invalid "name".' });
        return;
      }
      if (!description || typeof description !== 'string') {
        res.status(400).json({ error: 'Missing or invalid "description".' });
        return;
      }
      if (!Array.isArray(concepts) || concepts.length < 3) {
        res.status(400).json({ error: 'At least 3 concepts are required.' });
        return;
      }

      const pack = buildCustomDomain(name, description, concepts, exampleInvariants);
      registry.register(pack);

      res.status(201).json(pack);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Internal server error';
      res.status(500).json({ error: message });
    }
  });

  return router;
}
