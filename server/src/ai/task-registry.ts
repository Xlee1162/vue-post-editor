import type { AITask, AIScope } from '../schemas/ai-schemas.js';

export interface AITaskDefinition {
  id: string;
  allowedScopes: AIScope[];
  outputType: 'suggestion' | 'article_review' | 'text';
  promptProfile: string;
  modelProfile: string;
  stream: boolean;
}

export const TASK_REGISTRY: Record<string, AITaskDefinition> = {
  rewrite: {
    id: 'rewrite',
    allowedScopes: ['selection', 'block'],
    outputType: 'suggestion',
    promptProfile: 'rewrite',
    modelProfile: 'rewrite',
    stream: true,
  },
  improve_writing: {
    id: 'improve_writing',
    allowedScopes: ['selection', 'block', 'section'],
    outputType: 'suggestion',
    promptProfile: 'improve',
    modelProfile: 'rewrite',
    stream: true,
  },
  shorten: {
    id: 'shorten',
    allowedScopes: ['selection', 'block'],
    outputType: 'suggestion',
    promptProfile: 'shorten',
    modelProfile: 'rewrite',
    stream: true,
  },
  expand: {
    id: 'expand',
    allowedScopes: ['selection', 'block'],
    outputType: 'suggestion',
    promptProfile: 'expand',
    modelProfile: 'rewrite',
    stream: true,
  },
  continue_writing: {
    id: 'continue_writing',
    allowedScopes: ['block', 'section'],
    outputType: 'text',
    promptProfile: 'continue',
    modelProfile: 'rewrite',
    stream: true,
  },
  generate_example: {
    id: 'generate_example',
    allowedScopes: ['selection', 'block', 'section'],
    outputType: 'text',
    promptProfile: 'generate-example',
    modelProfile: 'rewrite',
    stream: true,
  },
  generate_section: {
    id: 'generate_section',
    allowedScopes: ['section', 'article'],
    outputType: 'text',
    promptProfile: 'generate-section',
    modelProfile: 'rewrite',
    stream: true,
  },
  explain: {
    id: 'explain',
    allowedScopes: ['selection', 'block'],
    outputType: 'text',
    promptProfile: 'explain',
    modelProfile: 'fast-small',
    stream: true,
  },
  fix_grammar: {
    id: 'fix_grammar',
    allowedScopes: ['selection', 'block'],
    outputType: 'suggestion',
    promptProfile: 'fix-grammar',
    modelProfile: 'fast-small',
    stream: false,
  },
  change_tone: {
    id: 'change_tone',
    allowedScopes: ['selection', 'block'],
    outputType: 'suggestion',
    promptProfile: 'change-tone',
    modelProfile: 'rewrite',
    stream: true,
  },
  summarize: {
    id: 'summarize',
    allowedScopes: ['selection', 'block', 'section', 'article'],
    outputType: 'text',
    promptProfile: 'summarize',
    modelProfile: 'rewrite',
    stream: true,
  },
  review_article: {
    id: 'review_article',
    allowedScopes: ['article'],
    outputType: 'article_review',
    promptProfile: 'review-article',
    modelProfile: 'technical-reviewer',
    stream: false,
  },
  review_technical: {
    id: 'review_technical',
    allowedScopes: ['section', 'article'],
    outputType: 'article_review',
    promptProfile: 'review-technical',
    modelProfile: 'technical-reviewer',
    stream: false,
  },
  review_seo: {
    id: 'review_seo',
    allowedScopes: ['article'],
    outputType: 'article_review',
    promptProfile: 'review-seo',
    modelProfile: 'rewrite',
    stream: false,
  },
  custom: {
    id: 'custom',
    allowedScopes: ['selection', 'block', 'section', 'article'],
    outputType: 'text',
    promptProfile: 'custom',
    modelProfile: 'rewrite',
    stream: true,
  },
};

export function getTaskDefinition(task: string): AITaskDefinition | undefined {
  return TASK_REGISTRY[task];
}

export function validateScope(task: string, scope: AIScope): boolean {
  const def = getTaskDefinition(task);
  if (!def) return false;
  return def.allowedScopes.includes(scope);
}
