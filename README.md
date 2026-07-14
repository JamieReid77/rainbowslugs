# RAINBOWSLUGS — Amiga Snail Race

Local multiplayer snail-race betting game in a chunky 8-bit / 90s Amiga style.

**Play online:** [https://rainbowslugs.vercel.app](https://rainbowslugs.vercel.app)

## Play locally

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Stack

Next.js App Router + React client game shell, Canvas race engine, Web Audio SFX.

Race BGM is the real **William Tell Overture** finale (U.S. Marine Band recording — public domain). See `public/audio/CREDITS.txt`.

## How it works

1. **Lobby** — add 2–6 players (each starts with 100 shells)
2. **Betting** — take turns picking a snail and wager
3. **Race** — snails scroll across a pixel track with chaos obstacles
4. **Results** — payouts at the posted odds if your snail finishes **1st**

### Obstacles (and DNFs)

Snails can fail to finish — those bets never pay:

- **Salt patch** — slows hard (Bungle sometimes eats through it)
- **Hungry bird** — may carry a snail away (DNF)
- **Nap attack** — mid-race snooze (George loves this)
- **Mud bog** — sticky slowdown
- **Turbo lettuce** — temporary boost
- **Shell jam** — stuck, or cracked shell (DNF)
- **Wrong way** — reverse slime / wander off (DNF)
- **Time cut** — stragglers DNF after the leader finishes

## Deploy

Pushes to `main` on GitHub deploy via Vercel (project linked to this repo).

```bash
npm run build
npx vercel --prod
```
