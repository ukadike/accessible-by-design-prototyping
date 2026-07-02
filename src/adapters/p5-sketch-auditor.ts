import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { normalizeAxeViolations } from '../core/issue-normalizer.js';
import { runAxeOnPage } from './playwright-axe.js';
import { rulesForContext, promptsForContext } from '../core/rules-engine.js';
import {
  detectP5PatternsInSource,
  buildP5IssuesFromRules,
  p5ContextsFor,
  type P5CanvasRules,
  type P5PatternMatches,
} from '../core/p5-checks.js';
import type { AuditIssue, HumanReviewPrompt } from '../core/types.js';

export type { P5PatternMatches } from '../core/p5-checks.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const P5_RULES_PATH = path.resolve(__dirname, '../../rules/p5-canvas-rules.json');

function loadP5CanvasRules(): P5CanvasRules {
  return JSON.parse(readFileSync(P5_RULES_PATH, 'utf-8')) as P5CanvasRules;
}

export function detectP5Patterns(html: string, patterns: P5CanvasRules = loadP5CanvasRules()): P5PatternMatches {
  return detectP5PatternsInSource(html, patterns);
}

export function buildP5Issues(matches: P5PatternMatches): AuditIssue[] {
  return buildP5IssuesFromRules(matches, rulesForContext(['p5', 'canvas']));
}

export function buildP5HumanReviewPrompts(matches: P5PatternMatches): HumanReviewPrompt[] {
  return promptsForContext(p5ContextsFor(matches));
}

export interface P5AuditResult {
  issues: AuditIssue[];
  humanReviewPrompts: HumanReviewPrompt[];
  hasCanvas: boolean;
  usesP5: boolean;
}

export async function auditP5Sketch(target: string): Promise<P5AuditResult> {
  const { axeResults, html } = await runAxeOnPage(target);
  const issues = normalizeAxeViolations(axeResults);

  const matches = detectP5Patterns(html);
  issues.push(...buildP5Issues(matches));
  const humanReviewPrompts = buildP5HumanReviewPrompts(matches);

  return { issues, humanReviewPrompts, hasCanvas: matches.hasCanvas, usesP5: matches.usesP5 };
}
