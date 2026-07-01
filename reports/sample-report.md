# Accessibility Audit Report

## Target

./examples/simple-html-site/index.html

Audited at: 2026-07-01T17:39:16.725Z

## Summary

- Critical: 3
- Serious: 2
- Moderate: 5
- Minor: 0
- Manual review items: 17

## Critical Issues

### Buttons must have discernible text

- **WCAG:** 4.1.2
- **Principle:** Robust
- **Source:** axe-core
- **Location:** `button`

Ensure buttons have discernible text

**Next steps:**
- Add visible text, an aria-label, or an aria-labelledby reference that clearly names the button’s purpose.

### Images must have alternative text

- **WCAG:** 1.1.1
- **Principle:** Perceivable
- **Source:** axe-core
- **Location:** `img`

Ensure <img> elements have alternative text or a role of none or presentation

**Next steps:**
- Add meaningful alt text if the image communicates content.
- Use empty alt text only if the image is decorative.
- Avoid phrases like 'image of' unless needed for context.

### Form elements must have labels

- **WCAG:** 4.1.2
- **Principle:** Robust
- **Source:** axe-core
- **Location:** `input`

Ensure every form element has a label

**Next steps:**
- Associate a visible <label> with the form field using the for/id attributes, or wrap the field in the label.

## Serious Issues

### Elements must meet minimum color contrast ratio thresholds

- **WCAG:** 1.4.3
- **Principle:** Perceivable
- **Source:** axe-core
- **Location:** `p`

Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds

**Next steps:**
- Increase the contrast between text and background to meet at least a 4.5:1 ratio (3:1 for large text).

### <html> element must have a lang attribute

- **WCAG:** 3.1.1
- **Principle:** Understandable
- **Source:** axe-core
- **Location:** `html`

Ensure every HTML document has a lang attribute

**Next steps:**
- Add a lang attribute to the <html> element so assistive technology announces content in the right language.

## Moderate Issues

### Document should have one main landmark

- **WCAG:** WCAG 2+
- **Principle:** WCAG 2+
- **Source:** axe-core
- **Location:** `html`

Ensure the document has a main landmark

**Next steps:**
- Document should have one main landmark.

### All page content should be contained by landmarks

- **WCAG:** WCAG 2+
- **Principle:** WCAG 2+
- **Source:** axe-core
- **Location:** `h1`

Ensure all page content is contained by landmarks

**Next steps:**
- All page content should be contained by landmarks.

### All page content should be contained by landmarks

- **WCAG:** WCAG 2+
- **Principle:** WCAG 2+
- **Source:** axe-core
- **Location:** `img`

Ensure all page content is contained by landmarks

**Next steps:**
- All page content should be contained by landmarks.

### All page content should be contained by landmarks

- **WCAG:** WCAG 2+
- **Principle:** WCAG 2+
- **Source:** axe-core
- **Location:** `p`

Ensure all page content is contained by landmarks

**Next steps:**
- All page content should be contained by landmarks.

### All page content should be contained by landmarks

- **WCAG:** WCAG 2+
- **Principle:** WCAG 2+
- **Source:** axe-core
- **Location:** `form`

Ensure all page content is contained by landmarks

**Next steps:**
- All page content should be contained by landmarks.

## Minor Issues

No issues found at this severity.

## Manual Review Needed

### Review motion and animation comfort

Can users pause, reduce, or avoid motion that is not essential?

- **WCAG:** 2.2.2, 2.3.3
- **Applies to:** animation, p5, canvas, html

### Review flashing and rapid visual change risk

Does any content flash more than three times per second, or could it be adjusted so it doesn't?

- **WCAG:** 2.3.1
- **Applies to:** animation, p5, canvas, html

### Review captions for audio/video content

Do all pre-recorded audio and video elements have accurate captions?

- **WCAG:** 1.2.2
- **Applies to:** html

### Review transcripts for media content

Is a full text transcript available for audio-only or video-only content?

- **WCAG:** 1.2.1
- **Applies to:** html

### Review keyboard-only usability

Can every interactive element and creative interaction be reached and operated using only a keyboard?

- **WCAG:** 2.1.1, 2.1.2
- **Applies to:** html, p5, canvas

### Review cognitive load

Is the interface free of unnecessary complexity, jargon, or steps that could overwhelm someone under time pressure or with a cognitive disability?

- **WCAG:** 3.1.5
- **Applies to:** html, p5

### Review plain-language navigation

Are navigation labels, menu items, and instructions written in plain, unambiguous language?

- **WCAG:** 3.1.5, 2.4.6
- **Applies to:** html

### Review sound-based interaction alternatives

Is sound-based feedback or interaction also available through a visual or text alternative?

- **WCAG:** 1.1.1, 1.2.1
- **Applies to:** p5, canvas, html

### Review touch target size

Are interactive touch targets at least 24 by 24 CSS pixels, or given adequate spacing if smaller?

- **WCAG:** 2.5.8
- **Applies to:** html, p5, canvas

### Review consistent help placement

If help mechanisms exist across multiple pages, do they appear in the same relative order each time?

- **WCAG:** 3.2.6
- **Applies to:** html

### Review accessible authentication

Does authentication avoid relying solely on cognitive function tests such as memorizing passwords or solving puzzles, without an alternative?

- **WCAG:** 3.3.8
- **Applies to:** html

### Review multilingual accessibility notes

If the project serves multiple languages, are accessibility labels, alt text, and instructions translated and reviewed by fluent speakers?

- **WCAG:** 3.1.2
- **Applies to:** html, p5

### Review bypass/skip navigation

Is there a way to skip repeated navigation blocks (a "skip to content" link, or landmark regions) so keyboard and screen reader users don't have to tab through the same menu on every page?

- **WCAG:** 2.4.1
- **Applies to:** html

### Review focus order

Does tabbing through the page move focus in an order that matches the visual reading order and preserves meaning?

- **WCAG:** 2.4.3
- **Applies to:** html, p5, canvas

### Review focus visibility

Is there always a clearly visible focus indicator on the element that currently has keyboard focus, and is it never fully hidden behind other content?

- **WCAG:** 2.4.7, 2.4.11
- **Applies to:** html, p5, canvas

### Review consistent navigation

If navigation menus repeat across multiple pages, do they appear in the same relative order each time?

- **WCAG:** 3.2.3
- **Applies to:** html

### Review multiple ways to find content

Is there more than one way to locate a page within the site (e.g. navigation menu plus search, or a sitemap), other than a single required sequence of steps?

- **WCAG:** 2.4.5
- **Applies to:** html

## Recommended Next Steps

Address critical and serious issues first, then work through moderate and minor issues.
Use the manual review prompts above as a checklist for a human accessibility pass, ideally including testing with assistive technology and disabled users.

## WCAG 2+ Notes

This report includes a WCAG 2+ layer covering creative, civic, educational, and multimodal accessibility concerns that go beyond conventional HTML audits.

## Disclaimer

This report is an accessibility aid, not a legal certification.
