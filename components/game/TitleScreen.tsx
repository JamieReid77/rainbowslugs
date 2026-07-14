export const TitleScreen = () => (
  <section id="screen-title" className="screen active">
    <div className="title-wrap">
      <p className="blink coin-insert">★ AMIGA DISK 1 ★</p>
      <h1 className="logo">
        <span className="logo-slug">RAINBOW</span>
        <span className="logo-arena">SLUGS</span>
      </h1>
      <p className="tagline">90s AMIGA · RAINBOW GARDEN RACE</p>
      <div className="title-snails" aria-hidden="true">
        <div className="pixel-snail s1" />
        <div className="pixel-snail s2" />
        <div className="pixel-snail s3" />
      </div>
      <p className="cast-line">
        ZIPPY · GEORGE · BUNGLE · GEOFFREY · JANE · FREDDY
      </p>
      <button id="btn-start" className="btn btn-primary">
        PRESS START
      </button>
      <p className="hint">2–6 local players · bet · watch the garden chaos</p>
    </div>
  </section>
);
