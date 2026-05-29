/* GEMS Talent — Body sections (stats, marquee, roster, services, work, footer) */

function StatsStrip() {
  const stats = window.GEMS_DATA.stats;
  return (
    <section data-screen-label="Stats" style={{ background: "var(--bone)", borderBottom: "1px solid var(--hair)" }}>
      <div className="container stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0 }}>
        {stats.map((s, i) => (
          <div key={s.label} style={{
            paddingBlock: 56,
            paddingInline: i === 0 ? 0 : 32,
            borderLeft: i > 0 ? "1px solid var(--hair)" : "none",
          }}>
            <div style={{
              fontSize: "clamp(48px, 5.4vw, 84px)",
              fontWeight: 500, lineHeight: 0.95, letterSpacing: "-0.025em",
              color: "var(--ink)", fontFamily: "var(--sans)",
            }}>
              {s.value}
            </div>
            <div style={{
              marginTop: 16, fontSize: 13, color: "var(--slate)",
              maxWidth: "22ch", lineHeight: 1.4,
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ClientMarquee() {
  const clients = window.GEMS_DATA.clients;
  // duplicate for seamless scroll
  const items = [...clients, ...clients];
  return (
    <section data-screen-label="Clients" className="marquee" aria-label="Clients">
      <div className="container" style={{ marginBottom: 18 }}>
        <span className="eyebrow"><span className="dot" />Trusted by</span>
      </div>
      <div className="marquee-track">
        {items.map((c, i) => (
          <span key={i} className="marquee-item">
            {c}<span className="sep">◆</span>
          </span>
        ))}
      </div>
    </section>
  );
}

/* ═════════ ROSTER ═════════ */

function RosterCard({ artist, treatment, useSerif }) {
  const [hover, setHover] = useState(false);

  return (
    <a
      href={`artistes.html#${artist.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "block", color: "var(--ink)",
        cursor: "default",
      }}
    >
      <div className="roster-img"
           style={{ transform: hover ? "scale(1.015)" : "scale(1)", background: "#11192a" }}>
        {artist.image ? (
          <img src={artist.image} alt={artist.name}
               style={{
                 position: "absolute", inset: 0,
                 width: "100%", height: "100%", objectFit: "cover",
                 filter: "brightness(0.92) contrast(1.02) saturate(0.95)",
                 transition: "transform 600ms cubic-bezier(.2,.7,.2,1)",
                 transform: hover ? "scale(1.04)" : "scale(1)",
               }} />
        ) : (
          <span className="ini">{artist.initials}</span>
        )}
        {treatment === "overlay" && hover && (
          <div style={{
            position: "absolute", inset: 0, background: "rgba(14,26,43,0.78)",
            display: "flex", flexDirection: "column", justifyContent: "flex-end",
            padding: 20, color: "var(--bone)",
          }}>
            <div className="eyebrow" style={{ color: "var(--teal-soft)" }}>{artist.tag}</div>
            <div style={{ fontSize: 22, fontWeight: 500, marginTop: 8, letterSpacing: "-0.01em" }}>
              {artist.name}
            </div>
            <div style={{ fontSize: 12, color: "rgba(250,247,242,0.7)", marginTop: 6 }}>
              {artist.credits}
            </div>
          </div>
        )}
        {/* Corner index */}
        <div className="mono" style={{
          position: "absolute", top: 14, left: 14,
          color: "rgba(250,247,242,0.7)",
          fontSize: 10,
          mixBlendMode: "difference",
        }}>
          {String(artist.idx + 1).padStart(2, "0")}
        </div>
      </div>

      {treatment !== "overlay" && (
        <div style={{
          paddingTop: 18,
          display: "grid",
          gridTemplateColumns: treatment === "below-split" ? "1fr auto" : "1fr",
          gap: 8,
          alignItems: "baseline",
        }}>
          <div>
            <div style={{
              fontSize: 19, fontWeight: 500, letterSpacing: "-0.01em",
              fontFamily: "var(--sans)",
            }}>
              {useSerif
                ? <span><span className="serif-em">{artist.name.split(" ")[0]}</span> {artist.name.split(" ").slice(1).join(" ")}</span>
                : artist.name}
            </div>
            {treatment === "below-stacked" && (
              <div style={{ fontSize: 12, color: "var(--slate)", marginTop: 4 }}>
                {artist.tag}
              </div>
            )}
          </div>
          {treatment === "below-split" && (
            <div className="mono" style={{ color: "var(--slate)", textAlign: "right", textTransform: "uppercase" }}>
              {artist.tag.split(" · ")[0]}
            </div>
          )}
        </div>
      )}
    </a>
  );
}

function Roster({ treatment, useSerif }) {
  const roster = window.GEMS_DATA.roster.map((a, idx) => ({ ...a, idx }));
  return (
    <section id="roster" data-screen-label="Roster" className="section">
      <div className="container">
        <div className="rail-grid" style={{ marginBottom: 80 }}>
          <div className="sec-rail"><span className="num">02</span>The roster</div>
          <div>
            <h2 className="h1" style={{ maxWidth: "16ch" }}>
              The voices, performers, and {useSerif ? <span className="serif-em">music directors</span> : "music directors"} we represent.
            </h2>
            <div style={{
              marginTop: 32, display: "flex", justifyContent: "space-between",
              alignItems: "flex-end", gap: 40, flexWrap: "wrap",
            }}>
              <p style={{ fontSize: 16, color: "var(--slate)", maxWidth: "48ch", lineHeight: 1.55 }}>
                Forty-plus artistes across vocal, instrumental, music direction,
                and on-camera. Each represented end-to-end — from booking and
                bond, to recording, brand, and broadcast.
              </p>
              <a href="artistes.html" className="btn btn--ghost-ink">
                See full roster <ArrowRight />
              </a>
            </div>
          </div>
        </div>

        <div className="roster-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "32px 24px",
        }}>
          {roster.map((a) => (
            <RosterCard key={a.name} artist={a} treatment={treatment} useSerif={useSerif} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═════════ SERVICES ═════════ */

function ServiceRow({ s, mode, useSerif }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="service-row"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "80px 1fr auto auto",
        gap: 32,
        alignItems: "center",
        padding: "36px 0",
        borderBottom: "1px solid rgba(14,26,43,0.12)",
        cursor: "default",
        transition: "padding 300ms ease",
      }}
    >
      <span className="mono" style={{ color: "var(--cobalt)", fontSize: 12 }}>{s.n}</span>

      <div style={{
        fontSize: "clamp(36px, 4vw, 60px)", fontWeight: 500,
        letterSpacing: "-0.02em", lineHeight: 1.0,
        color: "var(--ink)",
        transition: "transform 400ms cubic-bezier(.2,.7,.2,1), color 200ms",
        transform: hover && mode !== "static" ? "translateX(8px)" : "none",
      }}>
        {useSerif && s.title.includes(" ")
          ? <span>{s.title.split(" ")[0]} <span className="serif-em">{s.title.split(" ").slice(1).join(" ")}</span></span>
          : s.title}
      </div>

      {mode === "blurb-slide" ? (
        <div style={{
          fontSize: 14, color: "var(--slate)",
          width: 280, opacity: hover ? 1 : 0,
          transform: hover ? "translateX(0)" : "translateX(-12px)",
          transition: "opacity 320ms ease, transform 320ms cubic-bezier(.2,.7,.2,1)",
        }}>
          {s.blurb}
        </div>
      ) : mode === "image-strip" ? (
        <div style={{
          width: 200, height: 80,
          background: hover ? "var(--cobalt-deep)" : "transparent",
          opacity: hover ? 1 : 0,
          transition: "opacity 320ms ease",
          position: "relative", overflow: "hidden",
        }} className={hover ? "striped" : ""}>
          {hover && (
            <div className="strip-meta" style={{ color: "rgba(250,247,242,0.85)" }}>
              <span>{s.title}</span>
              <span>03</span>
            </div>
          )}
        </div>
      ) : (
        <div style={{
          fontSize: 13, color: "var(--slate)",
          opacity: hover ? 1 : 0.65,
          transition: "opacity 200ms ease",
        }}>
          {s.blurb}
        </div>
      )}

      <div style={{
        color: "var(--cobalt)",
        transform: hover ? "translateX(6px)" : "translateX(0)",
        transition: "transform 300ms cubic-bezier(.2,.7,.2,1)",
      }}>
        <ArrowRight size={18} />
      </div>

      {/* accent underline on hover */}
      <span style={{
        position: "absolute", left: 0, bottom: -1, height: 1,
        background: "var(--cobalt)",
        width: hover && mode !== "static" ? "100%" : "0%",
        transition: "width 500ms cubic-bezier(.2,.7,.2,1)",
      }} />
    </div>
  );
}

function Services({ mode, useSerif }) {
  const items = window.GEMS_DATA.services;
  return (
    <section id="services" data-screen-label="Services" className="section" style={{ background: "var(--sage)", color: "var(--ink)" }}>
      <div className="container">
        <div className="rail-grid" style={{ marginBottom: 60 }}>
          <div className="sec-rail">
            <span className="num">03</span>What we do
          </div>
          <div>
            <h2 className="h1" style={{ color: "var(--ink)", maxWidth: "18ch" }}>
              Five practices, {useSerif ? <span className="serif-em">one studio.</span> : "one studio."}
            </h2>
            <p style={{
              marginTop: 28, fontSize: 16, color: "var(--slate)",
              maxWidth: "48ch", lineHeight: 1.55,
            }}>
              We work as a single team. Most of our productions touch three or
              more of these lines — the management of an artiste, the
              direction of the music, the running of the room.
            </p>
          </div>
        </div>

        <div className="services-rows" style={{ borderTop: "1px solid rgba(14,26,43,0.18)" }}>
          {items.map((s) => (
            <ServiceRow key={s.n} s={s} mode={mode} useSerif={useSerif} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═════════ WORK PREVIEW (3 projects) ═════════ */

function WorkPreview({ useSerif }) {
  const w = window.GEMS_DATA.featured.slice(0, 3);
  return (
    <section id="work" data-screen-label="Work" className="section section--cobalt" style={{ paddingTop: 140 }}>
      <div className="container">
        <div className="rail-grid" style={{ marginBottom: 64 }}>
          <div className="sec-rail"><span className="num">01</span>Recent work</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 40, flexWrap: "wrap" }}>
            <h2 className="h1" style={{ maxWidth: "18ch" }}>
              Selected stages, screens, and {useSerif ? <span className="serif-em">broadcasts.</span> : "broadcasts."}
            </h2>
            <a href="work.html" className="btn btn--ghost-bone">All projects <ArrowRight /></a>
          </div>
        </div>

        <div className="work-grid" style={{
          display: "grid",
          gridTemplateColumns: "1.3fr 1fr 1fr",
          gap: 24,
          alignItems: "stretch",
        }}>
          {w.map((p, i) => (
            <a key={p.title} href={`work.html#${p.title.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`} style={{ display: "block" }}>
              <div style={{
                position: "relative",
                aspectRatio: i === 0 ? "4/5" : "3/4",
                background: "#16243b",
                overflow: "hidden",
              }}>
                <img src={p.image} alt={p.title}
                     style={{
                       position: "absolute", inset: 0,
                       width: "100%", height: "100%", objectFit: "cover",
                       filter: "brightness(0.9) saturate(0.95)",
                     }} />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(180deg, rgba(14,26,43,0) 50%, rgba(14,26,43,0.7) 100%)",
                }} />
                <div className="strip-meta" style={{ color: "rgba(250,247,242,0.9)" }}>
                  <span>{p.eyebrow}</span>
                  <span>{p.meta.split(" · ").pop()}</span>
                </div>
              </div>
              <div style={{ paddingTop: 20 }}>
                <div className="eyebrow" style={{ color: "var(--brass)" }}>{p.eyebrow}</div>
                <div style={{ fontSize: 22, fontWeight: 500, marginTop: 10, letterSpacing: "-0.01em" }}>
                  {useSerif
                    ? <span>{p.title.split(" ")[0]} <span className="serif-em">{p.title.split(" ").slice(1).join(" ")}</span></span>
                    : p.title}
                </div>
                <div style={{ fontSize: 13, color: "rgba(250,247,242,0.6)", marginTop: 6 }}>
                  {p.role}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═════════ FOOTER CTA + FOOTER ═════════ */

function FooterCTA({ variant, useSerif }) {
  const cta = window.GEMS_DATA.footerCTAs[variant];
  return (
    <section id="contact" data-screen-label="Footer CTA" className="section" style={{ paddingBlock: 180, background: "var(--clay)", color: "var(--ink)", borderTop: "1px solid var(--hair)" }}>
      <div className="container" style={{ textAlign: "center" }}>
        <div className="eyebrow" style={{ color: "var(--cobalt)" }}>
          <span className="dot" />{cta.eyebrow}
        </div>
        <h2 className="display" style={{
          color: "var(--ink)", marginTop: 36,
          fontSize: "clamp(64px, 9vw, 156px)",
        }}>
          {useSerif
            ? <span><span className="serif-em" style={{ color: "var(--cobalt)" }}>{cta.title.split(" ")[0]}</span> {cta.title.split(" ").slice(1).join(" ")}</span>
            : cta.title}
        </h2>
        <p style={{
          marginTop: 36, fontSize: 18, color: "var(--slate)",
          maxWidth: "44ch", marginInline: "auto", lineHeight: 1.5,
        }}>
          {cta.sub}
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 48 }}>
          {(() => {
            const publicEmail = window.GEMS_DATA.contact.email;
            return (
              <a href={`mailto:${publicEmail}`} className="btn" style={{
                background: "var(--cobalt)", color: "var(--white)", borderColor: "var(--cobalt)",
                height: 56, padding: "0 28px", fontSize: 15,
              }}>
                {publicEmail} <ArrowRight size={16} />
              </a>
            );
          })()}
          <a href="contact.html#brief" className="btn btn--ghost-ink" style={{ height: 56, padding: "0 28px", fontSize: 15 }}>
            Submit a brief
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  // Contact strings come from data.js — single source of truth. The UEN
  // line is rendered only when window.GEMS_DATA.contact.uen is set;
  // until a real UEN is supplied we omit it rather than show a placeholder.
  const C = (window.GEMS_DATA && window.GEMS_DATA.contact) || {};
  const email = C.email || "hello@gemstalent.com.sg";
  const phone = C.phone || "";
  const phoneHref = "tel:" + (phone || "").replace(/[^+\d]/g, "");
  const year = new Date().getFullYear();

  const studioLinks = [
    { label: "Roster",      href: "artistes.html" },
    { label: "Recent work", href: "work.html" },
    { label: "Services",    href: "services.html" },
    { label: "About",       href: "about.html" },
  ];
  const reachLinks = [
    { label: email,        href: "mailto:" + email },
    phone ? { label: phone, href: phoneHref } : null,
    { label: "Singapore HQ", href: "contact.html" },
    { label: "KL · Jakarta", href: "about.html#locations" },
  ].filter(Boolean);

  return (
    <footer data-screen-label="Footer" style={{ background: "var(--cobalt-deep)", color: "rgba(250,247,242,0.7)", borderTop: "1px solid rgba(250,247,242,0.1)" }}>
      <div className="container" style={{ paddingBlock: 56 }}>
        <div className="footer-cols" style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr 1fr",
          gap: 48, alignItems: "flex-start",
        }}>
          <div>
            <Logo tone="bone" />
            <p style={{ fontSize: 13, color: "rgba(250,247,242,0.55)", marginTop: 24, maxWidth: "32ch", lineHeight: 1.55 }}>
              GEMS Talent Pte Ltd. Talent representation, music direction,
              and live production for stages across Asia.
            </p>
          </div>
          {[
            { h: "Studio", links: studioLinks },
            { h: "Reach",  links: reachLinks  },
          ].map((col, i) => (
            <div key={i}>
              <div className="eyebrow" style={{ color: "rgba(250,247,242,0.45)" }}>{col.h}</div>
              <ul style={{ listStyle: "none", marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                {col.links.map((l) => (
                  <li key={l.label} style={{ fontSize: 14, color: "rgba(250,247,242,0.85)" }}>
                    <a href={l.href} style={{ borderBottom: "1px solid transparent", paddingBottom: 1 }}
                       onMouseEnter={(e) => e.currentTarget.style.borderBottomColor = "var(--brass)"}
                       onMouseLeave={(e) => e.currentTarget.style.borderBottomColor = "transparent"}
                    >{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 72, paddingTop: 24,
          borderTop: "1px solid rgba(250,247,242,0.1)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          fontSize: 12, color: "rgba(250,247,242,0.45)",
        }}>
          <span>© {year} GEMS Talent Pte Ltd{C.uen ? ` · UEN ${C.uen}` : ""}</span>
          <span className="mono">SG / KL / JKT · Est. 2014</span>
        </div>
      </div>
    </footer>
  );
}

window.StatsStrip = StatsStrip;
window.ClientMarquee = ClientMarquee;
window.Roster = Roster;
window.Services = Services;
window.WorkPreview = WorkPreview;
window.FooterCTA = FooterCTA;
window.Footer = Footer;
