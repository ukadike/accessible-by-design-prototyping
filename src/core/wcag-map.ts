import type { Principle } from './types.js';

const PRINCIPLE_BY_CRITERION_PREFIX: Record<string, Principle> = {
  '1': 'Perceivable',
  '2': 'Operable',
  '3': 'Understandable',
  '4': 'Robust',
};

export function principleForWcag(wcag: string[]): Principle {
  for (const criterion of wcag) {
    const prefix = criterion.split('.')[0];
    const principle = PRINCIPLE_BY_CRITERION_PREFIX[prefix];
    if (principle) return principle;
  }
  return 'WCAG 2+';
}

const AXE_TAG_WCAG_PATTERN = /^wcag(\d)(\d)(\d+)$/;

export function extractWcagFromAxeTags(tags: string[]): string[] {
  const criteria = new Set<string>();
  for (const tag of tags) {
    const match = AXE_TAG_WCAG_PATTERN.exec(tag);
    if (match) {
      const [, major, minor, rest] = match;
      criteria.add(`${major}.${minor}.${rest}`);
    }
  }
  return Array.from(criteria).sort();
}
