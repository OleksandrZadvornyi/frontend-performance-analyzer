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
  .option("-t, --threshold <number>", "Performance threshold (0-100). Fail if score is below this.")
  .option("-p, --preset <type>", "Device preset: mobile or desktop", "mobile")
  .option("-r, --runs <number>", "Number of runs for reliability", "1")
  .option("--no-throttle", "Disable network and CPU throttling")
  .action(async (options) => {
    const { url, output, threshold, preset, throttle } = options;
    const runs = parseInt(options.runs, 10) || 1;

    console.log(chalk.blue(`🔍 Analyzing ${url}...`));
    console.log(chalk.gray(`   Preset: ${preset} | Throttling: ${throttle ? "Enabled" : "Disabled"} | Runs: ${runs}`));

    try {
      const results = [];

      // Loop for multiple runs
      for (let i = 1; i <= runs; i++) {
        if (runs > 1) {
          console.log(chalk.yellow(`\n🔄 Run ${i} of ${runs}...`));
        }

        // Run analysis
        const result = await runAnalysis(url, { preset, throttle });
        results.push(result);
      }

      // Select Median Run
      results.sort((a, b) => {
        return a.lhr.categories.performance.score - b.lhr.categories.performance.score;
      });

      const medianIndex = Math.floor(results.length / 2);
      const medianResult = results[medianIndex];
      const { lhr, report } = medianResult;

      // Notify user if median was selected from multiple runs
      if (runs > 1) {
        console.log(chalk.green(`\n📊 Median run selected (Run index ${medianIndex + 1} of sorted results).`));
      }

      // Show CLI Metrics
      printMetrics(lhr);

      // Save HTML Report (if requested)
      if (output) {
        fs.writeFileSync(output, report);
        console.log(chalk.gray(`📝 HTML report saved to: ${output}`));
      }

      // Implement Gatekeeper Logic
      if (threshold) {
        const score = lhr.categories.performance.score * 100;
        const thresholdNum = Number(threshold);

        if (score < thresholdNum) {
          console.error(
            chalk.red(
              `\n❌ Performance Budget Failed: Score ${Math.round(score)} is below threshold ${thresholdNum}.`
            )
          );
          process.exit(1);
        } else {
          console.log(
            chalk.green(
              `\n✅ Performance Budget Passed: Score ${Math.round(score)} meets threshold ${thresholdNum}.`
            )
          );
        }
      }

    } catch (error) {
      console.error(chalk.red("\n❌ Analysis failed:"));
      console.error(error.message);
      process.exit(1);
    }
  });

program.parse(process.argv);