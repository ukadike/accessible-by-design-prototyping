import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import type { AccessibilityRule, HumanReviewPrompt } from './types.js';
import { filterPromptsByContext, filterRulesByContext, type AuditContext } from './context-filter.js';

export type { AuditContext } from './context-filter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RULES_DIR = path.resolve(__dirname, '../../rules');

function loadJson<T>(fileName: string): T {
  const raw = readFileSync(path.join(RULES_DIR, fileName), 'utf-8');
  return JSON.parse(raw) as T;
}

export function loadHumanReviewPrompts(): HumanReviewPrompt[] {
  return loadJson<HumanReviewPrompt[]>('human-review-prompts.json');
}

export function loadWcagPlusRules(): AccessibilityRule[] {
  const data = loadJson<{ rules: AccessibilityRule[] }>('wcag-2-plus.json');
  return data.rules;
}

export function promptsForContext(contexts: AuditContext[]): HumanReviewPrompt[] {
  return filterPromptsByContext(loadHumanReviewPrompts(), contexts);
}

export function rulesForContext(contexts: AuditContext[]): AccessibilityRule[] {
  return filterRulesByContext(loadWcagPlusRules(), contexts);
}
