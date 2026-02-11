import { Router } from 'express';

const router = Router();

/**
 * GET /api/health
 * Returns a simple health-check payload with current timestamp.
 */
router.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
