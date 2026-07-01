import type { AuditIssue, AuditResult, Severity } from '../core/types.js';

function renderIssue(issue: AuditIssue): string {
  const lines = [
    `### ${issue.title}`,
    '',
    `- **WCAG:** ${issue.wcag.length ? issue.wcag.join(', ') : 'WCAG 2+'}`,
    `- **Principle:** ${issue.principle}`,
    `- **Source:** ${issue.source}`,
  ];
  if (issue.location) lines.push(`- **Location:** \`${issue.location}\``);
  lines.push('', issue.explanation, '', '**Next steps:**');
  for (const step of issue.nextSteps) lines.push(`- ${step}`);
  lines.push('');
  return lines.join('\n');
}

function renderSeveritySection(title: string, issues: AuditIssue[], severity: Severity): string {
  const filtered = issues.filter((issue) => issue.severity === severity);
  const lines = [`## ${title}`, ''];
  if (filtered.length === 0) {
    lines.push('No issues found at this severity.', '');
  } else {
    for (const issue of filtered) lines.push(renderIssue(issue));
  }
  return lines.join('\n');
}

export function generateMarkdownReport(result: AuditResult): string {
  const { summary, issues, humanReviewPrompts, target, auditedAt } = result;

  const lines: string[] = [
    '# Accessibility Audit Report',
    '',
    '## Target',
    '',
    target,
    '',
    `Audited at: ${auditedAt}`,
    '',
    '## Summary',
    '',
    `- Critical: ${summary.critical}`,
    `- Serious: ${summary.serious}`,
    `- Moderate: ${summary.moderate}`,
    `- Minor: ${summary.minor}`,
    `- Manual review items: ${summary.manualReview}`,
    '',
    renderSeveritySection('Critical Issues', issues, 'critical'),
    renderSeveritySection('Serious Issues', issues, 'serious'),
    renderSeveritySection('Moderate Issues', issues, 'moderate'),
    renderSeveritySection('Minor Issues', issues, 'minor'),
    '## Manual Review Needed',
    '',
  ];

  if (humanReviewPrompts.length === 0) {
    lines.push('No manual review prompts apply to this target.', '');
  } else {
    for (const prompt of humanReviewPrompts) {
      lines.push(
        `### ${prompt.title}`,
        '',
        `${prompt.question}`,
        '',
        `- **WCAG:** ${prompt.wcag.join(', ')}`,
        `- **Applies to:** ${prompt.appliesTo.join(', ')}`,
        '',
      );
    }
  }

  lines.push(
    '## Recommended Next Steps',
    '',
    'Address critical and serious issues first, then work through moderate and minor issues.',
    'Use the manual review prompts above as a checklist for a human accessibility pass, ideally including testing with assistive technology and disabled users.',
    '',
    '## WCAG 2+ Notes',
    '',
    'This report includes a WCAG 2+ layer covering creative, civic, educational, and multimodal accessibility concerns that go beyond conventional HTML audits.',
    '',
    '## Disclaimer',
    '',
    'This report is an accessibility aid, not a legal certification.',
    '',
  );

  return lines.join('\n');
}
