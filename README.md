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