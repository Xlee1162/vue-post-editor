/**
 * Mock LLM Adapter
 *
 * Returns realistic-looking mock responses for development without Ollama.
 * Simulates latency and streaming behavior.
 */

import type { LLMAdapter, GenerateInput, GenerateResult, LLMChunk } from './llm-adapter.js';

const MOCK_DELAY_MS = 800;
const CHUNK_DELAY_MS = 40;

export class MockAdapter implements LLMAdapter {
  async generate(input: GenerateInput): Promise<GenerateResult> {
    const start = Date.now();
    await sleep(MOCK_DELAY_MS + Math.random() * 500);

    const content = this.generateMockContent(input);

    return {
      content,
      model: `mock-${input.model}`,
      totalDuration: Date.now() - start,
      promptEvalCount: input.prompt.length,
      evalCount: content.length,
    };
  }

  async *stream(input: GenerateInput): AsyncIterable<LLMChunk> {
    await sleep(200);

    const content = this.generateMockContent(input);
    const words = content.split(/(\s+)/);

    for (let i = 0; i < words.length; i++) {
      await sleep(CHUNK_DELAY_MS + Math.random() * 20);
      yield {
        content: words[i],
        done: i === words.length - 1,
      };
    }
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  private generateMockContent(input: GenerateInput): string {
    const prompt = input.prompt.toLowerCase();
    const system = (input.system ?? '').toLowerCase();

    // Check if it's a JSON format request (review tasks)
    if (input.format === 'json' || system.includes('return structured json') || system.includes('json only')) {
      return this.generateMockReview();
    }

    // Translation
    if (system.includes('translator') || prompt.includes('translate')) {
      return this.generateMockTranslation(input.prompt);
    }

    // Rewrite / improve
    if (system.includes('rewrite') || system.includes('improve') || system.includes('clearer')) {
      return this.generateMockRewrite(input.prompt);
    }

    // Shorten
    if (system.includes('shorten') || system.includes('shorter') || system.includes('concise')) {
      return this.generateMockShorten(input.prompt);
    }

    // Expand
    if (system.includes('expand') || system.includes('longer') || system.includes('elaborate')) {
      return this.generateMockExpand(input.prompt);
    }

    // Explain
    if (system.includes('explain')) {
      return this.generateMockExplain(input.prompt);
    }

    // Summarize
    if (system.includes('summarize') || system.includes('summary')) {
      return this.generateMockSummarize(input.prompt);
    }

    // Generate example
    if (system.includes('example') || system.includes('generate')) {
      return this.generateMockExample();
    }

    // Default: improve the text
    return this.generateMockRewrite(input.prompt);
  }

  private generateMockReview(): string {
    return JSON.stringify({
      type: 'article_review',
      score: 82,
      dimensions: {
        structure: 90,
        clarity: 86,
        technical: 81,
        completeness: 76,
        consistency: 92,
      },
      issues: [
        {
          id: 'issue_001',
          severity: 'warning',
          type: 'missing_section',
          title: 'Missing evaluation section',
          description: 'The article explains retrieval and generation but does not discuss evaluation metrics or how to measure RAG system quality.',
        },
        {
          id: 'issue_002',
          severity: 'suggestion',
          type: 'terminology',
          title: 'Terminology inconsistency',
          description: 'The term "retriever" is used interchangeably with "retrieval system" — consider standardizing to one term.',
        },
        {
          id: 'issue_003',
          severity: 'info',
          type: 'practical_example',
          title: 'Add practical example',
          description: 'Consider adding a concrete example showing how chunk size affects retrieval quality in a real scenario.',
        },
      ],
    });
  }

  private generateMockTranslation(prompt: string): string {
    // Extract the content to translate (after the last instruction block)
    const lines = prompt.split('\n');
    const contentStart = lines.findIndex(l => l.includes('Translate the following'));
    if (contentStart >= 0) {
      const content = lines.slice(contentStart + 1).join('\n').trim();
      // Simple mock: prefix with [VI] to indicate translation
      return `[Đã dịch] ${content.slice(0, 200)}...`;
    }
    return 'Retrieval-augmented generation không chỉ là một mô hình; đây là hệ thống phân phối cho các sản phẩm AI đáng tin cậy.';
  }

  private generateMockRewrite(prompt: string): string {
    return 'Retrieval-augmented generation (RAG) represents a fundamental architectural pattern for building trustworthy AI systems. Rather than relying solely on a model\'s parametric knowledge, RAG grounds responses in retrieved evidence — improving factual accuracy, reducing hallucinations, and enabling domain-specific knowledge integration.';
  }

  private generateMockShorten(prompt: string): string {
    return 'RAG combines document retrieval with LLM generation to produce grounded, accurate AI responses.';
  }

  private generateMockExpand(prompt: string): string {
    return 'Retrieval-augmented generation (RAG) is a powerful architectural pattern that enhances large language models by incorporating external knowledge retrieval into the generation process.\n\nAt its core, RAG works in three stages: First, a retriever component searches a knowledge base to find documents relevant to the user\'s query. This retrieval step uses embedding models to convert both the query and documents into vector representations, enabling semantic similarity matching.\n\nSecond, the retrieved documents are combined with the original query to form an enriched context. This context provides the LLM with specific, up-to-date information that may not exist in its training data.\n\nThird, the LLM generates a response grounded in the retrieved evidence, significantly reducing the risk of hallucination and improving factual accuracy.\n\nThe key advantage of RAG over pure LLM approaches is that the knowledge base can be continuously updated without retraining the model, making it ideal for domains where information changes frequently.';
  }

  private generateMockExplain(prompt: string): string {
    return 'RAG (Retrieval-Augmented Generation) works like a student who looks up references before answering a question, rather than relying purely on memory. The "retrieval" step finds relevant documents, and the "generation" step uses those documents as context to produce a well-grounded answer. This approach significantly reduces hallucinations because the model bases its response on actual evidence rather than its potentially outdated or incomplete training data.';
  }

  private generateMockSummarize(prompt: string): string {
    return 'This article covers building production RAG systems, including retrieval architecture, quality evaluation, and operational best practices. Key takeaways: use semantic chunking, implement reranking, establish evaluation loops, and monitor retrieval quality metrics in production.';
  }

  private generateMockExample(): string {
    return 'For example, consider a customer support RAG system that needs to answer questions about product features:\n\n1. A user asks: "Does the Pro plan include API access?"\n2. The retriever searches the product documentation and finds 3 relevant chunks about pricing tiers\n3. The reranker scores these chunks and selects the most relevant one\n4. The LLM generates: "Yes, the Pro plan includes full API access with a rate limit of 1000 requests per minute. See our API documentation for details."\n\nWithout RAG, the LLM might hallucinate pricing details or provide outdated information.';
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
