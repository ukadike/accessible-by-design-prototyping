import { readFile } from 'node:fs/promises';
import { PDFDocument, PDFName, PDFBool, PDFDict } from 'pdf-lib';
import { rulesForContext, promptsForContext } from '../core/rules-engine.js';
import type { AuditIssue, HumanReviewPrompt, AccessibilityRule } from '../core/types.js';

function ruleToIssue(rule: AccessibilityRule): AuditIssue {
  return {
    id: rule.id,
    title: rule.title,
    severity: rule.severity,
    wcag: rule.wcag,
    principle: rule.principle,
    explanation: rule.description,
    nextSteps: rule.nextSteps,
    source: 'pdf-auditor',
  };
}

export interface PdfStructureChecks {
  isTagged: boolean;
  hasLanguage: boolean;
  hasTitle: boolean;
}

async function loadPdfBytes(target: string): Promise<Uint8Array> {
  if (/^https?:\/\//i.test(target)) {
    const response = await fetch(target);
    if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
    return new Uint8Array(await response.arrayBuffer());
  }
  return readFile(target);
}

export async function inspectPdfStructure(bytes: Uint8Array): Promise<PdfStructureChecks> {
  const document = await PDFDocument.load(bytes, { ignoreEncryption: true });

  const markInfo = document.catalog.get(PDFName.of('MarkInfo'));
  let isTagged = false;
  if (markInfo instanceof PDFDict) {
    const marked = markInfo.get(PDFName.of('Marked'));
    isTagged = marked instanceof PDFBool && marked.asBoolean() === true;
  }

  const lang = document.catalog.get(PDFName.of('Lang'));
  const hasLanguage = Boolean(lang);

  const title = document.getTitle();
  const hasTitle = Boolean(title && title.trim().length > 0);

  return { isTagged, hasLanguage, hasTitle };
}

export function buildPdfIssues(checks: PdfStructureChecks): AuditIssue[] {
  const rules = rulesForContext(['pdf']);
  const ruleById = new Map(rules.map((rule) => [rule.id, rule]));
  const issues: AuditIssue[] = [];

  if (!checks.isTagged) {
    const rule = ruleById.get('pdf-tagged-structure');
    if (rule) issues.push(ruleToIssue(rule));
  }

  if (!checks.hasLanguage) {
    const rule = ruleById.get('pdf-document-language');
    if (rule) issues.push(ruleToIssue(rule));
  }

  if (!checks.hasTitle) {
    const rule = ruleById.get('pdf-document-title');
    if (rule) issues.push(ruleToIssue(rule));
  }

  return issues;
}

export function buildPdfHumanReviewPrompts(): HumanReviewPrompt[] {
  return promptsForContext(['pdf']);
}

export interface PdfAuditResult {
  issues: AuditIssue[];
  humanReviewPrompts: HumanReviewPrompt[];
  checks: PdfStructureChecks;
}

export async function auditPdf(target: string): Promise<PdfAuditResult> {
  const bytes = await loadPdfBytes(target);
  const checks = await inspectPdfStructure(bytes);
  const issues = buildPdfIssues(checks);
  const humanReviewPrompts = buildPdfHumanReviewPrompts();

  return { issues, humanReviewPrompts, checks };
}
