/**
 * Maps axe-core findings to the plain-language result categories used on the
 * Website Check page. axe tags every rule with a `cat.*` marker; a few rule
 * ids get explicit overrides where the tag grouping reads oddly for humans.
 */

export const RESULT_CATEGORIES = [
  'Page structure',
  'Images and media',
  'Links and buttons',
  'Forms',
  'Color and contrast',
  'Keyboard access',
] as const;

export type ResultCategory = (typeof RESULT_CATEGORIES)[number];

const CATEGORY_BY_AXE_TAG: Record<string, ResultCategory> = {
  'cat.text-alternatives': 'Images and media',
  'cat.time-and-media': 'Images and media',
  'cat.color': 'Color and contrast',
  'cat.sensory-and-visual-cues': 'Color and contrast',
  'cat.forms': 'Forms',
  'cat.keyboard': 'Keyboard access',
  'cat.name-role-value': 'Links and buttons',
  'cat.structure': 'Page structure',
  'cat.semantics': 'Page structure',
  'cat.language': 'Page structure',
  'cat.parsing': 'Page structure',
  'cat.tables': 'Page structure',
  'cat.aria': 'Page structure',
};

const CATEGORY_BY_RULE_ID: Record<string, ResultCategory> = {
  'image-alt': 'Images and media',
  'input-image-alt': 'Images and media',
  'area-alt': 'Images and media',
  'object-alt': 'Images and media',
  'svg-img-alt': 'Images and media',
  'video-caption': 'Images and media',
  'button-name': 'Links and buttons',
  'link-name': 'Links and buttons',
  'input-button-name': 'Links and buttons',
  label: 'Forms',
  'select-name': 'Forms',
  'color-contrast': 'Color and contrast',
  tabindex: 'Keyboard access',
  accesskeys: 'Keyboard access',
};

export function categorizeAxeRule(ruleId: string, tags: string[]): ResultCategory {
  const byId = CATEGORY_BY_RULE_ID[ruleId];
  if (byId) return byId;
  for (const tag of tags) {
    const byTag = CATEGORY_BY_AXE_TAG[tag];
    if (byTag) return byTag;
  }
  return 'Page structure';
}
