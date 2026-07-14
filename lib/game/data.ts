import config from './data/config.json';
import obstaclesJson from './data/obstacles.json';
import snailsJson from './data/snails.json';
import { obstacleHandlers } from './obstacleHandlers';
import type { ObstacleType, Snail } from './types';

export type {
  Bet,
  ObstacleRacer,
  ObstacleResult,
  ObstacleType,
  Player,
  Snail,
  SnailState,
} from './types';

export const STARTING_BANK = config.startingBank;
export const TRACK_LENGTH = config.trackLength;
export const PLAYER_COLORS = config.playerColors;

export const SNAILS = snailsJson as Snail[];

export const OBSTACLE_TYPES: ObstacleType[] = obstaclesJson.map((ob) => {
  const apply = obstacleHandlers[ob.id];
  if (!apply) {
    throw new Error(`Missing obstacle handler for ${ob.id}`);
  }
  return {
    id: ob.id,
    label: ob.label,
    chance: ob.chance,
    apply,
  };
});

export const rollOdds = (snails: Snail[]): Record<string, number> => {
  const odds: Record<string, number> = {};
  for (const s of snails) {
    const jitter = 0.7 + Math.random() * 0.9;
    odds[s.id] = Math.round(s.baseOdds * jitter * 10) / 10;
  }
  return odds;
};

export const payout = (amount: number, odds: number): number =>
  Math.floor(amount * odds);
