/**
 * POST /api/ai/run
 *
 * Unified AI endpoint for writing and review tasks.
 * Supports both JSON response and SSE streaming.
 */

import type { FastifyInstance } from 'fastify';
import { nanoid } from 'nanoid';
import { AIRunRequest } from '../schemas/ai-schemas.js';
import { getTaskDefinition, validateScope } from '../ai/task-registry.js';
import { buildPrompt } from '../ai/prompt-manager.js';
import { MODEL_PROFILES } from '../config.js';
import type { LLMAdapter } from '../adapters/llm-adapter.js';

export async function aiRunRoute(app: FastifyInstance, adapter: LLMAdapter) {
  app.post('/api/ai/run', async (request, reply) => {
    const requestId = `req_${nanoid(12)}`;
    const startTime = Date.now();

    // 1. Validate request
    const parsed = AIRunRequest.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        requestId,
        task: 'unknown',
        status: 'failed',
        error: `Validation error: ${parsed.error.issues.map(i => i.message).join(', ')}`,
      });
    }

    const req = parsed.data;
    const task = req.task;

    // 2. Check task registry
    const taskDef = getTaskDefinition(task);
    if (!taskDef) {
      return reply.status(400).send({
        requestId,
        task,
        status: 'failed',
        error: `Unknown task: ${task}`,
      });
    }

    // 3. Validate scope
    if (!validateScope(task, req.scope)) {
      return reply.status(400).send({
        requestId,
        task,
        status: 'failed',
        error: `Task "${task}" does not support scope "${req.scope}". Allowed: ${taskDef.allowedScopes.join(', ')}`,
      });
    }

    // 4. Extract content
    const content = req.selection?.text
      ?? (typeof req.document === 'string' ? req.document : JSON.stringify(req.document ?? ''))
      ?? '';

    if (!content) {
      return reply.status(400).send({
        requestId,
        task,
        status: 'failed',
        error: 'No content provided (selection.text or document required)',
      });
    }

    // 5. Build prompt
    const { system, user } = buildPrompt(
      taskDef.promptProfile,
      content,
      req.context,
      req.instruction
    );

    // 6. Get model profile
    const modelProfile = MODEL_PROFILES[taskDef.modelProfile] ?? MODEL_PROFILES['rewrite']!;

    const llmInput = {
      model: modelProfile.model,
      system,
      prompt: user,
      temperature: modelProfile.temperature,
      timeoutMs: modelProfile.timeoutMs,
      format: taskDef.outputType === 'article_review' ? 'json' as const : undefined,
    };

    // 7. Check if client wants SSE streaming
    const acceptsStream = request.headers.accept?.includes('text/event-stream');

    if (acceptsStream && taskDef.stream) {
      // ─── SSE Streaming ───
      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      });

      const write = (event: string, data: unknown) => {
        reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      };

      write('started', { requestId, task });

      try {
        let fullContent = '';
        for await (const chunk of adapter.stream(llmInput)) {
          fullContent += chunk.content;
          write('chunk', { content: chunk.content });
        }

        const latencyMs = Date.now() - startTime;

        // Build result based on output type
        let result;
        if (taskDef.outputType === 'suggestion') {
          result = { type: 'suggestion', original: content, suggested: fullContent };
        } else {
          result = { type: 'text', content: fullContent };
        }

        write('result', result);
        write('done', { requestId, latencyMs });
      } catch (err) {
        write('error', { message: err instanceof Error ? err.message : 'Unknown error' });
      }

      reply.raw.end();
      return;
    }

    // ─── JSON Response (non-streaming) ───
    try {
      const llmResult = await adapter.generate(llmInput);
      const latencyMs = Date.now() - startTime;

      let result;
      if (taskDef.outputType === 'article_review') {
        try {
          result = JSON.parse(llmResult.content);
        } catch {
          // If JSON parse fails, wrap in text result
          result = { type: 'text', content: llmResult.content };
        }
      } else if (taskDef.outputType === 'suggestion') {
        result = { type: 'suggestion', original: content, suggested: llmResult.content };
      } else {
        result = { type: 'text', content: llmResult.content };
      }

      return reply.send({
        requestId,
        task,
        status: 'completed',
        result,
        meta: {
          model: llmResult.model,
          latencyMs,
          tokensUsed: llmResult.evalCount,
        },
      });
    } catch (err) {
      const latencyMs = Date.now() - startTime;
      app.log.error({ requestId, task, err, latencyMs }, 'AI run failed');

      return reply.status(500).send({
        requestId,
        task,
        status: 'failed',
        error: err instanceof Error ? err.message : 'AI generation failed',
      });
    }
  });
}
