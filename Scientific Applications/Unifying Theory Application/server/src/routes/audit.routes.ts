import { Router } from 'express';
import type { Request, Response } from 'express';
import type { Pipeline } from '../engine/pipeline.js';
import type { SessionStore } from '../engine/session-store.js';
import type { AuditValidateRequest, AuditValidateResponse } from '../types/api.types.js';

/**
 * Create the audit route group.
 *
 * POST /api/audit/validate — validate theory text and return drift report + mappings
 */
export function createAuditRoutes(pipeline: Pipeline, store: SessionStore): Router {
  const router = Router();

  /**
   * POST /api/audit/validate
   * Body: { sessionId, text }
   * Returns: { driftReport, mappings, invariant }
   */
  router.post('/api/audit/validate', async (req: Request, res: Response) => {
    try {
      const { sessionId, text } = req.body as AuditValidateRequest;

      if (!sessionId || typeof sessionId !== 'string') {
        res.status(400).json({ error: 'Missing or invalid "sessionId".' });
        return;
      }
      if (!text || typeof text !== 'string') {
        res.status(400).json({ error: 'Missing or invalid "text".' });
        return;
      }

      const session = store.get(sessionId);
      if (!session) {
        res.status(404).json({ error: `Session "${sessionId}" not found.` });
        return;
      }

      const auditResult = await pipeline.auditText(sessionId, text) as AuditValidateResponse;

      store.update(sessionId, {
        result: {
          sessionId,
          invariant: {
            statement: auditResult.invariant,
            domains: [],
            confidence: 1,
            rationale: 'Extracted from audit text',
          },
          mappings: auditResult.mappings,
          schema: null as unknown as import('../types/engine.types.js').UnifyingSchema,
          applicationTests: [],
          driftReport: auditResult.driftReport,
        },
      });

      const response: AuditValidateResponse = {
        driftReport: auditResult.driftReport,
        mappings: auditResult.mappings,
        invariant: auditResult.invariant,
      };

      res.json(response);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Internal server error';
      res.status(500).json({ error: message });
    }
  });

  return router;
}
