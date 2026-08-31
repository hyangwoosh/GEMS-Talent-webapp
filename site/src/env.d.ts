/// <reference types="astro/client" />

/**
 * `cloudflare:workers` is a virtual module that only resolves inside workerd.
 * It is imported dynamically in src/lib/enquiry/env.ts, so TypeScript needs a
 * declaration to typecheck the import even though nothing resolves it locally.
 */
declare module 'cloudflare:workers' {
  export const env: Record<string, string | undefined>;
}
