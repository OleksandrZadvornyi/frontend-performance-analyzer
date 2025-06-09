import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";
import { formatConsoleMetrics } from "../src/report-formatters/console.js";
import { exportJsonReport } from "../src/report-formatters/json.js";
import { exportMarkdownReport } from "../src/report-formatters/markdown.js";

// Mock fs module
vi.mock("fs");

// Mock logger
vi.mock("../src/lib/logger.js", () => ({
  logger: {
    verbose: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    success: vi.fn(),
  },
  OUTPUT_LEVELS: {
    SILENT: 0,
    NORMAL: 1,
    VERBOSE: 2,
  },
}));

// Mock package.json reads
vi.mocked(fs.readFileSync).mockImplementation((path) => {
  if (path === "package.json") {
    return JSON.stringify({ version: "0.2.0" });
  }
  throw new Error(`Unexpected file read: ${path}`);
});

describe("Report Formatters", () => {
  let consoleSpy;
  let mockLhr;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    // Mock Lighthouse result
    mockLhr = {
      finalUrl: "https://example.com",
      fetchTime: "2024-01-01T00:00:00.000Z",
      lighthouseVersion: "12.0.0",
      categories: {
        performance: { score: 0.85 },
        accessibility: { score: 0.92 },
        "best-practices": { score: 0.88 },
        seo: { score: 0.95 },
        pwa: { score: 0.67 },
      },
      audits: {
        "first-contentful-paint": {
          displayValue: "1.2 s",
          numericValue: 1200,
          score: 0.8,
        },
        "speed-index": {
          displayValue: "2.3 s",
          numericValue: 2300,
          score: 0.7,
        },
        "largest-contentful-paint": {
          displayValue: "2.8 s",
          numericValue: 2800,
          score: 0.6,
        },
        interactive: {
          displayValue: "3.1 s",
          numericValue: 3100,
          score: 0.65,
        },
        "total-blocking-time": {
          displayValue: "150 ms",
          numericValue: 150,
          score: 0.75,
        },
        "cumulative-layout-shift": {
          displayValue: "0.05",
          numericValue: 0.05,
          score: 0.9,
        },
      },
      environment: {
        networkUserAgent: "Mozilla/5.0 Test Agent",
        benchmarkIndex: 1000,
      },
    };

    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe("formatConsoleMetrics", () => {
    it("should format and display performance metrics", () => {
      formatConsoleMetrics(mockLhr);

      // Check that console.log was called with performance data
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Performance Metrics for https://example.com")
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Score: 85/100")
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("First Contentful Paint")
      );
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("1.2 s"));
    });

    it("should display all core web vitals", () => {
      formatConsoleMetrics(mockLhr);

      const expectedMetrics = [
        "First Contentful Paint",
        "Speed Index",
        "Largest Contentful Paint",
        "Time to Interactive",
        "Total Blocking Time",
        "Cumulative Layout Shift",
      ];

      expectedMetrics.forEach((metric) => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining(metric)
        );
      });
    });
  });

  describe("exportJsonReport", () => {
    it("should export JSON report to console when no file path provided", () => {
      const result = exportJsonReport({
        lhr: mockLhr,
        url: "https://example.com",
      });

      expect(result).toBeDefined();
      expect(result.tool).toBe("frontend-performance-analyzer");
      expect(result.version).toBe("0.2.0");
      expect(result.results).toHaveLength(1);
      expect(result.results[0].url).toBe("https://example.com");
      expect(result.results[0].performance.score).toBe(85);
    });

    it("should handle multiple results", () => {
      const results = [
        { lhr: mockLhr, url: "https://example.com" },
        {
          lhr: { ...mockLhr, finalUrl: "https://test.com" },
          url: "https://test.com",
        },
      ];

      const output = exportJsonReport(results);

      expect(output.results).toHaveLength(2);
      expect(output.results[0].url).toBe("https://example.com");
      expect(output.results[1].url).toBe("https://test.com");
    });

    it("should write to file when file path provided", () => {
      const filePath = "test-output.json";
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});

      exportJsonReport({ lhr: mockLhr, url: "https://example.com" }, filePath);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        filePath,
        expect.stringContaining('"tool": "frontend-performance-analyzer"'),
        "utf8"
      );
    });

    it("should include all performance metrics in output", () => {
      const result = exportJsonReport({
        lhr: mockLhr,
        url: "https://example.com",
      });

      const metrics = result.results[0].performance.metrics;
      expect(metrics.firstContentfulPaint.value).toBe(1200);
      expect(metrics.firstContentfulPaint.displayValue).toBe("1.2 s");
      expect(metrics.speedIndex.score).toBe(0.7);
      expect(metrics.cumulativeLayoutShift.numericValue).toBe(0.05);
    });

    it("should include category scores", () => {
      const result = exportJsonReport({
        lhr: mockLhr,
        url: "https://example.com",
      });

      const categories = result.results[0].performance.categories;
      expect(categories.performance).toBe(0.85);
      expect(categories.accessibility).toBe(0.92);
      expect(categories.seo).toBe(0.95);
    });
  });

  describe("exportMarkdownReport", () => {
    beforeEach(() => {
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});
    });

    it("should generate markdown report with performance data", () => {
      const filePath = "test-report.md";

      exportMarkdownReport(mockLhr, filePath);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        filePath,
        expect.stringContaining("# 🚀 Performance Analysis Report"),
        "utf8"
      );

      const writtenContent = vi.mocked(fs.writeFileSync).mock.calls[0][1];
      expect(writtenContent).toContain("https://example.com");
      expect(writtenContent).toContain("🟡 **85** (Good)");
      expect(writtenContent).toContain("Largest Contentful Paint");
      expect(writtenContent).toContain("2.8 s");
    });

    it("should include Core Web Vitals section", () => {
      const filePath = "test-report.md";

      exportMarkdownReport(mockLhr, filePath);

      const writtenContent = vi.mocked(fs.writeFileSync).mock.calls[0][1];
      expect(writtenContent).toContain("## 🎯 Core Web Vitals");
      expect(writtenContent).toContain("Largest Contentful Paint (LCP)");
      expect(writtenContent).toContain("Cumulative Layout Shift (CLS)");
      expect(writtenContent).toContain("≤ 2.5s"); // Good threshold
    });

    it("should include category scores", () => {
      const filePath = "test-report.md";

      exportMarkdownReport(mockLhr, filePath);

      const writtenContent = vi.mocked(fs.writeFileSync).mock.calls[0][1];
      expect(writtenContent).toContain("## 🏆 Lighthouse Category Scores");
      expect(writtenContent).toContain("⚡ Performance");
      expect(writtenContent).toContain("♿ Accessibility");
      expect(writtenContent).toContain("🔍 SEO");
    });

    it("should include metrics table", () => {
      const filePath = "test-report.md";

      exportMarkdownReport(mockLhr, filePath);

      const writtenContent = vi.mocked(fs.writeFileSync).mock.calls[0][1];
      expect(writtenContent).toContain("| Metric | Value | Score | Status |");
      expect(writtenContent).toContain("|--------|-------|-------|---------|");
      expect(writtenContent).toContain(
        "| Largest Contentful Paint (LCP) | 2.8 s | 60/100 |"
      );
    });

    it("should include footer information", () => {
      const filePath = "test-report.md";

      exportMarkdownReport(mockLhr, filePath);

      const writtenContent = vi.mocked(fs.writeFileSync).mock.calls[0][1];
      expect(writtenContent).toContain("## 📝 Report Information");
      expect(writtenContent).toContain("**Lighthouse Version:** 12.0.0");
      expect(writtenContent).toContain("frontend-performance-analyzer");
      expect(writtenContent).toContain("v0.2.0");
    });

    it("should handle file write errors gracefully", () => {
      const filePath = "test-report.md";
      const mockError = new Error("Write failed");

      vi.mocked(fs.writeFileSync).mockImplementation(() => {
        throw mockError;
      });

      // Should not throw, but should call logger.error
      expect(() => exportMarkdownReport(mockLhr, filePath)).not.toThrow();
    });
  });
});
