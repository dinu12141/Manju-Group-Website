import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const errors = [];
const failedRequests = [];
page.on("console", msg => {
  if (msg.type() === "error") errors.push(msg.text());
});
page.on("requestfailed", req => {
  failedRequests.push(`${req.url()} :: ${req.failure()?.errorText}`);
});
page.on("response", res => {
  if (res.status() >= 400) failedRequests.push(`${res.status()} ${res.url()}`);
});

await page.goto("http://localhost:3000/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(1500);

await page.screenshot({ path: "scripts/homepage.png", fullPage: false });

console.log("---CONSOLE ERRORS---");
console.log(errors.length ? errors.join("\n") : "(none)");
console.log("---FAILED/4xx-5xx REQUESTS---");
console.log(failedRequests.length ? failedRequests.join("\n") : "(none)");

const brokenImages = await page.evaluate(() => {
  return Array.from(document.querySelectorAll("img"))
    .filter(img => !img.complete || img.naturalWidth === 0)
    .map(img => img.src);
});
console.log("---BROKEN IMAGES---");
console.log(brokenImages.length ? brokenImages.join("\n") : "(none)");

const hasCanvas = await page.evaluate(() => !!document.querySelector("canvas"));
console.log("---THREE.JS CANVAS PRESENT---", hasCanvas);

await browser.close();
