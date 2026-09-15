/**
 * AI Gateway Server
 *
 * Fastify server that serves as the AI Gateway between
 * the Vue frontend and the LLM runtime (Ollama / mock).
 */

import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { loadConfig } from './config.js';
import { MockAdapter } from './adapters/mock-adapter.js';
import { aiRunRoute } from './routes/ai-run.js';
import { aiTranslateRoute } from './routes/ai-translate.js';
import type { LLMAdapter } from './adapters/llm-adapter.js';

async function main() {
  const config = loadConfig();

  const app = Fastify({
    logger: {
      level: config.logLevel,
      transport: {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'HH:MM:ss' },
      },
    },
  });

  // CORS for frontend dev server
  await app.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  });

  // ─── LLM Adapter ───
  // Use MockAdapter for development (no Ollama required)
  // Switch to OllamaAdapter when Ollama is available
  const adapter: LLMAdapter = new MockAdapter();

  const isAvailable = await adapter.isAvailable();
  app.log.info(`LLM Adapter: MockAdapter (available: ${isAvailable})`);

  // ─── Routes ───
  await aiRunRoute(app, adapter);
  await aiTranslateRoute(app, adapter);

  // ─── Health check ───
  app.get('/api/health', async () => ({
    status: 'ok',
    adapter: 'mock',
    timestamp: new Date().toISOString(),
  }));

  // ─── Start ───
  try {
    await app.listen({ port: config.port, host: '0.0.0.0' });
    app.log.info(`AI Gateway running at http://localhost:${config.port}`);
    app.log.info('Routes:');
    app.log.info('  POST /api/ai/run           — AI writing & review');
    app.log.info('  POST /api/ai/translate      — Start translation job');
    app.log.info('  GET  /api/ai/translate/:id/stream — Translation SSE');
    app.log.info('  GET  /api/health            — Health check');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  // Graceful shutdown
  const shutdown = async () => {
    app.log.info('Shutting down...');
    await app.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main();
