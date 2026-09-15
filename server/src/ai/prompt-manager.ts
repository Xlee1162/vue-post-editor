/**
 * Prompt Manager
 *
 * Builds system and user prompts for each AI task,
 * injecting editorial profile and context.
 */

import type { AIContext } from '../schemas/ai-schemas.js';
import { resolveEditorialProfile } from './editorial-profile.js';

interface PromptParts {
  system: string;
  user: string;
}

const TASK_PROMPTS: Record<string, (ctx: PromptContext) => PromptParts> = {
  'rewrite': (ctx) => ({
    system: `You are a professional content editor for an AI knowledge platform.

${formatProfile(ctx)}

Task: Rewrite the following text to improve clarity, flow, and readability.
${ctx.instruction ? `Additional instruction: ${ctx.instruction}` : ''}

Rules:
- Preserve technical meaning and accuracy
- Keep the same level of detail
- Do not add new information
- Return ONLY the rewritten text, no explanation or preamble`,
    user: ctx.content,
  }),

  'improve': (ctx) => ({
    system: `You are a professional content editor for an AI knowledge platform.

${formatProfile(ctx)}

Task: Improve the writing quality of the following text — better clarity, smoother transitions, more precise wording.
${ctx.instruction ? `Additional instruction: ${ctx.instruction}` : ''}

Rules:
- Preserve technical meaning
- Maintain the author's voice
- Return ONLY the improved text`,
    user: ctx.content,
  }),

  'shorten': (ctx) => ({
    system: `You are a professional content editor. Make the following text more concise while preserving all key information.

${formatProfile(ctx)}

Rules:
- Remove redundancy
- Tighten wording
- Keep technical accuracy
- Return ONLY the shortened text`,
    user: ctx.content,
  }),

  'expand': (ctx) => ({
    system: `You are a professional content editor. Expand the following text with more detail, examples, or explanation while keeping it focused and valuable.

${formatProfile(ctx)}

Rules:
- Add relevant detail, not filler
- Keep the same tone
- Return ONLY the expanded text`,
    user: ctx.content,
  }),

  'explain': (ctx) => ({
    system: `You are a helpful AI assistant for an AI knowledge platform. Explain the following text in simpler terms.

${formatProfile(ctx)}

Rules:
- Use clear, accessible language
- Include an analogy if helpful
- Return ONLY the explanation`,
    user: ctx.content,
  }),

  'fix-grammar': (ctx) => ({
    system: `Fix any grammar, spelling, or punctuation errors in the following text. Return ONLY the corrected text.`,
    user: ctx.content,
  }),

  'change-tone': (ctx) => ({
    system: `Rewrite the following text to change its tone.
${ctx.instruction ? `Target tone: ${ctx.instruction}` : 'Target tone: professional and approachable'}

Rules:
- Preserve all information
- Return ONLY the rewritten text`,
    user: ctx.content,
  }),

  'summarize': (ctx) => ({
    system: `Summarize the following text concisely. Capture the key points and main ideas.

${formatProfile(ctx)}

Rules:
- Be concise but complete
- Return ONLY the summary`,
    user: ctx.content,
  }),

  'generate-example': (ctx) => ({
    system: `You are an expert content creator for an AI knowledge platform. Generate a practical, concrete example related to the following content.

${formatProfile(ctx)}

Rules:
- Make the example realistic and useful
- Include specific details
- Return ONLY the example content`,
    user: ctx.content,
  }),

  'review-technical': (ctx) => ({
    system: `You are a technical editor for an AI knowledge platform.

${formatProfile(ctx)}

Review goals:
1. Check logical structure and flow
2. Identify terminology inconsistencies
3. Identify potentially unsupported technical claims
4. Check practical usefulness (examples, code, trade-offs)
5. Identify important missing concepts

Rules:
- Do not invent facts
- Distinguish possible issues from verified facts
- Return structured JSON ONLY in this format:
{
  "type": "article_review",
  "score": <number 0-100>,
  "dimensions": { "structure": <n>, "clarity": <n>, "technical": <n>, "completeness": <n>, "consistency": <n> },
  "issues": [{ "id": "issue_<n>", "severity": "info|suggestion|warning|critical", "type": "<type>", "title": "<title>", "description": "<description>" }]
}`,
    user: ctx.content,
  }),

  'review-article': (ctx) => ({
    system: `You are an editorial reviewer for an AI knowledge platform. Review the article for overall quality.

${formatProfile(ctx)}

Return structured JSON ONLY in this format:
{
  "type": "article_review",
  "score": <number 0-100>,
  "dimensions": { "structure": <n>, "clarity": <n>, "technical": <n>, "completeness": <n>, "consistency": <n> },
  "issues": [{ "id": "issue_<n>", "severity": "info|suggestion|warning|critical", "type": "<type>", "title": "<title>", "description": "<description>" }]
}`,
    user: ctx.content,
  }),

  'review-seo': (ctx) => ({
    system: `You are an SEO specialist reviewing content for an AI knowledge platform. Analyze the following content for SEO quality.

Return structured JSON ONLY in this format:
{
  "type": "article_review",
  "score": <number 0-100>,
  "dimensions": { "title_quality": <n>, "heading_structure": <n>, "keyword_usage": <n>, "readability": <n>, "meta_quality": <n> },
  "issues": [{ "id": "issue_<n>", "severity": "info|suggestion|warning|critical", "type": "<type>", "title": "<title>", "description": "<description>" }]
}`,
    user: ctx.content,
  }),

  'custom': (ctx) => ({
    system: `You are a helpful AI assistant for an AI knowledge platform.

${formatProfile(ctx)}

${ctx.instruction ? `Task: ${ctx.instruction}` : 'Help the user with their content.'}

Rules:
- Be helpful and accurate
- Keep the response focused`,
    user: ctx.content,
  }),

  'translation': (ctx) => ({
    system: `You are a professional technical translator for an AI knowledge platform.

Source language: ${ctx.sourceLanguage}
Target language: ${ctx.targetLanguage ?? 'Vietnamese'}
Category: ${ctx.context?.category ?? 'general'}
Content type: ${ctx.context?.contentType ?? 'article'}
Target audience: ${ctx.context?.targetAudience ?? 'intermediate'}

${ctx.glossary ? `Preferred terminology:\n${ctx.glossary}` : ''}

Rules:
- Preserve technical meaning
- Do NOT translate: code, URLs, product names, model names, variable names, command syntax
- Keep document structure intact
- Use natural ${ctx.targetLanguage ?? 'Vietnamese'} technical terminology
- Do not add or remove information
- Preserve inline formatting (bold, italic, code)
- Return ONLY the translated text`,
    user: `Translate the following content:\n\n${ctx.content}`,
  }),
};

interface PromptContext {
  content: string;
  context?: AIContext;
  instruction?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  glossary?: string;
}

function formatProfile(ctx: PromptContext): string {
  if (!ctx.context) return '';

  const profile = resolveEditorialProfile(ctx.context);

  return `Editorial profile:
- Category: ${ctx.context.category}
- Content type: ${ctx.context.contentType}
- Audience: ${ctx.context.targetAudience}
- Language: ${ctx.context.sourceLanguage}
- Tone: ${profile.tone}
- Technical depth: ${profile.technicalDepth}`;
}

export function buildPrompt(
  promptProfile: string,
  content: string,
  context?: AIContext,
  instruction?: string,
  options?: { targetLanguage?: string; glossary?: string }
): PromptParts {
  const builder = TASK_PROMPTS[promptProfile];
  if (!builder) {
    // fallback to custom
    return TASK_PROMPTS['custom']!({
      content,
      context,
      instruction,
    });
  }

  return builder({
    content,
    context,
    instruction,
    sourceLanguage: context?.sourceLanguage,
    targetLanguage: options?.targetLanguage,
    glossary: options?.glossary,
  });
}
