export interface AppConfig {
  port: number;
  ollamaBaseUrl: string;
  defaultModel: string;
  logLevel: string;
}

export function loadConfig(): AppConfig {
  return {
    port: parseInt(process.env['PORT'] ?? '3001', 10),
    ollamaBaseUrl: process.env['OLLAMA_BASE_URL'] ?? 'http://localhost:11434',
    defaultModel: process.env['DEFAULT_MODEL'] ?? 'qwen2.5:7b',
    logLevel: process.env['LOG_LEVEL'] ?? 'info',
  };
}

export interface ModelProfile {
  model: string;
  temperature: number;
  maxTokens?: number;
  timeoutMs: number;
}

export const MODEL_PROFILES: Record<string, ModelProfile> = {
  'fast-small': {
    model: 'qwen2.5:3b',
    temperature: 0.4,
    timeoutMs: 15_000,
  },
  'rewrite': {
    model: 'qwen2.5:7b',
    temperature: 0.4,
    timeoutMs: 30_000,
  },
  'translation': {
    model: 'qwen2.5:7b',
    temperature: 0.2,
    timeoutMs: 60_000,
  },
  'technical-reviewer': {
    model: 'qwen2.5:7b',
    temperature: 0.1,
    timeoutMs: 90_000,
  },
};
