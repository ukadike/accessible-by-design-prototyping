# Changelog

All notable changes to this project are documented here. This project follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) conventions.

## [Unreleased]

### Added

- Navigation human-review prompts: bypass/skip navigation (2.4.1), focus order (2.4.3), focus visibility (2.4.7 / 2.4.11), consistent navigation (3.2.3), and multiple ways to find content (2.4.5).

## [0.1.0] - 2026-07-01

### Added

- CLI (`a11y-lab audit`, `audit-p5`, `report`) for auditing public URLs and local HTML files with Playwright + axe-core.
- p5.js sketch auditor detecting missing canvas descriptions, mouse-only interaction without keyboard alternatives, and unpaused animation loops.
- WCAG 2+ rule and human-review-prompt layer covering motion, flashing, captions, transcripts, keyboard-only use, cognitive load, plain-language navigation, canvas descriptions, sound alternatives, touch target size, consistent help, accessible authentication, and multilingual labels.
- Markdown, JSON, and console reporters.
- Vite + React web UI with a dev-server audit API.
- Example fixtures (`simple-html-site`, `p5-sketch-good`, `p5-sketch-needs-work`) and a sample report.
- JSON schemas for audit results and rule definitions.
