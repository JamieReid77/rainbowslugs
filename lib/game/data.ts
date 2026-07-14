export type SnailState =
  | "idle"
  | "boost"
  | "slow"
  | "stuck"
  | "napping"
  | "dnf";

export type Snail = {
  id: string;
  name: string;
  color: string;
  body: string;
  shell: string;
  personality: string;
  baseOdds: number;
};

export type Player = {
  id: string;
  name: string;
  color: string;
  bank: number;
};

export type Bet = {
  playerId: string;
  snailId: string;
  amount: number;
};

/** Mutable racer state used by obstacle apply + race loop */
export type ObstacleRacer = {
  id: string;
  name: string;
  x: number;
  speed: number;
  state: SnailState;
  stateTimer: number;
  finished: boolean;
  dnf: boolean;
  dnfReason: string;
};

export type ObstacleResult = {
  message: string;
  kind: string;
  sfx: string | null;
};

export type ObstacleType = {
  id: string;
  label: string;
  chance: number;
  apply: (racer: ObstacleRacer) => ObstacleResult;
};

export const STARTING_BANK = 100;
export const TRACK_LENGTH = 2400;
export const PLAYER_COLORS = [
  "#ff6b9d",
  "#4ef0d2",
  "#9dff57",
  "#ffd24a",
  "#b388ff",
  "#ff9f43",
] as const;

export const SNAILS: Snail[] = [
  {
    id: "zippy",
    name: "ZIPPY",
    color: "#ff9f43",
    body: "#ffb347",
    shell: "#e85d04",
    personality: "Loud zip-mouth sprinter",
    baseOdds: 2.8,
  },
  {
    id: "george",
    name: "GEORGE",
    color: "#ff8fab",
    body: "#ffb3c6",
    shell: "#c9184a",
    personality: "Gentle — loves a mid-race nap",
    baseOdds: 4.2,
  },
  {
    id: "bungle",
    name: "BUNGLE",
    color: "#d4a373",
    body: "#e6b98a",
    shell: "#8b5a2b",
    personality: "Clumsy bear who eats salt",
    baseOdds: 3.6,
  },
  {
    id: "geoffrey",
    name: "GEOFFREY",
    color: "#4ef0d2",
    body: "#7dfff0",
    shell: "#0077b6",
    personality: "Steady rainbow host",
    baseOdds: 3.2,
  },
  {
    id: "jane",
    name: "JANE",
    color: "#9dff57",
    body: "#b8ff7a",
    shell: "#2d6a4f",
    personality: "Song-&-dance speedster",
    baseOdds: 3.5,
  },
  {
    id: "freddy",
    name: "FREDDY",
    color: "#b388ff",
    body: "#d0b3ff",
    shell: "#5a189a",
    personality: "Glitchy underdog",
    baseOdds: 5.5,
  },
];

export const OBSTACLE_TYPES: ObstacleType[] = [
  {
    id: "salt",
    label: "SALT PATCH!",
    chance: 0.22,
    apply(racer) {
      if (racer.id === "bungle" && Math.random() < 0.55) {
        return {
          message: `Oh my! BUNGLE munches the salt and powers on!`,
          kind: "boost",
          sfx: "boost",
        };
      }
      racer.state = "slow";
      racer.stateTimer = 1.4 + Math.random() * 1.2;
      racer.speed *= 0.25;
      return {
        message: `Watch out — ${racer.name} has hit a SALT PATCH!`,
        kind: "slow",
        sfx: "slow",
      };
    },
  },
  {
    id: "bird",
    label: "HUNGRY BIRD!",
    chance: 0.1,
    apply(racer) {
      if (Math.random() < 0.28) {
        racer.state = "dnf";
        racer.stateTimer = 999;
        racer.speed = 0;
        racer.finished = false;
        racer.dnf = true;
        racer.dnfReason = "carried off by a bird";
        return {
          message: `Good heavens! A bird has scooped up ${racer.name}! That's a DNF!`,
          kind: "dnf",
          sfx: "dnf",
        };
      }
      racer.state = "stuck";
      racer.stateTimer = 0.8;
      racer.speed = 0;
      return {
        message: `${racer.name} ducks just in time — hungry bird misses!`,
        kind: "stuck",
        sfx: "dodge",
      };
    },
  },
  {
    id: "nap",
    label: "NAP ATTACK!",
    chance: 0.18,
    apply(racer) {
      const napBias = racer.id === "george" ? 0.75 : 0.35;
      if (Math.random() < napBias) {
        racer.state = "napping";
        racer.stateTimer = 1.8 + Math.random() * 2.2;
        racer.speed = 0;
        return {
          message: `And ${racer.name} has fallen FAST ASLEEP mid-race…`,
          kind: "nap",
          sfx: "nap",
        };
      }
      return {
        message: `${racer.name} yawns… but keeps on sliming.`,
        kind: "ok",
        sfx: null,
      };
    },
  },
  {
    id: "mud",
    label: "MUD BOG!",
    chance: 0.2,
    apply(racer) {
      racer.state = "slow";
      racer.stateTimer = 1.2 + Math.random() * 1.5;
      racer.speed *= 0.35;
      return {
        message: `${racer.name} is stuck in a sticky MUD BOG!`,
        kind: "slow",
        sfx: "slow",
      };
    },
  },
  {
    id: "lettuce",
    label: "TURBO LETTUCE!",
    chance: 0.16,
    apply(racer) {
      racer.state = "boost";
      racer.stateTimer = 1.0 + Math.random() * 1.0;
      racer.speed *= 1.85;
      return {
        message: `${racer.name} chomps TURBO LETTUCE — what a burst of speed!`,
        kind: "boost",
        sfx: "boost",
      };
    },
  },
  {
    id: "shellcrack",
    label: "SHELL JAM!",
    chance: 0.1,
    apply(racer) {
      if (Math.random() < 0.12) {
        racer.state = "dnf";
        racer.stateTimer = 999;
        racer.speed = 0;
        racer.dnf = true;
        racer.dnfReason = "shell cracked — retired";
        return {
          message: `Disaster! ${racer.name}'s shell has CRACKED — out of the race!`,
          kind: "dnf",
          sfx: "dnf",
        };
      }
      racer.state = "stuck";
      racer.stateTimer = 1.5 + Math.random() * 1.5;
      racer.speed = 0;
      return {
        message: `${racer.name} is SHELL-JAMMED and can't move!`,
        kind: "stuck",
        sfx: "slow",
      };
    },
  },
  {
    id: "wrongway",
    label: "WRONG WAY!",
    chance: 0.08,
    apply(racer) {
      if (racer.id === "freddy" && Math.random() < 0.4) {
        racer.x = Math.max(0, racer.x - 80);
        return {
          message: `FREDDY glitches and slides backwards — oh dear!`,
          kind: "slow",
          sfx: "glitch",
        };
      }
      if (Math.random() < 0.12) {
        racer.state = "dnf";
        racer.stateTimer = 999;
        racer.speed = 0;
        racer.dnf = true;
        racer.dnfReason = "got lost and quit";
        return {
          message: `${racer.name} has wandered clean off the track! DNF!`,
          kind: "dnf",
          sfx: "dnf",
        };
      }
      racer.x = Math.max(0, racer.x - 40 - Math.random() * 60);
      return {
        message: `${racer.name} turns around by mistake — wrong way!`,
        kind: "slow",
        sfx: "slow",
      };
    },
  },
];

export function rollOdds(snails: Snail[]): Record<string, number> {
  const odds: Record<string, number> = {};
  for (const s of snails) {
    const jitter = 0.7 + Math.random() * 0.9;
    odds[s.id] = Math.round(s.baseOdds * jitter * 10) / 10;
  }
  return odds;
}

export function payout(amount: number, odds: number): number {
  return Math.floor(amount * odds);
}
