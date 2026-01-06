# fpa-cli 🚀

> **Frontend Performance Analyzer** — A lightweight CLI tool to analyze frontend performance using Google Lighthouse and Puppeteer.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/fpa-cli.svg)](https://www.npmjs.com/package/fpa-cli)

**fpa-cli** helps developers quickly audit web pages from the terminal. It runs a headless browser, captures Core Web Vitals, and provides a concise color-coded summary or a full HTML report.

## ✨ Features

* **Automated Audits:** Runs Google Lighthouse programmatically via Puppeteer.
* **Core Web Vitals:** Instant checks for LCP, FCP, CLS, TBT, and Speed Index.
* **Color-Coded Feedback:** Green/Yellow/Red indicators based on performance scores.
* **Report Export:** Option to save the full Lighthouse HTML report locally.
* **CI/CD Friendly:** Simple command-line interface suitable for scripts.

## 📦 Installation

You can run it directly using `npx` (recommended) or install it globally.

### Using npx (No install required)
```bash
npx fpa-cli -u https://example.com
```

### Global Installation

```bash
npm install -g fpa-cli
```

## 🛠 Usage

### Basic Analysis

Run a quick performance check on a URL:

```bash
fpa-cli -u https://www.google.com
```

### Save HTML Report

Analyze a URL and save the detailed Lighthouse report to a file:

```bash
fpa-cli --url https://github.com --output ./report.html
```

## ⚙️ Options

| Option | Alias | Description | Required |
| --- | --- | --- | --- |
| `--url <url>` | `-u` | The target URL to analyze | **Yes** |
| `--output <path>` | `-o` | Path to save the full HTML report | No |
| `--version` | `-V` | Output the version number | No |
| `--help` | `-h` | Display help for command | No |

## 📊 Metrics Explained

The CLI outputs the following metrics directly to your console:

* **Performance Score:** Overall Lighthouse performance category score (0-100).
* **FCP (First Contentful Paint):** When the first text or image is painted.
* **LCP (Largest Contentful Paint):** Render time of the largest image or text block.
* **TBT (Total Blocking Time):** Time the main thread was blocked.
* **CLS (Cumulative Layout Shift):** Visual stability of the page.
* **Speed Index:** How quickly content is visually displayed.

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes using [Conventional Commits](https://www.conventionalcommits.org/)
4. Push to the branch
5. Open a Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.