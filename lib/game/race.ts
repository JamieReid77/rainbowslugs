import { OBSTACLE_TYPES, SNAILS, TRACK_LENGTH } from './data';
import type { SnailState } from './types';

export interface Racer {
  id: string;
  name: string;
  color: string;
  body: string;
  shell: string;
  x: number;
  lane: number;
  baseSpeed: number;
  speed: number;
  state: SnailState;
  stateTimer: number;
  bob: number;
  finished: boolean;
  finishTime: number | null;
  dnf: boolean;
  dnfReason: string;
  nextEventAt: number;
}

export interface RaceEventMeta {
  kind?: string;
  sfx?: string | null;
  priority?: number;
}

export interface RaceHooks {
  onEvent?: (msg: string, meta?: RaceEventMeta) => void;
  onFinish?: (results: Racer[]) => void;
}

export type RaceHandle = {
  start: () => void;
  stop: () => void;
  getProgress: () => number;
  readonly elapsed: number;
  readonly finished: boolean;
  readonly racers: Racer[];
};

type Cloud = {
  x: number;
  y: number;
  w: number;
};

type Flower = {
  x: number;
  y: number;
  c: string;
};

type TrackObstacleKind = 'salt' | 'mud' | 'lettuce' | 'bird' | 'nap';

type TrackObstacle = {
  x: number;
  lane: number;
  kind: TrackObstacleKind;
  hit: boolean;
};

export const createRaceEngine = (
  canvas: HTMLCanvasElement,
  hooks: RaceHooks = {},
): RaceHandle => {
  const ctx = canvas.getContext('2d')!;

  const makeClouds = (): Cloud[] => {
    return Array.from({ length: 10 }, (_, i) => ({
      x: i * 280 + Math.random() * 120,
      y: 18 + Math.random() * 55,
      w: 48 + Math.random() * 56,
    }));
  };

  const makeFlowers = (): Flower[] => {
    return Array.from({ length: 48 }, () => ({
      x: Math.random() * (TRACK_LENGTH + 400),
      y: 0.55 + Math.random() * 0.35,
      c: ['#ff6b9d', '#ffd24a', '#4ef0d2', '#b388ff', '#ff9f43'][
        (Math.random() * 5) | 0
      ],
    }));
  };

  const makeTrackObstacles = (): TrackObstacle[] => {
    const kinds: TrackObstacleKind[] = [
      'salt',
      'mud',
      'lettuce',
      'bird',
      'nap',
    ];
    return Array.from({ length: 12 }, () => ({
      x: 320 + Math.random() * (TRACK_LENGTH - 560),
      lane: (Math.random() * SNAILS.length) | 0,
      kind: kinds[(Math.random() * kinds.length) | 0],
      hit: false,
    }));
  };

  let racers: Racer[] = [];
  let cameraX = 0;
  let elapsed = 0;
  let running = false;
  let finished = false;
  const clouds = makeClouds();
  const flowers = makeFlowers();
  let obstacles = makeTrackObstacles();
  let copperOffset = 0;
  let raf = 0;
  let last = 0;
  let finishAnnounced = new Set<string>();

  const triggerRandomEvent = (racer: Racer): void => {
    const roll = Math.random();
    let acc = 0;
    const total = OBSTACLE_TYPES.reduce((s, t) => s + t.chance, 0);
    for (const type of OBSTACLE_TYPES) {
      acc += type.chance;
      if (roll <= acc / total) {
        const result = type.apply(racer);
        if (result.message) {
          const priority = result.kind === 'dnf' ? 2 : 1;
          hooks.onEvent?.(result.message, {
            kind: result.kind,
            sfx: result.sfx,
            priority,
          });
        }
        return;
      }
    }
  };

  const applyObstacleByKind = (racer: Racer, kind: string): void => {
    const type = OBSTACLE_TYPES.find((t) => t.id === kind);
    if (!type) return;
    const result = type.apply(racer);
    if (result.message) {
      const priority = result.kind === 'dnf' ? 2 : 1;
      hooks.onEvent?.(result.message, {
        kind: result.kind,
        sfx: result.sfx,
        priority,
      });
    }
  };

  const rank = (): Racer[] => {
    const finishedRacers = racers
      .filter((r) => r.finished)
      .sort((a, b) => (a.finishTime ?? 0) - (b.finishTime ?? 0));
    const dnfs = racers.filter((r) => r.dnf);
    return [...finishedRacers, ...dnfs];
  };

  const drawCloud = (x: number, y: number, w: number): void => {
    ctx.fillStyle = '#e8f4ff';
    ctx.fillRect(x, y, w * 0.55, 12);
    ctx.fillRect(x + w * 0.18, y - 10, w * 0.45, 14);
    ctx.fillRect(x + w * 0.4, y - 4, w * 0.38, 12);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(x + 4, y + 2, w * 0.3, 4);
  };

  const drawHills = (cam: number, trackTop: number): void => {
    const w = canvas.width;
    const base = trackTop - 8;
    ctx.fillStyle = '#3d8b4f';
    ctx.beginPath();
    ctx.moveTo(0, base);
    for (let x = 0; x <= w; x += 20) {
      const wx = x + cam * 0.12;
      const y =
        base * 0.7 + Math.sin(wx * 0.012) * 18 + Math.sin(wx * 0.004) * 12;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, base);
    ctx.lineTo(0, base);
    ctx.fill();

    ctx.fillStyle = '#2d6b3a';
    ctx.beginPath();
    ctx.moveTo(0, base);
    for (let x = 0; x <= w; x += 24) {
      const wx = x + cam * 0.2;
      const y = base * 0.82 + Math.sin(wx * 0.018 + 1) * 14;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, base);
    ctx.lineTo(0, base);
    ctx.fill();
  };

  const drawObstacle = (
    x: number,
    y: number,
    kind: string,
    hit: boolean,
  ): void => {
    if (hit) {
      // leftover crumbs
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#fff';
      ctx.fillRect(x - 2, y + 4, 3, 3);
      ctx.fillRect(x + 4, y + 6, 2, 2);
      ctx.globalAlpha = 1;
      return;
    }
    const px = (ox: number, oy: number, pw: number, ph: number, c: string) => {
      ctx.fillStyle = c;
      ctx.fillRect(x + ox, y + oy, pw, ph);
    };

    if (kind === 'salt') {
      px(-10, 4, 22, 6, '#f8f9fa');
      px(-6, 0, 14, 6, '#e9ecef');
      px(-2, -4, 8, 6, '#fff');
      px(2, -2, 2, 2, '#adb5bd');
      px(-4, 2, 2, 2, '#ced4da');
      px(6, 2, 2, 2, '#adb5bd');
    } else if (kind === 'mud') {
      px(-14, 6, 28, 8, '#5c3317');
      px(-10, 2, 20, 6, '#7b4b2a');
      px(-4, 8, 4, 3, '#3d2314');
      px(6, 8, 5, 3, '#3d2314');
      px(-2, 0, 3, 3, '#a0673b');
      px(4, 2, 3, 3, '#a0673b');
    } else if (kind === 'lettuce') {
      px(-2, -2, 10, 10, '#52b788');
      px(-8, 2, 10, 8, '#40916c');
      px(4, 2, 10, 8, '#74c69d');
      px(0, 4, 6, 4, '#2d6a4f');
      px(2, 0, 2, 8, '#1b4332');
    } else if (kind === 'bird') {
      // body
      px(-2, -6, 10, 8, '#ff6b6b');
      px(6, -4, 6, 4, '#ff8787');
      // wing
      px(-10, -8, 10, 4, '#c92a2a');
      px(-14, -10, 6, 3, '#a61e1e');
      // beak
      px(12, -2, 6, 3, '#ffd43b');
      // eye
      px(4, -4, 2, 2, '#111');
      // feet
      px(0, 2, 2, 3, '#ffd43b');
      px(4, 2, 2, 3, '#ffd43b');
    } else if (kind === 'nap') {
      px(-8, 0, 18, 10, '#cbb2fe');
      px(-6, -4, 14, 6, '#e0aaff');
      px(-4, -2, 4, 4, '#fff');
      ctx.fillStyle = '#fff';
      ctx.font = "8px 'Press Start 2P', monospace";
      ctx.fillText('z', x + 10, y - 8);
      ctx.fillText('Z', x + 16, y - 16);
    } else {
      px(-6, -6, 12, 12, '#fff');
      px(-4, -4, 8, 8, '#ff00aa');
    }
  };

  const drawSnail = (x: number, y: number, r: Racer, labelY?: number): void => {
    const scale = 1.05;

    if (r.dnf) ctx.globalAlpha = 0.4;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 12, 28 * scale, 4);

    // Antennae
    ctx.strokeStyle = r.body;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 22 * scale, y - 4);
    ctx.lineTo(x + 28 * scale, y - 14 - (r.state === 'napping' ? -4 : 0));
    ctx.moveTo(x + 18 * scale, y - 4);
    ctx.lineTo(x + 22 * scale, y - 12);
    ctx.stroke();
    ctx.fillStyle = '#111';
    ctx.fillRect(x + 27 * scale, y - 16, 3, 3);
    ctx.fillRect(x + 21 * scale, y - 14, 3, 3);

    // Body
    ctx.fillStyle = r.body;
    ctx.fillRect(x, y, 26 * scale, 10 * scale);
    ctx.fillRect(x + 20 * scale, y - 4, 10 * scale, 10 * scale);
    // highlight
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(x + 2, y + 1, 14 * scale, 3);

    // Shell — chunkier Amiga orb
    ctx.fillStyle = r.shell;
    ctx.beginPath();
    ctx.arc(x + 10 * scale, y + 1, 12 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.arc(x + 6 * scale, y - 2, 4 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + 10 * scale, y + 1, 7 * scale, 0.2, Math.PI * 1.6);
    ctx.stroke();

    if (r.state === 'boost') {
      ctx.fillStyle = '#ffe66d';
      ctx.fillRect(x - 12, y + 2, 10, 4);
      ctx.fillRect(x - 18, y + 5, 8, 3);
      ctx.fillStyle = '#ff00aa';
      ctx.fillRect(x - 8, y, 6, 3);
    }
    if (r.state === 'napping') {
      ctx.fillStyle = '#fff';
      ctx.font = "8px 'Press Start 2P', monospace";
      ctx.fillText('z', x + 8, y - 18);
      ctx.fillText('Z', x + 16, y - 26);
    }
    if (r.state === 'slow' || r.state === 'stuck') {
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillRect(x + 4, y + 12, 4, 4);
      ctx.fillRect(x + 12, y + 14, 3, 3);
    }
    if (r.dnf) {
      ctx.fillStyle = '#ff0055';
      ctx.font = "7px 'Press Start 2P', monospace";
      ctx.fillText('DNF', x, y - 20);
    }

    const tagY = labelY ?? y + 16;
    ctx.globalAlpha = r.dnf ? 0.4 : 1;
    ctx.fillStyle = '#111';
    ctx.fillRect(x - 4, tagY, 52, 13);
    ctx.fillStyle = r.color;
    ctx.fillRect(x - 3, tagY + 1, 50, 11);
    ctx.fillStyle = '#111';
    ctx.font = "7px 'Press Start 2P', monospace";
    ctx.fillText(r.name, x - 1, tagY + 10);

    ctx.globalAlpha = 1;
  };

  const draw = (): void => {
    const w = canvas.width;
    const h = canvas.height;
    const cam = cameraX;

    // Layout: sky / verge / dirt lanes / label gutter (bottom lane fully visible)
    const labelGutter = 28;
    const trackTop = Math.floor(h * 0.34);
    const trackHeight = h - trackTop - labelGutter;
    const laneH = trackHeight / SNAILS.length;
    const trackBottom = trackTop + trackHeight;

    ctx.fillStyle = '#1a1a3a';
    ctx.fillRect(0, 0, w, h);

    for (let y = 0; y < trackTop - 16; y += 4) {
      const t = y / Math.max(1, trackTop - 16);
      const shift = Math.sin((y + copperOffset) * 0.04) * 0.08;
      const r = Math.floor(40 + t * 80 + shift * 40);
      const g = Math.floor(80 + t * 100);
      const b = Math.floor(180 + t * 40);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(0, y, w, 4);
    }

    for (const c of clouds) {
      const cx = ((c.x - cam * 0.25) % (w + 220)) - 110;
      drawCloud(cx, Math.min(c.y, trackTop - 40), c.w);
    }

    drawHills(cam, trackTop);

    const vergeTop = trackTop - 16;
    for (let x = 0; x < w; x += 16) {
      const wx = Math.floor((x + cam) / 16);
      ctx.fillStyle = wx % 2 === 0 ? '#2d6b2d' : '#3d8f3d';
      ctx.fillRect(x, vergeTop, 16, 16);
    }

    for (let i = 0; i < SNAILS.length; i++) {
      const ly = trackTop + i * laneH;
      ctx.fillStyle = i % 2 === 0 ? '#c9a227' : '#a67c1a';
      ctx.fillRect(0, ly, w, laneH + 1);
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      for (let px = 0; px < w; px += 8) {
        if ((px / 8 + i) % 2 === 0) ctx.fillRect(px, ly, 4, laneH);
      }
      ctx.fillStyle = '#5c3d0e';
      ctx.fillRect(0, ly + laneH - 2, w, 2);
    }

    ctx.fillStyle = '#3d2914';
    ctx.fillRect(0, trackBottom, w, labelGutter);
    ctx.fillStyle = '#5c3d0e';
    ctx.fillRect(0, trackBottom, w, 2);

    for (const f of flowers) {
      const fx = f.x - cam;
      if (fx < -20 || fx > w + 20) continue;
      const fy = trackTop - 12 + f.y * 6;
      ctx.fillStyle = f.c;
      ctx.fillRect(fx, fy, 5, 5);
      ctx.fillRect(fx - 3, fy + 2, 3, 3);
      ctx.fillRect(fx + 5, fy + 2, 3, 3);
      ctx.fillStyle = '#1b4332';
      ctx.fillRect(fx + 1, fy + 5, 2, 7);
    }

    for (let m = 0; m <= TRACK_LENGTH; m += 200) {
      const mx = m - cam;
      if (mx < -10 || mx > w + 10) continue;
      ctx.fillStyle = '#fff';
      ctx.fillRect(mx, trackTop, 4, trackHeight);
      ctx.fillStyle = '#111';
      ctx.fillRect(mx + 4, trackTop, 28, 14);
      ctx.fillStyle = '#ffd24a';
      ctx.font = "8px 'Press Start 2P', monospace";
      ctx.fillText(`${m}`, mx + 6, trackTop + 11);
    }

    const finishX = TRACK_LENGTH - cam;
    if (finishX > -40 && finishX < w + 40) {
      for (let y = 0; y < trackHeight; y += 12) {
        for (let x = 0; x < 28; x += 12) {
          ctx.fillStyle = ((x + y) / 12) % 2 === 0 ? '#111' : '#eee';
          ctx.fillRect(finishX + x, trackTop + y, 12, 12);
        }
      }
      ctx.fillStyle = '#ff00aa';
      ctx.fillRect(finishX - 4, trackTop - 20, 88, 16);
      ctx.fillStyle = '#fff';
      ctx.font = "10px 'Press Start 2P', monospace";
      ctx.fillText('FINISH', finishX, trackTop - 8);
    }

    const startX = 40 - cam;
    if (startX > -20 && startX < w + 20) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(startX, trackTop, 5, trackHeight);
      ctx.fillStyle = '#00e5ff';
      ctx.fillRect(startX - 2, trackTop, 2, trackHeight);
    }

    for (const ob of obstacles) {
      const ox = ob.x - cam;
      if (ox < -40 || ox > w + 40) continue;
      const oy = trackTop + ob.lane * laneH + laneH * 0.5;
      drawObstacle(ox, oy, ob.kind, ob.hit);
    }

    for (const r of racers) {
      const sx = r.x - cam + 40;
      const sy = trackTop + r.lane * laneH + laneH * 0.4 + Math.sin(r.bob) * 2;
      drawSnail(sx, sy, r, trackBottom + 4);
    }

    const lead = Math.max(0, ...racers.map((r) => (r.dnf ? 0 : r.x)));
    const pct = Math.min(1, lead / TRACK_LENGTH);
    ctx.fillStyle = '#111';
    ctx.fillRect(12, 8, w - 24, 14);
    ctx.fillStyle = '#ff00aa';
    ctx.fillRect(14, 10, (w - 28) * pct, 10);
    ctx.fillStyle = '#00e5ff';
    ctx.fillRect(14, 10, 3, 10);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 8, w - 24, 14);
  };

  const update = (dt: number): void => {
    elapsed += dt;
    copperOffset += dt * 40;

    for (const r of racers) {
      if (r.finished || r.dnf) continue;

      r.bob += dt * 8;
      r.stateTimer -= dt;

      if (r.stateTimer <= 0 && r.state !== 'idle') {
        r.state = 'idle';
        r.speed = r.baseSpeed * (0.9 + Math.random() * 0.25);
      }

      if (elapsed >= r.nextEventAt && !r.dnf && !r.finished) {
        triggerRandomEvent(r);
        r.nextEventAt = elapsed + 4.5 + Math.random() * 5.5;
      }

      for (const ob of obstacles) {
        if (ob.hit || ob.lane !== r.lane) continue;
        if (Math.abs(r.x - ob.x) < 18) {
          ob.hit = true;
          applyObstacleByKind(r, ob.kind);
        }
      }

      if (r.state === 'idle') {
        r.speed += (Math.random() - 0.5) * 18 * dt;
        r.speed = Math.max(
          r.baseSpeed * 0.55,
          Math.min(r.baseSpeed * 1.35, r.speed),
        );
      }

      r.x += r.speed * dt;

      if (r.x >= TRACK_LENGTH) {
        r.x = TRACK_LENGTH;
        r.finished = true;
        r.finishTime = elapsed;
        r.speed = 0;
        if (!finishAnnounced.has(r.id)) {
          finishAnnounced.add(r.id);
          const place = racers.filter((x) => x.finished).length;
          const placeWord =
            ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'][
              place - 1
            ] || 'home';
          hooks.onEvent?.(`${r.name} crosses the line in ${placeWord} place!`, {
            kind: 'finish',
            sfx: 'finish',
            priority: place === 1 ? 3 : 2,
          });
        }
      }
    }

    const active = racers.filter((r) => !r.dnf);
    const leadX = active.length
      ? Math.max(...active.map((r) => r.x))
      : TRACK_LENGTH;
    const targetCam = Math.max(0, leadX - canvas.width * 0.35);
    cameraX += (targetCam - cameraX) * Math.min(1, dt * 3);

    const finishers = racers.filter((r) => r.finished);
    if (finishers.length >= 1) {
      const firstTime = Math.min(
        ...finishers.map((r) => r.finishTime ?? Infinity),
      );
      for (const r of racers) {
        if (!r.finished && !r.dnf && elapsed - firstTime > 14) {
          r.dnf = true;
          r.speed = 0;
          r.dnfReason = "didn't make it in time";
          hooks.onEvent?.(
            `Time's up — ${r.name} didn't make it to the finish!`,
            { kind: 'dnf', sfx: 'dnf', priority: 2 },
          );
        }
      }
    }

    if (racers.every((r) => r.finished || r.dnf)) {
      if (!finished) {
        finished = true;
        running = false;
        const results = rank();
        setTimeout(() => hooks.onFinish?.(results), 1400);
      }
    }
  };

  const loop = (): void => {
    if (!running) return;
    const now = performance.now();
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    draw();
    raf = requestAnimationFrame(loop);
  };

  const start = (): void => {
    racers = SNAILS.map((s, i) => {
      const base = 55 + Math.random() * 35 + (s.id === 'zippy' ? 12 : 0);
      return {
        id: s.id,
        name: s.name,
        color: s.color,
        body: s.body,
        shell: s.shell,
        x: 20 + Math.random() * 8,
        lane: i,
        baseSpeed: base,
        speed: base * (0.85 + Math.random() * 0.3),
        state: 'idle' as SnailState,
        stateTimer: 0,
        bob: Math.random() * Math.PI * 2,
        finished: false,
        finishTime: null,
        dnf: false,
        dnfReason: '',
        nextEventAt: 3.5 + Math.random() * 4 + i * 0.35,
      };
    });
    cameraX = 0;
    elapsed = 0;
    running = true;
    finished = false;
    finishAnnounced = new Set();
    obstacles = makeTrackObstacles();
    last = performance.now();
    hooks.onEvent?.("And they're OFF! What a colourful field today!", {
      kind: 'start',
      sfx: null,
      priority: 2,
    });
    loop();
  };

  const stop = (): void => {
    running = false;
    cancelAnimationFrame(raf);
  };

  const getProgress = (): number => {
    const lead = Math.max(0, ...racers.map((r) => (r.dnf ? 0 : r.x)));
    return Math.min(100, Math.floor((lead / TRACK_LENGTH) * 100));
  };

  return {
    start,
    stop,
    getProgress,
    get elapsed() {
      return elapsed;
    },
    get finished() {
      return finished;
    },
    get racers() {
      return racers;
    },
  };
};
