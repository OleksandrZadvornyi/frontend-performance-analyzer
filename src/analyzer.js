import puppeteer from "puppeteer";
import lighthouse from "lighthouse";

export async function runAnalysis(url, options = {}) {
    const { preset = "mobile", throttle = true } = options;

    // 1. Launch browser
    const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
        // 2. Run Lighthouse
        const { port } = new URL(browser.wsEndpoint());

        // Configure Lighthouse Flags based on CLI options
        const lighthouseFlags = {
            port: Number(port),
            output: "html",
            logLevel: "error",
            onlyCategories: ["performance"],

            // Device Simulation
            formFactor: preset === "desktop" ? "desktop" : "mobile",
            screenEmulation: preset === "desktop"
                ? { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false }
                : { mobile: true },

            // Network Simulation
            throttlingMethod: throttle ? "simulate" : "provided",
        };

        const result = await lighthouse(url, lighthouseFlags);

        // 3. Return results
        return {
            lhr: result.lhr, // The raw data
            report: result.report, // The HTML string
        };
    } finally {
        await browser.close();
    }
}