# URL redirects — WordPress → React

> Generated from `uploads/gemstalent.WordPress.2026-05-05.xml` (the WP export).
> Old site lived at `gemstalent.com.sg/wordpress/<slug>/`. New site lives at
> `gemstalent.com.sg/<slug>` (no `/wordpress` prefix).

---

## How to use this

The mapping below becomes a Netlify `_redirects` file at the repo root.
Netlify reads `_redirects` automatically on every deploy — no config needed.

**Copy the block below into a new file named `_redirects` (no extension) at the repo root before Phase 1 deploys.**

```
# ─── WordPress page redirects (preserve SEO + inbound links) ───
# Old URL                              New URL          Status
/wordpress/                            /                301
/wordpress/services/                   /services        301
/wordpress/our-services/               /services        301
/wordpress/about-2/                    /about           301
/wordpress/about/                      /about           301
/wordpress/contact/                    /contact         301
/wordpress/our-artistes/               /artistes        301
/wordpress/our-clients/                /clients         301
/wordpress/our-works/                  /work            301

# ─── Defunct paths (gone, not migrated) ───
/wordpress/customer-cabinet-2/         /                301
/wordpress/customer-cabinet/           /                301
/wordpress/hello-world/                /                410!

# ─── WP admin / login (no equivalent on static site) ───
/wordpress/wp-admin                    /                301
/wordpress/wp-admin/*                  /                301
/wordpress/wp-login.php                /                301

# ─── Catch-all: any unmapped /wordpress/* URL goes to home ───
/wordpress/*                           /                301
```

> The `410!` on `/hello-world/` returns "Gone" status — tells search engines
> to drop it from the index permanently (it's a default WordPress demo post,
> no value). The `!` suffix in Netlify means "force this even if a file
> exists at that path."

---

## What's NOT covered

### Old image URLs

Image URLs were `gemstalent.com.sg/wordpress/wp-content/uploads/2026/05/<file>.jpg`. After CDN localization (Phase 0.5), they live at `gemstalent.com.sg/assets/cdn/<file>.jpg` — date segments stripped.

Mapping these via Netlify redirects is messy (date segments don't translate to a single rewrite rule). **Recommendation: don't bother.** Inbound traffic to old image URLs is virtually zero — only matters if external sites hot-linked your images, which they don't.

If you discover later that important inbound image traffic exists, add specific per-file redirects for the 17 known basenames.

### Anchors / fragments

URLs like `gemstalent.com.sg/wordpress/our-artistes/#lawrence-wong` lose their fragment in a 301 — browsers handle them client-side. The redirect strips the path but keeps the fragment. So `#lawrence-wong` would survive to `/artistes#lawrence-wong`. If the new site uses slug anchors that match (`id="lawrence-wong"`), it Just Works. If anchors differ, manual fixup is needed (low-traffic edge case).

### Subdomains

Doesn't apply — there's no `blog.gemstalent.com.sg` or similar subdomain in the WP export. If any existed historically, they're already broken (DNS doesn't resolve them).

---

## Verification after Phase 6 cutover

Once DNS has propagated:

```bash
# Each should return 301 with new Location header
curl -I https://gemstalent.com.sg/wordpress/services/
curl -I https://gemstalent.com.sg/wordpress/our-artistes/
curl -I https://gemstalent.com.sg/wordpress/about-2/

# Should return 410
curl -I https://gemstalent.com.sg/wordpress/hello-world/

# Catch-all: random /wordpress/whatever should redirect to /
curl -I https://gemstalent.com.sg/wordpress/random-old-page/
```

If any fail, check Netlify dashboard → Site settings → Build & deploy → Post processing — make sure `_redirects` was picked up. Look for the redirect count in the build log.

---

## Source data

Full list of published pages from the WP XML export (for reference):

| WP URL | Title | Mapped to |
|---|---|---|
| `/wordpress/` | Home | `/` |
| `/wordpress/services/` | Services | `/services` |
| `/wordpress/about-2/` | About | `/about` |
| `/wordpress/contact/` | Contact | `/contact` |
| `/wordpress/our-works/` | Our Works | `/work` |
| `/wordpress/our-artistes/` | Our Artistes | `/artistes` |
| `/wordpress/our-clients/` | Our Clients | `/clients` |
| `/wordpress/customer-cabinet-2/` | Customer Cabinet | `/` (no equivalent) |
| `/wordpress/hello-world/` | Hello world! | `410!` (default WP demo post) |

Total: 9 pages → 7 redirects + 1 gone + 1 silent (home maps to itself).
