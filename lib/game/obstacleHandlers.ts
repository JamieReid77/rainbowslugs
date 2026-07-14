import type { ObstacleRacer, ObstacleResult } from './types';

export const obstacleHandlers: Record<
  string,
  (racer: ObstacleRacer) => ObstacleResult
> = {
  salt: (racer) => {
    if (racer.id === 'bungle' && Math.random() < 0.55) {
      return {
        message: `Oh my! BUNGLE munches the salt and powers on!`,
        kind: 'boost',
        sfx: 'boost',
      };
    }
    racer.state = 'slow';
    racer.stateTimer = 1.4 + Math.random() * 1.2;
    racer.speed *= 0.25;
    return {
      message: `Watch out — ${racer.name} has hit a SALT PATCH!`,
      kind: 'slow',
      sfx: 'slow',
    };
  },

  bird: (racer) => {
    if (Math.random() < 0.28) {
      racer.state = 'dnf';
      racer.stateTimer = 999;
      racer.speed = 0;
      racer.finished = false;
      racer.dnf = true;
      racer.dnfReason = 'carried off by a bird';
      return {
        message: `Good heavens! A bird has scooped up ${racer.name}! That's a DNF!`,
        kind: 'dnf',
        sfx: 'dnf',
      };
    }
    racer.state = 'stuck';
    racer.stateTimer = 0.8;
    racer.speed = 0;
    return {
      message: `${racer.name} ducks just in time — hungry bird misses!`,
      kind: 'stuck',
      sfx: 'dodge',
    };
  },

  nap: (racer) => {
    const napBias = racer.id === 'george' ? 0.75 : 0.35;
    if (Math.random() < napBias) {
      racer.state = 'napping';
      racer.stateTimer = 1.8 + Math.random() * 2.2;
      racer.speed = 0;
      return {
        message: `And ${racer.name} has fallen FAST ASLEEP mid-race…`,
        kind: 'nap',
        sfx: 'nap',
      };
    }
    return {
      message: `${racer.name} yawns… but keeps on sliming.`,
      kind: 'ok',
      sfx: null,
    };
  },

  mud: (racer) => {
    racer.state = 'slow';
    racer.stateTimer = 1.2 + Math.random() * 1.5;
    racer.speed *= 0.35;
    return {
      message: `${racer.name} is stuck in a sticky MUD BOG!`,
      kind: 'slow',
      sfx: 'slow',
    };
  },

  lettuce: (racer) => {
    racer.state = 'boost';
    racer.stateTimer = 1.0 + Math.random() * 1.0;
    racer.speed *= 1.85;
    return {
      message: `${racer.name} chomps TURBO LETTUCE — what a burst of speed!`,
      kind: 'boost',
      sfx: 'boost',
    };
  },

  shellcrack: (racer) => {
    if (Math.random() < 0.12) {
      racer.state = 'dnf';
      racer.stateTimer = 999;
      racer.speed = 0;
      racer.dnf = true;
      racer.dnfReason = 'shell cracked — retired';
      return {
        message: `Disaster! ${racer.name}'s shell has CRACKED — out of the race!`,
        kind: 'dnf',
        sfx: 'dnf',
      };
    }
    racer.state = 'stuck';
    racer.stateTimer = 1.5 + Math.random() * 1.5;
    racer.speed = 0;
    return {
      message: `${racer.name} is SHELL-JAMMED and can't move!`,
      kind: 'stuck',
      sfx: 'slow',
    };
  },

  wrongway: (racer) => {
    if (racer.id === 'freddy' && Math.random() < 0.4) {
      racer.x = Math.max(0, racer.x - 80);
      return {
        message: `FREDDY glitches and slides backwards — oh dear!`,
        kind: 'slow',
        sfx: 'glitch',
      };
    }
    if (Math.random() < 0.12) {
      racer.state = 'dnf';
      racer.stateTimer = 999;
      racer.speed = 0;
      racer.dnf = true;
      racer.dnfReason = 'got lost and quit';
      return {
        message: `${racer.name} has wandered clean off the track! DNF!`,
        kind: 'dnf',
        sfx: 'dnf',
      };
    }
    racer.x = Math.max(0, racer.x - 40 - Math.random() * 60);
    return {
      message: `${racer.name} turns around by mistake — wrong way!`,
      kind: 'slow',
      sfx: 'slow',
    };
  },
};
