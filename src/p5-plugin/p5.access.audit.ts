/**
 * Optional in-browser helper for p5.js sketch authors.
 * Include this script after p5.js and it will log accessibility
 * warnings to the console while the sketch runs, so issues surface
 * during development rather than only during a CLI audit.
 */

interface P5AccessWindow extends Window {
  describe?: (...args: unknown[]) => void;
  textOutput?: (...args: unknown[]) => void;
  gridOutput?: (...args: unknown[]) => void;
  keyPressed?: (...args: unknown[]) => void;
  mousePressed?: (...args: unknown[]) => void;
  mouseDragged?: (...args: unknown[]) => void;
  draw?: (...args: unknown[]) => void;
}

export function runP5AccessAudit(target: P5AccessWindow = window as unknown as P5AccessWindow): string[] {
  const warnings: string[] = [];

  const hasDescription = typeof target.describe === 'function' || typeof target.textOutput === 'function' || typeof target.gridOutput === 'function';
  const usesCanvasInteraction = typeof target.mousePressed === 'function' || typeof target.mouseDragged === 'function';
  const hasKeyboardAlternative = typeof target.keyPressed === 'function';
  const isAnimated = typeof target.draw === 'function';

  if (!hasDescription) {
    warnings.push('No describe()/textOutput()/gridOutput() call was found. Consider adding a text description of the canvas.');
  }

  if (usesCanvasInteraction && !hasKeyboardAlternative) {
    warnings.push('Mouse-based interaction was found without a keyPressed() handler. Consider adding a keyboard alternative.');
  }

  if (isAnimated) {
    warnings.push('A draw() loop was found. Consider adding a pause/reduce-motion control if the animation is continuous.');
  }

  if (warnings.length > 0 && typeof console !== 'undefined') {
    console.warn('[a11y-lab] p5 accessibility warnings:');
    for (const warning of warnings) console.warn(`  - ${warning}`);
  }

  return warnings;
}
