import type { AuditIssue } from '../../core/types.js';

export interface IssueCardProps {
  issue: AuditIssue;
}

export function IssueCard({ issue }: IssueCardProps) {
  return (
    <li className={`issue-card issue-card--${issue.severity}`}>
      <h3>{issue.title}</h3>
      <p className="issue-card__meta">
        Severity: {issue.severity} · WCAG {issue.wcag.length ? issue.wcag.join(', ') : '2+'} · {issue.principle}
      </p>
      {issue.location ? <p className="issue-card__location">Location: <code>{issue.location}</code></p> : null}
      <p>{issue.explanation}</p>
      <p className="issue-card__next-steps-label">Next steps:</p>
      <ul>
        {issue.nextSteps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ul>
    </li>
  );
}
