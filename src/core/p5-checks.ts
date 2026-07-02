import type { AccessibilityRule, AuditIssue } from './types.js';
import type { AuditContext } from './context-filter.js';

export interface P5CanvasRules {
  descriptionFunctions: string[];
  mouseOnlyFunctions: string[];
  keyboardFunctions: string[];
  animationIndicators: string[];
}

export interface P5PatternMatches {
  hasCanvas: boolean;
  usesP5: boolean;
  hasDescription: boolean;
  mouseOnly: boolean;
  hasKeyboardAlternative: boolean;
  isAnimated: boolean;
}

export function detectP5PatternsInSource(html: string, patterns: P5CanvasRules): P5PatternMatches {
  const hasCanvas = /<canvas[\s>]/i.test(html) || /createCanvas\s*\(/.test(html);
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

export function buildP5IssuesFromRules(matches: P5PatternMatches, rules: AccessibilityRule[]): AuditIssue[] {
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

export function p5ContextsFor(matches: P5PatternMatches): AuditContext[] {
  const contexts: AuditContext[] = ['p5', 'canvas'];
  if (matches.isAnimated) contexts.push('animation');
  return contexts;
}
