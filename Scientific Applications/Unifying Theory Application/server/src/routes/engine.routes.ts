import { Router } from 'express';
import type { Request, Response } from 'express';
import type { Pipeline } from '../engine/pipeline.js';
import type { SessionStore } from '../engine/session-store.js';
import type {
  RunPipelineRequest,
  RunPipelineResponse,
  StepPipelineRequest,
  StepPipelineResponse,
} from '../types/api.types.js';

/**
 * Create the engine route group.
 *
 * POST /api/engine/run  — run the full pipeline (Expert mode)
 * POST /api/engine/step — run a single pipeline step (Guided mode)
 */
export function createEngineRoutes(pipeline: Pipeline, store: SessionStore): Router {
  const router = Router();

  /**
   * POST /api/engine/run
   * Body: { sessionId, domainIds, userInvariant? }
   * Returns: { result: PipelineResult }
   */
  router.post('/api/engine/run', async (req: Request, res: Response) => {
    try {
      const { sessionId, domainIds, userInvariant } = req.body as RunPipelineRequest;

      if (!sessionId || typeof sessionId !== 'string') {
        res.status(400).json({ error: 'Missing or invalid "sessionId".' });
        return;
      }
      if (!Array.isArray(domainIds) || domainIds.length === 0) {
        res.status(400).json({ error: 'At least one domain id is required.' });
        return;
      }

      const session = store.get(sessionId);
      if (!session) {
        res.status(404).json({ error: `Session "${sessionId}" not found.` });
        return;
      }

      const result = await pipeline.runFull(sessionId, domainIds, userInvariant);

      store.update(sessionId, {
        selectedDomains: domainIds,
        result,
      });

      const response: RunPipelineResponse = { result };
      res.json(response);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Internal server error';
      res.status(500).json({ error: message });
    }
  });

  /**
   * POST /api/engine/step
   * Body: { sessionId, step, data? }
   * Returns: { step: PipelineStep }
   */
  router.post('/api/engine/step', async (req: Request, res: Response) => {
    try {
      const { sessionId, step, data } = req.body as StepPipelineRequest;

      if (!sessionId || typeof sessionId !== 'string') {
        res.status(400).json({ error: 'Missing or invalid "sessionId".' });
        return;
      }
      if (typeof step !== 'number' || step < 0 || step > 4) {
        res.status(400).json({ error: 'Invalid "step". Must be a number between 0 and 4.' });
        return;
      }

      const session = store.get(sessionId);
      if (!session) {
        res.status(404).json({ error: `Session "${sessionId}" not found.` });
        return;
      }

      const pipelineStep = await pipeline.runStep(sessionId, step, data);

      store.update(sessionId, {
        currentStep: step,
        steps: [...session.state.steps, pipelineStep],
      });

      const response: StepPipelineResponse = { step: pipelineStep };
      res.json(response);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Internal server error';
      res.status(500).json({ error: message });
    }
  });

  return router;
}
