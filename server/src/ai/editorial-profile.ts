import type { AIContext } from '../schemas/ai-schemas.js';

export interface EditorialProfile {
  tone: string;
  technicalDepth: string;
  structureRules: string[];
  reviewRules: string[];
}

const PROFILES: Record<string, Partial<EditorialProfile>> = {
  'best-practices': { tone: 'professional-practical', structureRules: ['problem', 'approach', 'example', 'tradeoffs', 'conclusion'] },
  'tutorial': { tone: 'instructional', structureRules: ['goal', 'prerequisites', 'steps', 'result', 'troubleshooting'] },
  'research': { tone: 'academic-approachable', structureRules: ['abstract', 'background', 'method', 'results', 'discussion'] },
  'learning': { tone: 'educational', structureRules: ['concept', 'explanation', 'example', 'practice', 'summary'] },
  'community': { tone: 'conversational', structureRules: ['context', 'story', 'insight', 'takeaway'] },
};

const AUDIENCE_DEPTH: Record<string, string> = {
  'beginner': 'low-medium',
  'intermediate': 'medium-high',
  'advanced': 'high',
  'expert': 'very-high',
};

export function resolveEditorialProfile(context: AIContext): EditorialProfile {
  const categoryProfile = PROFILES[context.category.toLowerCase().replace(/\s+/g, '-')] ?? {};
  const contentTypeProfile = PROFILES[context.contentType.toLowerCase().replace(/\s+/g, '-')] ?? {};

  return {
    tone: categoryProfile.tone ?? contentTypeProfile.tone ?? 'professional',
    technicalDepth: AUDIENCE_DEPTH[context.targetAudience.toLowerCase()] ?? 'medium',
    structureRules: categoryProfile.structureRules ?? contentTypeProfile.structureRules ?? ['introduction', 'body', 'conclusion'],
    reviewRules: ['technical-consistency', 'practical-example', 'completeness'],
  };
}
