import type { AuditIssue, AuditSummary, HumanReviewPrompt } from './types.js';

export function summarize(issues: AuditIssue[], humanReviewPrompts: HumanReviewPrompt[]): AuditSummary {
  const summary: AuditSummary = { critical: 0, serious: 0, moderate: 0, minor: 0, manualReview: 0 };
  for (const issue of issues) {
    if (issue.severity === 'critical') summary.critical += 1;
    else if (issue.severity === 'serious') summary.serious += 1;
    else if (issue.severity === 'moderate') summary.moderate += 1;
    else if (issue.severity === 'minor') summary.minor += 1;
  }
  summary.manualReview = humanReviewPrompts.length;
  return summary;
}
