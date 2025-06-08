# ⚡️ Frontend Performance Analyzer

**A simple CLI tool to analyze frontend performance using Lighthouse and Puppeteer.**

- 🧠 Built for developers who care about performance
- 🚀 Powered by headless Chrome and real metrics
- 📦 Publish-ready for NPM usage
- 🔍 Automatically validates URL accessibility before analysis
- 📊 Comprehensive progress reporting and analysis summaries
- 📝 Multiple export formats (HTML, JSON, Markdown)

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

# Save JSON report to file
frontend-performance-analyzer --url https://example.com --json-file report.json

# Save Markdown summary (automatically named based on URL)
frontend-performance-analyzer --url https://example.com --markdown

# Output raw JSON to console
frontend-performance-analyzer --url https://example.com --json
```

### Logging and Verbosity Options

```bash
# Verbose output with debugging details
frontend-performance-analyzer --url https://example.com --verbose

# Minimal output (errors and final results only)
frontend-performance-analyzer --url https://example.com --silent
```

### Use Performance Threshold

Exit with failure if score is below threshold:

```bash
frontend-performance-analyzer --url https://example.com --threshold 85
```

## 🔍 URL Validation & Accessibility

The tool automatically:

- ✅ Validates URL format before analysis
- 🔍 Checks URL accessibility with HEAD requests and 10-second timeout
- ⚠️ Warns about inaccessible URLs and skips them
- 📊 Provides detailed progress reporting during analysis
- 🔄 Continues analysis even if some URLs fail

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

## 📄 Export Formats

### HTML Reports

- Full Lighthouse HTML report with all details
- Automatically named based on URL (e.g., `example_com.html`)

### JSON Reports

- Structured JSON output with performance metrics
- Includes timestamp, tool version, and detailed scores
- Supports both single URL and batch analysis
- Contains all Lighthouse categories (Performance, Accessibility, Best Practices, SEO, PWA)

### Markdown Reports

- Human-readable performance summary
- Core Web Vitals breakdown with visual indicators
- Performance opportunities and diagnostics
- Category scores with emoji indicators
- Automatically named based on URL (e.g., `example_com.md`)

## 🚨 Error Handling & Validation

The tool provides comprehensive validation and error handling:

- **Invalid URLs**: validates URL format before processing
- **Inaccessible URLs**: tests connectivity with HEAD requests and 10-second timeout
- **File validation**: ensures input files exist and have correct extensions (.txt or .json)
- **Threshold validation**: validates threshold values are between 0-100
- **Graceful failures**: continues analysis even if some URLs fail
- **Lighthouse warnings**: filters internal Lighthouse warnings for cleaner output
- **Browser management**: proper cleanup of browser instances

## 🔧 Advanced Features

### Logging Levels

- **Normal**: standard output with progress indicators
- **Verbose** (`--verbose`): detailed debugging information including timing
- **Silent** (`--silent`): minimal output, errors and final results only

### Performance Monitoring

- Tracks analysis time per URL
- Reports overall performance (URLs/second)
- Browser launch and close timing
- Accessibility check timing

### Batch Processing

- Supports multiple URL analysis in a single run
- Consolidated JSON export for batch results
- Individual file exports for each URL
- Progress tracking with clear indicators

## 🛠 Development

Clone the repo and run:

```bash
npm install
node cli.js --url https://example.com
```

### Project Structure

```
├── cli.js                   # Main CLI entry point
├── lib/
│   ├── lighthouse.js        # Lighthouse analysis logic
│   ├── logger.js            # Logging utilities
│   └── url-utils.js         # URL validation and processing
└── report-formatters/
    ├── console.js           # Console output formatting
    ├── json.js              # JSON export functionality
    └── markdown.js          # Markdown report generation
```

## 📄 License

MIT © 2025 Oleksandr Zadvornyi
