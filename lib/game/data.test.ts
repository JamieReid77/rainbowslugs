import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createCommentary } from '@/lib/game/commentary';
import {
  OBSTACLE_TYPES,
  payout,
  PLAYER_COLORS,
  rollOdds,
  SNAILS,
  STARTING_BANK,
  TRACK_LENGTH,
} from '@/lib/game/data';
import { obstacleHandlers } from '@/lib/game/obstacleHandlers';
import type { ObstacleRacer } from '@/lib/game/types';

describe('game data (JSON)', () => {
  it('loads snails from JSON with expected cast', () => {
    expect(SNAILS).toHaveLength(6);
    expect(SNAILS.map((s) => s.id)).toEqual([
      'zippy',
      'george',
      'bungle',
      'geoffrey',
      'jane',
      'freddy',
    ]);
  });

  it('loads config constants from JSON', () => {
    expect(STARTING_BANK).toBe(100);
    expect(TRACK_LENGTH).toBe(2400);
    expect(PLAYER_COLORS).toHaveLength(6);
  });

  it('wires obstacle JSON entries to handlers', () => {
    expect(OBSTACLE_TYPES.every((o) => typeof o.apply === 'function')).toBe(
      true,
    );
    expect(OBSTACLE_TYPES.map((o) => o.id)).toEqual(
      Object.keys(obstacleHandlers),
    );
  });
});

describe('rollOdds / payout', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('rollOdds returns a value per snail within jitter range', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const odds = rollOdds(SNAILS);
    for (const s of SNAILS) {
      // jitter = 0.7 + 0.5 * 0.9 = 1.15, then round to 1 decimal
      expect(odds[s.id]).toBe(Math.round(s.baseOdds * 1.15 * 10) / 10);
    }
  });

  it('payout floors amount * odds', () => {
    expect(payout(10, 2.8)).toBe(28);
    expect(payout(10, 2.85)).toBe(28);
    expect(payout(7, 3.2)).toBe(22);
  });
});

describe('obstacleHandlers', () => {
  const makeRacer = (
    overrides: Partial<ObstacleRacer> = {},
  ): ObstacleRacer => ({
    id: 'zippy',
    name: 'ZIPPY',
    x: 100,
    speed: 60,
    state: 'idle',
    stateTimer: 0,
    finished: false,
    dnf: false,
    dnfReason: '',
    ...overrides,
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('salt slows a normal snail', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const racer = makeRacer();
    const result = obstacleHandlers.salt(racer);
    expect(result.kind).toBe('slow');
    expect(result.sfx).toBe('slow');
    expect(racer.state).toBe('slow');
    expect(racer.speed).toBe(15);
  });

  it('bungle can eat salt when luck hits', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    const racer = makeRacer({ id: 'bungle', name: 'BUNGLE' });
    const result = obstacleHandlers.salt(racer);
    expect(result.kind).toBe('boost');
    expect(result.message).toMatch(/BUNGLE munches/);
  });

  it('bird can DNF when unlucky', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    const racer = makeRacer();
    const result = obstacleHandlers.bird(racer);
    expect(result.kind).toBe('dnf');
    expect(racer.dnf).toBe(true);
    expect(racer.dnfReason).toBe('carried off by a bird');
  });

  it('lettuce boosts speed', () => {
    const racer = makeRacer({ speed: 50 });
    const result = obstacleHandlers.lettuce(racer);
    expect(result.kind).toBe('boost');
    expect(racer.state).toBe('boost');
    expect(racer.speed).toBeCloseTo(92.5);
  });
});

describe('createCommentary', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows queued messages in order with hold delay', () => {
    const el = document.createElement('div');
    const onShow = vi.fn();
    const commentary = createCommentary(el, { onShow });

    commentary.say('First', { hold: 1000, priority: 1 });
    expect(el.textContent).toBe('First');
    expect(onShow).toHaveBeenCalledWith('First', undefined);

    commentary.say('Second', { hold: 1000, priority: 1 });
    expect(el.textContent).toBe('First');

    vi.advanceTimersByTime(1000 + 400);
    expect(el.textContent).toBe('Second');
  });

  it('clear resets the board', () => {
    const el = document.createElement('div');
    const commentary = createCommentary(el);
    commentary.say('Hello', { hold: 5000 });
    commentary.clear();
    expect(el.textContent).toBe('');
  });
});
