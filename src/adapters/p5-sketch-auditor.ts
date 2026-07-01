import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { normalizeAxeViolations } from '../core/issue-normalizer.js';
import { runAxeOnPage } from './playwright-axe.js';
import { rulesForContext, promptsForContext } from '../core/rules-engine.js';
import type { AuditIssue, HumanReviewPrompt, AccessibilityRule } from '../core/types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const P5_RULES_PATH = path.resolve(__dirname, '../../rules/p5-canvas-rules.json');

interface P5CanvasRules {
  descriptionFunctions: string[];
  mouseOnlyFunctions: string[];
  keyboardFunctions: string[];
  animationIndicators: string[];
}

function loadP5CanvasRules(): P5CanvasRules {
  return JSON.parse(readFileSync(P5_RULES_PATH, 'utf-8')) as P5CanvasRules;
}

function ruleToIssue(rule: AccessibilityRule, location?: string): AuditIssue {
  return {
    id: rule.id,
    title: rule.title,
    severity: rule.severity,
    wcag: rule.wcag,
    principle: rule.principle,
    location,
    explanation: rule.description,
    nextSteps: rule.nextSteps,
    source: 'p5-auditor',
  };
}

export interface P5PatternMatches {
  hasCanvas: boolean;
  usesP5: boolean;
  hasDescription: boolean;
  mouseOnly: boolean;
  hasKeyboardAlternative: boolean;
  isAnimated: boolean;
}

export function detectP5Patterns(html: string, patterns: P5CanvasRules = loadP5CanvasRules()): P5PatternMatches {
  const hasCanvas = /<canvas[\s>]/i.test(html);
  const usesP5 = /p5\.(min\.)?js/i.test(html) || hasCanvas;

  return {
    hasCanvas,
    usesP5,
    hasDescription: patterns.descriptionFunctions.some((fn) => html.includes(fn)),
    mouseOnly: patterns.mouseOnlyFunctions.some((fn) => html.includes(fn)),
    hasKeyboardAlternative: patterns.keyboardFunctions.some((fn) => html.includes(fn)),
    isAnimated: patterns.animationIndicators.some((fn) => html.includes(fn)),
  };
}

export function buildP5Issues(matches: P5PatternMatches): AuditIssue[] {
  const rules = rulesForContext(['p5', 'canvas']);
  const ruleById = new Map(rules.map((rule) => [rule.id, rule]));
  const issues: AuditIssue[] = [];

  if (matches.hasCanvas && !matches.hasDescription) {
    const rule = ruleById.get('p5-canvas-description');
    if (rule) issues.push(ruleToIssue(rule, 'canvas'));
  }

  if (matches.hasCanvas && matches.mouseOnly && !matches.hasKeyboardAlternative) {
    const rule = ruleById.get('p5-keyboard-alternative');
    if (rule) issues.push(ruleToIssue(rule, 'canvas'));
  }

  if (matches.hasCanvas && matches.isAnimated) {
    const rule = ruleById.get('p5-animation-pause-control');
    if (rule) issues.push(ruleToIssue(rule, 'canvas'));
  }

  return issues;
}

export function buildP5HumanReviewPrompts(matches: P5PatternMatches): HumanReviewPrompt[] {
  const contexts: Array<'p5' | 'canvas' | 'animation'> = ['p5', 'canvas'];
  if (matches.isAnimated) contexts.push('animation');
  return promptsForContext(contexts);
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
