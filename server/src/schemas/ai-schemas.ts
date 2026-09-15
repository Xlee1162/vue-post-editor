import { z } from 'zod';

/* ═══════════ Shared ═══════════ */

export const AIScope = z.enum(['selection', 'block', 'section', 'article']);
export type AIScope = z.infer<typeof AIScope>;

export const AITask = z.enum([
  'rewrite',
  'improve_writing',
  'shorten',
  'expand',
  'continue_writing',
  'generate_example',
  'generate_section',
  'review_article',
  'review_technical',
  'review_seo',
  'explain',
  'fix_grammar',
  'change_tone',
  'summarize',
  'custom',
]);
export type AITask = z.infer<typeof AITask>;

export const AIContext = z.object({
  category: z.string().default('general'),
  contentType: z.string().default('article'),
  targetAudience: z.string().default('intermediate'),
  sourceLanguage: z.enum(['en', 'vi', 'ko']).default('en'),
});
export type AIContext = z.infer<typeof AIContext>;

/* ═══════════ AI Run ═══════════ */

export const AIRunRequest = z.object({
  task: AITask,
  scope: AIScope,
  context: AIContext,
  selection: z.object({
    text: z.string(),
  }).optional(),
  document: z.any().optional(),
  nodeId: z.string().optional(),
  instruction: z.string().optional(),
});
export type AIRunRequest = z.infer<typeof AIRunRequest>;

export const AISuggestionResult = z.object({
  type: z.literal('suggestion'),
  original: z.string(),
  suggested: z.string(),
});

export const AIReviewIssue = z.object({
  id: z.string(),
  severity: z.enum(['info', 'suggestion', 'warning', 'critical']),
  type: z.string(),
  nodeId: z.string().optional(),
  title: z.string(),
  description: z.string(),
});

export const AIReviewResult = z.object({
  type: z.literal('article_review'),
  score: z.number(),
  dimensions: z.record(z.string(), z.number()),
  issues: z.array(AIReviewIssue),
});

export const AITextResult = z.object({
  type: z.literal('text'),
  content: z.string(),
});

export const AIRunResult = z.union([AISuggestionResult, AIReviewResult, AITextResult]);
export type AIRunResult = z.infer<typeof AIRunResult>;

export const AIRunResponse = z.object({
  requestId: z.string(),
  task: AITask,
  status: z.enum(['completed', 'failed']),
  result: AIRunResult.optional(),
  error: z.string().optional(),
  meta: z.object({
    model: z.string(),
    latencyMs: z.number(),
    tokensUsed: z.number().optional(),
  }).optional(),
});
export type AIRunResponse = z.infer<typeof AIRunResponse>;

/* ═══════════ Translate ═══════════ */

export const TranslateRequest = z.object({
  articleId: z.string().optional(),
  sourceLanguage: z.enum(['en', 'vi', 'ko']),
  targetLanguages: z.array(z.enum(['en', 'vi', 'ko'])).min(1),
  sourceVersion: z.number().optional(),
  document: z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    blocks: z.array(z.object({
      type: z.string(),
      text: z.string().optional(),
      content: z.any().optional(),
    })).optional(),
  }),
  options: z.object({
    translateTitle: z.boolean().default(true),
    translateSubtitle: z.boolean().default(true),
    translateBody: z.boolean().default(true),
    translateSeo: z.boolean().default(false),
  }).optional(),
});
export type TranslateRequest = z.infer<typeof TranslateRequest>;

export const TranslateJobResponse = z.object({
  jobId: z.string(),
  status: z.enum(['queued', 'running', 'completed', 'failed']),
});
export type TranslateJobResponse = z.infer<typeof TranslateJobResponse>;
