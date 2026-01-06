# fpa-cli

> **Frontend Performance Analyzer** — A lightweight CLI tool to analyze frontend performance using Google Lighthouse and Puppeteer.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/fpa-cli.svg)](https://www.npmjs.com/package/fpa-cli)

**fpa-cli** helps developers quickly audit web pages from the terminal. It runs a headless browser, captures Core Web Vitals, and provides a concise color-coded summary or a full HTML report.

## Features

* **Automated Audits:** Runs Google Lighthouse programmatically via Puppeteer.
* **Multi-Device Support:** Switch between **Mobile** (default) and **Desktop** emulation presets.
* **Performance Budgets:** Set a threshold score; the CLI will exit with an error if the site fails (perfect for CI/CD pipelines).
* **Reliability:** Run multiple audits automatically and select the **median result** to reduce variance.
* **Core Web Vitals:** Instant checks for LCP, FCP, CLS, TBT, and Speed Index.
* **Report Export:** Option to save the full Lighthouse HTML report locally.

## Installation

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

### Basic Analysis (Mobile Default)

Run a quick performance check on a URL:

```bash
fpa-cli -u https://www.google.com
```

### Desktop Analysis

Analyze the page using desktop screen emulation settings:

```bash
fpa-cli -u https://www.google.com --preset desktop
```

### CI/CD Performance Budget

Fail the build (exit code 1) if the performance score is below 90:

```bash
fpa-cli -u https://www.google.com --threshold 90
```

### High Reliability Mode

Run the audit 3 times and select the median result to account for network variance:

```bash
fpa-cli -u https://www.google.com --runs 3
```

### Save HTML Report

Analyze a URL and save the detailed Lighthouse report to a file:

```bash
fpa-cli -u https://github.com -o ./report.html
```

## Options

| Option | Alias | Description | Default |
| --- | --- | --- | --- |
| `--url <url>` | `-u` | The target URL to analyze | **Required** |
| `--output <path>` | `-o` | Path to save the full HTML report | `null` |
| `--threshold <number>` | `-t` | Performance threshold (0-100). Fail if score is below this. | `null` |
| `--preset <type>` | `-p` | Device preset: `mobile` or `desktop` | `mobile` |
| `--runs <number>` | `-r` | Number of runs to calculate the median score | `1` |
| `--no-throttle` |  | Disable network and CPU throttling | `false` |
| `--version` | `-V` | Output the version number |  |
| `--help` | `-h` | Display help for command |  |

## Metrics Explained

The CLI outputs the following metrics directly to your console:

* **Performance Score:** Overall Lighthouse performance category score (0-100).
* **FCP (First Contentful Paint):** When the first text or image is painted.
* **LCP (Largest Contentful Paint):** Render time of the largest image or text block.
* **TBT (Total Blocking Time):** Time the main thread was blocked.
* **CLS (Cumulative Layout Shift):** Visual stability of the page.
* **Speed Index:** How quickly content is visually displayed.

## Contributing

Contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes using [Conventional Commits](https://www.conventionalcommits.org/)
4. Push to the branch
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.