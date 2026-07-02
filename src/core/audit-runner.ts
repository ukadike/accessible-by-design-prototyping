import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { AuditResult } from './types.js';
import { auditUrl } from '../adapters/url-auditor.js';
import { auditHtmlFile } from '../adapters/html-file-auditor.js';
import { auditP5Sketch } from '../adapters/p5-sketch-auditor.js';
import { auditPdf } from '../adapters/pdf-auditor.js';
import { promptsForContext } from './rules-engine.js';
import { summarize } from './summarize.js';

export { summarize } from './summarize.js';

function isUrl(target: string): boolean {
  return /^(https?|file):\/\//i.test(target);
}

export async function runAudit(target: string): Promise<AuditResult> {
  const issues = isUrl(target) ? await auditUrl(target) : await auditHtmlFile(target);
  const humanReviewPrompts = promptsForContext(['html']);

  return {
    projectName: 'Accessibility Audit Lab',
    target,
    auditedAt: new Date().toISOString(),
    summary: summarize(issues, humanReviewPrompts),
    issues,
    humanReviewPrompts,
  };
}

export async function runP5Audit(target: string): Promise<AuditResult> {
  const resolvedTarget = isUrl(target) ? target : pathToFileURL(path.resolve(target)).href;
  const { issues, humanReviewPrompts } = await auditP5Sketch(resolvedTarget);

  return {
    projectName: 'Accessibility Audit Lab',
    target,
    auditedAt: new Date().toISOString(),
    summary: summarize(issues, humanReviewPrompts),
    issues,
    humanReviewPrompts,
  };
}

export async function runPdfAudit(target: string): Promise<AuditResult> {
  const { issues, humanReviewPrompts } = await auditPdf(target);

  return {
    projectName: 'Accessibility Audit Lab',
    target,
    auditedAt: new Date().toISOString(),
    summary: summarize(issues, humanReviewPrompts),
    issues,
    humanReviewPrompts,
  };
}
