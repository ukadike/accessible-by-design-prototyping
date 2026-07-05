import humanReviewPromptsData from '../../../rules/human-review-prompts.json';
import wcagPlusData from '../../../rules/wcag-2-plus.json';
import p5CanvasRulesData from '../../../rules/p5-canvas-rules.json';
import { filterPromptsByContext, filterRulesByContext } from '../../core/context-filter.js';
import {
  detectP5PatternsInSource,
  buildP5IssuesFromRules,
  p5ContextsFor,
  type P5CanvasRules,
} from '../../core/p5-checks.js';
import { el, buildResult, renderResults } from '../results.js';
import type { AccessibilityRule, HumanReviewPrompt } from '../../core/types.js';

const humanReviewPrompts = humanReviewPromptsData as HumanReviewPrompt[];
const wcagPlusRules = (wcagPlusData as { rules: AccessibilityRule[] }).rules;
const p5CanvasRules = p5CanvasRulesData as P5CanvasRules;

const sketchInput = document.getElementById('sketch-input') as HTMLTextAreaElement | null;
const sketchButton = document.getElementById('sketch-check-button');
const sketchResults = document.getElementById('sketch-results');

if (sketchInput && sketchButton && sketchResults) {
  sketchButton.addEventListener('click', () => {
    const source = sketchInput.value.trim();
    sketchResults.textContent = '';
    if (!source) {
      sketchResults.append(el('p', 'result-summary problems', 'Paste your sketch code first, then press the button.'));
      return;
    }
    const matches = detectP5PatternsInSource(source, p5CanvasRules);
    if (!matches.hasCanvas && !matches.usesP5) {
      sketchResults.append(
        el(
          'p',
          'result-summary',
          'This doesn’t look like a canvas or p5.js sketch, so the sketch-specific checks don’t apply. If it’s a regular web page, use the website check instead.',
        ),
      );
      return;
    }
    const issues = buildP5IssuesFromRules(matches, filterRulesByContext(wcagPlusRules, ['p5', 'canvas']));
    const prompts = filterPromptsByContext(humanReviewPrompts, p5ContextsFor(matches));
    const result = buildResult('pasted sketch code', issues, prompts);
    renderResults(sketchResults, issues, prompts, result, 'sketch');
  });
}
