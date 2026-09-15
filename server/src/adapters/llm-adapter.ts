/**
 * LLM Adapter Interface
 *
 * Abstraction over model runtime (Ollama, vLLM, OpenAI-compatible, etc.)
 * Backend code only interacts with this interface — never with Ollama directly.
 */

export interface GenerateInput {
  model: string;
  prompt: string;
  system?: string;
  temperature?: number;
  maxTokens?: number;
  format?: 'json' | undefined;
  timeoutMs?: number;
}

export interface GenerateResult {
  content: string;
  model: string;
  totalDuration?: number;
  promptEvalCount?: number;
  evalCount?: number;
}

export interface LLMChunk {
  content: string;
  done: boolean;
}

export interface LLMAdapter {
  generate(input: GenerateInput): Promise<GenerateResult>;
  stream(input: GenerateInput): AsyncIterable<LLMChunk>;
  isAvailable(): Promise<boolean>;
}
