# RAINBOWSLUGS — Amiga Snail Race

Local multiplayer snail-race betting game in a chunky 8-bit horizontal-scrolling style.

**Play online:** [https://rainbowslugs.vercel.app](https://rainbowslugs.vercel.app)

## Play locally

Open `index.html` in a browser, or from this folder:

```bash
npm start
```

Then visit the URL shown (usually `http://localhost:5173`).

### Deploy to Vercel

```bash
npx vercel
```

For production:

```bash
npx vercel --prod
```

Or import the GitHub repo in the [Vercel dashboard](https://vercel.com/new) — no build command needed (static files).

## How it works

1. **Lobby** — add 2–6 players (each starts with 100 shells)
2. **Betting** — take turns picking a snail and wager
3. **Race** — snails scroll across a pixel track with chaos obstacles
4. **Results** — payouts at the posted odds if your snail finishes **1st**

### Obstacles (and DNFs)

Snails can fail to finish — those bets never pay:

- **Salt patch** — slows hard (Crunch sometimes eats through it)
- **Hungry bird** — may carry a snail away (DNF)
- **Nap attack** — mid-race snooze (Velvet loves this)
- **Mud bog** — sticky slowdown
- **Turbo lettuce** — temporary boost
- **Shell jam** — stuck, or cracked shell (DNF)
- **Wrong way** — reverse slime / wander off (DNF)
- **Time cut** — stragglers DNF after the leader finishes

## Stack

Pure HTML / CSS / Canvas JS — no build step required.

Chip-style SFX use the Web Audio API (toggle with **SFX: ON**).

Race BGM is the real **William Tell Overture** finale (U.S. Marine Band recording — public domain). See `audio/CREDITS.txt`.
