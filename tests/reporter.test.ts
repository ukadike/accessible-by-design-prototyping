import { describe, expect, it } from 'vitest';
import { generateMarkdownReport } from '../src/reporters/markdown-reporter.js';
import { generateJsonReport } from '../src/reporters/json-reporter.js';
import type { AuditResult } from '../src/core/types.js';

const sampleResult: AuditResult = {
  projectName: 'Accessibility Audit Lab',
  target: 'https://example.com',
  auditedAt: '2026-07-01T00:00:00.000Z',
  summary: { critical: 0, serious: 1, moderate: 0, minor: 0, manualReview: 1 },
  issues: [
    {
      id: 'image-alt-missing',
      title: 'Image is missing alternative text',
      severity: 'serious',
      wcag: ['1.1.1'],
      principle: 'Perceivable',
      location: 'img.hero',
      explanation: 'Images that communicate meaning need text alternatives.',
      nextSteps: ['Add meaningful alt text.'],
      source: 'axe-core',
    },
  ],
  humanReviewPrompts: [
    {
      id: 'motion-review',
      title: 'Review motion and animation comfort',
      question: 'Can users pause, reduce, or avoid motion that is not essential?',
      wcag: ['2.2.2', '2.3.3'],
      appliesTo: ['animation'],
    },
  ],
};

describe('markdown reporter', () => {
  it('includes the required report sections', () => {
    const markdown = generateMarkdownReport(sampleResult);
    expect(markdown).toContain('# Accessibility Audit Report');
    expect(markdown).toContain('## Target');
    expect(markdown).toContain('## Summary');
    expect(markdown).toContain('## Serious Issues');
    expect(markdown).toContain('Image is missing alternative text');
    expect(markdown).toContain('## Manual Review Needed');
    expect(markdown).toContain('Review motion and animation comfort');
    expect(markdown).toContain('## Recommended Next Steps');
    expect(markdown).toContain('## WCAG 2+ Notes');
    expect(markdown).toContain('## Disclaimer');
    expect(markdown).toContain('This report is an accessibility aid, not a legal certification.');
  });
});

describe('json reporter', () => {
  it('round-trips the audit result as JSON', () => {
    const json = generateJsonReport(sampleResult);
    expect(JSON.parse(json)).toEqual(sampleResult);
  });
});
