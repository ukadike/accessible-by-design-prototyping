import { readFile } from 'node:fs/promises';
import { rulesForContext, promptsForContext } from '../core/rules-engine.js';
import { inspectPdfStructure, buildPdfIssuesFromRules, type PdfStructureChecks } from '../core/pdf-checks.js';
import type { AuditIssue, HumanReviewPrompt } from '../core/types.js';

export { inspectPdfStructure } from '../core/pdf-checks.js';
export type { PdfStructureChecks } from '../core/pdf-checks.js';

async function loadPdfBytes(target: string): Promise<Uint8Array> {
  if (/^https?:\/\//i.test(target)) {
    const response = await fetch(target);
    if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
    return new Uint8Array(await response.arrayBuffer());
  }
  return readFile(target);
}

export function buildPdfIssues(checks: PdfStructureChecks): AuditIssue[] {
  return buildPdfIssuesFromRules(checks, rulesForContext(['pdf']));
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
