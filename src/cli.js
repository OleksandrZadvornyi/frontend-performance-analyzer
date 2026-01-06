#!/usr/bin/env node
import { Command } from "commander";
import fs from "fs";
import chalk from "chalk";
import { Logger, OUTPUT_LEVELS } from "./lib/logger.js";
import {
  validateInputs,
  getUrlList,
  validateUrlAccessibility,
} from "./lib/url-utils.js";
import { runLighthouseAnalysis } from "./lib/lighthouse.js";
import { formatConsoleMetrics } from "./report-formatters/console.js";
import { exportMarkdownReport } from "./report-formatters/markdown.js";
import { exportJsonReport } from "./report-formatters/json.js";

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const version = packageJson.version;

const program = new Command();

program
  .name("frontend-performance-analyzer")
  .description("Analyze frontend performance of a given URL")
  .version(version)
  .option("-u, --url <url...>", "One or more URLs to analyze")
  .option("--input <file>", "Load URLs from a .txt or .json file")
  .option("-o, --output <file>", "Save HTML report to file")
  .option("--json", "Print raw JSON report to stdout")
  .option("--json-file <file>", "Save JSON report to file")
  .option("--markdown", "Save metrics as Markdown report")
  .option(
    "--threshold <score>",
    "Minimum acceptable Lighthouse performance score (0-100)",
    parseFloat
  )
  .option("-v, --verbose", "Enable verbose output with debugging details")
  .option("-s, --silent", "Minimal output (errors and final results only)")
  .parse(process.argv);

const options = program.opts();

// Validate mutually exclusive flags
if (options.verbose && options.silent) {
  console.error(
    chalk.red("❌ Error: --verbose and --silent cannot be used together")
  );
  process.exit(1);
}

const logger = new Logger();
logger.configure(options);

(async () => {
  const startTime = Date.now();
  logger.verbose(`Starting frontend-performance-analyzer v${version}`);
  logger.verbose(`Node.js version: ${process.version}`);
  logger.verbose(`Platform: ${process.platform} ${process.arch}`);
  logger.verbose(`Working directory: ${process.cwd()}`);
  logger.verbose(`Command line arguments: ${JSON.stringify(process.argv)}`);
  logger.verbose(`Options: ${JSON.stringify(options, null, 2)}`);

  // Validate inputs before processing
  validateInputs(options, logger);

  const urls = getUrlList(options, logger);

  // Check URL accessibility and get only accessible ones
  const accessibleUrls = await validateUrlAccessibility(urls, logger);
  const allResults = []; // Store all results for batch JSON export

  logger.info(chalk.blue.bold("🚀 Starting Lighthouse analysis...\n"));

  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < accessibleUrls.length; i++) {
    const url = accessibleUrls[i];
    const progress = `[${i + 1}/${accessibleUrls.length}]`;
    const urlStartTime = Date.now();

    logger.info(chalk.blue(`${progress} 🔍 Analyzing ${url}...`));
    logger.verbose(
      `Starting analysis ${i + 1}/${
        accessibleUrls.length
      } at ${new Date().toISOString()}`
    );

    try {
      logger.info(
        chalk.gray("  └─ Launching browser..."),
        OUTPUT_LEVELS.NORMAL
      );
      const { lhr, report } = await runLighthouseAnalysis(url, options);
      const urlAnalysisTime = Date.now() - urlStartTime;

      logger.info(chalk.gray("  └─ Analysis complete!"), OUTPUT_LEVELS.NORMAL);
      logger.verbose(`Total analysis time for ${url}: ${urlAnalysisTime}ms`);

      // Store result for batch processing
      allResults.push({ lhr, url, report });

      if (!options.json || options.jsonFile) {
        formatConsoleMetrics(lhr);
      }

      successCount++;

      if (options.json) {
        console.log(JSON.stringify(lhr, null, 2));
      }

      if (options.output) {
        const safeUrl = url.replace(/https?:\/\//, "").replace(/[^\w]/g, "_");
        const outputFile = `${safeUrl}.html`;
        logger.verbose(`Saving HTML report to: ${outputFile}`);
        fs.writeFileSync(outputFile, report);
        logger.info(
          chalk.gray(`  └─ HTML report saved to ${outputFile}`),
          OUTPUT_LEVELS.NORMAL
        );
      }

      if (options.markdown) {
        const safeUrl = url.replace(/https?:\/\//, "").replace(/[^\w]/g, "_");
        const markdownFile = `${safeUrl}.md`;
        exportMarkdownReport(lhr, markdownFile);
      }

      // Individual JSON file export
      if (options.jsonFile && accessibleUrls.length === 1) {
        exportJsonReport({ lhr, url }, options.jsonFile);
      }

      if (options.threshold !== undefined) {
        const actualScore = lhr.categories.performance.score * 100;
        logger.verbose(
          `Comparing score ${actualScore} against threshold ${options.threshold}`
        );
        if (actualScore < options.threshold) {
          logger.warn(
            chalk.red(
              `Score ${actualScore} is below threshold of ${options.threshold}`
            )
          );
          process.exitCode = 1; // does not exit immediately, just sets failure
        }
      }
    } catch (err) {
      const urlAnalysisTime = Date.now() - urlStartTime;
      logger.error(chalk.red(`Failed: ${err.message}`));
      logger.verbose(`Analysis failed for ${url} after ${urlAnalysisTime}ms`);
      logger.verbose(`Error details: ${err.stack}`);
      failureCount++;
      process.exitCode = 1;
    }

    // Add spacing between analyses
    if (i < accessibleUrls.length - 1) {
      logger.info("", OUTPUT_LEVELS.NORMAL);
    }
  }

  // Batch JSON export
  if (options.json) {
    logger.verbose("Performing batch JSON export to stdout");
    exportJsonReport(allResults);
  }

  if (options.jsonFile && accessibleUrls.length > 1) {
    logger.verbose(`Performing batch JSON export to file: ${options.jsonFile}`);
    exportJsonReport(allResults, options.jsonFile);
  }

  const totalTime = Date.now() - startTime;
  logger.verbose(`Total execution time: ${totalTime}ms`);

  // Final summary
  logger.info(chalk.blue.bold("\n📋 Analysis Summary:"));
  logger.info(`${chalk.green("✅ Successful:")} ${successCount}`);
  if (failureCount > 0) {
    logger.info(`${chalk.red("❌ Failed:")} ${failureCount}`);
  }
  logger.info(`${chalk.blue("📊 Total analyzed:")} ${accessibleUrls.length}`);

  if (urls.length > accessibleUrls.length) {
    logger.info(
      `${chalk.yellow("⚠️  Skipped (inaccessible):")} ${
        urls.length - accessibleUrls.length
      }`
    );
  }

  logger.verbose(`Analysis completed at ${new Date().toISOString()}`);
  logger.verbose(
    `Performance: ${(accessibleUrls.length / (totalTime / 1000)).toFixed(
      2
    )} URLs/sec`
  );
  logger.verbose(`Total execution time: ${totalTime}ms`);
})();
