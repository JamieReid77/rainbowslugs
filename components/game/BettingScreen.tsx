const BET_CHIPS = [
  { amt: '5', label: '5' },
  { amt: '10', label: '10' },
  { amt: '25', label: '25' },
  { amt: '50', label: '50' },
  { amt: 'all', label: 'ALL IN' },
] as const;

export const BettingScreen = () => (
  <section id="screen-betting" className="screen">
    <header className="screen-header">
      <h2>PLACE YOUR BETS</h2>
      <p className="sub" id="betting-turn-label">
        Player 1&apos;s turn
      </p>
    </header>
    <div className="betting-layout">
      <div className="snail-odds" id="snail-odds" />
      <div className="bet-panel">
        <p className="bet-player" id="bet-player-name">
          —
        </p>
        <p className="bet-bank" id="bet-bank">
          Shells: 100
        </p>
        <label className="field">
          <span>SNAIL</span>
          <select id="bet-snail" />
        </label>
        <label className="field">
          <span>AMOUNT</span>
          <input
            id="bet-amount"
            type="number"
            min={1}
            step={1}
            defaultValue={10}
          />
        </label>
        <div className="chip-row">
          {BET_CHIPS.map(({ amt, label }) => (
            <button key={amt} type="button" className="chip" data-amt={amt}>
              {label}
            </button>
          ))}
        </div>
        <button id="btn-lock-bet" className="btn btn-primary">
          LOCK BET
        </button>
        <p className="hint" id="bet-hint">
          Pick a snail. Odds pay if they finish 1st.
        </p>
      </div>
    </div>
    <div className="bets-placed" id="bets-placed" />
  </section>
);
