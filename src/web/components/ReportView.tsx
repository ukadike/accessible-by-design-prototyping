import type { AuditResult } from '../../core/types.js';
import { IssueCard } from './IssueCard.js';

export interface ReportViewProps {
  result: AuditResult;
  onExportMarkdown: () => void;
  onExportJson: () => void;
}

export function ReportView({ result, onExportMarkdown, onExportJson }: ReportViewProps) {
  const { summary, issues, humanReviewPrompts, target } = result;

  return (
    <section aria-label="Audit results">
      <h2>Results for {target}</h2>

      <ul className="summary-cards" aria-label="Summary counts by severity">
        <li>Critical: {summary.critical}</li>
        <li>Serious: {summary.serious}</li>
        <li>Moderate: {summary.moderate}</li>
        <li>Minor: {summary.minor}</li>
        <li>Manual review: {summary.manualReview}</li>
      </ul>

      <div className="export-buttons">
        <button type="button" onClick={onExportMarkdown}>
          Export Markdown
        </button>
        <button type="button" onClick={onExportJson}>
          Export JSON
        </button>
      </div>

      <h3>Issues</h3>
      {issues.length === 0 ? (
        <p>No automated issues found.</p>
      ) : (
        <ul className="issue-list">
          {issues.map((issue, index) => (
            <IssueCard key={`${issue.id}-${index}`} issue={issue} />
          ))}
        </ul>
      )}

      <h3>Manual review prompts</h3>
      {humanReviewPrompts.length === 0 ? (
        <p>No manual review prompts apply to this target.</p>
      ) : (
        <ul className="prompt-list">
          {humanReviewPrompts.map((prompt) => (
            <li key={prompt.id}>
              <strong>{prompt.title}</strong>
              <p>{prompt.question}</p>
            </li>
          ))}
        </ul>
      )}

      <p className="disclaimer">This report is an accessibility aid, not a legal certification.</p>
    </section>
  );
}
