export const RaceScreen = () => (
  <section id="screen-race" className="screen">
    <header className="race-hud">
      <div className="hud-left">
        <span className="hud-label">LAP</span>
        <span id="hud-progress">0%</span>
      </div>
      <div className="hud-center">
        <div className="commentary-box">
          <span className="comm-label">COMM</span>
          <span id="hud-event" className="hud-event">
            READY…
          </span>
        </div>
      </div>
      <div className="hud-right">
        <span className="hud-label">TIME</span>
        <span id="hud-time">0.0s</span>
      </div>
    </header>
    <canvas id="race-canvas" width={960} height={480} />
    <div className="lane-legend" id="lane-legend" />
  </section>
);
