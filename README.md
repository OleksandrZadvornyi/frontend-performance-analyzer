# ⚡️ Frontend Performance Analyzer

**A simple CLI tool to analyze frontend performance using Lighthouse and Puppeteer.**

- 🧠 Built for developers who care about performance
- 🚀 Powered by headless Chrome and real metrics
- 📦 Publish-ready for NPM usage
- 🔍 Automatically validates URL accessibility before analysis
- 📊 Comprehensive progress reporting and analysis summaries

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

### Export Reports

```bash
# Save HTML report (automatically named based on URL)
frontend-performance-analyzer --url https://example.com --output

# Save Markdown summary (automatically named based on URL)
frontend-performance-analyzer --url https://example.com --markdown

# Output raw JSON to console
frontend-performance-analyzer --url https://example.com --json
```

### Use Performance Threshold

Exit with failure if score is below threshold:

```bash
frontend-performance-analyzer --url https://example.com --threshold 85
```

## 🔍 URL Validation & Accessibility

The tool automatically:

- ✅ Validates URL format before analysis
- 🔍 Checks URL accessibility with HEAD requests
- ⚠️ Warns about inaccessible URLs and skips them
- 📊 Provides detailed progress reporting during analysis

## 📊 Sample Output

```
🔍 Checking URL accessibility...
  Checking https://example.com... ✅
✅ 1 URL(s) are accessible and will be analyzed

🚀 Starting Lighthouse analysis...

[1/1] 🔍 Analyzing https://example.com...
  └─ Launching browser...
  └─ Analysis complete!

📊 Performance Metrics for https://example.com
Score: 93/100

First Contentful Paint: 1.2 s
Speed Index: 1.9 s
Largest Contentful Paint: 1.4 s
Time to Interactive: 1.6 s
Total Blocking Time: 30 ms
Cumulative Layout Shift: 0.01

📋 Analysis Summary:
✅ Successful: 1
❌ Failed: 0
📊 Total analyzed: 1
```

## 📁 Input File Formats

- `.txt`: List of URLs separated by new lines
- `.json`: JSON array of URLs, e.g. `["https://example.com", "https://github.com"]`

## 🚨 Error Handling

The tool provides comprehensive validation:

- **Invalid URLs**: checks URL format before processing
- **Inaccessible URLs**: tests connectivity and skips unreachable sites
- **File validation**: ensures input files exist and have correct extensions
- **Threshold validation**: validates threshold values are between 0-100
- **Graceful failures**: continues analysis even if some URLs fail

## 🛠 Development

Clone the repo and run:

```bash
npm install
node cli.js --url https://example.com
```

## 📄 License

MIT © 2025 Oleksandr Zadvornyi
