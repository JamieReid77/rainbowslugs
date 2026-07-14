export const ResultsScreen = () => (
  <section id="screen-results" className="screen">
    <header className="screen-header">
      <h2>RACE RESULTS</h2>
      <p className="sub" id="winner-banner">
        —
      </p>
    </header>
    <div className="results-grid">
      <div className="podium" id="podium" />
      <div className="payouts" id="payouts" />
    </div>
    <div className="standings" id="standings" />
    <div className="lobby-actions">
      <button id="btn-rematch" className="btn btn-primary">
        NEXT RACE
      </button>
      <button id="btn-new-game" className="btn">
        NEW GAME
      </button>
    </div>
  </section>
);
