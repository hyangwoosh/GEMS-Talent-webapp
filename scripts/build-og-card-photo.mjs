#!/usr/bin/env node
/**
 * GEMS Talent — Photo-led OG card PNG builder
 * ─────────────────────────────────────────────────────────────────
 * Produces /assets/og-card-photo.png at 1200×630 by headless-rendering
 * og-card-photo.html with Playwright (or screenshot a hosted preview
 * yourself — anything that captures the page at exact viewport works).
 *
 *   $ npm i -D playwright
 *   $ node scripts/build-og-card-photo.mjs
 *
 * If you'd rather not install Playwright, the alternative is:
 *   1. Run a tiny local server in the project root:
 *        npx serve .
 *   2. Open http://localhost:3000/og-card-photo.html in a browser sized
 *      to exactly 1200×630.
 *   3. Take a screenshot of just the .card element (most browser dev tools
 *      have a "screenshot node" action), save to /assets/og-card-photo.png.
 *
 * Either way, the resulting PNG is the asset to point og:image at on
 * social-media-led pages (e.g. work.html case studies, artiste pages).
 * Keep /assets/og-card.png as the type-led default; this is the
 * photo-led companion.
 * ─────────────────────────────────────────────────────────────────
 */

import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, "..");
const HTML      = pathToFileURL(join(ROOT, "og-card-photo.html")).href;
const OUT       = join(ROOT, "assets", "og-card-photo.png");

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error("Playwright not installed. Run:  npm i -D playwright");
  console.error("Or screenshot og-card-photo.html manually at 1200×630.");
  process.exit(1);
}

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 2, // 2x for retina-quality export
});
const page = await ctx.newPage();
await page.goto(HTML, { waitUntil: "networkidle" });

// Wait one extra frame to let webfonts settle
await page.waitForTimeout(400);

await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: 1200, height: 630 } });
await browser.close();

console.log(`✓ wrote ${OUT}`);
