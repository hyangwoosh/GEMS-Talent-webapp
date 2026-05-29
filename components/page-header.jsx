/* GEMS Talent — Page header (used on inner pages) */

function PageHeader({ eyebrow, title, sub, image }) {
  return (
    <section data-screen-label="Page header" style={{
      position: "relative", background: "var(--ink)", color: "var(--bone)",
      paddingTop: 200, paddingBottom: 100, overflow: "hidden",
    }}>
      {image && (
        <>
          <img src={image} alt=""
               style={{
                 position: "absolute", inset: 0,
                 width: "100%", height: "100%", objectFit: "cover",
                 opacity: 0.35,
                 filter: "brightness(0.7) saturate(0.85)",
               }} />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(180deg, rgba(14,26,43,0.7) 0%, rgba(14,26,43,0.95) 100%)",
          }} />
        </>
      )}
      <div className="container" style={{ position: "relative", zIndex: 2 }}>
        <div className="rail-grid">
          <div className="sec-rail" style={{ position: "static", color: "rgba(250,247,242,0.55)" }}>
            <span className="num" style={{ color: "var(--brass)" }}>{eyebrow.num}</span>
            {eyebrow.label}
          </div>
          <div>
            <h1 className="display" style={{ fontSize: "clamp(56px, 7vw, 116px)" }}>
              {title}
            </h1>
            {sub && (
              <p className="lede" style={{
                color: "rgba(250,247,242,0.75)", marginTop: 32, maxWidth: "52ch",
              }}>
                {sub}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

window.PageHeader = PageHeader;
