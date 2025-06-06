import puppeteer from "puppeteer";
import lighthouse from "lighthouse";
import { URL } from "url";

async function runLighthouse(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--remote-debugging-port=9222"],
  });

  const result = await lighthouse(url, {
    port: 9222,
    output: "html",
    logLevel: "info",
  });

  await browser.close();
  return result.lhr;
}

const url = process.argv[2];
if (!url) {
  console.error("❌ Please provide a URL");
  process.exit(1);
}

const result = await runLighthouse(url);
console.log(
  `✅ Performance score for ${url}: ${
    result.categories.performance.score * 100
  }`
);
