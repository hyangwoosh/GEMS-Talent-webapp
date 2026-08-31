import type { EnquiryEnv } from './types';

/**
 * Resolve runtime secrets.
 *
 * `Astro.locals.runtime.env` was removed in Astro 6 — the Cloudflare adapter
 * now exposes bindings through the `cloudflare:workers` virtual module, which
 * only resolves inside workerd. Importing it statically breaks `astro dev` and
 * the prerender pass, so it is imported dynamically and falls back to
 * `process.env` elsewhere.
 *
 * Nothing here invents a default. The legacy function defaulted ENQUIRY_TO to a
 * domain GEMS does not own, so a missing variable silently misrouted mail;
 * adapters here skip when unconfigured and say so.
 */
export async function getEnv(): Promise<EnquiryEnv> {
  try {
    const mod = (await import(/* @vite-ignore */ 'cloudflare:workers')) as {
      env?: Record<string, string | undefined>;
    };
    if (mod?.env) return mod.env as EnquiryEnv;
  } catch {
    // Not running in workerd — dev server, prerender, or a test.
  }

  if (typeof process !== 'undefined' && process.env) {
    return process.env as unknown as EnquiryEnv;
  }
  return {};
}
