import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import type { AuditIssue, AuditResult } from '../core/types.js';

const PAGE_WIDTH = 595; // A4 portrait, points
const PAGE_HEIGHT = 842;
const MARGIN = 50;
const BODY_SIZE = 11;
const LINE_GAP = 4;

export interface PdfReportOptions {
  /** Extra note printed near the top, e.g. explaining a quick/partial check. */
  note?: string;
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [''];
}

function severityWord(severity: AuditIssue['severity']): string {
  switch (severity) {
    case 'critical':
      return 'Very important to fix';
    case 'serious':
      return 'Important to fix';
    case 'moderate':
      return 'Worth fixing';
    case 'minor':
      return 'Small improvement';
    default:
      return 'Needs a human check';
  }
}

export async function generatePdfReportBytes(result: AuditResult, options: PdfReportOptions = {}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Accessibility report for ${result.target}`);
  doc.setLanguage('en');
  doc.setCreator('Accessibility Audit Lab');

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const maxWidth = PAGE_WIDTH - MARGIN * 2;

  let page: PDFPage = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  function ensureRoom(needed: number): void {
    if (y - needed < MARGIN) {
      page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
  }

  function drawParagraph(text: string, useFont: PDFFont, size: number, spacingAfter = 8): void {
    const lines = wrapText(text, useFont, size, maxWidth);
    for (const line of lines) {
      ensureRoom(size + LINE_GAP);
      page.drawText(line, { x: MARGIN, y: y - size, size, font: useFont, color: rgb(0.1, 0.1, 0.1) });
      y -= size + LINE_GAP;
    }
    y -= spacingAfter;
  }

  drawParagraph('Accessibility Audit Report', bold, 20, 4);
  drawParagraph(`Checked: ${result.target}`, font, BODY_SIZE, 2);
  drawParagraph(`Date: ${new Date(result.auditedAt).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}`, font, BODY_SIZE, 10);

  if (options.note) {
    drawParagraph(`Note: ${options.note}`, bold, BODY_SIZE, 10);
  }

  const { summary } = result;
  drawParagraph('Summary', bold, 14, 4);
  drawParagraph(
    `Very important to fix: ${summary.critical}   ·   Important to fix: ${summary.serious}   ·   Worth fixing: ${summary.moderate}   ·   Small improvements: ${summary.minor}   ·   Needs a human check: ${summary.manualReview}`,
    font,
    BODY_SIZE,
    12,
  );

  drawParagraph('Things to fix', bold, 14, 4);
  if (result.issues.length === 0) {
    drawParagraph('Good news — the automatic checks found no problems.', font, BODY_SIZE, 10);
  } else {
    for (const issue of result.issues) {
      drawParagraph(issue.title, bold, 12, 2);
      const meta = [`${severityWord(issue.severity)}.`];
      if (issue.wcag.length) meta.push(`WCAG ${issue.wcag.join(', ')}.`);
      if (issue.location) meta.push(`Where: ${issue.location}.`);
      drawParagraph(meta.join(' '), font, 9.5, 2);
      drawParagraph(issue.explanation, font, BODY_SIZE, 2);
      for (const step of issue.nextSteps) {
        drawParagraph(`•  ${step}`, font, BODY_SIZE, 1);
      }
      y -= 8;
    }
  }

  drawParagraph('Things only a person can check', bold, 14, 4);
  if (result.humanReviewPrompts.length === 0) {
    drawParagraph('No manual review prompts apply to this target.', font, BODY_SIZE, 10);
  } else {
    for (const prompt of result.humanReviewPrompts) {
      drawParagraph(prompt.title, bold, 11, 1);
      drawParagraph(prompt.question, font, BODY_SIZE, 6);
    }
  }

  drawParagraph(
    'This report is an accessibility aid, not a legal certification. Automated testing can only catch some accessibility issues — reviewing your work with a keyboard, a screen reader, and disabled users is still worth doing.',
    font,
    9.5,
    0,
  );

  return doc.save();
}
