export type Severity = 'critical' | 'serious' | 'moderate' | 'minor' | 'manual';

export type Principle = 'Perceivable' | 'Operable' | 'Understandable' | 'Robust' | 'WCAG 2+';

export interface AuditIssue {
  id: string;
  title: string;
  severity: Severity;
  wcag: string[];
  principle: Principle;
  location?: string;
  explanation: string;
  nextSteps: string[];
  source: 'axe-core' | 'wcag-2-plus' | 'p5-auditor' | 'manual-review';
}

export interface HumanReviewPrompt {
  id: string;
  title: string;
  question: string;
  wcag: string[];
  appliesTo: string[];
}

export interface AuditSummary {
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
  manualReview: number;
}

export interface AuditResult {
  projectName: string;
  target: string;
  auditedAt: string;
  summary: AuditSummary;
  issues: AuditIssue[];
  humanReviewPrompts: HumanReviewPrompt[];
}

export interface AccessibilityRule {
  id: string;
  title: string;
  category: string;
  severity: Severity;
  wcag: string[];
  principle: Principle;
  testType: 'automated' | 'manual' | 'automated-or-manual';
  description: string;
  nextSteps: string[];
  appliesTo?: string[];
}
