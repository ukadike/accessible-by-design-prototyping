import humanReviewPromptsData from '../../rules/human-review-prompts.json';
import wcagPlusData from '../../rules/wcag-2-plus.json';
import p5CanvasRulesData from '../../rules/p5-canvas-rules.json';
import { filterPromptsByContext, filterRulesByContext } from '../core/context-filter.js';
import { inspectPdfStructure, buildPdfIssuesFromRules } from '../core/pdf-checks.js';
import {
  detectP5PatternsInSource,
  buildP5IssuesFromRules,
  p5ContextsFor,
  type P5CanvasRules,
} from '../core/p5-checks.js';
import { summarize } from '../core/summarize.js';
import { generateMarkdownReport } from '../reporters/markdown-reporter.js';
import { generateJsonReport } from '../reporters/json-reporter.js';
import { generatePdfReportBytes } from '../reporters/pdf-reporter.js';
import { runUrlCheck } from './url-check.js';
import type { AccessibilityRule, AuditIssue, AuditResult, HumanReviewPrompt } from '../core/types.js';

const humanReviewPrompts = humanReviewPromptsData as HumanReviewPrompt[];
const wcagPlusRules = (wcagPlusData as { rules: AccessibilityRule[] }).rules;
const p5CanvasRules = p5CanvasRulesData as P5CanvasRules;

/* ---------- shared rendering ---------- */

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function severityWord(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'Very important to fix';
    case 'serious':
      return 'Important to fix';
    case 'moderate':
      return 'Worth fixing';
    default:
      return 'Small improvement';
  }
}

function renderResults(
  container: HTMLElement,
  issues: AuditIssue[],
  prompts: HumanReviewPrompt[],
  result: AuditResult,
  fileBaseName: string,
  note?: string,
): void {
  container.textContent = '';

  const summaryLine = el(
    'p',
    issues.length === 0 ? 'result-summary ok' : 'result-summary problems',
    issues.length === 0
      ? 'Good news — the automatic checks found no problems.'
      : `The automatic checks found ${issues.length} ${issues.length === 1 ? 'thing' : 'things'} to fix.`,
  );
  container.append(summaryLine);

  if (note) {
    const noteLine = el('p', 'result-note', note);
    container.append(noteLine);
  }

  for (const issue of issues) {
    const card = el('div', `finding severity-${issue.severity}`);
    card.append(el('h3', undefined, issue.title));
    card.append(el('p', undefined, `${severityWord(issue.severity)}.`));
    card.append(el('p', undefined, issue.explanation));
    const stepsHeading = el('p', undefined, 'What to do:');
    stepsHeading.style.fontWeight = '600';
    card.append(stepsHeading);
    const list = el('ul', 'next-steps');
    for (const step of issue.nextSteps) list.append(el('li', undefined, step));
    card.append(list);
    container.append(card);
  }

  if (prompts.length > 0) {
    container.append(el('h3', undefined, 'Things only a person can check'));
    container.append(
      el(
        'p',
        undefined,
        'Automatic checks can’t judge everything. When you have a moment, ask yourself:',
      ),
    );
    for (const prompt of prompts) {
      const card = el('div', 'human-check');
      const strong = el('p');
      strong.append(el('strong', undefined, prompt.title));
      card.append(strong);
      card.append(el('p', undefined, prompt.question));
      container.append(card);
    }
  }

  const downloadRow = el('div', 'download-row');
  const pdfButton = el('button', undefined, 'Download report (PDF)');
  pdfButton.type = 'button';
  pdfButton.addEventListener('click', () => {
    void (async () => {
      pdfButton.disabled = true;
      try {
        const bytes = await generatePdfReportBytes(result, { note });
        downloadBytes(`${fileBaseName}-report.pdf`, bytes, 'application/pdf');
      } finally {
        pdfButton.disabled = false;
      }
    })();
  });
  const mdButton = el('button', undefined, 'Download report (text)');
  mdButton.type = 'button';
  mdButton.addEventListener('click', () =>
    downloadFile(`${fileBaseName}-report.md`, generateMarkdownReport(result), 'text/markdown'),
  );
  const jsonButton = el('button', undefined, 'Download report (for developers)');
  jsonButton.type = 'button';
  jsonButton.addEventListener('click', () =>
    downloadFile(`${fileBaseName}-report.json`, generateJsonReport(result), 'application/json'),
  );
  downloadRow.append(pdfButton, mdButton, jsonButton);
  container.append(downloadRow);

  container.append(
    el('p', undefined, 'Remember: this is an accessibility aid, not a legal certification.'),
  );
}

function downloadFile(filename: string, contents: string, mimeType: string): void {
  downloadBytes(filename, new TextEncoder().encode(contents), mimeType);
}

function downloadBytes(filename: string, bytes: Uint8Array, mimeType: string): void {
  const blob = new Blob([bytes as BlobPart], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function buildResult(target: string, issues: AuditIssue[], prompts: HumanReviewPrompt[]): AuditResult {
  return {
    projectName: 'Accessibility Audit Lab',
    target,
    auditedAt: new Date().toISOString(),
    summary: summarize(issues, prompts),
    issues,
    humanReviewPrompts: prompts,
  };
}

/* ---------- bookmarklet link ---------- */

const bookmarkletLink = document.getElementById('bookmarklet-link') as HTMLAnchorElement | null;
if (bookmarkletLink) {
  const scriptUrl = new URL('bookmarklet.js', document.baseURI).href;
  bookmarkletLink.href = `javascript:(function(){var s=document.createElement('script');s.src=${JSON.stringify(
    scriptUrl,
  )}+'?t='+Date.now();document.body.appendChild(s);})();`;
  bookmarkletLink.addEventListener('click', (event) => {
    // Clicking the button on this page shouldn't run it here — it's meant to be dragged.
    event.preventDefault();
    window.alert(
      'Drag this button up into your bookmarks bar instead of clicking it. Then visit the site you want to check and click the bookmark there.',
    );
  });
}

/* ---------- quick URL checker ---------- */

const QUICK_CHECK_NOTE =
  'This was a quick check of a copy of the page, so some problems (especially on sites built with heavy scripting) may not show up. For complete results, use the "Audit this page" bookmark.';

const urlInput = document.getElementById('url-input') as HTMLInputElement | null;
const urlButton = document.getElementById('url-check-button') as HTMLButtonElement | null;
const urlResults = document.getElementById('url-results');

if (urlInput && urlButton && urlResults) {
  const runCheck = () => {
    const value = urlInput.value.trim();
    urlResults.textContent = '';
    if (!value) {
      urlResults.append(el('p', 'result-summary problems', 'Type a web address first, then press the button.'));
      return;
    }
    urlButton.disabled = true;
    urlResults.textContent = 'Fetching a copy of the page and checking it — this can take a few seconds…';
    void (async () => {
      try {
        const { issues, finalUrl, looksEmpty } = await runUrlCheck(value);
        const prompts = filterPromptsByContext(humanReviewPrompts, ['html']);
        const result = buildResult(finalUrl, issues, prompts);
        if (looksEmpty) {
          urlResults.textContent = '';
          urlResults.append(
            el(
              'p',
              'result-summary problems',
              'The copy of this page came back almost empty — it is probably built with scripting that the quick check can’t see. Please use the "Audit this page" bookmark for this site.',
            ),
          );
          return;
        }
        const slug = finalUrl.replace(/^https?:\/\//i, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'page';
        renderResults(urlResults, issues, prompts, result, slug, QUICK_CHECK_NOTE);
      } catch (checkError) {
        urlResults.textContent = '';
        urlResults.append(
          el(
            'p',
            'result-summary problems',
            checkError instanceof Error ? checkError.message : 'Sorry — that page could not be checked.',
          ),
        );
      } finally {
        urlButton.disabled = false;
      }
    })();
  };

  urlButton.addEventListener('click', runCheck);
  urlInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      runCheck();
    }
  });
}

/* ---------- PDF checker ---------- */

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

/* ---------- sketch checker ---------- */

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
          'This doesn’t look like a canvas or p5.js sketch, so the sketch-specific checks don’t apply. If it’s a regular web page, use the website check above instead.',
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
