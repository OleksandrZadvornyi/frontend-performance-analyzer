import { logger, OUTPUT_LEVELS } from "../lib/logger.js";
import chalk from "chalk";
import fs from "fs";

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const version = packageJson.version;

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

export function exportMarkdownReport(lhr, filePath) {
  logger.verbose(`Starting Markdown export for ${lhr.finalUrl}`);

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

  try {
    fs.writeFileSync(filePath, content, "utf8");
    logger.info(
      chalk.gray(`  └─ 📝 Markdown report saved to ${filePath}`),
      OUTPUT_LEVELS.NORMAL
    );
    logger.verbose(
      `Markdown export completed: ${filePath} (${content.length} characters)`
    );
  } catch (error) {
    logger.error(chalk.red(`Error writing Markdown file: ${error.message}`));
  }
}
