import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * The content contract.
 *
 * The legacy `data.js` stored content as presentation: a display array for the
 * hero rotator, hardcoded JSX in work.html, and plain strings standing in for
 * relationships that nothing validated (`relatedWork: "rws-exclusive-showcase"`
 * pointed at a DOM id; rename the id and the link died silently).
 *
 * Here the relationships are real. A broken reference() fails the build.
 */

const artistes = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/artistes' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      /** Chinese name. Competitors in this market show them; we render when present. */
      nameZh: z.string().optional(),
      /** Short descriptor under the name — "Vocalist · Recording Artiste". */
      tag: z.string(),
      disciplines: z.array(z.string()).min(1),
      languages: z.array(z.string()).min(1),
      based: z.string(),
      portrait: image(),
      gallery: z.array(image()).default([]),
      showreel: z.string().url().optional(),
      instagram: z.string().optional(),
      /** Structured, not a comma-string — this is what lets us render timelines and JSON-LD. */
      credits: z
        .array(
          z.object({
            year: z.string(),
            role: z.string(),
            project: z.string(),
          }),
        )
        .default([]),
      /** Roster display order. Lower sorts first. */
      order: z.number().default(99),
      draft: z.boolean().default(false),
    }),
});

const events = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/events' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      venue: z.string(),
      /** Drives reverse-chronological ordering and Event JSON-LD. */
      date: z.coerce.date(),
      client: reference('clients').optional(),
      /**
       * Many-to-many, resolved both directions at build time: an artiste page
       * lists their events, an event lists its artistes, neither hand-maintained.
       * The legacy single-string `relatedWork` could not express an artiste
       * with two events.
       */
      artistes: z.array(reference('artistes')).default([]),
      /** What GEMS actually did — "Production", "Talent hospitality", "Logistics". */
      roles: z.array(z.string()).default([]),
      hero: image(),
      gallery: z.array(image()).default([]),
      /** Replaces the separate featured[] array. One source, no drift. */
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

const clients = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/clients' }),
  schema: z.object({
    name: z.string(),
    group: z.enum(['venues', 'broadcasters', 'agencies', 'brands']),
    /** What the engagement was. Only shown when verified. */
    engagement: z.string().optional(),
    /**
     * Defaults to false and unverified entries never render.
     *
     * The live site publishes named client relationships that the project's own
     * handoff flags as placeholder copy. This flag makes that failure impossible
     * to repeat by accident: a name appears only when someone has confirmed it.
     */
    verified: z.boolean().default(false),
  }),
});

const services = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    blurb: z.string(),
    /** Concrete deliverables a corporate buyer asks about — contracting, insurance, transport. */
    deliverables: z.array(z.string()).default([]),
    order: z.number().default(99),
  }),
});

const updates = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/updates' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    /** Optional link out to a press feature or listing. */
    link: z.string().url().optional(),
    artistes: z.array(reference('artistes')).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { artistes, events, clients, services, updates };
