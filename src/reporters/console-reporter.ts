import chalk from 'chalk';
import type { AuditResult } from '../core/types.js';

export function printConsoleReport(result: AuditResult): void {
  const { target, summary, issues, humanReviewPrompts } = result;

  console.log(chalk.bold(`\nAccessibility Audit: ${target}`));
  console.log(chalk.dim(`Audited at ${result.auditedAt}\n`));

  console.log(chalk.bold('Summary:'));
  console.log(`  ${chalk.red('Critical')}: ${summary.critical}`);
  console.log(`  ${chalk.redBright('Serious')}: ${summary.serious}`);
  console.log(`  ${chalk.yellow('Moderate')}: ${summary.moderate}`);
  console.log(`  ${chalk.blue('Minor')}: ${summary.minor}`);
  console.log(`  ${chalk.magenta('Manual review')}: ${summary.manualReview}\n`);

  if (issues.length === 0) {
    console.log(chalk.green('No automated issues found.\n'));
  } else {
    console.log(chalk.bold('Issues:'));
    for (const issue of issues) {
      console.log(`  [${issue.severity}] ${issue.title}${issue.location ? ` (${issue.location})` : ''}`);
    }
    console.log('');
  }

  if (humanReviewPrompts.length > 0) {
    console.log(chalk.bold('Manual review prompts:'));
    for (const prompt of humanReviewPrompts) {
      console.log(`  - ${prompt.title}: ${prompt.question}`);
    }
    console.log('');
  }

  console.log(chalk.dim('This report is an accessibility aid, not a legal certification.\n'));
}
