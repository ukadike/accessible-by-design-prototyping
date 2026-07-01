# p5.js Accessibility Guide

Canvas-based sketches render as a single opaque `<canvas>` element by default, so screen readers and other assistive technology see nothing meaningful without extra work. This guide covers what `a11y-lab audit-p5` checks for and how to fix what it finds.

## What the p5 auditor checks

Run `npm run audit:p5 -- <path-or-url>` to check a sketch for:

- **Accessible descriptions.** Does the page use `describe()`, `describeElement()`, `textOutput()`, or `gridOutput()`?
- **Keyboard alternatives.** If the sketch uses `mousePressed`, `mouseDragged`, `mouseMoved`, or `touchStarted`, does it also provide `keyPressed`/`keyReleased`/`keyTyped` handling or equivalent button controls?
- **Animation controls.** If the sketch has a running `draw()` loop, is there a visible pause or reduce-motion control? (Flagged for manual review; automated checks cannot confirm a control exists and works.)
- Everything axe-core checks on the surrounding HTML page (labels, contrast, landmarks, and so on).

## Fixing common findings

### Missing canvas description

```js
function setup() {
  createCanvas(400, 400);
  describe('A circle that moves left and right in response to arrow key presses.');
}
```

### Mouse-only interaction

```js
function keyPressed() {
  if (keyCode === LEFT_ARROW) x -= 10;
  if (keyCode === RIGHT_ARROW) x += 10;
}
```

### Continuous animation without a pause control

Add a visible button or key command that stops `draw()` from updating, and avoid motion that is not essential to the sketch's meaning.

## Two worked examples

- `examples/p5-sketch-good/` — has a description, keyboard controls, a pause control, and text instructions.
- `examples/p5-sketch-needs-work/` — canvas only, mouse-only interaction, no description, constant animation.

Run the audit against both to see the difference in the report.

## Manual review still matters

Automated checks can detect the *absence* of a pattern, not whether a description is meaningful or whether motion is essential. Pair automated results with the human-review prompts in the report, and where possible, review with people who use screen readers or navigate by keyboard.
