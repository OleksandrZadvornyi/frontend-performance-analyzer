#!/usr/bin/env node
import { Command } from "commander";
import puppeteer from "puppeteer";
import lighthouse from "lighthouse";
import fs from "fs";
import path from "path";
import chalk from "chalk";

const packageJsonPath = path.resolve("package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
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
  .option("--markdown <file>", "Save metrics as Markdown report")
  .option(
    "--threshold <score>",
    "Minimum acceptable Lighthouse performance score (0-100)",
    parseFloat
  )
  .parse(process.argv);

const options = program.opts();

function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function checkUrlAccessibility(url) {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      timeout: 10000,
      signal: AbortSignal.timeout(10000),
    });
    return response.ok || response.status < 400;
  } catch {
    return false;
  }
}

function validateInputs(options) {
  // Check if at least one URL source is provided
  if (!options.url && !options.input) {
    console.error(
      chalk.red("❌ Error: Please provide URLs using --url or --input")
    );
    process.exit(1);
  }

  // Validate threshold if provided
  if (options.threshold !== undefined) {
    if (
      isNaN(options.threshold) ||
      options.threshold < 0 ||
      options.threshold > 100
    ) {
      console.error(
        chalk.red("❌ Error: Threshold must be a number between 0 and 100")
      );
      process.exit(1);
    }
  }

  // Validate input file exists
  if (options.input) {
    const filePath = path.resolve(process.cwd(), options.input);
    if (!fs.existsSync(filePath)) {
      console.error(
        chalk.red(`❌ Error: Input file "${options.input}" does not exist`)
      );
      process.exit(1);
    }

    // Check file extension
    if (!filePath.endsWith(".txt") && !filePath.endsWith(".json")) {
      console.error(chalk.red("❌ Error: Input file must be .txt or .json"));
      process.exit(1);
    }
  }
}

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

function exportMarkdown(lhr, filePath) {
  const audits = lhr.audits;
  const lines = [];

  lines.push(`# 🚀 Performance Report for ${lhr.finalUrl}`);
  lines.push(
    `**Performance Score**: ${lhr.categories.performance.score * 100}/100\n`
  );

  const metrics = {
    "First Contentful Paint": audits["first-contentful-paint"].displayValue,
    "Speed Index": audits["speed-index"].displayValue,
    "Largest Contentful Paint": audits["largest-contentful-paint"].displayValue,
    "Time to Interactive": audits["interactive"].displayValue,
    "Total Blocking Time": audits["total-blocking-time"].displayValue,
    "Cumulative Layout Shift": audits["cumulative-layout-shift"].displayValue,
  };

  for (const [key, value] of Object.entries(metrics)) {
    lines.push(`- **${key}**: ${value}`);
  }

  fs.writeFileSync(filePath, lines.join("\n"), "utf8");
  console.log(`📝 Markdown report saved to ${filePath}`);
}

function getUrlList(options) {
  let urls = [];

  if (options.input) {
    const filePath = path.resolve(process.cwd(), options.input);
    try {
      const content = fs.readFileSync(filePath, "utf-8");

      if (filePath.endsWith(".json")) {
        const parsed = JSON.parse(content);
        urls = Array.isArray(parsed) ? parsed : [parsed];
      } else {
        urls = content
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);
      }
    } catch (error) {
      console.error(chalk.red(`❌ Error reading input file: ${error.message}`));
      process.exit(1);
    }
  } else if (options.url) {
    urls = options.url;
  }

  // Validate all URLs format
  const invalidUrls = urls.filter((url) => !isValidUrl(url));
  if (invalidUrls.length > 0) {
    console.error(chalk.red(`❌ Error: Invalid URL format:`));
    invalidUrls.forEach((url) => console.error(`  - ${url}`));
    process.exit(1);
  }

  if (urls.length === 0) {
    console.error(chalk.red("❌ Error: No valid URLs found"));
    process.exit(1);
  }

  return urls;
}

async function validateUrlAccessibility(urls) {
  console.log(chalk.blue("🔍 Checking URL accessibility..."));

  const accessibleUrls = [];
  const inaccessibleUrls = [];

  for (const url of urls) {
    process.stdout.write(`  Checking ${url}... `);
    const isAccessible = await checkUrlAccessibility(url);
    if (isAccessible) {
      console.log(chalk.green("✅"));
      accessibleUrls.push(url);
    } else {
      console.log(chalk.red("❌"));
      inaccessibleUrls.push(url);
    }
  }

  if (inaccessibleUrls.length > 0) {
    console.warn(
      chalk.yellow(
        `⚠️  Warning: ${inaccessibleUrls.length} URL(s) are not accessible and will be skipped:`
      )
    );
    inaccessibleUrls.forEach((url) => console.warn(`  - ${url}`));
  }

  if (accessibleUrls.length === 0) {
    console.error(chalk.red("❌ Error: No accessible URLs found"));
    process.exit(1);
  }

  console.log(
    chalk.green(
      `✅ ${accessibleUrls.length} URL(s) are accessible and will be analyzed\n`
    )
  );
  return accessibleUrls;
}

async function runLighthouse(url) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--remote-debugging-port=9222",
    ],
  });

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
      // Show a cleaner warning instead of the full stack trace
      if (lighthouseErrors.length === 1) {
        console.warn(
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
    const result = await lighthouse(url, {
      port: 9222,
      output: "html",
      logLevel: "error",
    });

    return result;
  } finally {
    // Restore original console.error
    console.error = originalConsoleError;
    await browser.close();
  }
}

(async () => {
  // Validate inputs before processing
  validateInputs(options);

  const urls = getUrlList(options);

  // Check URL accessibility and get only accessible ones
  const accessibleUrls = await validateUrlAccessibility(urls);

  console.log(chalk.blue.bold("🚀 Starting Lighthouse analysis...\n"));

  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < accessibleUrls.length; i++) {
    const url = accessibleUrls[i];
    const progress = `[${i + 1}/${accessibleUrls.length}]`;

    console.log(chalk.blue(`${progress} 🔍 Analyzing ${url}...`));

    try {
      console.log(chalk.gray("  └─ Launching browser..."));
      const { lhr, report } = await runLighthouse(url);
      console.log(chalk.gray("  └─ Analysis complete!"));

      formatMetrics(lhr);
      successCount++;

      if (options.json) {
        console.log(JSON.stringify(lhr, null, 2));
      }

      if (options.output) {
        const safeUrl = url.replace(/https?:\/\//, "").replace(/[^\w]/g, "_");
        fs.writeFileSync(`${safeUrl}.html`, report);
        console.log(chalk.gray(`  └─ HTML report saved to ${safeUrl}.html`));
      }

      if (options.markdown) {
        const safeUrl = url.replace(/https?:\/\//, "").replace(/[^\w]/g, "_");
        exportMarkdown(lhr, `${safeUrl}.md`);
      }

      if (options.threshold !== undefined) {
        const actualScore = lhr.categories.performance.score * 100;
        if (actualScore < options.threshold) {
          console.warn(
            chalk.red(
              `⚠️  Score ${actualScore} is below threshold of ${options.threshold}`
            )
          );
          process.exitCode = 1; // does not exit immediately, just sets failure
        }
      }
    } catch (err) {
      console.error(chalk.red(`  └─ ❌ Failed: ${err.message}`));
      failureCount++;
      process.exitCode = 1;
    }

    // Add spacing between analyses
    if (i < accessibleUrls.length - 1) {
      console.log();
    }
  }

  // Final summary
  console.log(chalk.blue.bold("\n📋 Analysis Summary:"));
  console.log(`${chalk.green("✅ Successful:")} ${successCount}`);
  console.log(`${chalk.red("❌ Failed:")} ${failureCount}`);
  console.log(`${chalk.blue("📊 Total analyzed:")} ${accessibleUrls.length}`);

  if (urls.length > accessibleUrls.length) {
    console.log(
      `${chalk.yellow("⚠️  Skipped (inaccessible):")} ${
        urls.length - accessibleUrls.length
      }`
    );
  }
})();
