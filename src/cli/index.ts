#!/usr/bin/env node
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { Command } from 'commander';
import { runAudit, runP5Audit, runPdfAudit } from '../core/audit-runner.js';
import { generateMarkdownReport } from '../reporters/markdown-reporter.js';
import { generateJsonReport } from '../reporters/json-reporter.js';
import { printConsoleReport } from '../reporters/console-reporter.js';
import type { AuditResult } from '../core/types.js';

const program = new Command();

program
  .name('a11y-lab')
  .description('Accessibility Audit Lab: WCAG 2.2+ auditing for websites, HTML, p5.js sketches, and PDFs')
  .version('0.1.0');

function slugifyTarget(target: string): string {
  return target
    .replace(/^https?:\/\//i, '')
    .replace(/^file:\/\//i, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'audit';
}

function writeReports(result: AuditResult, outDir: string, format: string): void {
  mkdirSync(outDir, { recursive: true });
  const slug = slugifyTarget(result.target);

  if (format === 'markdown' || format === 'both') {
    const mdPath = path.join(outDir, `${slug}-audit.md`);
    writeFileSync(mdPath, generateMarkdownReport(result), 'utf-8');
    console.log(`Markdown report written to ${mdPath}`);
  }

  if (format === 'json' || format === 'both') {
    const jsonPath = path.join(outDir, `${slug}-audit.json`);
    writeFileSync(jsonPath, generateJsonReport(result), 'utf-8');
    console.log(`JSON report written to ${jsonPath}`);
  }
}

program
  .command('audit')
  .argument('<target>', 'URL or path to a local HTML file to audit')
  .option('--format <format>', 'markdown, json, or both', 'both')
  .option('--out <dir>', 'output directory for reports', './reports')
  .action(async (target: string, options: { format: string; out: string }) => {
    const result = await runAudit(target);
    printConsoleReport(result);
    writeReports(result, options.out, options.format);
  });

program
  .command('audit-p5')
  .argument('<target>', 'URL or path to a local p5.js sketch HTML file to audit')
  .option('--format <format>', 'markdown, json, or both', 'both')
  .option('--out <dir>', 'output directory for reports', './reports')
  .action(async (target: string, options: { format: string; out: string }) => {
    const result = await runP5Audit(target);
    printConsoleReport(result);
    writeReports(result, options.out, options.format);
  });

program
  .command('audit-pdf')
  .argument('<target>', 'URL or path to a local PDF file to audit')
  .option('--format <format>', 'markdown, json, or both', 'both')
  .option('--out <dir>', 'output directory for reports', './reports')
  .action(async (target: string, options: { format: string; out: string }) => {
    const result = await runPdfAudit(target);
    printConsoleReport(result);
    writeReports(result, options.out, options.format);
  });

program
  .command('report')
  .argument('<jsonFile>', 'path to a previously generated JSON audit report')
  .option('--out <dir>', 'output directory for the regenerated markdown report', './reports')
  .action((jsonFile: string, options: { out: string }) => {
    const result = JSON.parse(readFileSync(jsonFile, 'utf-8')) as AuditResult;
    writeReports(result, options.out, 'markdown');
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
