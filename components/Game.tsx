"use client";

import { useEffect, useRef } from "react";
import { bootGame } from "@/lib/game/main.js";

export default function Game() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    return bootGame(rootRef.current);
  }, []);

  return (
    <div className="crt" ref={rootRef}>
      <div className="scanlines" aria-hidden="true" />
      <button id="btn-mute" className="mute-btn" type="button" title="Toggle sound">
        SFX: ON
      </button>
      <div id="app">
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
                <button type="button" className="chip" data-amt="5">
                  5
                </button>
                <button type="button" className="chip" data-amt="10">
                  10
                </button>
                <button type="button" className="chip" data-amt="25">
                  25
                </button>
                <button type="button" className="chip" data-amt="50">
                  50
                </button>
                <button type="button" className="chip" data-amt="all">
                  ALL IN
                </button>
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
      </div>
    </div>
  );
}
