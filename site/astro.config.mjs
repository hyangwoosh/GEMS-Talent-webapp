// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

/**
 * Static by default. Only routes that opt out with `export const prerender = false`
 * run on demand — currently just /api/enquiry. Everything else is prerendered
 * HTML, which is the point of choosing Astro (ADR-001-amended).
 */
export default defineConfig({
  site: 'https://gemstalent.com.sg',
  adapter: cloudflare({ imageService: 'compile' }),
  integrations: [react(), mdx(), sitemap()],
  build: { format: 'file' }, // /artistes.html — matches the legacy extensionless URLs
});
