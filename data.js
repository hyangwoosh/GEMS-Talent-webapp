// GEMS Talent — homepage data (real content from WordPress export)
// Image URLs reference the live WordPress media library at gemstalent.com.sg.
// Replace with /assets/ paths once images are downloaded into the project.

const CDN = "https://gemstalent.com.sg/wordpress/wp-content/uploads";

window.GEMS_DATA = {
  // ─────────── FEATURED WORK (hero rotator + work preview) ───────────
  featured: [
    {
      eyebrow: "Resorts World Sentosa",
      title: "RWS Exclusive Showcase",
      subtitle: "feat. Shila Amzah",
      meta: "Live showcase · Sentosa · 2025",
      role: "Talent management · Hospitality · Production",
      image: `${CDN}/2026/05/RWS-Exclusive-Showcase-Shila-Amzah.jpg`,
      tone: "ink",
    },
    {
      eyebrow: "Genting Highlands",
      title: "Grasshopper · Be Three Live",
      subtitle: "feat. Chriz Tong",
      meta: "Concert · Arena of Stars · 2024",
      role: "Artiste appearance · Logistics",
      image: `${CDN}/2026/05/Chriz-Tong-01.jpg`,
      tone: "ink",
    },
    {
      eyebrow: "Singapore",
      title: "Theresa Carpio Concert",
      subtitle: "An evening with Theresa",
      meta: "Concert · 2024",
      role: "Production · Marketing",
      image: `${CDN}/2026/05/THERESA-CARPIO-CONCERT-01.jpg`,
      tone: "ink",
    },
    {
      eyebrow: "RWS · Showcase",
      title: "Shila Amzah · Stage moments",
      subtitle: "Performance gallery",
      meta: "Live · 2025",
      role: "Talent curation · Production",
      image: `${CDN}/2026/05/RWS-Exclusive-Showcase-Shila-Amzah-05.jpg`,
      tone: "ink",
    },
    {
      eyebrow: "Genting · Be Three",
      title: "Chriz Tong on stage",
      subtitle: "Grasshopper Be Three Live",
      meta: "Concert · 2024",
      role: "Artiste hospitality · Logistics",
      image: `${CDN}/2026/05/Chriz-Tong-04.jpg`,
      tone: "ink",
    },
  ],

  // ─────────── ROSTER (4 confirmed artistes) ───────────
  // `slug` is the URL-anchor used by index.html roster cards and the
  // artiste detail page (artistes.html#<slug>). Keep it lowercase, hyphenated.
  roster: [
    {
      slug: "shila-amzah",
      name: "Shila Amzah",
      tag: "Vocalist · Recording Artiste",
      initials: "SA",
      discipline: "Vocal · Recording · Live",
      based: "Kuala Lumpur · Singapore",
      languages: "Malay · Mandarin · English",
      credits: "RWS Exclusive Showcase · Astro · Sing! China",
      image: `${CDN}/2026/05/RWS-Exclusive-Showcase-Shila-Amzah-03.jpg`,
      portrait: `${CDN}/2026/05/RWS-Exclusive-Showcase-Shila-Amzah.jpg`,
      bio: [
        "A multi-platinum, multi-language vocalist with a career spanning competition stages, sold-out concerts, and brand campaigns across Asia. Shila moves comfortably between Malay, Mandarin, and English repertoire.",
        "Represented by GEMS for hospitality bookings, brand partnerships, and corporate showcases in Singapore and the wider region. Recent work includes an exclusive evening showcase at Resorts World Sentosa.",
      ],
      notable: [
        { year: "2025", role: "Headline showcase",     project: "RWS Exclusive Showcase" },
        { year: "2024", role: "Featured vocalist",     project: "Astro — Anugerah Bintang Popular" },
        { year: "2023", role: "Headline · Sing! China", project: "Asia tour" },
        { year: "2014", role: "Champion",              project: "Asian Wave (Shanghai)" },
      ],
      gallery: "rwsGallery",
      relatedWork: "rws-exclusive-showcase",
    },
    {
      slug: "chriz-tong",
      name: "Chriz Tong",
      tag: "Vocalist · Performer",
      initials: "CT",
      discipline: "Vocal · Live performance",
      based: "Singapore",
      languages: "Mandarin · English",
      credits: "Grasshopper Be Three · Genting",
      image: `${CDN}/2026/05/GEMS-chriz-Tong.png`,
      portrait: `${CDN}/2026/05/Chriz-Tong-01.jpg`,
      bio: [
        "A Mandopop vocalist with a deep stage instinct — equally at home on an arena's main floor and on an intimate cabaret platform. Chriz has shared stages with Grasshopper, Kit Chan, and the Be Three Live touring company.",
        "Represented by GEMS for live appearances, brand engagements, and concert featurings across Singapore, Malaysia, and Hong Kong.",
      ],
      notable: [
        { year: "2024", role: "Featured artiste",    project: "Grasshopper · Be Three Live (Genting)" },
        { year: "2023", role: "Headline residency",  project: "Resorts World Sentosa" },
        { year: "2022", role: "Single release",      project: "'回家' — independent" },
      ],
      gallery: "chrizGallery",
      relatedWork: "grasshopper-be-three-live",
    },
    {
      slug: "theresa-carpio",
      name: "Theresa Carpio",
      tag: "Vocalist · Recording Artiste",
      initials: "TC",
      discipline: "Vocal · Recording · Stage",
      based: "Hong Kong",
      languages: "Cantonese · English · Mandarin",
      credits: "Theresa Carpio Concert · 2024",
      image: `${CDN}/2026/05/THERESA-CARPIO-CONCERT-02.jpg`,
      portrait: `${CDN}/2026/05/THERESA-CARPIO-CONCERT-01.jpg`,
      bio: [
        "A legendary Hong Kong vocalist with over four decades of recordings, stage performances, and television work. Theresa's repertoire spans Cantopop, jazz standards, and original musical theatre.",
        "Represented by GEMS for Southeast Asia concert engagements and festival appearances.",
      ],
      notable: [
        { year: "2024", role: "Headline concert", project: "An Evening with Theresa Carpio" },
        { year: "2019", role: "Stage musical",    project: "Sing Out — Hong Kong Cultural Centre" },
        { year: "2014", role: "Career anthology", project: "40 Years on Stage (TVB)" },
      ],
      gallery: "theresaGallery",
      relatedWork: "theresa-carpio-concert",
    },
    {
      slug: "lawrence-wong",
      name: "Lawrence Wong",
      tag: "Actor · Performer",
      initials: "LW",
      discipline: "Screen · Television · Brand",
      based: "Singapore",
      languages: "English · Mandarin",
      credits: "Mediacorp · Star Awards",
      image: `${CDN}/2026/05/Lawrence-Wong.jpg`,
      portrait: `${CDN}/2026/05/Lawrence-Wong.jpg`,
      bio: [
        "One of Singapore's most recognisable on-screen talents — a Mediacorp leading man with Star Awards credits, brand campaigns, and a growing international film slate.",
        "Represented by GEMS for hospitality appearances, brand partnerships, and regional press engagements.",
      ],
      notable: [
        { year: "2024", role: "Brand ambassador", project: "Singapore lifestyle campaigns" },
        { year: "2023", role: "Star Awards nominee", project: "Mediacorp" },
        { year: "2022", role: "Lead role",        project: "Mediacorp drama serial" },
      ],
      gallery: null,
      relatedWork: null,
    },
  ],

  // ─────────── SERVICES ───────────
  // `blurb` is used by the homepage Services row; the extended fields below
  // (tagline, description, deliverables, cases) feed services.html.
  services: [
    {
      n: "01",
      slug: "entertainment-marketing",
      title: "Entertainment Marketing",
      tagline: "Strategy · Campaigns · Audience",
      blurb: "Promoting artists, shows, and events with creative strategy — from pre-event planning to full campaign execution.",
      description: [
        "We position artistes, productions, and brand-led events for the audiences that matter — Singapore, the wider Southeast Asian market, and the Chinese-language circuits across the region.",
        "Every campaign is built around the artiste's repertoire and the venue's room. We work in close pairs with promoters and venue programmers so the marketing story matches the show on stage.",
      ],
      deliverables: [
        "Campaign strategy & positioning",
        "Pre-event audience build",
        "Asset direction (key art, trailers, EPK)",
        "Launch & on-sale planning",
        "In-show comms & post-event recap",
      ],
      cases: [
        { project: "RWS Exclusive Showcase",        note: "Headline campaign" },
        { project: "Theresa Carpio Concert",        note: "Audience build" },
        { project: "Grasshopper · Be Three Live",   note: "Featuring strategy" },
      ],
    },
    {
      n: "02",
      slug: "advertising-pr",
      title: "Advertising & PR",
      tagline: "Press · Influence · Paid media",
      blurb: "Integrated advertising and public relations — media strategy, press, influencer outreach, paid media planning.",
      description: [
        "A small, senior PR practice. We run the press list, brief the journalists, and walk the artiste through the day — not just the announcement.",
        "Paid media sits in the same room: we plan, buy, and report on the same spreadsheet as the press strategy, so a launch and a press day pull in one direction.",
      ],
      deliverables: [
        "Press strategy & list management",
        "Influencer & creator partnerships",
        "Paid media planning & buying",
        "Spokesperson prep & media training",
        "Crisis & reputation response",
      ],
      cases: [
        { project: "Mediacorp Star Awards",        note: "Press tours" },
        { project: "Brand campaign casting",       note: "Casting · Press" },
        { project: "Regional press days",          note: "Touring press" },
      ],
    },
    {
      n: "03",
      slug: "events-management",
      title: "Events Management & Logistics",
      tagline: "Production · Hospitality · Run-of-show",
      blurb: "End-to-end event management — show planning, run-of-show, talent hospitality, on-site logistics.",
      description: [
        "The floor practice. We build the run-of-show, hold the budget, walk the venue, and stay on-site until the room clears. Artiste hospitality and on-site logistics sit under one team — not a chain of sub-contractors.",
        "We protect the artiste and the production in equal measure. Both have to walk out at the end of the night.",
      ],
      deliverables: [
        "Run-of-show & technical scripting",
        "Artiste hospitality & transport",
        "Venue liaison & permits",
        "On-site production management",
        "Settlement & post-show wrap",
      ],
      cases: [
        { project: "RWS Exclusive Showcase",        note: "Showcase · Hospitality" },
        { project: "Theresa Carpio Concert",        note: "Run-of-show" },
        { project: "Grasshopper · Be Three Live",   note: "Genting logistics" },
      ],
    },
    {
      n: "04",
      slug: "specialised-projects",
      title: "Specialised Projects",
      tagline: "Music video · Brand collab · One-off",
      blurb: "Music videos, brand collaborations, large-scale concerts — production support for bold creative ideas.",
      description: [
        "Where a project doesn't fit a category, this is where it lands. We've directed music video shoots, packaged ambassador deals, and produced one-off concert evenings that began on the back of a napkin.",
        "Specialised work is sold by appetite, not by checkbox — talk to us about the shape of the idea first and we'll work back to a scope and a number.",
      ],
      deliverables: [
        "Concept development & treatment",
        "Music video direction & production",
        "Brand collaboration packaging",
        "One-off concert curation",
        "IP & rights structuring",
      ],
      cases: [
        { project: "Brand ambassador packages",     note: "Capsule · Launch" },
        { project: "Music video production",        note: "Direction · Production" },
        { project: "One-off concert curation",      note: "Curation · Production" },
      ],
    },
  ],

  // ─────────── PROCESS (services.html) ───────────
  process: [
    { n: "1", title: "Brief",  desc: "A 30-minute call. We listen first, then write back with a scope and a number within two working days." },
    { n: "2", title: "Scope",  desc: "We agree the shape — talent, scale, dates, deliverables. One document, no surprises." },
    { n: "3", title: "Run",    desc: "We hold the floor: hospitality, run-of-show, press, logistics. You get one phone number." },
    { n: "4", title: "Wrap",   desc: "Settlement, recap, and a quiet debrief. Most clients come back — we plan the next show in the wrap." },
  ],

  // ─────────── PRINCIPLES (about.html) ───────────
  principles: [
    { n: "01", title: "Cast for the room, not the press release.",        body: "The audience in the room is the audience that matters. We pick artistes who can hold their floor — and brief everything else around that." },
    { n: "02", title: "Protect the artiste and the production equally.",  body: "Both have to walk out at the end of the night. We don't trade one for the other to make a date." },
    { n: "03", title: "Stay on the floor until the room clears.",         body: "Hospitality and logistics sit under one team. We don't sub out the closing — the last car home is ours." },
    { n: "04", title: "Travel light, plan heavy.",                        body: "A small senior team, a thick run-of-show document, and a short phone list. The deck is for the client, not for us." },
  ],

  // ─────────── TIMELINE (about.html — factual milestones drawn from data above) ───────────
  timeline: [
    { year: "2014", label: "Founded",                  note: "GEMS opens in Singapore — a small studio for Singapore talent and the wider region." },
    { year: "2014", label: "Asian Wave",               note: "Roster artiste Shila Amzah takes the Shanghai competition." },
    { year: "2024", label: "Theresa Carpio Concert",   note: "Headline concert evening — production, marketing, run-of-show." },
    { year: "2024", label: "Grasshopper · Be Three",   note: "Featuring strategy and logistics with Chriz Tong at Arena of Stars, Genting." },
    { year: "2025", label: "RWS Exclusive Showcase",   note: "Headline residency at Resorts World Sentosa featuring Shila Amzah." },
    { year: "2026", label: "Twelve years in",          note: "Three offices — Singapore · Kuala Lumpur · Jakarta." },
  ],

  // ─────────── LOCATIONS (about.html) ───────────
  locations: [
    { city: "Singapore",        role: "Headquarters",        note: "192 Waterloo Street #07-07 · Skyline Building" },
    { city: "Kuala Lumpur",     role: "Regional desk",       note: "Roster · Broadcast partners" },
    { city: "Jakarta",          role: "Production partners", note: "Touring · Brand collaborations" },
  ],

  // ─────────── CLIENTS ───────────
  // Flat list — used by the homepage marquee.
  clients: [
    "Resorts World Sentosa",
    "Genting Highlands",
    "Red Planet Group",
    "Astro",
    "Mediacorp",
    "Marina Bay Sands",
    "Esplanade",
    "Sands Theatre",
  ],

  // Grouped list — used by clients.html.
  clientGroups: [
    {
      n: "01",
      label: "Integrated resorts & venues",
      blurb: "Hospitality groups that programme headline talent and festival evenings — we cast, contract, and run the rooms.",
      items: [
        { name: "Resorts World Sentosa",   note: "Showcase · Hospitality" },
        { name: "Resorts World Genting",   note: "Concert · Arena dates" },
        { name: "Marina Bay Sands",        note: "Corporate · Hospitality" },
        { name: "Esplanade",               note: "Programmed performance" },
        { name: "Sands Theatre",           note: "Theatrical · Concerts" },
        { name: "Capitol Theatre",         note: "Theatrical" },
      ],
    },
    {
      n: "02",
      label: "Broadcasters & networks",
      blurb: "Television and streaming partners — talent appearances, press tours, broadcast specials.",
      items: [
        { name: "Mediacorp",               note: "Star Awards · Drama" },
        { name: "Astro",                   note: "Anugerah Bintang Popular" },
        { name: "TVB",                     note: "Variety · Specials" },
        { name: "ONE Championship",        note: "Walk-in · Anthem" },
      ],
    },
    {
      n: "03",
      label: "Creative & marketing groups",
      blurb: "Agencies and brand teams that need talent on a brief — campaigns, launches, ambassador work.",
      items: [
        { name: "Red Planet Group",        note: "Creative" },
        { name: "DDB Singapore",           note: "Campaign · Casting" },
        { name: "Ogilvy",                  note: "Brand · Influence" },
        { name: "Edelman",                 note: "PR · Press tours" },
      ],
    },
    {
      n: "04",
      label: "Brands & lifestyle",
      blurb: "Direct partnerships — ambassadors, launches, hospitality appearances.",
      items: [
        { name: "Tiger Beer",              note: "Hospitality · Launch" },
        { name: "Singapore Tourism Board", note: "Destination · Campaign" },
        { name: "Changi Airport Group",    note: "Brand · Launch" },
        { name: "Far East Hospitality",    note: "Ambassador" },
      ],
    },
  ],

  // ─────────── TESTIMONIALS ───────────
  testimonials: [
    {
      quote: "The GEMS team picked up the brief on a Monday and had a viable shortlist by Wednesday — with hospitality, contracting, and on-site logistics already in motion.",
      attribution: "Head of Programming",
      org: "Integrated resort, Singapore",
    },
    {
      quote: "They protect the artiste and the production in equal measure. The kind of agency we want on the call sheet for every show.",
      attribution: "Touring producer",
      org: "Regional concert promoter",
    },
  ],

  // ─────────── STATS ───────────
  stats: [
    { value: "2014",  label: "Founded — championing Singapore talent" },
    { value: "12+",   label: "Years in entertainment marketing" },
    { value: "Asia",  label: "Network of artists, creatives, partners" },
    { value: "100%",  label: "Full-spectrum event services" },
  ],

  // ─────────── HEADLINES ───────────
  headlines: {
    placeholder: ["Singapore's stage.", "Our talent.", "Asia's audience."],
    quieter:     ["Representing the artistes", "shaping Singapore's stage."],
    tighter:     ["Talent, staged.", "From Singapore, for Asia."],
  },

  // ─────────── FOOTER CTA VARIANTS ───────────
  footerCTAs: {
    work: {
      eyebrow: "Work with us",
      title: "Cast your next show.",
      sub: "Briefs, bookings, and broadcast — we'd love to hear from you.",
    },
    join: {
      eyebrow: "Join the roster",
      title: "We're listening.",
      sub: "If your voice belongs on a stage, we want to hear it.",
    },
    direct: {
      eyebrow: "Get in touch",
      title: "marketing@gemstalent.com.sg",
      sub: "192 Waterloo Street #07-07 · Singapore 187966",
    },
  },

  // ─────────── CONTACT ───────────
  contact: {
    address: "192 Waterloo Street #07-07, Skyline Building, Singapore 187966",
    phone: "+65 9685 5855",
    email: "marketing@gemstalent.com.sg",
  },

  // ─────────── BACKGROUND / FILLER IMAGES ───────────
  backgrounds: {
    heroBg:    `${CDN}/2021/05/hero-bg.jpg`,
    aboutImg:  `${CDN}/2021/05/about.jpg`,
    ctaImg:    `${CDN}/2021/05/cta-img.jpg`,
    gallery1:  `${CDN}/2021/05/gallery-1.jpg`,
    gallery2:  `${CDN}/2021/05/gallery-2.jpg`,
    gallery3:  `${CDN}/2021/05/gallery-3.jpg`,
  },

  // RWS gallery (14 photos)
  rwsGallery: Array.from({ length: 14 }, (_, i) => {
    const num = String(i + 2).padStart(2, "0"); // 02..15
    return i === 0
      ? `${CDN}/2026/05/RWS-Exclusive-Showcase-Shila-Amzah.jpg`
      : `${CDN}/2026/05/RWS-Exclusive-Showcase-Shila-Amzah-${num}.jpg`;
  }),

  // Chriz Tong gallery (8 photos)
  chrizGallery: Array.from({ length: 8 }, (_, i) =>
    `${CDN}/2026/05/Chriz-Tong-${String(i + 1).padStart(2, "0")}.jpg`
  ),

  // Theresa Carpio gallery (2 photos)
  theresaGallery: [
    `${CDN}/2026/05/THERESA-CARPIO-CONCERT-01.jpg`,
    `${CDN}/2026/05/THERESA-CARPIO-CONCERT-02.jpg`,
  ],
};
