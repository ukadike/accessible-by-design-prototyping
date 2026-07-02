import type { AccessibilityRule, HumanReviewPrompt } from './types.js';

export type AuditContext = 'html' | 'p5' | 'canvas' | 'animation' | 'pdf';

export function filterPromptsByContext(
  prompts: HumanReviewPrompt[],
  contexts: AuditContext[],
): HumanReviewPrompt[] {
  return prompts.filter((prompt) => prompt.appliesTo.some((tag) => contexts.includes(tag as AuditContext)));
}

export function filterRulesByContext(
  rules: AccessibilityRule[],
  contexts: AuditContext[],
): AccessibilityRule[] {
  return rules.filter((rule) => (rule.appliesTo ?? []).some((tag) => contexts.includes(tag as AuditContext)));
}
