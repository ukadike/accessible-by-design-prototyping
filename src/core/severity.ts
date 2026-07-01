import type { Severity } from './types.js';

const AXE_IMPACT_TO_SEVERITY: Record<string, Severity> = {
  critical: 'critical',
  serious: 'serious',
  moderate: 'moderate',
  minor: 'minor',
};

export function axeImpactToSeverity(impact: string | null | undefined): Severity {
  if (!impact) return 'moderate';
  return AXE_IMPACT_TO_SEVERITY[impact] ?? 'moderate';
}

const SEVERITY_ORDER: Severity[] = ['critical', 'serious', 'moderate', 'minor', 'manual'];

export function severityRank(severity: Severity): number {
  const rank = SEVERITY_ORDER.indexOf(severity);
  return rank === -1 ? SEVERITY_ORDER.length : rank;
}

export function sortBySeverity<T extends { severity: Severity }>(items: T[]): T[] {
  return [...items].sort((a, b) => severityRank(a.severity) - severityRank(b.severity));
}
