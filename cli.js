#!/usr/bin/env node
import { Command } from "commander";
import puppeteer from "puppeteer";
import lighthouse from "lighthouse";
import fs from "fs";
import path from "path";
import chalk from "chalk";

const program = new Command();

program
  .name("frontend-performance-analyzer")
  .description("Analyze frontend performance of a given URL")
  .version("0.1.1")
  .requiredOption("-u, --url <url>", "URL to analyze")
  .option("-o, --output <file>", "Save HTML report to file")
  .option("--json", "Print raw JSON report to stdout")
  .parse(process.argv);

const options = program.opts();

function formatMetrics(lhr) {
  const audits = lhr.audits;

  const metrics = {
    "First Contentful Paint": audits["first-contentful-paint"].displayValue,
    "Speed Index": audits["speed-index"].displayValue,
    "Largest Contentful Paint": audits["largest-contentful-paint"].displayValue,
    "Time to Interactive": audits["interactive"].displayValue,
    "Total Blocking Time": audits["total-blocking-time"].displayValue,
    "Cumulative Layout Shift": audits["cumulative-layout-shift"].displayValue,
  };

  console.log(chalk.green.bold(`\n📊 Performance Metrics for ${lhr.finalUrl}`));
  console.log(
    chalk.yellow(`Score: ${lhr.categories.performance.score * 100}/100\n`)
  );

  for (const [key, value] of Object.entries(metrics)) {
    console.log(`${chalk.cyan(key)}: ${chalk.white(value)}`);
  }
}

async function runLighthouse(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--remote-debugging-port=9222"],
  });

  const result = await lighthouse(url, {
    port: 9222,
    output: "html",
    logLevel: "info",
  });

  await browser.close();
  return result;
}

(async () => {
  try {
    const { lhr, report } = await runLighthouse(options.url);

    formatMetrics(lhr);

    if (options.json) {
      console.log(JSON.stringify(lhr, null, 2));
    }

    if (options.output) {
      const outputPath = path.resolve(process.cwd(), options.output);
      fs.writeFileSync(outputPath, report);
      console.log(`💾 Report saved to ${outputPath}`);
    }
  } catch (err) {
    console.error("❌ Failed to analyze:", err.message);
    process.exit(1);
  }
})();
