import { logger, OUTPUT_LEVELS } from "../lib/logger.js";
import chalk from "chalk";

export function formatConsoleMetrics(lhr) {
  const audits = lhr.audits;

  const metrics = {
    "First Contentful Paint": audits["first-contentful-paint"].displayValue,
    "Speed Index": audits["speed-index"].displayValue,
    "Largest Contentful Paint": audits["largest-contentful-paint"].displayValue,
    "Time to Interactive": audits["interactive"].displayValue,
    "Total Blocking Time": audits["total-blocking-time"].displayValue,
    "Cumulative Layout Shift": audits["cumulative-layout-shift"].displayValue,
  };

  logger.info(
    chalk.green.bold(`\n📊 Performance Metrics for ${lhr.finalUrl}`),
    OUTPUT_LEVELS.SILENT
  );
  logger.info(
    chalk.yellow(`Score: ${lhr.categories.performance.score * 100}/100\n`),
    OUTPUT_LEVELS.SILENT
  );

  for (const [key, value] of Object.entries(metrics)) {
    logger.info(
      `${chalk.cyan(key)}: ${chalk.white(value)}`,
      OUTPUT_LEVELS.SILENT
    );
  }
}
