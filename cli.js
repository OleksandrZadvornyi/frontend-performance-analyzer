#!/usr/bin/env node
import { Command } from "commander";
import puppeteer from "puppeteer";
import lighthouse from "lighthouse";
import fs from "fs";
import path from "path";

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

    console.log(
      `✅ Performance score: ${lhr.categories.performance.score * 100}`
    );

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
