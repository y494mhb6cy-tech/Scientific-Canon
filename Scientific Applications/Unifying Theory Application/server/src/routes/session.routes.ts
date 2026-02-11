import { Router } from 'express';
import type { Request, Response } from 'express';
import type { SessionStore } from '../engine/session-store.js';
import type { CreateSessionRequest, CreateSessionResponse } from '../types/api.types.js';

/**
 * Create the session route group.
 *
 * POST /api/session   — create a new session
 * GET  /api/session/:id — retrieve an existing session
 */
export function createSessionRoutes(store: SessionStore): Router {
  const router = Router();

  /**
   * POST /api/session
   * Body: { mode: ModeType }
   * Returns: { sessionId, mode }
   */
  router.post('/api/session', (req: Request, res: Response) => {
    try {
      const { mode } = req.body as CreateSessionRequest;

      if (!mode || !['guided', 'expert', 'audit'].includes(mode)) {
        res.status(400).json({ error: 'Invalid or missing mode. Must be "guided", "expert", or "audit".' });
        return;
      }

      const session = store.create(mode);

      const response: CreateSessionResponse = {
        sessionId: session.id,
        mode: session.state.mode,
      };

      res.status(201).json(response);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Internal server error';
      res.status(500).json({ error: message });
    }
  });

  /**
   * GET /api/session/:id
   * Returns the full session object, or 404 if not found.
   */
  router.get('/api/session/:id', (req: Request, res: Response) => {
    try {
      const session = store.get(req.params.id);

      if (!session) {
        res.status(404).json({ error: `Session "${req.params.id}" not found.` });
        return;
      }

      res.json(session);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Internal server error';
      res.status(500).json({ error: message });
    }
  });

  return router;
}
