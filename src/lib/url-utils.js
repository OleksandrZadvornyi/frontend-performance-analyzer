import fs from "fs";
import path from "path";
import chalk from "chalk";
import { logger, outputLevel, OUTPUT_LEVELS } from "./logger.js";

export function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateInputs(options) {
  logger.verbose("Validating input options...");

  // Check if at least one URL source is provided
  if (!options.url && !options.input) {
    logger.error(
      chalk.red("❌ Error: Please provide URLs using --url or --input")
    );
    process.exit(1);
  }

  // Validate threshold if provided
  if (options.threshold !== undefined) {
    logger.verbose(`Validating threshold: ${options.threshold}`);
    if (
      isNaN(options.threshold) ||
      options.threshold < 0 ||
      options.threshold > 100
    ) {
      logger.error(
        chalk.red("❌ Error: Threshold must be a number between 0 and 100")
      );
      process.exit(1);
    }
  }

  // Validate input file exists
  if (options.input) {
    logger.verbose(`Validating input file: ${options.input}`);
    const filePath = path.resolve(process.cwd(), options.input);
    if (!fs.existsSync(filePath)) {
      logger.error(
        chalk.red(`❌ Error: Input file "${options.input}" does not exist`)
      );
      process.exit(1);
    }

    // Check file extension
    if (!filePath.endsWith(".txt") && !filePath.endsWith(".json")) {
      logger.error(chalk.red("Error: Input file must be .txt or .json"));
      process.exit(1);
    }
  }

  logger.verbose("Input validation completed successfully");
}

export function getUrlList(options) {
  logger.verbose("Extracting URL list from options...");
  let urls = [];

  if (options.input) {
    logger.verbose(`Reading URLs from input file: ${options.input}`);
    const filePath = path.resolve(process.cwd(), options.input);
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      logger.verbose(`File content length: ${content.length} characters`);

      if (filePath.endsWith(".json")) {
        logger.verbose("Parsing JSON file...");
        const parsed = JSON.parse(content);
        urls = Array.isArray(parsed) ? parsed : [parsed];
      } else {
        logger.verbose("Parsing text file...");
        urls = content
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);
      }
      logger.verbose(`Extracted ${urls.length} URLs from file`);
    } catch (error) {
      logger.error(chalk.red(`Error reading input file: ${error.message}`));
      process.exit(1);
    }
  } else if (options.url) {
    urls = options.url;
    logger.verbose(`Using ${urls.length} URLs from command line arguments`);
  }

  // Validate all URLs format
  logger.verbose("Validating URL formats...");
  const invalidUrls = urls.filter((url) => !isValidUrl(url));
  if (invalidUrls.length > 0) {
    logger.error(chalk.red(`Error: Invalid URL format:`));
    invalidUrls.forEach((url) => logger.error(`  - ${url}`));
    process.exit(1);
  }

  if (urls.length === 0) {
    logger.error(chalk.red("Error: No valid URLs found"));
    process.exit(1);
  }

  logger.verbose(`URL validation completed: ${urls.length} valid URLs`);
  return urls;
}

async function checkUrlAccessibility(url) {
  logger.verbose(`Checking accessibility for: ${url}`);
  try {
    const startTime = Date.now();
    const response = await fetch(url, {
      method: "HEAD",
      timeout: 10000,
      signal: AbortSignal.timeout(10000),
    });
    const duration = Date.now() - startTime;
    logger.verbose(
      `Response received in ${duration}ms - Status: ${response.status}`
    );
    return response.ok || response.status < 400;
  } catch (error) {
    logger.verbose(`Accessibility check failed: ${error.message}`);
    return false;
  }
}

export async function validateUrlAccessibility(urls) {
  logger.info(chalk.blue("🔍 Checking URL accessibility..."));
  logger.verbose(`Starting accessibility check for ${urls.length} URLs`);

  const accessibleUrls = [];
  const inaccessibleUrls = [];

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    logger.verbose(`Checking URL ${i + 1}/${urls.length}: ${url}`);

    if (outputLevel >= OUTPUT_LEVELS.NORMAL) {
      process.stdout.write(`  Checking ${url}... `);
    }

    const startTime = Date.now();
    const isAccessible = await checkUrlAccessibility(url);
    const duration = Date.now() - startTime;

    if (isAccessible) {
      logger.info(chalk.green("✅"), OUTPUT_LEVELS.NORMAL);
      logger.verbose(`✅ Accessible in ${duration}ms`);
      accessibleUrls.push(url);
    } else {
      logger.info(chalk.red("❌"), OUTPUT_LEVELS.NORMAL);
      logger.verbose(`❌ Not accessible (checked in ${duration}ms)`);
      inaccessibleUrls.push(url);
    }
  }

  if (inaccessibleUrls.length > 0) {
    logger.warn(
      chalk.yellow(
        `Warning: ${inaccessibleUrls.length} URL(s) are not accessible and will be skipped:`
      )
    );
    inaccessibleUrls.forEach((url) => logger.warn(`  - ${url}`));
    logger.verbose(
      `Inaccessible URLs: ${JSON.stringify(inaccessibleUrls, null, 2)}`
    );
  }

  if (accessibleUrls.length === 0) {
    logger.error(chalk.red("Error: No accessible URLs found"));
    process.exit(1);
  }

  logger.success(
    chalk.green(
      `${accessibleUrls.length} URL(s) are accessible and will be analyzed\n`
    )
  );
  logger.verbose(
    `Accessibility check completed: ${accessibleUrls.length} accessible, ${inaccessibleUrls.length} inaccessible`
  );

  return accessibleUrls;
}
