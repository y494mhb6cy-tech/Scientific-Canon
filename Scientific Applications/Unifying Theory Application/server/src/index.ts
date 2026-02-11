import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

import { ClaudeClient } from './llm/claude-client.js';
import { DomainRegistry } from './domains/domain-registry.js';
import { SessionStore } from './engine/session-store.js';
import { Pipeline } from './engine/pipeline.js';

import healthRouter from './routes/health.routes.js';
import { createSessionRoutes } from './routes/session.routes.js';
import { createDomainRoutes } from './routes/domain.routes.js';
import { createEngineRoutes } from './routes/engine.routes.js';
import { createAuditRoutes } from './routes/audit.routes.js';

// ---------------------------------------------------------------------------
// Instantiate core services
// ---------------------------------------------------------------------------

const claude = new ClaudeClient();
const registry = new DomainRegistry();
const store = new SessionStore();
const pipeline = new Pipeline(claude, registry);

// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------

const app = express();

app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------------
// Mount route groups
// ---------------------------------------------------------------------------

app.use(healthRouter);
app.use(createSessionRoutes(store));
app.use(createDomainRoutes(registry));
app.use(createEngineRoutes(pipeline, store));
app.use(createAuditRoutes(pipeline, store));

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

app.listen(PORT, () => {
  console.log(`[UTE Server] Running on http://localhost:${PORT}`);
  console.log(`[UTE Server] ${registry.list().length} domain packs loaded`);
});
