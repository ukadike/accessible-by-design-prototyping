import { describe, expect, it } from 'vitest';
import wcagPlusData from '../rules/wcag-2-plus.json';
import p5CanvasRulesData from '../rules/p5-canvas-rules.json';
import { buildP5IssuesFromRules, detectP5PatternsInSource, type P5CanvasRules } from '../src/core/p5-checks.js';
import type { AccessibilityRule } from '../src/core/types.js';

const rules = (wcagPlusData as { rules: AccessibilityRule[] }).rules.filter((rule) =>
  rule.id === 'p5-animation-pause-control',
);
const patterns = p5CanvasRulesData as P5CanvasRules;

describe('p5 pause control detection', () => {
  it('does not report continuous-motion risk when noLoop is present as a pause path', () => {
    const source = `
      function setup() { createCanvas(640, 420); describe('A garden of shapes.'); noLoop(); }
      function draw() { background(240); }
      function keyPressed() { if (key === 'p') loop(); else noLoop(); }
    `;
    const matches = detectP5PatternsInSource(source, patterns);
    expect(matches.hasPauseControl).toBe(true);
    expect(buildP5IssuesFromRules(matches, rules)).toEqual([]);
  });

  it('keeps the motion review issue when a draw loop has no pause indicator', () => {
    const source = 'createCanvas(640, 420); function draw() { background(240); }';
    const matches = detectP5PatternsInSource(source, patterns);
    expect(matches.isAnimated).toBe(true);
    expect(matches.hasPauseControl).toBe(false);
    expect(buildP5IssuesFromRules(matches, rules).map((issue) => issue.id)).toContain('p5-animation-pause-control');
  });
});
