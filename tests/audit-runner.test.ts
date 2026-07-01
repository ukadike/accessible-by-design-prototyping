import { describe, expect, it } from 'vitest';
import { axeImpactToSeverity, sortBySeverity } from '../src/core/severity.js';
import { extractWcagFromAxeTags, principleForWcag } from '../src/core/wcag-map.js';
import { normalizeAxeViolations } from '../src/core/issue-normalizer.js';
import { summarize } from '../src/core/audit-runner.js';
import { promptsForContext, rulesForContext } from '../src/core/rules-engine.js';

describe('severity mapping', () => {
  it('maps axe impact levels to project severities', () => {
    expect(axeImpactToSeverity('critical')).toBe('critical');
    expect(axeImpactToSeverity('serious')).toBe('serious');
    expect(axeImpactToSeverity('moderate')).toBe('moderate');
    expect(axeImpactToSeverity('minor')).toBe('minor');
    expect(axeImpactToSeverity(null)).toBe('moderate');
    expect(axeImpactToSeverity(undefined)).toBe('moderate');
  });

  it('sorts issues from most to least severe', () => {
    const sorted = sortBySeverity([
      { severity: 'minor' as const },
      { severity: 'critical' as const },
      { severity: 'moderate' as const },
    ]);
    expect(sorted.map((item) => item.severity)).toEqual(['critical', 'moderate', 'minor']);
  });
});

describe('wcag mapping', () => {
  it('extracts WCAG success criteria from axe tags', () => {
    expect(extractWcagFromAxeTags(['wcag2a', 'wcag111', 'cat.text-alternatives'])).toEqual(['1.1.1']);
  });

  it('infers a principle from a WCAG criterion', () => {
    expect(principleForWcag(['1.1.1'])).toBe('Perceivable');
    expect(principleForWcag(['2.1.1'])).toBe('Operable');
    expect(principleForWcag(['3.1.5'])).toBe('Understandable');
    expect(principleForWcag(['4.1.2'])).toBe('Robust');
    expect(principleForWcag([])).toBe('WCAG 2+');
  });
});

describe('axe issue normalization', () => {
  it('converts axe violations into AuditIssue entries, one per affected node', () => {
    const issues = normalizeAxeViolations({
      violations: [
        {
          id: 'image-alt',
          help: 'Images must have alternative text',
          description: 'Ensures <img> elements have alternative text',
          impact: 'critical',
          tags: ['wcag2a', 'wcag111'],
          nodes: [{ target: ['img.hero'] }, { target: ['img.footer'] }],
        },
      ],
    });

    expect(issues).toHaveLength(2);
    expect(issues[0]).toMatchObject({
      id: 'image-alt',
      severity: 'critical',
      wcag: ['1.1.1'],
      principle: 'Perceivable',
      location: 'img.hero',
      source: 'axe-core',
    });
    expect(issues[0].nextSteps.length).toBeGreaterThan(0);
  });
});

describe('summary', () => {
  it('tallies issues by severity and counts manual review prompts', () => {
    const summary = summarize(
      [
        { severity: 'critical' } as never,
        { severity: 'serious' } as never,
        { severity: 'serious' } as never,
        { severity: 'minor' } as never,
      ],
      [{ id: 'a' } as never, { id: 'b' } as never],
    );
    expect(summary).toEqual({ critical: 1, serious: 2, moderate: 0, minor: 1, manualReview: 2 });
  });
});

describe('rules engine', () => {
  it('returns human review prompts that apply to the given contexts', () => {
    const prompts = promptsForContext(['p5', 'canvas']);
    expect(prompts.length).toBeGreaterThan(0);
    expect(prompts.every((prompt) => prompt.appliesTo.some((tag) => ['p5', 'canvas'].includes(tag)))).toBe(true);
  });

  it('returns WCAG 2+ rules that apply to the given contexts', () => {
    const rules = rulesForContext(['p5', 'canvas']);
    expect(rules.some((rule) => rule.id === 'p5-canvas-description')).toBe(true);
  });

  it('includes navigation prompts (skip links, focus order, focus visibility, consistent navigation, multiple ways) for html audits', () => {
    const prompts = promptsForContext(['html']);
    const navigationPromptIds = [
      'skip-link-review',
      'focus-order-review',
      'focus-visible-review',
      'consistent-navigation-review',
      'multiple-ways-review',
    ];
    for (const id of navigationPromptIds) {
      expect(prompts.some((prompt) => prompt.id === id)).toBe(true);
    }
  });
});
