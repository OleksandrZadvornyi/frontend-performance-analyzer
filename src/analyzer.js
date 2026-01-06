import puppeteer from "puppeteer";
import lighthouse from "lighthouse";

export async function runAnalysis(url) {
    // 1. Launch browser
    const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
        // 2. Run Lighthouse (using the same port that Puppeteer is listening on)
        const { port } = new URL(browser.wsEndpoint());

        const result = await lighthouse(url, {
            port: Number(port),
            output: "html",
            logLevel: "error",
            onlyCategories: ["performance"],
        });

        // 3. Return results
        return {
            lhr: result.lhr, // The raw data
            report: result.report, // The HTML string
        };
    } finally {
        await browser.close();
    }
}