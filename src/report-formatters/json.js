import { logger, OUTPUT_LEVELS } from "../lib/logger.js";
import chalk from "chalk";
import fs from "fs";

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const version = packageJson.version;

export function exportJsonReport(lhResults, filePath = null) {
  logger.verbose("Starting JSON export...");

  const jsonOutput = {
    timestamp: new Date().toISOString(),
    tool: "frontend-performance-analyzer",
    version: version,
    results: [],
  };

  // Handle single result or array of results
  const results = Array.isArray(lhResults) ? lhResults : [lhResults];
  logger.verbose(`Processing ${results.length} result(s) for JSON export`);

  results.forEach(({ lhr, url }, index) => {
    logger.verbose(
      `Processing result ${index + 1}/${results.length}: ${url || lhr.finalUrl}`
    );

    const performanceScore = lhr.categories.performance.score * 100;
    const audits = lhr.audits;

    jsonOutput.results.push({
      url: lhr.finalUrl || url,
      timestamp: lhr.fetchTime,
      performance: {
        score: performanceScore,
        metrics: {
          firstContentfulPaint: {
            value: audits["first-contentful-paint"].numericValue,
            displayValue: audits["first-contentful-paint"].displayValue,
            score: audits["first-contentful-paint"].score,
          },
          speedIndex: {
            value: audits["speed-index"].numericValue,
            displayValue: audits["speed-index"].displayValue,
            score: audits["speed-index"].score,
          },
          largestContentfulPaint: {
            value: audits["largest-contentful-paint"].numericValue,
            displayValue: audits["largest-contentful-paint"].displayValue,
            score: audits["largest-contentful-paint"].score,
          },
          timeToInteractive: {
            value: audits["interactive"].numericValue,
            displayValue: audits["interactive"].displayValue,
            score: audits["interactive"].score,
          },
          totalBlockingTime: {
            value: audits["total-blocking-time"].numericValue,
            displayValue: audits["total-blocking-time"].displayValue,
            score: audits["total-blocking-time"].score,
          },
          cumulativeLayoutShift: {
            value: audits["cumulative-layout-shift"].numericValue,
            displayValue: audits["cumulative-layout-shift"].displayValue,
            score: audits["cumulative-layout-shift"].score,
          },
        },
        categories: {
          performance: lhr.categories.performance.score,
          accessibility: lhr.categories.accessibility?.score,
          bestPractices: lhr.categories["best-practices"]?.score,
          seo: lhr.categories.seo?.score,
          pwa: lhr.categories.pwa?.score,
        },
      },
    });
  });

  const jsonString = JSON.stringify(jsonOutput, null, 2);
  logger.verbose(`Generated JSON output (${jsonString.length} characters)`);

  if (filePath) {
    try {
      fs.writeFileSync(filePath, jsonString, "utf8");
      logger.info(
        chalk.gray(`  └─ JSON report saved to ${filePath}`),
        OUTPUT_LEVELS.NORMAL
      );
      logger.verbose(`JSON file written successfully: ${filePath}`);
    } catch (error) {
      logger.error(chalk.red(`Error writing JSON file: ${error.message}`));
    }
  } else {
    console.log(jsonString);
  }

  return jsonOutput;
}
