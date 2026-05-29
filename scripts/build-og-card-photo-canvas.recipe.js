/**
 * GEMS Talent — Photo-led OG card builder (canvas)
 * ─────────────────────────────────────────────────────────────────
 * This is the reproducible recipe behind /assets/og-card-photo.png.
 *
 * The canvas drawing logic itself runs in this project's `run_script`
 * sandbox (browser Canvas API). To re-run it after CDN images land
 * locally, paste this file's body into a fresh `run_script` call —
 * it auto-detects whether a photo is present and either composites
 * the photo onto the right panel or renders a labelled placeholder.
 *
 * Source data for the composition:
 *   • Stamp:       assets/gems-stamp-nav.jpg (always local)
 *   • Photo:       first match of:
 *                    assets/cdn/RWS-Exclusive-Showcase-Shila-Amzah.jpg
 *                    assets/cdn/Chriz-Tong-01.jpg
 *                    assets/cdn/THERESA-CARPIO-CONCERT-01.jpg
 *                  (download via scripts/download-cdn-images.mjs)
 *   • Headline:    "Singapore's stage. / Our talent." (brass accent on line 3)
 *   • Lockup:      GEMS Talent · REPRESENTATION · MARKETING · PRODUCTION
 *
 * Output: assets/og-card-photo.png  (1200×630)
 * ─────────────────────────────────────────────────────────────────
 */

// See scripts/build-og-card-photo-canvas.recipe.txt for the run_script body.
