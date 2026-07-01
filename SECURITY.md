# Security Policy

## Supported Versions

This project is pre-1.0 and evolving quickly. Security fixes are only made against the latest commit on `main`.

## Reporting a Vulnerability

Please do not open a public issue for security vulnerabilities.

Instead, use GitHub's private vulnerability reporting for this repository (Security tab → "Report a vulnerability"), or contact a repository owner directly. Include:

- A description of the issue and its potential impact
- Steps to reproduce, or a minimal proof of concept
- Any suggested remediation, if you have one

We'll acknowledge reports as quickly as we can and keep you updated as the issue is investigated and fixed.

## Scope

This tool audits pages you point it at using Playwright and axe-core. Be aware that:

- Auditing a URL causes this tool to load and execute that page's JavaScript in a headless browser.
- The web UI's `/api/audit` endpoint (dev server only) accepts a target and runs the same process server-side — do not expose the dev server to untrusted networks.
