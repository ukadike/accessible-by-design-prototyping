# Human Review Guide

Automated tools, including this one, only catch a subset of accessibility issues. Every audit report includes a "Manual Review Needed" section listing the prompts in `rules/human-review-prompts.json` that apply to the target. Use them as a checklist for a human pass.

## How to use the prompts

For each prompt:

1. Read the question and the linked WCAG success criteria.
2. Try the interaction or content the question refers to yourself, ideally with the relevant assistive technology (screen reader, keyboard only, screen magnifier, switch access).
3. Record a plain answer: yes, no, or partial, with a one-line note on what you observed.
4. If the answer is no or partial, add it to the remediation backlog alongside the automated issues.

## Prompt topics covered

- Motion and animation comfort
- Flashing and rapid visual change risk
- Captions for audio/video
- Transcripts for media
- Keyboard-only usability
- Cognitive load
- Plain-language navigation
- Canvas/sketch descriptions
- Sound-based interaction alternatives
- Touch target size
- Consistent help placement
- Accessible authentication
- Multilingual accessibility notes
- Bypass/skip navigation
- Focus order
- Focus visibility
- Consistent navigation
- Multiple ways to find content

## Best practice: include disabled testers

Wherever possible, involve people who use assistive technology daily in the review, rather than relying solely on team members simulating disability. Their lived experience surfaces issues that checklists cannot.

## This is not certification

A completed human review, combined with a clean automated report, still does not constitute a legal accessibility certification. Treat both as inputs to an ongoing accessibility practice, not a one-time gate.
