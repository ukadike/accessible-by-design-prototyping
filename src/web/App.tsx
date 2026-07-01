import { useState } from 'react';
import { AuditForm } from './components/AuditForm.js';
import { ReportView } from './components/ReportView.js';
import { generateMarkdownReport } from '../reporters/markdown-reporter.js';
import { generateJsonReport } from '../reporters/json-reporter.js';
import type { AuditResult } from '../core/types.js';
import './styles.css';

function downloadFile(filename: string, contents: string, mimeType: string): void {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function App() {
  const [result, setResult] = useState<AuditResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(target: string) {
    setIsRunning(true);
    setError(null);
    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target }),
      });
      const data = (await response.json()) as AuditResult | { error: string };
      if (!response.ok || 'error' in data) {
        throw new Error('error' in data ? data.error : 'Audit failed.');
      }
      setResult(data);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Audit failed.');
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <main>
      <h1>Accessibility Audit Lab</h1>
      <p>Run a WCAG 2.2+ audit on a public URL and get plain-language next steps.</p>

      <AuditForm onSubmit={handleSubmit} isRunning={isRunning} />

      {error ? (
        <p role="alert" className="error">
          {error}
        </p>
      ) : null}

      {result ? (
        <ReportView
          result={result}
          onExportMarkdown={() => downloadFile('audit-report.md', generateMarkdownReport(result), 'text/markdown')}
          onExportJson={() => downloadFile('audit-report.json', generateJsonReport(result), 'application/json')}
        />
      ) : null}
    </main>
  );
}
