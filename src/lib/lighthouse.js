import puppeteer from "puppeteer";
import lighthouse from "lighthouse";
import { logger } from "./logger.js";
import { exportJsonReport } from "../report-formatters/json.js";
import { exportMarkdownReport } from "../report-formatters/markdown.js";
import { formatConsoleMetrics } from "../report-formatters/console.js";

export async function analyzeUrls(urls, options) {
  const results = [];

  for (const url of urls) {
    try {
      const result = await runLighthouseAnalysis(url, options);
      results.push(result);

      // Handle reports based on options
      if (options.json) exportJsonReport(result);
      if (options.markdown) exportMarkdownReport(result);
      // ... other report handling ...
    } catch (error) {
      logger.error(`Analysis failed for ${url}: ${error.message}`);
    }
  }

  return results;
}

export async function runLighthouseAnalysis(url, options) {
  logger.verbose(`Starting Lighthouse analysis for: ${url}`);

  const browserStartTime = Date.now();
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--remote-debugging-port=9222",
    ],
  });

  const browserLaunchTime = Date.now() - browserStartTime;
  logger.verbose(`Browser launched in ${browserLaunchTime}ms`);

  // Capture console output to filter Lighthouse internal errors
  const originalConsoleError = console.error;
  const lighthouseErrors = [];

  console.error = (...args) => {
    const message = args.join(" ");
    if (
      message.includes("LanternError") ||
      message.includes("Invalid dependency graph")
    ) {
      lighthouseErrors.push(message);
      logger.verbose(`Lighthouse internal warning: ${message}`);
      // Show a cleaner warning instead of the full stack trace
      if (lighthouseErrors.length === 1) {
        logger.info(
          chalk.yellow(
            "  └─ ⚠️  Lighthouse internal warning (analysis will continue)"
          )
        );
      }
    } else {
      originalConsoleError(...args);
    }
  };

  try {
    const lighthouseStartTime = Date.now();
    logger.verbose("Running Lighthouse analysis...");

    const result = await lighthouse(url, {
      port: 9222,
      output: "html",
      logLevel: options.verbose ? "info" : "error", // More detailed logs in verbose mode
    });

    const lighthouseTime = Date.now() - lighthouseStartTime;
    logger.verbose(`Lighthouse analysis completed in ${lighthouseTime}ms`);

    if (result.lhr) {
      logger.verbose(
        `Performance score: ${(
          result.lhr.categories.performance.score * 100
        ).toFixed(1)}`
      );
      logger.verbose(`Lighthouse version: ${result.lhr.lighthouseVersion}`);
      logger.verbose(`Report generation time: ${result.lhr.timing?.total}ms`);
    }

    return result;
  } finally {
    // Restore original console.error
    console.error = originalConsoleError;
    const browserCloseStart = Date.now();
    await browser.close();
    const browserCloseTime = Date.now() - browserCloseStart;
    logger.verbose(`Browser closed in ${browserCloseTime}ms`);
  }
}
