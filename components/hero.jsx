/* GEMS Talent — Hero */

const { useState, useEffect, useRef } = React;

function HeroHeadline({ variant }) {
  const lines = window.GEMS_DATA.headlines[variant] || window.GEMS_DATA.headlines.placeholder;
  const useSerif = window.__SERIF_ACCENTS__;

  if (variant === "placeholder") {
    return (
      <h1 className="display" style={{ color: "var(--ink)" }}>
        <span style={{ display: "block" }}>Singapore's stage.</span>
        <span style={{ display: "block" }}>
          {useSerif ? <span className="serif-em">Our</span> : "Our"} talent.
        </span>
        <span style={{ display: "block", color: "var(--cobalt)" }}>Asia's audience.</span>
      </h1>
    );
  }
  if (variant === "quieter") {
    return (
      <h1 className="display" style={{ color: "var(--ink)", fontSize: "clamp(48px, 6.4vw, 108px)" }}>
        <span style={{ display: "block" }}>Representing the {useSerif ? <span className="serif-em">artistes</span> : "artistes"}</span>
        <span style={{ display: "block" }}>shaping Singapore's stage.</span>
      </h1>
    );
  }
  // tighter
  return (
    <h1 className="display" style={{ color: "var(--ink)" }}>
      <span style={{ display: "block" }}>Talent, {useSerif ? <span className="serif-em">staged.</span> : "staged."}</span>
      <span style={{ display: "block", color: "var(--cobalt)" }}>From Singapore, for Asia.</span>
    </h1>
  );
}

function FeaturedFrame({ project, layout }) {
  const baseStyle = {
    position: "relative",
    background: "#16243b",
    aspectRatio: layout === "fullbleed" ? "auto" : (layout === "asymmetric" ? "4/5" : "3/4"),
    height: layout === "fullbleed" ? "100%" : "auto",
    overflow: "hidden",
  };
  return (
    <div style={baseStyle}>
      {/* real photography */}
      <img src={project.image} alt={project.title}
           style={{
             position: "absolute", inset: 0,
             width: "100%", height: "100%", objectFit: "cover",
             filter: "brightness(0.85) contrast(1.02) saturate(0.92)",
           }} />
      {/* subtle ink wash for text legibility */}
      <div style={{
        position: "absolute", inset: 0,
        background: layout === "fullbleed"
          ? "linear-gradient(180deg, rgba(14,26,43,0.55) 0%, rgba(14,26,43,0.15) 35%, rgba(14,26,43,0.85) 100%)"
          : "linear-gradient(180deg, rgba(14,26,43,0.15) 0%, rgba(14,26,43,0.0) 30%, rgba(14,26,43,0.6) 100%)",
      }} />

      {/* play affordance */}
      <div style={{
        position: "absolute", left: 24, top: 24,
        display: "flex", alignItems: "center", gap: 10,
        color: "var(--ink)", fontSize: 11,
        fontFamily: "var(--mono)", letterSpacing: "0.08em", textTransform: "uppercase",
      }}>
        <span style={{
          width: 28, height: 28, borderRadius: "50%",
          border: "1px solid var(--ink)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="8" height="9" viewBox="0 0 8 9" fill="none">
            <path d="M0 0L8 4.5L0 9V0Z" fill="currentColor" />
          </svg>
        </span>
        Watch · 02:14
      </div>

      {/* meta footer */}
      <div className="strip-meta" style={{ color: "var(--ink)" }}>
        <span>{project.eyebrow}</span>
        <span>{project.meta}</span>
      </div>
    </div>
  );
}

function HeroProgress({ count, current, onClick, paused }) {
  return (
    <div style={{
      display: "flex", gap: 10, alignItems: "center",
      width: "100%",
    }}>
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={() => onClick(i)}
          aria-label={`Project ${i + 1}`}
          style={{
            flex: 1, height: 2, background: "rgba(14,26,43,0.14)",
            position: "relative", overflow: "hidden", cursor: "default",
          }}
        >
          <span style={{
            position: "absolute", inset: 0,
            background: "var(--teal)",
            transform: i < current ? "scaleX(1)" : i === current ? "scaleX(var(--prog,0))" : "scaleX(0)",
            transformOrigin: "left",
            transition: i < current ? "transform 200ms ease" : "none",
          }}
            className={i === current ? "hero-prog-fill" : ""}
          />
        </button>
      ))}
      <span style={{
        marginLeft: 14, fontFamily: "var(--mono)", fontSize: 11,
        letterSpacing: "0.06em", color: "var(--slate)",
        fontVariantNumeric: "tabular-nums",
      }}>
        {String(current + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
      </span>
    </div>
  );
}

function Hero({ headline, layout, parallax }) {
  const data = window.GEMS_DATA.featured;
  const [idx, setIdx] = useState(0);
  const [prog, setProg] = useState(0);
  const heroRef = useRef(null);
  const DURATION = 6500;

  useEffect(() => {
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const elapsed = now - start;
      const p = Math.min(elapsed / DURATION, 1);
      setProg(p);
      if (p >= 1) setIdx((i) => (i + 1) % data.length);
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [idx, data.length]);

  // Parallax on hero image
  useEffect(() => {
    if (!parallax) return;
    const el = heroRef.current;
    if (!el) return;
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const y = Math.max(-200, Math.min(0, -r.top * 0.18));
      el.style.setProperty("--parallax-y", `${y}px`);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [parallax]);

  const cur = data[idx];

  // Layout rendering
  const renderLayout = () => {
    if (layout === "split") {
      return (
        <div className="hero-split" style={{
          display: "grid", gridTemplateColumns: "1.05fr 1fr",
          gap: 64, alignItems: "end", paddingTop: 140, paddingBottom: 64,
        }}>
          <div style={{ paddingBottom: 24 }}>
            <HeroHeadline variant={headline} />
            <p className="lede" style={{ color: "var(--slate)", marginTop: 36, maxWidth: "38ch" }}>
              A talent agency representing Singapore's most distinguished
              vocalists, performers, and music directors — for stages, screens,
              and broadcasts across Asia.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 40 }}>
              <a href="#roster" className="btn" style={{ background: "var(--cobalt)", color: "var(--white)", borderColor: "var(--cobalt)" }}>
                Meet the roster <ArrowRight />
              </a>
              <a href="#work" className="btn btn--ghost-ink">Recent work</a>
            </div>
          </div>
          <div ref={heroRef} style={{
            transform: parallax ? "translateY(var(--parallax-y, 0px))" : "none",
            willChange: "transform",
          }}>
            <FeaturedFrame project={cur} layout="split" />
          </div>
        </div>
      );
    }
    if (layout === "asymmetric") {
      return (
        <div className="hero-asym" style={{
          display: "grid", gridTemplateColumns: "1.4fr 1fr",
          gap: 80, alignItems: "stretch", paddingTop: 160, paddingBottom: 64,
          minHeight: 760,
        }}>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <HeroHeadline variant={headline} />
            <div style={{ maxWidth: "44ch", marginTop: 48 }}>
              <p className="lede" style={{ color: "var(--slate)" }}>
                A talent agency representing Singapore's most distinguished
                vocalists, performers, and music directors.
              </p>
              <div style={{ display: "flex", gap: 12, marginTop: 36 }}>
                <a href="#roster" className="btn" style={{ background: "var(--cobalt)", color: "var(--white)", borderColor: "var(--cobalt)" }}>
                  Meet the roster <ArrowRight />
                </a>
                <a href="#work" className="btn btn--ghost-ink">Recent work</a>
              </div>
            </div>
          </div>
          <div ref={heroRef} style={{
            transform: parallax ? "translateY(var(--parallax-y, 0px))" : "none",
            willChange: "transform",
            display: "flex",
          }}>
            <div style={{ flex: 1 }}>
              <FeaturedFrame project={cur} layout="asymmetric" />
            </div>
          </div>
        </div>
      );
    }
    // fullbleed
    return (
      <div ref={heroRef} style={{
        position: "absolute", inset: 0,
        transform: parallax ? "translateY(var(--parallax-y, 0px))" : "none",
        willChange: "transform",
      }}>
        <FeaturedFrame project={cur} layout="fullbleed" />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(14,26,43,0.7) 0%, rgba(14,26,43,0.3) 40%, rgba(14,26,43,0.85) 100%)",
        }} />
      </div>
    );
  };

  return (
    <section
      id="top"
      data-screen-label="Hero"
      style={{
        position: "relative",
        background: "var(--bone)",
        color: "var(--ink)",
        // Dynamic viewport — fills screen, recalcs as browser chrome shows/hides.
        // 100vh fallback covers pre-2022 browsers; modern engines pick 100dvh.
        minHeight: "100vh",
        minHeight: "100dvh",
        overflow: "hidden",
      }}
    >
      {layout === "fullbleed" && renderLayout()}

      <div className="container" style={{ position: "relative", zIndex: 2, minHeight: layout === "fullbleed" ? "100dvh" : "auto", display: "flex", flexDirection: "column" }}>
        {layout !== "fullbleed" && renderLayout()}

        {layout === "fullbleed" && (
          <div style={{
            paddingTop: 200, paddingBottom: 64, flex: 1,
            display: "flex", flexDirection: "column", justifyContent: "flex-end",
          }}>
            <div style={{ marginBottom: 40 }}>
              <span className="eyebrow"><span className="dot" />{cur.eyebrow}</span>
            </div>
            <HeroHeadline variant={headline} />
            <p className="lede" style={{ color: "var(--slate)", marginTop: 40, maxWidth: "44ch" }}>
              A talent agency representing Singapore's most distinguished
              vocalists, performers, and music directors — for stages, screens,
              and broadcasts across Asia.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 40 }}>
              <a href="#roster" className="btn" style={{ background: "var(--cobalt)", color: "var(--white)", borderColor: "var(--cobalt)" }}>
                Meet the roster <ArrowRight />
              </a>
              <a href="#work" className="btn btn--ghost-ink">Recent work</a>
            </div>
          </div>
        )}

        {/* Hero footer rail: project meta + progress */}
        <div className="hero-rail" style={{
          paddingBlock: 28,
          borderTop: "1px solid var(--hair)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1.5fr",
          gap: 40,
          alignItems: "center",
        }}>
          <div>
            <div className="eyebrow" style={{ color: "var(--slate)" }}>
              <span className="dot" /> Now featured
            </div>
            <div style={{
              fontSize: 18, fontWeight: 500, marginTop: 8,
              fontFamily: "var(--sans)", letterSpacing: "-0.005em",
            }}>
              {cur.title}
            </div>
            <div style={{ fontSize: 12.5, color: "var(--slate)", marginTop: 4 }}>
              {cur.role}
            </div>
          </div>
          <div className="mono" style={{ color: "var(--slate)" }}>
            {cur.meta}
          </div>
          <HeroProgress count={data.length} current={idx} onClick={(i) => { setIdx(i); }} />
        </div>
      </div>

      {/* live progress bar */}
      <style>{`
        .hero-prog-fill { transform: scaleX(${prog}) !important; }
      `}</style>
    </section>
  );
}

window.Hero = Hero;
