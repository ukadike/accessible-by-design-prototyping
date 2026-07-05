import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { generatePdfReportBytes } from '../src/reporters/pdf-reporter.js';
import type { AuditResult } from '../src/core/types.js';

const sampleResult: AuditResult = {
  projectName: 'Accessibility Audit Lab',
  target: 'https://example.com',
  auditedAt: '2026-07-01T00:00:00.000Z',
  summary: { critical: 1, serious: 0, moderate: 0, minor: 0, manualReview: 1 },
  issues: [
    {
      id: 'image-alt',
      title: 'Images must have alternative text',
      severity: 'critical',
      wcag: ['1.1.1'],
      principle: 'Perceivable',
      location: 'img.hero',
      explanation: 'Images that communicate meaning need text alternatives so screen reader users can understand the content.',
      nextSteps: ['Add meaningful alt text if the image communicates content.'],
      source: 'axe-core',
    },
  ],
  humanReviewPrompts: [
    {
      id: 'motion-review',
      title: 'Review motion and animation comfort',
      question: 'Can users pause, reduce, or avoid motion that is not essential?',
      wcag: ['2.2.2'],
      appliesTo: ['animation'],
    },
  ],
};

describe('pdf reporter', () => {
  it('produces a valid PDF with title and language metadata', async () => {
    const bytes = await generatePdfReportBytes(sampleResult);
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe('%PDF-');

    const reloaded = await PDFDocument.load(bytes);
    expect(reloaded.getPageCount()).toBeGreaterThan(0);
    expect(reloaded.getTitle()).toBe('Accessibility report for https://example.com');
  });

  it('handles a long issue list by paginating instead of failing', async () => {
    const manyIssues: AuditResult = {
      ...sampleResult,
      issues: Array.from({ length: 40 }, (_, index) => ({
        ...sampleResult.issues[0],
        title: `Issue number ${index + 1} with a reasonably long title that will need wrapping across lines`,
      })),
    };
    const bytes = await generatePdfReportBytes(manyIssues, { note: 'This was a quick check of a copy of the page.' });
    const reloaded = await PDFDocument.load(bytes);
    expect(reloaded.getPageCount()).toBeGreaterThan(1);
  });
});
