/**
 * Shared result rendering + report downloads for the public site's tool pages.
 */
import { summarize } from '../core/summarize.js';
import { generateMarkdownReport } from '../reporters/markdown-reporter.js';
import { generateJsonReport } from '../reporters/json-reporter.js';
import { generatePdfReportBytes } from '../reporters/pdf-reporter.js';
import { RESULT_CATEGORIES } from './categorize.js';
import type { AuditIssue, AuditResult, HumanReviewPrompt } from '../core/types.js';

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

export function severityWord(severity: string): string {
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

export function buildResult(target: string, issues: AuditIssue[], prompts: HumanReviewPrompt[]): AuditResult {
  return {
    projectName: 'Accessibility Audit Lab',
    target,
    auditedAt: new Date().toISOString(),
    summary: summarize(issues, prompts),
    issues,
    humanReviewPrompts: prompts,
  };
}

export function downloadFile(filename: string, contents: string, mimeType: string): void {
  downloadBytes(filename, new TextEncoder().encode(contents), mimeType);
}

export function downloadBytes(filename: string, bytes: Uint8Array, mimeType: string): void {
  const blob = new Blob([bytes as BlobPart], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function renderIssueCard(issue: AuditIssue): HTMLElement {
  const card = el('div', `finding severity-${issue.severity}`);
  card.append(el('h4', undefined, issue.title));
  card.append(el('p', undefined, `${severityWord(issue.severity)}.`));
  card.append(el('p', undefined, issue.explanation));
  const stepsHeading = el('p', undefined, 'What to do:');
  stepsHeading.style.fontWeight = '600';
  card.append(stepsHeading);
  const list = el('ul', 'next-steps');
  for (const step of issue.nextSteps) list.append(el('li', undefined, step));
  card.append(list);
  return card;
}

export interface RenderOptions {
  /** Extra note shown under the summary and printed inside downloaded reports. */
  note?: string;
  /** issue.id → category name; when provided, findings render grouped by category. */
  categories?: Record<string, string>;
}

export function renderResults(
  container: HTMLElement,
  issues: AuditIssue[],
  prompts: HumanReviewPrompt[],
  result: AuditResult,
  fileBaseName: string,
  options: RenderOptions = {},
): void {
  const { note, categories } = options;
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
    container.append(el('p', 'result-note', note));
  }

  if (categories && issues.length > 0) {
    const grouped = new Map<string, AuditIssue[]>();
    for (const issue of issues) {
      const category = categories[issue.id] ?? 'Page structure';
      const bucket = grouped.get(category) ?? [];
      bucket.push(issue);
      grouped.set(category, bucket);
    }
    for (const category of RESULT_CATEGORIES) {
      const bucket = grouped.get(category);
      if (!bucket || bucket.length === 0) continue;
      container.append(el('h3', 'category-heading', `${category} (${bucket.length})`));
      for (const issue of bucket) container.append(renderIssueCard(issue));
    }
  } else {
    for (const issue of issues) container.append(renderIssueCard(issue));
  }

  if (prompts.length > 0) {
    container.append(el('h3', 'category-heading', 'Recommendations — things only a person can check'));
    container.append(
      el('p', undefined, 'Automatic checks can’t judge everything. When you have a moment, ask yourself:'),
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

  container.append(el('p', undefined, 'Remember: this is an accessibility aid, not a legal certification.'));
}
