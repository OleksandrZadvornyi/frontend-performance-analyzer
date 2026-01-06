import chalk from "chalk";

export function printMetrics(lhr) {
    const score = lhr.categories.performance.score * 100;
    const audits = lhr.audits;

    const scoreColor = score >= 90 ? chalk.green : score >= 50 ? chalk.yellow : chalk.red;

    console.log("\n" + chalk.bold.underline(`Report for: ${lhr.finalUrl}`));
    console.log(`Performance Score: ${scoreColor.bold(Math.round(score))}/100\n`);

    const metrics = [
        { label: "FCP (First Contentful Paint)", id: "first-contentful-paint" },
        { label: "LCP (Largest Contentful Paint)", id: "largest-contentful-paint" },
        { label: "TBT (Total Blocking Time)", id: "total-blocking-time" },
        { label: "CLS (Cumulative Layout Shift)", id: "cumulative-layout-shift" },
        { label: "Speed Index", id: "speed-index" },
    ];

    metrics.forEach((m) => {
        const audit = audits[m.id];
        const value = audit.displayValue;
        const color = audit.score >= 0.9 ? chalk.green : audit.score >= 0.5 ? chalk.yellow : chalk.red;

        console.log(`${m.label.padEnd(35)} ${color(value)}`);
    });
    console.log("");
}