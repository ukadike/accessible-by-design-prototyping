# WCAG 2+ Framework

WCAG 2.2 is the standards foundation for this project, with backward compatibility to WCAG 2.0 and 2.1. "WCAG 2+" is this project's own extension layer for issues that matter in creative, civic, educational, and multimodal interfaces but that conventional HTML-focused audits often miss.

## Core WCAG principles

- Perceivable
- Operable
- Understandable
- Robust

## WCAG 2+ extension areas

- Canvas accessibility
- p5.js sketch descriptions
- Keyboard-only creative interactions
- Screen-reader-readable sketch output
- Captions and transcripts
- Motion and flashing risk
- Sonification alternatives
- Cognitive load
- Plain-language labels
- Multilingual accessibility notes
- Blind editor review
- Human-review prompts

## Where the rules live

- `rules/wcag-core.json` documents the WCAG principle mapping used to interpret axe-core results.
- `rules/wcag-2-plus.json` holds automated-or-manual rules, currently focused on p5/canvas patterns (canvas description, keyboard alternative, animation pause control).
- `rules/human-review-prompts.json` holds the full set of manual-review prompts (motion, flashing, captions, transcripts, keyboard-only use, cognitive load, plain-language navigation, canvas descriptions, sound alternatives, touch target size, consistent help, accessible authentication, multilingual labels), each tagged with the contexts (`html`, `p5`, `canvas`, `animation`) it applies to.

## Extending the framework

New WCAG 2+ rules or prompts should:

1. Reference the closest matching WCAG success criterion where one exists, or state that none applies.
2. Include plain-language next steps, not just a description of the problem.
3. Declare which contexts they apply to (`appliesTo`) so the rules engine only surfaces relevant guidance.
