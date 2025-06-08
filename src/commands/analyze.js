import { validateInputs } from "../lib/url-utils.js";
import { analyzeUrls } from "../lib/lighthouse.js";
import { logger } from "../lib/logger.js";

export default function analyzeCommand(program) {
  program
    .command("analyze")
    .description("Analyze frontend performance of URLs")
    .option("-u, --url <url...>", "One or more URLs to analyze")
    .option("--input <file>", "Load URLs from a .txt or .json file")
    .option("-o, --output <file>", "Save HTML report to file")
    .option("--json", "Print raw JSON report to stdout")
    .option("--json-file <file>", "Save JSON report to file")
    .option("--markdown", "Save metrics as Markdown report")
    .option(
      "--threshold <score>",
      "Minimum acceptable Lighthouse performance score (0-100)",
      parseFloat
    )
    .option("-v, --verbose", "Enable verbose output with debugging details")
    .option("-s, --silent", "Minimal output (errors and final results only)")
    .action(async (options) => {
      try {
        validateInputs(options);
        const urls = getUrlList(options);
        const accessibleUrls = await validateUrlAccessibility(urls);
        await analyzeUrls(accessibleUrls, options);
      } catch (error) {
        logger.error(error.message);
        process.exit(1);
      }
    });
}
