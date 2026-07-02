import { PDFDocument, PDFName, PDFBool, PDFDict } from 'pdf-lib';
import type { AccessibilityRule, AuditIssue } from './types.js';

export interface PdfStructureChecks {
  isTagged: boolean;
  hasLanguage: boolean;
  hasTitle: boolean;
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

export function buildPdfIssuesFromRules(checks: PdfStructureChecks, rules: AccessibilityRule[]): AuditIssue[] {
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
