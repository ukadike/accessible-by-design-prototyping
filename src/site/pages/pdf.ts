import humanReviewPromptsData from '../../../rules/human-review-prompts.json';
import wcagPlusData from '../../../rules/wcag-2-plus.json';
import { filterPromptsByContext, filterRulesByContext } from '../../core/context-filter.js';
import { inspectPdfStructure, buildPdfIssuesFromRules } from '../../core/pdf-checks.js';
import { el, buildResult, renderResults } from '../results.js';
import type { AccessibilityRule, HumanReviewPrompt } from '../../core/types.js';

const humanReviewPrompts = humanReviewPromptsData as HumanReviewPrompt[];
const wcagPlusRules = (wcagPlusData as { rules: AccessibilityRule[] }).rules;

const pdfInput = document.getElementById('pdf-input') as HTMLInputElement | null;
const pdfResults = document.getElementById('pdf-results');

if (pdfInput && pdfResults) {
  pdfInput.addEventListener('change', () => {
    const file = pdfInput.files?.[0];
    if (!file) return;
    void (async () => {
      pdfResults.textContent = 'Checking your PDF…';
      try {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const checks = await inspectPdfStructure(bytes);
        const issues = buildPdfIssuesFromRules(checks, filterRulesByContext(wcagPlusRules, ['pdf']));
        const prompts = filterPromptsByContext(humanReviewPrompts, ['pdf']);
        const result = buildResult(file.name, issues, prompts);
        renderResults(pdfResults, issues, prompts, result, file.name.replace(/\.pdf$/i, ''));
      } catch {
        pdfResults.textContent = '';
        pdfResults.append(
          el(
            'p',
            'result-summary problems',
            'Sorry — that file could not be read as a PDF. Please check the file and try again.',
          ),
        );
      }
    })();
  });
}
