import chalk from "chalk";

export const OUTPUT_LEVELS = {
  SILENT: 0,
  NORMAL: 1,
  VERBOSE: 2,
};

export const outputLevel = OUTPUT_LEVELS.NORMAL;

export function configureLogger(options) {
  outputLevel = options.silent
    ? OUTPUT_LEVELS.SILENT
    : options.verbose
    ? OUTPUT_LEVELS.VERBOSE
    : OUTPUT_LEVELS.NORMAL;
}

export const logger = {
  info: (message, minLevel = OUTPUT_LEVELS.NORMAL) => {
    if (outputLevel >= minLevel) console.log(message);
  },
  verbose: (message) => {
    if (outputLevel >= OUTPUT_LEVELS.VERBOSE) {
      console.log(chalk.gray(`[VERBOSE] ${message}`));
    }
  },
  error: (message) => console.error(chalk.red(`❌ ${message}`)),
  warn: (message, minLevel = OUTPUT_LEVELS.NORMAL) => {
    if (outputLevel >= minLevel) console.warn(chalk.yellow(`⚠️  ${message}`));
  },
  success: (message, minLevel = OUTPUT_LEVELS.NORMAL) => {
    if (outputLevel >= minLevel) console.log(chalk.green(`✅ ${message}`));
  },
};
