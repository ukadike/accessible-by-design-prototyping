const NEXT_STEP_LIBRARY: Record<string, string[]> = {
  'image-alt': [
    'Add meaningful alt text if the image communicates content.',
    'Use empty alt text only if the image is decorative.',
    "Avoid phrases like 'image of' unless needed for context.",
  ],
  'button-name': [
    'Add visible text, an aria-label, or an aria-labelledby reference that clearly names the button’s purpose.',
  ],
  'link-name': [
    'Add descriptive text inside the link, or an aria-label, so the link’s destination or purpose is clear out of context.',
  ],
  label: [
    'Associate a visible <label> with the form field using the for/id attributes, or wrap the field in the label.',
  ],
  'color-contrast': [
    'Increase the contrast between text and background to meet at least a 4.5:1 ratio (3:1 for large text).',
  ],
  'html-has-lang': [
    'Add a lang attribute to the <html> element so assistive technology announces content in the right language.',
  ],
};

export function generateNextSteps(ruleId: string, fallbackHelp?: string): string[] {
  const known = NEXT_STEP_LIBRARY[ruleId];
  if (known) return known;
  if (fallbackHelp) {
    return [fallbackHelp.endsWith('.') ? fallbackHelp : `${fallbackHelp}.`];
  }
  return ['Review this issue against the linked WCAG guidance and address the underlying cause.'];
}
