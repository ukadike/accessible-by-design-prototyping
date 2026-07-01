import { describe, expect, it } from 'vitest';
import { detectP5Patterns, buildP5Issues, buildP5HumanReviewPrompts } from '../src/adapters/p5-sketch-auditor.js';

const needsWorkHtml = `
<html><body>
<canvas></canvas>
<script>
function draw() { background(240); }
function mouseDragged() { x = mouseX; }
</script>
</body></html>
`;

const goodHtml = `
<html><body>
<canvas></canvas>
<script>
function setup() { describe('A circle that moves.'); }
function draw() { background(240); }
function keyPressed() { if (key === 'p') isPaused = !isPaused; }
</script>
</body></html>
`;

describe('p5 pattern detection', () => {
  it('flags a canvas with no description as an issue', () => {
    const matches = detectP5Patterns(needsWorkHtml);
    expect(matches.hasCanvas).toBe(true);
    expect(matches.hasDescription).toBe(false);

    const issues = buildP5Issues(matches);
    expect(issues.some((issue) => issue.id === 'p5-canvas-description')).toBe(true);
  });

  it('flags mouse-only interaction without a keyboard alternative', () => {
    const matches = detectP5Patterns(needsWorkHtml);
    expect(matches.mouseOnly).toBe(true);
    expect(matches.hasKeyboardAlternative).toBe(false);

    const issues = buildP5Issues(matches);
    expect(issues.some((issue) => issue.id === 'p5-keyboard-alternative')).toBe(true);
  });

  it('does not flag a sketch that already has a description and keyboard controls', () => {
    const matches = detectP5Patterns(goodHtml);
    const issues = buildP5Issues(matches);
    expect(issues.some((issue) => issue.id === 'p5-canvas-description')).toBe(false);
    expect(issues.some((issue) => issue.id === 'p5-keyboard-alternative')).toBe(false);
  });

  it('generates manual review prompts, including animation-specific ones when a draw loop is present', () => {
    const matches = detectP5Patterns(needsWorkHtml);
    expect(matches.isAnimated).toBe(true);

    const prompts = buildP5HumanReviewPrompts(matches);
    expect(prompts.some((prompt) => prompt.id === 'motion-review')).toBe(true);
  });
});
