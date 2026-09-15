/**
 * POST  /api/ai/translate       — Start translation job
 * GET   /api/ai/translate/:jobId/stream — SSE translation progress
 */

import type { FastifyInstance } from 'fastify';
import { nanoid } from 'nanoid';
import { TranslateRequest } from '../schemas/ai-schemas.js';
import { buildPrompt } from '../ai/prompt-manager.js';
import { MODEL_PROFILES } from '../config.js';
import type { LLMAdapter } from '../adapters/llm-adapter.js';

/* ═══════════ In-Memory Job Store ═══════════ */

interface TranslationUnit {
  id: string;
  type: string;
  sourceText: string;
  translatedText?: string;
  preserved: boolean;
}

interface LangJob {
  lang: string;
  status: 'queued' | 'preparing' | 'translating' | 'done' | 'failed';
  progress: number;
  units: TranslationUnit[];
  error?: string;
}

interface TranslationJob {
  jobId: string;
  sourceLanguage: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  languages: Record<string, LangJob>;
  createdAt: number;
}

const jobs = new Map<string, TranslationJob>();

/* ═══════════ Helpers ═══════════ */

const PRESERVE_TYPES = new Set(['code', 'code_block', 'image', 'file', 'embed', 'video']);
const LANG_LABELS: Record<string, string> = { en: 'English', vi: 'Vietnamese', ko: 'Korean' };

function parseDocumentUnits(doc: TranslateRequest['document'], options?: TranslateRequest['options']): TranslationUnit[] {
  const units: TranslationUnit[] = [];
  let idx = 0;

  if (options?.translateTitle !== false && doc.title) {
    units.push({ id: `u_${idx++}`, type: 'title', sourceText: doc.title, preserved: false });
  }

  if (options?.translateSubtitle !== false && doc.subtitle) {
    units.push({ id: `u_${idx++}`, type: 'subtitle', sourceText: doc.subtitle, preserved: false });
  }

  if (options?.translateBody !== false && doc.blocks) {
    for (const block of doc.blocks) {
      const text = block.text ?? (typeof block.content === 'string' ? block.content : JSON.stringify(block.content ?? ''));
      const preserved = PRESERVE_TYPES.has(block.type);
      units.push({ id: `u_${idx++}`, type: block.type, sourceText: text, preserved });
    }
  }

  return units;
}

/* ═══════════ Glossary ═══════════ */

const GLOSSARY: Record<string, Record<string, string>> = {
  'en-vi': {
    'retrieval': 'truy xuất',
    'embedding': 'embedding',
    'agent': 'tác nhân AI',
    'prompt engineering': 'kỹ thuật prompt',
    'fine-tuning': 'tinh chỉnh',
    'hallucination': 'ảo giác',
    'chunking': 'phân đoạn',
    'vector database': 'cơ sở dữ liệu vector',
    'latency': 'độ trễ',
    'throughput': 'thông lượng',
  },
  'en-ko': {
    'retrieval': '검색',
    'embedding': '임베딩',
    'agent': 'AI 에이전트',
    'prompt engineering': '프롬프트 엔지니어링',
    'fine-tuning': '파인튜닝',
  },
};

function getGlossaryStr(source: string, target: string): string {
  const key = `${source}-${target}`;
  const glossary = GLOSSARY[key];
  if (!glossary) return '';
  return Object.entries(glossary)
    .map(([en, local]) => `${en} = ${local}`)
    .join('\n');
}

/* ═══════════ Routes ═══════════ */

export async function aiTranslateRoute(app: FastifyInstance, adapter: LLMAdapter) {

  // ── POST /api/ai/translate ──
  app.post('/api/ai/translate', async (request, reply) => {
    const parsed = TranslateRequest.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: `Validation error: ${parsed.error.issues.map(i => i.message).join(', ')}`,
      });
    }

    const req = parsed.data;
    const jobId = `tj_${nanoid(12)}`;

    // Parse document into translation units
    const units = parseDocumentUnits(req.document, req.options);

    // Create language jobs
    const languages: Record<string, LangJob> = {};
    for (const lang of req.targetLanguages) {
      languages[lang] = {
        lang,
        status: 'queued',
        progress: 0,
        units: units.map(u => ({ ...u, translatedText: u.preserved ? u.sourceText : undefined })),
      };
    }

    const job: TranslationJob = {
      jobId,
      sourceLanguage: req.sourceLanguage,
      status: 'queued',
      languages,
      createdAt: Date.now(),
    };

    jobs.set(jobId, job);

    // Start translation in background (don't await)
    runTranslationJob(job, req, adapter, app).catch(err => {
      app.log.error({ jobId, err }, 'Translation job failed');
      job.status = 'failed';
    });

    return reply.send({
      jobId,
      status: 'queued',
    });
  });

  // ── GET /api/ai/translate/:jobId/stream ──
  app.get<{ Params: { jobId: string } }>('/api/ai/translate/:jobId/stream', async (request, reply) => {
    const { jobId } = request.params;
    const job = jobs.get(jobId);

    if (!job) {
      return reply.status(404).send({ error: `Job not found: ${jobId}` });
    }

    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    const write = (event: string, data: unknown) => {
      reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    // Send current state
    write('status', {
      jobId: job.jobId,
      status: job.status,
      languages: Object.fromEntries(
        Object.entries(job.languages).map(([k, v]) => [k, { status: v.status, progress: v.progress }])
      ),
    });

    // Poll for updates (simplified — in production use event emitter)
    const interval = setInterval(() => {
      for (const [lang, langJob] of Object.entries(job.languages)) {
        write('progress', {
          lang,
          label: LANG_LABELS[lang] ?? lang,
          status: langJob.status,
          progress: Math.round(langJob.progress),
        });
      }

      if (job.status === 'completed' || job.status === 'failed') {
        // Send final translated content
        const translations: Record<string, unknown> = {};
        for (const [lang, langJob] of Object.entries(job.languages)) {
          translations[lang] = {
            status: langJob.status,
            units: langJob.units.map(u => ({
              id: u.id,
              type: u.type,
              translated: u.translatedText ?? u.sourceText,
            })),
          };
        }

        write('done', { jobId: job.jobId, translations });
        clearInterval(interval);
        reply.raw.end();
      }
    }, 500);

    request.raw.on('close', () => {
      clearInterval(interval);
    });
  });
}

/* ═══════════ Translation Executor ═══════════ */

async function runTranslationJob(
  job: TranslationJob,
  req: TranslateRequest,
  adapter: LLMAdapter,
  app: FastifyInstance
) {
  job.status = 'running';

  for (const [langCode, langJob] of Object.entries(job.languages)) {
    langJob.status = 'preparing';
    langJob.progress = 5;

    await sleep(300);

    langJob.status = 'translating';

    const glossary = getGlossaryStr(job.sourceLanguage, langCode);
    const targetLanguage = LANG_LABELS[langCode] ?? langCode;

    // Translate non-preserved units
    const translatableUnits = langJob.units.filter(u => !u.preserved);
    const totalUnits = translatableUnits.length;

    for (let i = 0; i < totalUnits; i++) {
      const unit = translatableUnits[i]!;

      try {
        const { system, user } = buildPrompt(
          'translation',
          unit.sourceText,
          req.document ? {
            category: 'general',
            contentType: 'article',
            targetAudience: 'intermediate',
            sourceLanguage: job.sourceLanguage as 'en' | 'vi' | 'ko',
          } : undefined,
          undefined,
          { targetLanguage, glossary }
        );

        const modelProfile = MODEL_PROFILES['translation']!;
        const result = await adapter.generate({
          model: modelProfile.model,
          system,
          prompt: user,
          temperature: modelProfile.temperature,
          timeoutMs: modelProfile.timeoutMs,
        });

        unit.translatedText = result.content.trim();
      } catch (err) {
        app.log.error({ jobId: job.jobId, lang: langCode, unitId: unit.id, err }, 'Unit translation failed');
        unit.translatedText = `[Translation failed] ${unit.sourceText}`;
      }

      langJob.progress = 10 + ((i + 1) / totalUnits) * 90;
    }

    langJob.status = 'done';
    langJob.progress = 100;
  }

  job.status = 'completed';
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
