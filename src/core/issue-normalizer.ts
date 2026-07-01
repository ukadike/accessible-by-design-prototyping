import type { AuditIssue } from './types.js';
import { axeImpactToSeverity } from './severity.js';
import { extractWcagFromAxeTags, principleForWcag } from './wcag-map.js';
import { generateNextSteps } from './next-step-generator.js';

export interface AxeNode {
  target: string[];
  html?: string;
}

export interface AxeViolation {
  id: string;
  help: string;
  description: string;
  impact?: string | null;
  tags: string[];
  nodes: AxeNode[];
}

export interface AxeResults {
  violations: AxeViolation[];
}

export function normalizeAxeViolations(results: AxeResults): AuditIssue[] {
  const issues: AuditIssue[] = [];

  for (const violation of results.violations) {
    const wcag = extractWcagFromAxeTags(violation.tags);
    const severity = axeImpactToSeverity(violation.impact);
    const nextSteps = generateNextSteps(violation.id, violation.help);
    const nodeCount = violation.nodes.length || 1;

    for (let i = 0; i < nodeCount; i += 1) {
      const node = violation.nodes[i];
      issues.push({
        id: violation.id,
        title: violation.help,
        severity,
        wcag,
        principle: principleForWcag(wcag),
        location: node?.target?.join(' ') ?? undefined,
        explanation: violation.description,
        nextSteps,
        source: 'axe-core',
      });
    }
  }

  return issues;
}
