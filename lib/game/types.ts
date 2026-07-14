export type SnailState =
  'idle' | 'boost' | 'slow' | 'stuck' | 'napping' | 'dnf';

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
