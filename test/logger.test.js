import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger, configureLogger, OUTPUT_LEVELS } from "../src/lib/logger.js";

describe("Logger", () => {
  let consoleSpy;
  let consoleErrorSpy;
  let consoleWarnSpy;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe("OUTPUT_LEVELS", () => {
    it("should have correct output level constants", () => {
      expect(OUTPUT_LEVELS.SILENT).toBe(0);
      expect(OUTPUT_LEVELS.NORMAL).toBe(1);
      expect(OUTPUT_LEVELS.VERBOSE).toBe(2);
    });
  });

  describe("configureLogger", () => {
    it("should set SILENT level when silent option is true", () => {
      configureLogger({ silent: true });

      logger.info("test message");
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it("should set VERBOSE level when verbose option is true", () => {
      configureLogger({ verbose: true });

      logger.verbose("test verbose message");
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("[VERBOSE] test verbose message")
      );
    });

    it("should set NORMAL level by default", () => {
      configureLogger({});

      logger.info("test message");
      expect(consoleSpy).toHaveBeenCalledWith("test message");
    });

    it("should prefer silent over verbose when both are true", () => {
      configureLogger({ silent: true, verbose: true });

      logger.info("test message");
      logger.verbose("verbose message");

      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe("logger methods", () => {
    beforeEach(() => {
      configureLogger({}); // Reset to normal level
    });

    describe("info", () => {
      it("should log info messages at NORMAL level", () => {
        logger.info("info message");
        expect(consoleSpy).toHaveBeenCalledWith("info message");
      });

      it("should respect minimum level parameter", () => {
        configureLogger({ silent: true });

        logger.info("normal message", OUTPUT_LEVELS.NORMAL);
        logger.info("silent message", OUTPUT_LEVELS.SILENT);

        expect(consoleSpy).not.toHaveBeenCalledWith("normal message");
        expect(consoleSpy).toHaveBeenCalledWith("silent message");
      });
    });

    describe("verbose", () => {
      it("should log verbose messages only at VERBOSE level", () => {
        configureLogger({});
        logger.verbose("verbose message");
        expect(consoleSpy).not.toHaveBeenCalled();

        configureLogger({ verbose: true });
        logger.verbose("verbose message");
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining("[VERBOSE] verbose message")
        );
      });

      it("should format verbose messages with prefix", () => {
        configureLogger({ verbose: true });
        logger.verbose("test message");

        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringMatching(
            /^\u001b\[90m\[VERBOSE\] test message\u001b\[39m$/
          )
        );
      });
    });

    describe("error", () => {
      it("should always log error messages regardless of level", () => {
        configureLogger({ silent: true });
        logger.error("error message");

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining("❌ error message")
        );
      });

      it("should format error messages with emoji and color", () => {
        logger.error("test error");

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringMatching(/❌ test error/)
        );
      });
    });

    describe("warn", () => {
      it("should log warning messages at appropriate level", () => {
        configureLogger({});
        logger.warn("warning message");

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining("⚠️  warning message")
        );
      });

      it("should respect minimum level for warnings", () => {
        configureLogger({ silent: true });

        logger.warn("normal warning", OUTPUT_LEVELS.NORMAL);
        logger.warn("silent warning", OUTPUT_LEVELS.SILENT);

        expect(consoleWarnSpy).not.toHaveBeenCalledWith(
          expect.stringContaining("normal warning")
        );
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining("silent warning")
        );
      });
    });

    describe("success", () => {
      it("should log success messages at appropriate level", () => {
        configureLogger({});
        logger.success("success message");

        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining("✅ success message")
        );
      });

      it("should respect minimum level for success messages", () => {
        configureLogger({ silent: true });

        logger.success("normal success", OUTPUT_LEVELS.NORMAL);
        logger.success("silent success", OUTPUT_LEVELS.SILENT);

        expect(consoleSpy).not.toHaveBeenCalledWith(
          expect.stringContaining("normal success")
        );
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining("silent success")
        );
      });
    });
  });
});
