import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { auditUrl } from './url-auditor.js';
import type { AuditIssue } from '../core/types.js';

export async function auditHtmlFile(filePath: string): Promise<AuditIssue[]> {
  const absolutePath = path.resolve(filePath);
  const fileUrl = pathToFileURL(absolutePath).href;
  return auditUrl(fileUrl);
}
