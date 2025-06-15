import chalk from "chalk";

export const OUTPUT_LEVELS = {
  SILENT: 0,
  NORMAL: 1,
  VERBOSE: 2,
};

class Logger {
  constructor(initialLevel = OUTPUT_LEVELS.NORMAL) {
    this.outputLevel = initialLevel;
  }

  configure(options) {
    if (options.silent) {
      this.outputLevel = OUTPUT_LEVELS.SILENT;
    } else if (options.verbose) {
      this.outputLevel = OUTPUT_LEVELS.VERBOSE;
    } else {
      this.outputLevel = OUTPUT_LEVELS.NORMAL;
    }
  }

  getOutputLevel() {
    return this.outputLevel;
  }

  #logIfLevelMet(logFn, message, minLevel) {
    if (this.outputLevel >= minLevel) {
      logFn(message);
    }
  }

  info(message, minLevel = OUTPUT_LEVELS.NORMAL) {
    this.#logIfLevelMet(console.log, message, minLevel);
  }

  verbose(message) {
    this.#logIfLevelMet(
      console.log,
      chalk.gray(`[VERBOSE] ${message}`),
      OUTPUT_LEVELS.VERBOSE
    );
  }

  error(message) {
    console.error(chalk.red(`❌ ${message}`));
  }

  warn(message, minLevel = OUTPUT_LEVELS.NORMAL) {
    this.#logIfLevelMet(console.warn, chalk.yellow(`⚠️  ${message}`), minLevel);
  }

  success(message, minLevel = OUTPUT_LEVELS.NORMAL) {
    this.#logIfLevelMet(console.log, chalk.green(`✅ ${message}`), minLevel);
  }
}

// Export a default instance for convenience
export const logger = new Logger();

// Also export the class for custom instances
export { Logger };
