import { normalizeAxeViolations } from '../core/issue-normalizer.js';
import { runAxeOnPage } from './playwright-axe.js';
import type { AuditIssue } from '../core/types.js';

export async function auditUrl(url: string): Promise<AuditIssue[]> {
  const { axeResults } = await runAxeOnPage(url);
  return normalizeAxeViolations(axeResults);
}
