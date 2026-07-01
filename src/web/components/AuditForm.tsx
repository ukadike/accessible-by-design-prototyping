import { useState, type FormEvent } from 'react';

export interface AuditFormProps {
  onSubmit: (target: string) => void;
  isRunning: boolean;
}

export function AuditForm({ onSubmit, isRunning }: AuditFormProps) {
  const [target, setTarget] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (target.trim().length === 0) return;
    onSubmit(target.trim());
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Run an accessibility audit">
      <label htmlFor="audit-target">Website URL</label>
      <input
        id="audit-target"
        name="target"
        type="url"
        inputMode="url"
        placeholder="https://example.com"
        value={target}
        onChange={(event) => setTarget(event.target.value)}
        required
      />
      <button type="submit" disabled={isRunning}>
        {isRunning ? 'Running audit…' : 'Run audit'}
      </button>
    </form>
  );
}
