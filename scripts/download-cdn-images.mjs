#!/usr/bin/env node
/**
 * GEMS Talent — CDN image localizer
 * ─────────────────────────────────────────────────────────────────
 * Walks data.js, finds every WordPress CDN image reference (full
 * URLs AND `${CDN}/...` template literals), downloads them into
 * /assets/cdn/ (flat — every basename is unique), and writes a
 * `cdn-map.json` mapping original URL → local path.
 *
 *   $ node scripts/download-cdn-images.mjs                 # download
 *   $ node scripts/download-cdn-images.mjs --dry-run       # list only
 *   $ node scripts/download-cdn-images.mjs --rewrite-data  # download AND
 *                                                            swap data.js
 *                                                            to local paths
 *
 * Zero npm dependencies. Requires Node ≥ 18 (uses global fetch).
 *
 * Flow:
 *   1. Parse `const CDN = "..."` out of data.js → expand templates.
 *   2. Download every URL into /assets/cdn/<basename>.
 *   3. Write /assets/cdn-map.json (full URL → local path).
 *   4. With --rewrite-data: rewrite data.js so `CDN` const becomes
 *      `assets/cdn` and every `${CDN}/2026/05/foo.jpg` becomes
 *      `${CDN}/foo.jpg` (date segments stripped — basenames are unique).
 * ─────────────────────────────────────────────────────────────────
 */

import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, "..");
const DATA_FILE = join(ROOT, "data.js");
const OUT_DIR   = join(ROOT, "assets", "cdn");
const MAP_FILE  = join(ROOT, "assets", "cdn-map.json");

const DRY     = process.argv.includes("--dry-run");
const REWRITE = process.argv.includes("--rewrite-data");

// ── 1. Read data.js, find the CDN const, expand template refs ──
const src = await readFile(DATA_FILE, "utf8");

const cdnConstMatch = src.match(/const\s+CDN\s*=\s*["'`]([^"'`]+)["'`]/);
if (!cdnConstMatch) {
  console.error("Could not find `const CDN = \"...\"` in data.js.");
  process.exit(1);
}
const CDN_PREFIX = cdnConstMatch[1];
console.log(`CDN prefix in data.js: ${CDN_PREFIX}`);

// Expand `${CDN}/path` → full URL, then capture both forms via one regex
const expanded = src.replace(/\$\{CDN\}/g, CDN_PREFIX);
const URL_RE   = /https:\/\/gemstalent\.com\.sg\/(?:wordpress\/)?wp-content\/uploads\/[^\s"'`)]+/g;
const urls     = [...new Set(expanded.match(URL_RE) || [])].sort();

if (!urls.length) {
  console.error("No CDN URLs found in data.js — nothing to do.");
  process.exit(0);
}

console.log(`Found ${urls.length} unique CDN URL${urls.length === 1 ? "" : "s"}.`);

if (DRY) {
  urls.forEach((u) => console.log("  " + u));
  process.exit(0);
}

await mkdir(OUT_DIR, { recursive: true });

// ── 2. Download (skip files that already exist) ──
const map = {};
let downloaded = 0, skipped = 0, failed = 0;

for (const url of urls) {
  const name  = basename(new URL(url).pathname);
  const local = "assets/cdn/" + name; // posix for the web
  const full  = join(ROOT, "assets", "cdn", name);

  map[url] = local;

  try {
    await stat(full);
    skipped++;
    process.stdout.write(`· skip   ${name}\n`);
    continue;
  } catch {} // not present — download

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(full, buf);
    downloaded++;
    process.stdout.write(`✓ got    ${name}  (${(buf.length / 1024).toFixed(1)} KB)\n`);
  } catch (err) {
    failed++;
    process.stdout.write(`✗ fail   ${name}  — ${err.message}\n`);
  }
}

// ── 3. Write the URL → local-path map ──
await writeFile(MAP_FILE, JSON.stringify(map, null, 2) + "\n");

console.log("");
console.log(`Done. ${downloaded} downloaded · ${skipped} skipped · ${failed} failed.`);
console.log(`Mapping written to assets/cdn-map.json.`);

// ── 4. (Optional) Rewrite data.js so all refs point at local files ──
if (REWRITE) {
  if (failed) {
    console.log("");
    console.log("⚠  Skipping --rewrite-data because some downloads failed.");
    console.log("   Fix the failures and re-run, or rewrite manually.");
    process.exit(0);
  }

  // a) Swap the CDN const → "assets/cdn"
  let next = src.replace(
    /const\s+CDN\s*=\s*["'`][^"'`]+["'`];?/,
    `const CDN = "assets/cdn";`
  );

  // b) Strip date segments from every templated reference
  //    `${CDN}/2026/05/foo.jpg`  →  `${CDN}/foo.jpg`
  //    `${CDN}/2021/05/bar.png`  →  `${CDN}/bar.png`
  next = next.replace(/\$\{CDN\}\/\d{4}\/\d{2}\//g, "${CDN}/");

  if (next === src) {
    console.log("");
    console.log("⚠  Rewrite produced no changes — data.js may already be local.");
  } else {
    await writeFile(DATA_FILE, next);
    console.log("");
    console.log("✓  data.js rewritten — CDN now points at assets/cdn, date segments stripped.");
    console.log("   Diff CDN const + 17 template refs. Reload the site to verify.");
  }
} else {
  console.log("");
  console.log("Next step:");
  console.log("  Re-run with --rewrite-data to swap data.js automatically,");
  console.log("  OR edit data.js by hand:");
  console.log('    • change  const CDN = "..."  →  const CDN = "assets/cdn";');
  console.log("    • strip the /2026/05/ and /2021/05/ segments from every template.");
}
