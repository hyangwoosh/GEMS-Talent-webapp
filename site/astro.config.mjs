// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// Static output. The Cloudflare adapter is added at cutover, together with the
// two on-demand routes (enquiry, talent upload). Until then this builds to
// plain static files and can be previewed anywhere.
export default defineConfig({
  site: 'https://gemstalent.com.sg',
  integrations: [react(), mdx(), sitemap()],
  build: { format: 'file' },   // /artistes.html — matches the legacy extensionless URLs
});
