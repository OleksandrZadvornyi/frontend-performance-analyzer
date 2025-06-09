import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";
import {
  isValidUrl,
  validateInputs,
  getUrlList,
} from "../src/lib/url-utils.js";

// Mock fs module
vi.mock("fs");

// Mock logger to avoid console output during tests
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

describe("URL Utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("isValidUrl", () => {
    it("should return true for valid HTTP URLs", () => {
      expect(isValidUrl("http://example.com")).toBe(true);
      expect(isValidUrl("http://www.example.com")).toBe(true);
      expect(isValidUrl("http://example.com/path")).toBe(true);
    });

    it("should return true for valid HTTPS URLs", () => {
      expect(isValidUrl("https://example.com")).toBe(true);
      expect(isValidUrl("https://www.example.com")).toBe(true);
      expect(isValidUrl("https://example.com/path?query=1")).toBe(true);
    });

    it("should return false for invalid URLs", () => {
      expect(isValidUrl("example.com")).toBe(false);
      expect(isValidUrl("ftp://example.com")).toBe(false);
      expect(isValidUrl("not-a-url")).toBe(false);
      expect(isValidUrl("")).toBe(false);
      expect(isValidUrl(null)).toBe(false);
      expect(isValidUrl(undefined)).toBe(false);
    });

    it("should return false for malformed URLs", () => {
      expect(isValidUrl("http://")).toBe(false);
      expect(isValidUrl("https://")).toBe(false);
      expect(isValidUrl("http://.")).toBe(false);
      expect(isValidUrl("http://..")).toBe(false);
    });
  });

  describe("validateInputs", () => {
    let mockExit;

    beforeEach(() => {
      mockExit = vi.spyOn(process, "exit").mockImplementation((code) => {
        throw new Error(`Process exit called with code ${code}`);
      });
    });

    afterEach(() => {
      mockExit.mockRestore();
    });

    it("should pass validation with valid URL option", () => {
      const options = { url: ["https://example.com"] };
      expect(() => validateInputs(options)).not.toThrow();
    });

    it("should pass validation with valid input file option", () => {
      const options = { input: "test.txt" };
      vi.mocked(fs.existsSync).mockReturnValue(true);

      expect(() => validateInputs(options)).not.toThrow();
    });

    it("should fail validation when no URL source is provided", () => {
      const options = {};
      expect(() => validateInputs(options)).toThrow(
        "Process exit called with code 1"
      );
    });

    it("should fail validation with invalid threshold", () => {
      const options = { url: ["https://example.com"], threshold: 150 };
      expect(() => validateInputs(options)).toThrow(
        "Process exit called with code 1"
      );
    });

    it("should fail validation with negative threshold", () => {
      const options = { url: ["https://example.com"], threshold: -10 };
      expect(() => validateInputs(options)).toThrow(
        "Process exit called with code 1"
      );
    });

    it("should pass validation with valid threshold", () => {
      const options = { url: ["https://example.com"], threshold: 75 };
      expect(() => validateInputs(options)).not.toThrow();
    });

    it("should fail validation when input file does not exist", () => {
      const options = { input: "nonexistent.txt" };
      vi.mocked(fs.existsSync).mockReturnValue(false);

      expect(() => validateInputs(options)).toThrow(
        "Process exit called with code 1"
      );
    });

    it("should fail validation with invalid file extension", () => {
      const options = { input: "test.csv" };
      vi.mocked(fs.existsSync).mockReturnValue(true);

      expect(() => validateInputs(options)).toThrow(
        "Process exit called with code 1"
      );
    });
  });

  describe("getUrlList", () => {
    let mockExit;

    beforeEach(() => {
      mockExit = vi.spyOn(process, "exit").mockImplementation((code) => {
        throw new Error(`Process exit called with code ${code}`);
      });
    });

    afterEach(() => {
      mockExit.mockRestore();
    });

    it("should return URLs from command line option", () => {
      const options = { url: ["https://example.com", "https://test.com"] };
      const urls = getUrlList(options);

      expect(urls).toEqual(["https://example.com", "https://test.com"]);
    });

    it("should read URLs from text file", () => {
      const options = { input: "urls.txt" };
      const fileContent = "https://example.com\nhttps://test.com\n\n";

      vi.mocked(fs.readFileSync).mockReturnValue(fileContent);

      const urls = getUrlList(options);
      expect(urls).toEqual(["https://example.com", "https://test.com"]);
    });

    it("should read URLs from JSON file", () => {
      const options = { input: "urls.json" };
      const urlArray = ["https://example.com", "https://test.com"];

      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(urlArray));

      const urls = getUrlList(options);
      expect(urls).toEqual(urlArray);
    });

    it("should handle single URL in JSON file", () => {
      const options = { input: "url.json" };
      const singleUrl = "https://example.com";

      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(singleUrl));

      const urls = getUrlList(options);
      expect(urls).toEqual([singleUrl]);
    });

    it("should fail with invalid URLs", () => {
      const options = { url: ["invalid-url", "https://valid.com"] };

      expect(() => getUrlList(options)).toThrow(
        "Process exit called with code 1"
      );
    });

    it("should fail when no valid URLs found", () => {
      const options = { input: "empty.txt" };

      vi.mocked(fs.readFileSync).mockReturnValue("");

      expect(() => getUrlList(options)).toThrow(
        "Process exit called with code 1"
      );
    });

    it("should handle file read errors gracefully", () => {
      const options = { input: "bad.txt" };

      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw new Error("File read error");
      });

      expect(() => getUrlList(options)).toThrow(
        "Process exit called with code 1"
      );
    });
  });
});
