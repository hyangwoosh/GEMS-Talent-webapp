/**
 * data.js  →  Astro content collections
 * ─────────────────────────────────────────────────────────────────────────
 * One-off. Run once, committed for the record. Re-running is safe: it
 * overwrites the generated files and nothing else.
 *
 *   node scripts/migrate-data-to-collections.mjs
 *
 * The interesting part is `events`. In data.js the same five engagements are
 * represented three times over, and none of the three knows about the others:
 *
 *   1. `featured[]`          — display rows for the hero rotator
 *   2. work.html             — hardcoded JSX sections, prose in `sub=` attrs
 *   3. `rwsGallery` etc.     — one top-level array per event
 *
 * Two of the five `featured[]` rows are alternate crops of engagements already
 * listed, so the real count is three. This script collapses all of it into one
 * record per event, with the galleries attached and the artiste links made into
 * real references.
 */

import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'site/src/content');
const ASSETS_SRC = path.join(ROOT, 'assets/cdn');
const ASSETS_DST = path.join(ROOT, 'site/src/assets/cdn');

// ── load data.js by shimming the browser global it assigns to ─────────────
const src = await readFile(path.join(ROOT, 'data.js'), 'utf8');
const globals = { window: {} };
new Function('window', src)(globals.window);
const D = globals.window.GEMS_DATA;
if (!D) throw new Error('data.js did not populate window.GEMS_DATA');

const warnings = [];

// ── helpers ──────────────────────────────────────────────────────────────
const splitDots = (s) => String(s || '').split('·').map((x) => x.trim()).filter(Boolean);

/** `assets/cdn/Foo.jpg` → `../../assets/cdn/Foo.jpg`, relative to a collection dir. */
function imageRef(p, collection) {
  if (!p) return null;
  const file = path.basename(p);
  if (!existsSync(path.join(ASSETS_SRC, file))) {
    warnings.push(`missing image: ${file} (referenced by ${collection})`);
    return null;
  }
  return `../../assets/cdn/${file}`;
}

/**
 * Scalars are always quoted. YAML's implicit typing would otherwise turn
 * `year: 2025` into a number and `verified: false` inside a string field into
 * a boolean — both of which the Zod schema rejects, with an error that points
 * at the content file rather than at this line.
 */
function scalar(v) {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'boolean' || typeof v === 'number') return String(v);
  return JSON.stringify(String(v));
}

/** Handles the three shapes this migration actually produces. */
function yamlEntry(key, value) {
  if (Array.isArray(value)) {
    if (!value.length) return `${key}: []`;
    const rows = value.map((item) => {
      if (item !== null && typeof item === 'object') {
        // array of flat objects: first key on the dash line, rest aligned under it
        const [[k0, v0], ...rest] = Object.entries(item);
        return [`  - ${k0}: ${scalar(v0)}`, ...rest.map(([k, v]) => `    ${k}: ${scalar(v)}`)].join('\n');
      }
      return `  - ${scalar(item)}`;
    });
    return `${key}:\n${rows.join('\n')}`;
  }
  return `${key}: ${scalar(value)}`;
}

function frontmatter(obj) {
  const body = Object.entries(obj)
    .filter(([, v]) => v !== null && v !== undefined)
    .map(([k, v]) => yamlEntry(k, v))
    .join('\n');
  return `---\n${body}\n---\n`;
}

async function write(collection, name, contents) {
  const dir = path.join(OUT, collection);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), contents, 'utf8');
}

// ── images ───────────────────────────────────────────────────────────────
// Files under src/ go through Astro's pipeline (AVIF/WebP, responsive srcset).
// Files in public/ are served untouched, which is what we're moving away from.
await mkdir(path.dirname(ASSETS_DST), { recursive: true });
await cp(ASSETS_SRC, ASSETS_DST, { recursive: true });

// ── artistes ─────────────────────────────────────────────────────────────
for (const [i, a] of D.roster.entries()) {
  const gallery = (a.gallery && D[a.gallery] ? D[a.gallery] : [])
    .map((g) => imageRef(g, `artistes/${a.slug}`))
    .filter(Boolean);

  const fm = frontmatter({
    name: a.name,
    tag: a.tag,
    disciplines: splitDots(a.discipline),
    languages: splitDots(a.languages),
    based: a.based,
    portrait: imageRef(a.portrait, `artistes/${a.slug}`),
    gallery,
    credits: (a.notable || []).map((c) => ({ year: c.year, role: c.role, project: c.project })),
    order: i + 1,
  });

  // bio[] paragraphs become the MDX body — prose belongs in the body, not frontmatter.
  await write('artistes', `${a.slug}.mdx`, fm + '\n' + (a.bio || []).join('\n\n') + '\n');
}

// ── events ───────────────────────────────────────────────────────────────
// Dates: data.js carries a year only. These are set to Jan 1 of that year so
// sorting and Event JSON-LD work; the real dates are an open content question.
const events = [
  {
    slug: 'rws-exclusive-showcase',
    title: 'RWS Exclusive Showcase',
    subtitle: 'feat. Shila Amzah',
    venue: 'Resorts World Sentosa',
    date: '2025-01-01',
    artistes: ['shila-amzah'],
    roles: ['Talent management', 'Hospitality', 'Production'],
    hero: 'RWS-Exclusive-Showcase-Shila-Amzah.jpg',
    galleryKey: 'rwsGallery',
    featured: true,
    body:
      'An evening showcase at Resorts World Sentosa, headlined by Shila Amzah. ' +
      'GEMS handled talent management, artiste hospitality and on-site production.',
  },
  {
    slug: 'grasshopper-be-three-live',
    title: 'Grasshopper · Be Three Live',
    subtitle: 'feat. Chriz Tong',
    venue: 'Arena of Stars, Genting Highlands',
    date: '2024-01-01',
    artistes: ['chriz-tong'],
    roles: ['Artiste appearance', 'Logistics'],
    hero: 'Chriz-Tong-01.jpg',
    galleryKey: 'chrizGallery',
    featured: true,
    body:
      'A featured artiste appearance for Chriz Tong across two arena dates with ' +
      "Grasshopper's Be Three Live in Genting — representation, hospitality and on-site logistics.",
  },
  {
    slug: 'theresa-carpio-concert',
    title: 'Theresa Carpio Concert',
    subtitle: 'An evening with Theresa',
    venue: 'Singapore',
    date: '2024-01-01',
    artistes: ['theresa-carpio'],
    roles: ['Production', 'Marketing'],
    hero: 'THERESA-CARPIO-CONCERT-01.jpg',
    galleryKey: 'theresaGallery',
    featured: true,
    body: 'A headline concert evening — production, marketing and run-of-show.',
  },
];

const rosterSlugs = new Set(D.roster.map((a) => a.slug));
for (const e of events) {
  for (const slug of e.artistes) {
    if (!rosterSlugs.has(slug)) warnings.push(`event ${e.slug} references unknown artiste "${slug}"`);
  }
  const gallery = (D[e.galleryKey] || []).map((g) => imageRef(g, `events/${e.slug}`)).filter(Boolean);
  const fm = frontmatter({
    title: e.title,
    subtitle: e.subtitle,
    venue: e.venue,
    date: e.date,
    artistes: e.artistes,
    roles: e.roles,
    hero: imageRef(e.hero, `events/${e.slug}`),
    gallery,
    featured: e.featured,
  });
  await write('events', `${e.slug}.mdx`, fm + '\n' + e.body + '\n');
}

// ── clients ──────────────────────────────────────────────────────────────
// EVERY entry lands with verified: false, deliberately.
//
// The live site publishes these as client relationships, and docs/handoff.md
// flags the copy as placeholder. Rather than carry that forward, the schema
// refuses to render an unverified name. Flip individual entries to true only
// once someone has confirmed the engagement was real.
const GROUP_MAP = {
  'Integrated resorts & venues': 'venues',
  'Broadcasters & networks': 'broadcasters',
  'Creative & marketing groups': 'agencies',
  'Brands & lifestyle': 'brands',
};

let clientCount = 0;
for (const group of D.clientGroups) {
  const key = GROUP_MAP[group.label];
  if (!key) {
    warnings.push(`unmapped client group "${group.label}" — skipped`);
    continue;
  }
  for (const item of group.items) {
    const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    await write(
      'clients',
      `${slug}.json`,
      JSON.stringify({ name: item.name, group: key, engagement: item.note, verified: false }, null, 2) + '\n',
    );
    clientCount++;
  }
}

// ── services ─────────────────────────────────────────────────────────────
for (const [i, s] of D.services.entries()) {
  const fm = frontmatter({
    title: s.title,
    blurb: s.blurb,
    deliverables: s.deliverables || [],
    order: i + 1,
  });
  await write('services', `${s.slug}.mdx`, fm + '\n' + (s.description || []).join('\n\n') + '\n');
}

// ── report ───────────────────────────────────────────────────────────────
console.log(`artistes  ${D.roster.length}`);
console.log(`events    ${events.length}   (collapsed from ${D.featured.length} featured rows + 3 hardcoded work.html sections + 3 gallery arrays)`);
console.log(`clients   ${clientCount}   (all verified:false — none will render until confirmed)`);
console.log(`services  ${D.services.length}`);
console.log(`images    copied to site/src/assets/cdn`);
if (warnings.length) {
  console.log('\nwarnings:');
  for (const w of warnings) console.log(`  ! ${w}`);
}
