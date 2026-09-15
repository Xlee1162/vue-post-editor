/**
 * AI Service — Frontend API wrapper
 *
 * All AI API calls go through this service.
 * Frontend never interacts with Ollama directly.
 */

/* ═══════════ Types ═══════════ */

export interface AIContext {
  category: string;
  contentType: string;
  targetAudience: string;
  sourceLanguage: 'en' | 'vi' | 'ko';
}

export interface AIRunRequest {
  task: string;
  scope: 'selection' | 'block' | 'section' | 'article';
  context: AIContext;
  selection?: { text: string };
  document?: unknown;
  instruction?: string;
}

export interface AIRunResponse {
  requestId: string;
  task: string;
  status: 'completed' | 'failed';
  result?: AIRunResult;
  error?: string;
  meta?: { model: string; latencyMs: number; tokensUsed?: number };
}

export type AIRunResult =
  | { type: 'suggestion'; original: string; suggested: string }
  | { type: 'article_review'; score: number; dimensions: Record<string, number>; issues: AIReviewIssue[] }
  | { type: 'text'; content: string };

export interface AIReviewIssue {
  id: string;
  severity: 'info' | 'suggestion' | 'warning' | 'critical';
  type: string;
  title: string;
  description: string;
}

export interface TranslateRequest {
  sourceLanguage: string;
  targetLanguages: string[];
  document: {
    title?: string;
    subtitle?: string;
    blocks?: Array<{ type: string; text?: string }>;
  };
  options?: {
    translateTitle?: boolean;
    translateSubtitle?: boolean;
    translateBody?: boolean;
    translateSeo?: boolean;
  };
}

export interface TranslateJobResponse {
  jobId: string;
  status: string;
}

export interface TranslateProgress {
  lang: string;
  label: string;
  status: string;
  progress: number;
}

/* ═══════════ API Calls ═══════════ */

const API_BASE = '/api';

/**
 * Run an AI task (non-streaming JSON response)
 */
export async function runAI(request: AIRunRequest): Promise<AIRunResponse> {
  const res = await fetch(`${API_BASE}/ai/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `AI request failed: ${res.status}`);
  }

  return res.json();
}

/**
 * Run an AI task with SSE streaming
 * Returns an async generator that yields chunks
 */
export async function* streamAI(request: AIRunRequest): AsyncGenerator<{
  type: 'started' | 'chunk' | 'result' | 'done' | 'error';
  data: unknown;
}> {
  const res = await fetch(`${API_BASE}/ai/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    throw new Error(`AI stream request failed: ${res.status}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    let currentEvent = '';
    for (const line of lines) {
      if (line.startsWith('event: ')) {
        currentEvent = line.slice(7).trim();
      } else if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        yield { type: currentEvent as any, data };
        currentEvent = '';
      }
    }
  }
}

/**
 * Start a translation job
 */
export async function translateArticle(request: TranslateRequest): Promise<TranslateJobResponse> {
  const res = await fetch(`${API_BASE}/ai/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `Translation request failed: ${res.status}`);
  }

  return res.json();
}

/**
 * Stream translation progress via SSE
 */
export async function* streamTranslation(jobId: string): AsyncGenerator<{
  type: string;
  data: unknown;
}> {
  const res = await fetch(`${API_BASE}/ai/translate/${jobId}/stream`, {
    headers: { 'Accept': 'text/event-stream' },
  });

  if (!res.ok) {
    throw new Error(`Translation stream failed: ${res.status}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    let currentEvent = '';
    for (const line of lines) {
      if (line.startsWith('event: ')) {
        currentEvent = line.slice(7).trim();
      } else if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        yield { type: currentEvent, data };
        currentEvent = '';
      }
    }
  }
}
