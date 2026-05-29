/* GEMS Talent — Nav */

const ArrowRight = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M1 7H13M13 7L8 2M13 7L8 12" stroke="currentColor" strokeWidth="1.25" strokeLinecap="square" />
  </svg>
);

const Logo = ({ tone = "bone" }) => {
  return (
    <a href="index.html" aria-label="GEMS Talent — home"
       style={{ display: "flex", alignItems: "center", gap: 12, height: 48 }}>
      <img
        src="assets/gems-stamp-nav.jpg"
        alt="GEMS Talent"
        style={{
          height: 48, width: 48, display: "block",
          borderRadius: "50%", objectFit: "cover",
        }}
      />
      <span style={{
        fontFamily: "var(--sans)", fontWeight: 600, fontSize: 14,
        letterSpacing: "0.18em", textTransform: "uppercase",
        color: "var(--ink)", opacity: 0.55,
      }}>TALENT</span>
    </a>
  );
};

function Nav({ condensed }) {
  const links = [
    { label: "Work",     href: "work.html" },
    { label: "Artistes", href: "artistes.html" },
    { label: "Services", href: "services.html" },
    { label: "Clients",  href: "clients.html" },
    { label: "About",    href: "about.html" },
    { label: "Contact",  href: "contact.html" },
  ];
  const isCondensed = condensed;
  const tone = isCondensed ? "ink" : "bone";
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // Lock body scroll while the drawer is open
  React.useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [drawerOpen]);

  // Close drawer on Escape
  React.useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setDrawerOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  return (
    <>
    <nav
      data-screen-label="Top nav"
      className={"site-nav " + (isCondensed ? "is-condensed" : "is-clear")}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        height: isCondensed ? 64 : 84,
        background: isCondensed ? "linear-gradient(to bottom, rgba(230,236,242,0.98) 0%, rgba(230,236,242,0.86) 100%)" : "transparent",
        borderBottom: "1px solid transparent",
        backdropFilter: isCondensed ? "blur(12px) saturate(120%)" : "none",
        WebkitBackdropFilter: isCondensed ? "blur(12px) saturate(120%)" : "none",
        transition: "height 280ms cubic-bezier(.2,.7,.2,1), background 280ms ease, border-color 280ms ease",
        color: "var(--ink)",
      }}
    >
      <div className="nav-grid" style={{
        maxWidth: "var(--max)", margin: "0 auto",
        padding: "0 var(--gutter)",
        height: "100%",
        display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center",
        gap: 48,
      }}>
        <Logo tone={tone === "ink" ? "bone" : "bone"} />

        <ul className="nav-links" style={{
          listStyle: "none", display: "flex", gap: 36, justifyContent: "center",
        }}>
          {links.map((l) => (
            <li key={l.label}>
              <a href={l.href} className="nav-link"
                 style={{
                   fontSize: 13, fontWeight: 500, letterSpacing: "-0.005em",
                   color: "var(--slate)", paddingBlock: 8,
                   borderBottom: "1px solid transparent",
                   transition: "color 200ms ease, border-color 200ms ease",
                 }}
                 onMouseEnter={(e) => { e.currentTarget.style.color = "var(--ink)"; e.currentTarget.style.borderBottomColor = "var(--brass)"; }}
                 onMouseLeave={(e) => { e.currentTarget.style.color = "var(--slate)"; e.currentTarget.style.borderBottomColor = "transparent"; }}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="nav-right" style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span className="mono nav-meta" style={{ color: "var(--slate)" }}>SG · KL · JKT</span>
          <a href="contact.html#brief" className="btn btn--ghost-ink nav-cta" style={{ height: 38, padding: "0 16px", fontSize: 12.5 }}>
            Cast a brief <ArrowRight size={12} />
          </a>
          <button
            className="nav-burger"
            aria-label={drawerOpen ? "Close menu" : "Open menu"}
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen((v) => !v)}
            style={{
              cursor: "pointer", width: 44, height: 44,
              display: "none", alignItems: "center", justifyContent: "center",
              color: "var(--ink)",
            }}
          >
            <svg width="22" height="14" viewBox="0 0 22 14" fill="none" aria-hidden="true">
              {drawerOpen ? (
                <>
                  <path d="M2 2L20 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                  <path d="M2 12L20 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                </>
              ) : (
                <>
                  <path d="M0 1.5H22" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M0 12.5H22" stroke="currentColor" strokeWidth="1.5" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>
    </nav>

    {/* Mobile drawer — toggled by hamburger, hidden via CSS at desktop widths */}
    <div
      className={"nav-drawer " + (drawerOpen ? "is-open" : "")}
      aria-hidden={!drawerOpen}
      onClick={(e) => { if (e.target === e.currentTarget) setDrawerOpen(false); }}
    >
      <div className="nav-drawer__panel" role="dialog" aria-label="Site menu">
        <div className="nav-drawer__rail">
          <span className="mono" style={{ color: "var(--slate)" }}>Menu</span>
          <button
            className="nav-drawer__close"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            style={{ cursor: "pointer", width: 44, height: 44, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--ink)" }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M2 2L16 16M16 2L2 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            </svg>
          </button>
        </div>
        <ul className="nav-drawer__list">
          {links.map((l, i) => (
            <li key={l.label}>
              <a href={l.href} onClick={() => setDrawerOpen(false)}>
                <span className="mono num">{String(i + 1).padStart(2, "0")}</span>
                <span className="label">{l.label}</span>
                <ArrowRight size={14} />
              </a>
            </li>
          ))}
        </ul>
        <div className="nav-drawer__foot">
          <a href="contact.html#brief" className="btn" onClick={() => setDrawerOpen(false)} style={{ background: "var(--cobalt)", color: "var(--white)", borderColor: "var(--cobalt)", height: 48 }}>
            Cast a brief <ArrowRight size={14} />
          </a>
          <span className="mono" style={{ color: "var(--slate)", marginTop: 16 }}>SG · KL · JKT</span>
        </div>
      </div>
    </div>
    </>
  );
}

window.Nav = Nav;
window.ArrowRight = ArrowRight;
window.Logo = Logo;
