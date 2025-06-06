# ⚡️ Frontend Performance Analyzer

**A simple CLI tool to analyze frontend performance using Lighthouse and Puppeteer.**

- 🧠 Built for developers who care about performance
- 🚀 Powered by headless Chrome and real metrics
- 📦 Publish-ready for NPM usage

## 📦 Installation

You can run it instantly via `npx`:

```bash
npx frontend-performance-analyzer --url https://example.com
```

Or install it globally:

```bash
npm install -g frontend-performance-analyzer
```

## 🚀 Usage

### Analyze a Single URL

```bash
frontend-performance-analyzer --url https://example.com
```

### Analyze Multiple URLs

```bash
frontend-performance-analyzer --url https://example.com https://github.com
```

### Load URLs from File

```bash
frontend-performance-analyzer --input urls.txt
# or
frontend-performance-analyzer --input urls.json
```

### Export Report

```bash
# Save HTML report
frontend-performance-analyzer --url https://example.com --output report.html

# Save Markdown summary
frontend-performance-analyzer --url https://example.com --markdown report.md

# Output raw JSON
frontend-performance-analyzer --url https://example.com --json
```

### Use Performance Threshold

Exit with failure if score is too low:

```bash
frontend-performance-analyzer --url https://example.com --threshold 85
```

## 📊 Sample Output

```
📊 Performance Metrics for https://example.com
Score: 93/100

First Contentful Paint: 1.2 s
Speed Index: 1.9 s
Largest Contentful Paint: 1.4 s
Time to Interactive: 1.6 s
Total Blocking Time: 30 ms
Cumulative Layout Shift: 0.01
```

## 📁 Input File Formats

- `.txt`: List of URLs separated by new lines
- `.json`: JSON array of URLs, e.g. `["https://example.com", "https://github.com"]`

## 🛠 Development

Clone the repo and run:

```bash
npm install
node cli.js --url https://example.com
```

## 📄 License

MIT © 2025 Oleksandr Zadvornyi
