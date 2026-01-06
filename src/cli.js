#!/usr/bin/env node
import { Command } from "commander";
import fs from "fs";
import chalk from "chalk";
import { runAnalysis } from "./analyzer.js";
import { printMetrics } from "./utils.js";

// Load version safely
const packageJson = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url)));

const program = new Command();

program
  .name("fpa-cli")
  .version(packageJson.version)
  .description("Lightweight CLI to analyze frontend performance")
  .requiredOption("-u, --url <url>", "The URL to analyze")
  .option("-o, --output <path>", "Save the full HTML report to a file")
  .action(async (options) => {
    const { url, output } = options;

    console.log(chalk.blue(`🔍 Analyzing ${url}...`));

    try {
      const { lhr, report } = await runAnalysis(url);

      // 1. Show CLI Metrics
      printMetrics(lhr);

      // 2. Save HTML Report (if requested)
      if (output) {
        fs.writeFileSync(output, report);
        console.log(chalk.gray(`📝 HTML report saved to: ${output}`));
      }

    } catch (error) {
      console.error(chalk.red("\n❌ Analysis failed:"));
      console.error(error.message);
      process.exit(1);
    }
  });

program.parse(process.argv);