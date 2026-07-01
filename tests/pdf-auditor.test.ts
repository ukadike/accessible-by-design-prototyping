import { describe, expect, it } from 'vitest';
import { PDFDocument, PDFName } from 'pdf-lib';
import { inspectPdfStructure, buildPdfIssues, buildPdfHumanReviewPrompts } from '../src/adapters/pdf-auditor.js';

async function buildPdf(options: { tagged?: boolean; language?: string; title?: string }): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.addPage([200, 200]);

  if (options.tagged) {
    const markInfoDict = doc.context.obj({ Marked: true });
    doc.catalog.set(PDFName.of('MarkInfo'), markInfoDict);
  }

  if (options.language) doc.setLanguage(options.language);
  if (options.title) doc.setTitle(options.title);

  return doc.save();
}

describe('PDF structure inspection', () => {
  it('detects an untagged PDF with no language or title', async () => {
    const bytes = await buildPdf({});
    const checks = await inspectPdfStructure(bytes);
    expect(checks).toEqual({ isTagged: false, hasLanguage: false, hasTitle: false });
  });

  it('detects a fully tagged PDF with language and title set', async () => {
    const bytes = await buildPdf({ tagged: true, language: 'en-US', title: 'Annual Report' });
    const checks = await inspectPdfStructure(bytes);
    expect(checks).toEqual({ isTagged: true, hasLanguage: true, hasTitle: true });
  });

  it('treats a whitespace-only title as no title', async () => {
    const bytes = await buildPdf({ tagged: true, language: 'en-US', title: '   ' });
    const checks = await inspectPdfStructure(bytes);
    expect(checks.hasTitle).toBe(false);
  });
});

describe('PDF issue generation', () => {
  it('flags all three structural issues for an untagged PDF with no language or title', () => {
    const issues = buildPdfIssues({ isTagged: false, hasLanguage: false, hasTitle: false });
    expect(issues.map((issue) => issue.id).sort()).toEqual([
      'pdf-document-language',
      'pdf-document-title',
      'pdf-tagged-structure',
    ]);
    expect(issues.every((issue) => issue.source === 'pdf-auditor')).toBe(true);
  });

  it('flags no structural issues for a fully tagged PDF with language and title', () => {
    const issues = buildPdfIssues({ isTagged: true, hasLanguage: true, hasTitle: true });
    expect(issues).toHaveLength(0);
  });
});

describe('PDF human review prompts', () => {
  it('returns PDF-specific manual review prompts', () => {
    const prompts = buildPdfHumanReviewPrompts();
    expect(prompts.some((prompt) => prompt.id === 'pdf-reading-order-review')).toBe(true);
    expect(prompts.some((prompt) => prompt.id === 'pdf-alt-text-review')).toBe(true);
    expect(prompts.every((prompt) => prompt.appliesTo.includes('pdf'))).toBe(true);
  });
});
