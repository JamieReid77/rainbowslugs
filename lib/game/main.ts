import { createCommentary, type CommentaryHandle } from "./commentary";
import {
  PLAYER_COLORS,
  SNAILS,
  STARTING_BANK,
  payout,
  rollOdds,
  type Bet,
  type Player,
} from "./data";
import { createRaceEngine, type RaceHandle, type Racer } from "./race";
import { sfx } from "./sfx";

/** Boot the imperative game UI inside a root element. */
export function bootGame(root: ParentNode): () => void {
  const $ = <T extends HTMLElement = HTMLElement>(id: string) => {
    const el = root.querySelector(`#${id}`);
    if (!el) throw new Error(`Missing #${id}`);
    return el as T;
  };

  let players: Player[] = [];
  let bets: Bet[] = [];
  let odds: Record<string, number> = {};
  let bettingIndex = 0;
  let race: RaceHandle | null = null;
  let commentary: CommentaryHandle | null = null;
  const intervals: ReturnType<typeof setInterval>[] = [];
  const timeouts: ReturnType<typeof setTimeout>[] = [];

  const trackInterval = (id: ReturnType<typeof setInterval>) => {
    intervals.push(id);
    return id;
  };
  const trackTimeout = (id: ReturnType<typeof setTimeout>) => {
    timeouts.push(id);
    return id;
  };

  const show = (screenId: string) => {
    root.querySelectorAll(".screen").forEach((el) => el.classList.remove("active"));
    $(screenId).classList.add("active");
  };

  const uid = () => Math.random().toString(36).slice(2, 9);
  const escapeAttr = (s: string) => s.replace(/"/g, "&quot;");

  const onPointerDown = () => sfx.unlock();
  document.addEventListener("pointerdown", onPointerDown, { once: true });

  const onMute = () => {
    const muted = sfx.toggleMute();
    $("btn-mute").textContent = muted ? "SFX: OFF" : "SFX: ON";
    sfx.unlock();
  };
  $("btn-mute").addEventListener("click", onMute);

  const onStart = () => {
    sfx.unlock();
    sfx.click();
    players = [
      {
        id: uid(),
        name: "PLAYER 1",
        color: PLAYER_COLORS[0],
        bank: STARTING_BANK,
      },
      {
        id: uid(),
        name: "PLAYER 2",
        color: PLAYER_COLORS[1],
        bank: STARTING_BANK,
      },
    ];
    renderLobby();
    show("screen-lobby");
  };
  $("btn-start").addEventListener("click", onStart);

  const renderLobby = () => {
    const list = $("lobby-list");
    list.innerHTML = "";
    players.forEach((p, i) => {
      const row = document.createElement("div");
      row.className = "player-row";
      row.innerHTML = `
      <div class="player-swatch" style="background:${p.color}"></div>
      <input type="text" maxlength="12" value="${escapeAttr(p.name)}" data-i="${i}" />
      <span class="player-bank">🐚 ${p.bank}</span>
      <button class="btn-mini" data-remove="${i}" ${players.length <= 2 ? "disabled" : ""}>X</button>
    `;
      list.appendChild(row);
    });

    list.querySelectorAll("input").forEach((input) => {
      input.addEventListener("change", (e) => {
        const t = e.target as HTMLInputElement;
        const i = Number(t.dataset.i);
        players[i].name = t.value.trim().toUpperCase() || `PLAYER ${i + 1}`;
      });
    });

    list.querySelectorAll("[data-remove]").forEach((btn) => {
      btn.addEventListener("click", () => {
        sfx.click();
        const i = Number((btn as HTMLElement).dataset.remove);
        if (players.length <= 2) return;
        players.splice(i, 1);
        renderLobby();
      });
    });

    $<HTMLButtonElement>("btn-to-betting").disabled = players.length < 2;
    $<HTMLButtonElement>("btn-add-player").disabled = players.length >= 6;
  };

  const onAddPlayer = () => {
    sfx.click();
    if (players.length >= 6) return;
    const i = players.length;
    players.push({
      id: uid(),
      name: `PLAYER ${i + 1}`,
      color: PLAYER_COLORS[i % PLAYER_COLORS.length],
      bank: STARTING_BANK,
    });
    renderLobby();
  };
  $("btn-add-player").addEventListener("click", onAddPlayer);

  const onToBetting = () => {
    sfx.click();
    $("lobby-list")
      .querySelectorAll("input")
      .forEach((input) => {
        const t = input as HTMLInputElement;
        const i = Number(t.dataset.i);
        players[i].name = t.value.trim().toUpperCase() || `PLAYER ${i + 1}`;
      });

    players = players.filter((p) => p.bank > 0);
    if (players.length < 1) {
      alert("Nobody has shells left! Start a new game.");
      return;
    }

    bets = [];
    bettingIndex = 0;
    odds = rollOdds(SNAILS);
    renderBetting();
    show("screen-betting");
  };
  $("btn-to-betting").addEventListener("click", onToBetting);

  const renderBetting = () => {
    const solvent = players.filter((p) => p.bank > 0);
    if (bettingIndex >= solvent.length) {
      startRace();
      return;
    }

    const player = solvent[bettingIndex];
    $("betting-turn-label").textContent = `${player.name}'s turn`;
    $("bet-player-name").textContent = player.name;
    $("bet-player-name").style.color = player.color;
    $("bet-bank").textContent = `Shells: ${player.bank}`;

    $("snail-odds").innerHTML = SNAILS.map(
      (s) => `
    <div class="odds-card">
      <div class="dot" style="background:${s.color}"></div>
      <div>
        <div class="name">${s.name}</div>
        <div class="meta">${s.personality}</div>
      </div>
      <div class="odds">${odds[s.id].toFixed(1)}x</div>
    </div>
  `,
    ).join("");

    $<HTMLSelectElement>("bet-snail").innerHTML = SNAILS.map(
      (s) =>
        `<option value="${s.id}">${s.name} (${odds[s.id].toFixed(1)}x)</option>`,
    ).join("");

    const amount = $<HTMLInputElement>("bet-amount");
    amount.max = String(player.bank);
    amount.value = String(Math.min(10, player.bank));

    $("bets-placed").innerHTML = bets
      .map((b) => {
        const pl = players.find((p) => p.id === b.playerId);
        const sn = SNAILS.find((s) => s.id === b.snailId);
        return `<div class="bet-chip">${pl?.name} → <strong>${sn?.name}</strong> · ${b.amount}</div>`;
      })
      .join("");

    $("bet-hint").textContent =
      "Winner pays odds. DNF never pays — even if it's George.";
  };

  const chipHandlers: Array<() => void> = [];
  root.querySelectorAll(".chip").forEach((btn) => {
    const handler = () => {
      sfx.click();
      const solvent = players.filter((p) => p.bank > 0);
      const player = solvent[bettingIndex];
      if (!player) return;
      const amt = (btn as HTMLElement).dataset.amt;
      const input = $<HTMLInputElement>("bet-amount");
      if (amt === "all") input.value = String(player.bank);
      else input.value = String(Math.min(player.bank, Number(amt)));
    };
    chipHandlers.push(handler);
    btn.addEventListener("click", handler);
  });

  const onLockBet = () => {
    const solvent = players.filter((p) => p.bank > 0);
    const player = solvent[bettingIndex];
    if (!player) return;

    const snailId = $<HTMLSelectElement>("bet-snail").value;
    let amount = Math.floor(Number($<HTMLInputElement>("bet-amount").value));
    if (!Number.isFinite(amount) || amount < 1) {
      alert("Bet at least 1 shell.");
      return;
    }
    amount = Math.min(amount, player.bank);

    player.bank -= amount;
    bets.push({ playerId: player.id, snailId, amount });
    bettingIndex += 1;
    sfx.bet();
    renderBetting();
  };
  $("btn-lock-bet").addEventListener("click", onLockBet);

  const settleBets = (results: Racer[]) => {
    const winner = results.find((r) => r.finished);
    for (const bet of bets) {
      const player = players.find((p) => p.id === bet.playerId);
      if (!player) continue;
      if (winner && bet.snailId === winner.id) {
        player.bank += payout(bet.amount, odds[bet.snailId]);
      }
    }
  };

  const showResults = (results: Racer[]) => {
    show("screen-results");
    const winner = results.find((r) => r.finished);
    $("winner-banner").textContent = winner
      ? `🏆 ${winner.name} WINS THE RAINBOW CUP!`
      : "Everyone DNFed. Chaos in the garden.";

    $("podium").innerHTML =
      `<h3>FINISH ORDER</h3>` +
      results
        .map((r, i) => {
          if (r.dnf) {
            return `<div class="finish-row"><span>${r.name}</span><span class="dnf">DNF — ${r.dnfReason}</span></div>`;
          }
          const place =
            ["1st", "2nd", "3rd", "4th", "5th", "6th"][i] || `${i + 1}th`;
          return `<div class="finish-row"><span>${place} · ${r.name}</span><span>${(r.finishTime ?? 0).toFixed(1)}s</span></div>`;
        })
        .join("");

    const winnerId = winner?.id;
    $("payouts").innerHTML =
      `<h3>PAYOUTS</h3>` +
      (bets.length
        ? bets
            .map((b) => {
              const pl = players.find((p) => p.id === b.playerId);
              const sn = SNAILS.find((s) => s.id === b.snailId);
              const won = winnerId && b.snailId === winnerId;
              const pay = won ? payout(b.amount, odds[b.snailId]) : 0;
              return `<div class="pay-row"><span>${pl?.name} on ${sn?.name}</span><span class="${won ? "win" : "lose"}">${won ? `+${pay}` : `-${b.amount}`}</span></div>`;
            })
            .join("")
        : `<div class="pay-row"><span>No bets</span><span>—</span></div>`);

    const ranked = [...players].sort((a, b) => b.bank - a.bank);
    $("standings").innerHTML =
      `<h3>SHELL STANDINGS</h3>` +
      ranked
        .map(
          (p, i) =>
            `<div class="stand-row"><span style="color:${p.color}">#${i + 1} ${p.name}</span><span class="gold">${p.bank} 🐚</span></div>`,
        )
        .join("");
  };

  const startRace = () => {
    show("screen-race");
    const canvas = $<HTMLCanvasElement>("race-canvas");
    const cssW = canvas.clientWidth || 960;
    const cssH = Math.round(cssW * (480 / 960));
    canvas.width = 960;
    canvas.height = 480;
    canvas.style.height = `${cssH}px`;

    $("lane-legend").innerHTML = SNAILS.map(
      (s) =>
        `<div class="legend-item"><i style="background:${s.color}"></i>${s.name}</div>`,
    ).join("");

    commentary?.clear();
    commentary = createCommentary($("hud-event"), {
      onShow(_msg, meta) {
        if (meta?.sfx) sfx.play(meta.sfx);
      },
    });

    $("hud-progress").textContent = "0%";
    $("hud-time").textContent = "0.0s";

    race?.stop();
    race = createRaceEngine(canvas, {
      onEvent(msg, meta = {}) {
        const hold =
          meta.kind === "dnf" || meta.kind === "finish"
            ? 3200
            : meta.kind === "start"
              ? 2800
              : 2600;
        commentary?.say(msg, {
          priority: meta.priority ?? 1,
          hold,
          meta,
        });
      },
      onFinish(results) {
        sfx.stopRaceMusic();
        sfx.win();
        settleBets(results);
        showResults(results);
      },
    });

    let countdown = 3;
    commentary?.say(String(countdown), { priority: 3, hold: 900 });
    sfx.countdown();
    const tick = trackInterval(
      setInterval(() => {
        countdown -= 1;
        if (countdown > 0) {
          commentary?.say(String(countdown), { priority: 3, hold: 900 });
          sfx.countdown();
        } else {
          clearInterval(tick);
          commentary?.say("GO!", { priority: 3, hold: 1200 });
          sfx.go();
          sfx.startRaceMusic();
          trackTimeout(
            setTimeout(() => {
              race?.start();
              trackInterval(
                setInterval(() => {
                  if (!race || race.finished) return;
                  $("hud-progress").textContent = `${race.getProgress()}%`;
                  $("hud-time").textContent = `${race.elapsed.toFixed(1)}s`;
                }, 100),
              );
            }, 400),
          );
        }
      }, 1000),
    );
  };

  const onRematch = () => {
    sfx.click();
    players = players.filter((p) => p.bank > 0);
    if (players.length < 1) {
      alert("Everyone is broke! New game required.");
      location.reload();
      return;
    }
    bets = [];
    bettingIndex = 0;
    odds = rollOdds(SNAILS);
    renderBetting();
    show("screen-betting");
  };
  $("btn-rematch").addEventListener("click", onRematch);

  const onNewGame = () => {
    sfx.click();
    location.reload();
  };
  $("btn-new-game").addEventListener("click", onNewGame);

  return () => {
    race?.stop();
    sfx.stopRaceMusic();
    commentary?.clear();
    intervals.forEach(clearInterval);
    timeouts.forEach(clearTimeout);
    document.removeEventListener("pointerdown", onPointerDown);
    $("btn-mute").removeEventListener("click", onMute);
    $("btn-start").removeEventListener("click", onStart);
    $("btn-add-player").removeEventListener("click", onAddPlayer);
    $("btn-to-betting").removeEventListener("click", onToBetting);
    $("btn-lock-bet").removeEventListener("click", onLockBet);
    $("btn-rematch").removeEventListener("click", onRematch);
    $("btn-new-game").removeEventListener("click", onNewGame);
    root.querySelectorAll(".chip").forEach((btn, i) => {
      const handler = chipHandlers[i];
      if (handler) btn.removeEventListener("click", handler);
    });
  };
}
