export const LobbyScreen = () => (
  <section id="screen-lobby" className="screen">
    <header className="screen-header">
      <h2>PLAYER LOBBY</h2>
      <p className="sub">
        Each racer starts with <span className="gold">100</span> shells
      </p>
    </header>
    <div className="lobby-list" id="lobby-list" />
    <div className="lobby-actions">
      <button id="btn-add-player" className="btn">
        + ADD PLAYER
      </button>
      <button id="btn-to-betting" className="btn btn-primary" disabled>
        GO TO BETTING →
      </button>
    </div>
  </section>
);
