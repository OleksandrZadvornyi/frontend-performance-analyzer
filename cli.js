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
  .option("--json-file <file>", "Save JSON report to file")
  .option("--markdown", "Save metrics as Markdown report")
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

function exportJson(lhResults, filePath = null) {
  const jsonOutput = {
    timestamp: new Date().toISOString(),
    tool: "frontend-performance-analyzer",
    version: version,
    results: [],
  };

  // Handle single result or array of results
  const results = Array.isArray(lhResults) ? lhResults : [lhResults];

  results.forEach(({ lhr, url }) => {
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
      // Include raw Lighthouse data if needed
      rawLighthouseData: options.includeRaw ? lhr : undefined,
    });
  });

  const jsonString = JSON.stringify(jsonOutput, null, 2);

  if (filePath) {
    fs.writeFileSync(filePath, jsonString, "utf8");
    console.log(chalk.gray(`  └─ JSON report saved to ${filePath}`));
  } else {
    console.log(jsonString);
  }

  return jsonOutput;
}

function getScoreBadge(score) {
  const percentage = Math.round(score * 100);

  if (percentage >= 90) {
    return `🟢 **${percentage}** (Excellent)`;
  } else if (percentage >= 75) {
    return `🟡 **${percentage}** (Good)`;
  } else if (percentage >= 50) {
    return `🟠 **${percentage}** (Needs Improvement)`;
  } else {
    return `🔴 **${percentage}** (Poor)`;
  }
}

function getMetricBadge(score) {
  if (score >= 0.9) {
    return "🟢";
  } else if (score >= 0.5) {
    return "🟡";
  } else {
    return "🔴";
  }
}

function exportMarkdown(lhr, filePath) {
  const audits = lhr.audits;
  const performanceScore = lhr.categories.performance.score;
  const lines = [];

  // Header with site info
  lines.push(`# 🚀 Performance Analysis Report`);
  lines.push(`**Analyzed URL:** [${lhr.finalUrl}](${lhr.finalUrl})`);
  lines.push("");
  lines.push(`**Generated:** ${new Date(lhr.fetchTime).toLocaleString()}`);
  lines.push("");
  lines.push(
    `**Tool:** [frontend-performance-analyzer](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer) v${version}`
  );
  lines.push("");

  // Overall Performance Score
  lines.push(`## 📊 Overall Performance Score`);
  lines.push(`### ${getScoreBadge(performanceScore)}`);
  lines.push("");

  // Core Web Vitals Section
  lines.push(`## 🎯 Core Web Vitals`);
  lines.push("");

  const coreVitals = [
    {
      name: "Largest Contentful Paint (LCP)",
      audit: "largest-contentful-paint",
      description: "Measures loading performance",
      goodThreshold: "≤ 2.5s",
    },
    {
      name: "First Input Delay / Total Blocking Time",
      audit: "total-blocking-time",
      description: "Measures interactivity",
      goodThreshold: "≤ 200ms",
    },
    {
      name: "Cumulative Layout Shift (CLS)",
      audit: "cumulative-layout-shift",
      description: "Measures visual stability",
      goodThreshold: "≤ 0.1",
    },
  ];

  coreVitals.forEach((vital) => {
    const audit = audits[vital.audit];
    const badge = getMetricBadge(audit.score);
    lines.push(`### ${badge} ${vital.name}`);
    lines.push(`- **Value:** ${audit.displayValue}`);
    lines.push(`- **Score:** ${Math.round(audit.score * 100)}/100`);
    lines.push(`- **Good:** ${vital.goodThreshold}`);
    lines.push(`- **Description:** ${vital.description}`);
    lines.push("");
  });

  // All Performance Metrics
  lines.push(`## 📈 Detailed Performance Metrics`);
  lines.push("");

  const allMetrics = [
    {
      name: "First Contentful Paint (FCP)",
      audit: "first-contentful-paint",
      description: "Time when first text/image is painted",
    },
    {
      name: "Speed Index",
      audit: "speed-index",
      description: "How quickly content is visually displayed",
    },
    {
      name: "Time to Interactive (TTI)",
      audit: "interactive",
      description: "Time when page becomes fully interactive",
    },
  ];

  // Create metrics table
  lines.push("| Metric | Value | Score | Status |");
  lines.push("|--------|-------|-------|---------|");

  [...coreVitals, ...allMetrics].forEach((metric) => {
    const audit = audits[metric.audit];
    const badge = getMetricBadge(audit.score);
    const score = Math.round(audit.score * 100);
    lines.push(
      `| ${metric.name} | ${audit.displayValue} | ${score}/100 | ${badge} |`
    );
  });

  lines.push("");

  // Category Scores
  lines.push(`## 🏆 Lighthouse Category Scores`);
  lines.push("");

  const categories = [
    { key: "performance", name: "Performance", icon: "⚡" },
    { key: "accessibility", name: "Accessibility", icon: "♿" },
    { key: "best-practices", name: "Best Practices", icon: "✅" },
    { key: "seo", name: "SEO", icon: "🔍" },
    { key: "pwa", name: "PWA", icon: "📱" },
  ];

  categories.forEach((category) => {
    const categoryData = lhr.categories[category.key];
    if (categoryData) {
      const score = Math.round(categoryData.score * 100);
      const badge = getScoreBadge(categoryData.score);
      lines.push(`### ${category.icon} ${category.name}`);
      lines.push(`${badge}`);
      lines.push("");
    }
  });

  // Opportunities Section
  const opportunities = Object.values(audits).filter(
    (audit) =>
      audit.details && audit.details.type === "opportunity" && audit.score < 1
  );

  if (opportunities.length > 0) {
    lines.push(`## 🔧 Performance Opportunities`);
    lines.push("");
    lines.push("These suggestions can help improve your page's performance:");
    lines.push("");

    opportunities.slice(0, 5).forEach((audit, index) => {
      lines.push(`${index + 1}. **${audit.title}**`);
      if (audit.displayValue) {
        lines.push(`   - Potential savings: ${audit.displayValue}`);
      }
      if (audit.description) {
        lines.push(`   - ${audit.description}`);
      }
      lines.push("");
    });
  }

  // Diagnostics Section
  const diagnostics = Object.values(audits).filter(
    (audit) =>
      audit.details &&
      audit.details.type === "diagnostic" &&
      audit.score !== null &&
      audit.score < 1
  );

  if (diagnostics.length > 0) {
    lines.push(`## 🔍 Diagnostics`);
    lines.push("");
    lines.push("Issues that may affect your page's performance:");
    lines.push("");

    diagnostics.slice(0, 3).forEach((audit, index) => {
      const badge = getMetricBadge(audit.score);
      lines.push(`${index + 1}. ${badge} **${audit.title}**`);
      if (audit.displayValue) {
        lines.push(`   - Value: ${audit.displayValue}`);
      }
      if (audit.description) {
        lines.push(`   - ${audit.description}`);
      }
      lines.push("");
    });
  }

  // Footer with additional info
  lines.push(`---`);
  lines.push(`## 📝 Report Information`);
  lines.push("");
  lines.push(`- **Analysis Date:** ${new Date().toLocaleString()}`);
  lines.push(`- **Lighthouse Version:** ${lhr.lighthouseVersion}`);
  lines.push(`- **User Agent:** ${lhr.environment.networkUserAgent}`);
  lines.push(`- **Benchmark Index:** ${lhr.environment.benchmarkIndex}`);
  lines.push("");
  lines.push(`### 🎯 Score Ranges`);
  lines.push(`- 🟢 **90-100:** Excellent`);
  lines.push(`- 🟡 **75-89:** Good`);
  lines.push(`- 🟠 **50-74:** Needs Improvement`);
  lines.push(`- 🔴 **0-49:** Poor`);
  lines.push("");
  lines.push(
    `*Generated by [frontend-performance-analyzer](https://github.com/OleksandrZadvornyi/frontend-performance-analyzer) v${version}*`
  );

  const content = lines.join("\n");
  fs.writeFileSync(filePath, content, "utf8");
  console.log(chalk.gray(`  └─ 📝 Markdown report saved to ${filePath}`));
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
  const allResults = []; // Store all results for batch JSON export

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

      // Store result for batch processing
      allResults.push({ lhr, url, report });

      if (!options.json || options.jsonFile) {
        formatMetrics(lhr);
      }

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

      // Individual JSON file export
      if (options.jsonFile && accessibleUrls.length === 1) {
        exportJson({ lhr, url }, options.jsonFile);
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

  // Batch JSON export
  if (options.json) {
    exportJson(allResults);
  }

  if (options.jsonFile && accessibleUrls.length > 1) {
    exportJson(allResults, options.jsonFile);
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
