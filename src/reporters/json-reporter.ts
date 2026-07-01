import type { AuditResult } from '../core/types.js';

export function generateJsonReport(result: AuditResult): string {
  return JSON.stringify(result, null, 2);
}
