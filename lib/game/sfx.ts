type SfxName =
  | "boost"
  | "slow"
  | "nap"
  | "dodge"
  | "glitch"
  | "dnf"
  | "finish";

export type SfxHandle = {
  unlock: () => void;
  toggleMute: () => boolean;
  click: () => void;
  bet: () => void;
  countdown: () => void;
  go: () => void;
  boost: () => void;
  slow: () => void;
  nap: () => void;
  dodge: () => void;
  glitch: () => void;
  dnf: () => void;
  finish: () => void;
  win: () => void;
  play: (name: string | null | undefined) => void;
  startRaceMusic: () => void;
  stopRaceMusic: () => void;
};

type AudioContextCtor = typeof AudioContext;

/**
 * Chip SFX via Web Audio + William Tell Overture finale as race BGM.
 * Recording: U.S. Marine Band (public domain) — see public/audio/CREDITS.txt
 */
export function createSfx(): SfxHandle {
  let ctx: AudioContext | null = null;
  let muted = false;
  const master = 0.18;
  let bgm: HTMLAudioElement | null = null;
  let musicPlaying = false;

  const unlock = () => {
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: AudioContextCtor })
          .webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();

    if (!bgm) {
      bgm = new Audio("/audio/william-tell-finale.mp3");
      bgm.loop = true;
      bgm.preload = "auto";
      bgm.volume = muted ? 0 : 0.55;
    }
  };

  const tone = (
    freq: number,
    dur: number,
    type: OscillatorType = "square",
    vol = 1,
    delay = 0,
  ) => {
    if (muted || !ctx) return;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(master * vol, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  };

  const handle: SfxHandle = {
    unlock,

    toggleMute() {
      muted = !muted;
      if (bgm) bgm.volume = muted ? 0 : 0.55;
      return muted;
    },

    click() {
      unlock();
      tone(880, 0.05, "square", 0.6);
    },

    bet() {
      unlock();
      tone(523, 0.08, "square", 0.7);
      tone(659, 0.1, "square", 0.7, 0.07);
      tone(784, 0.12, "square", 0.7, 0.14);
    },

    countdown() {
      unlock();
      tone(392, 0.12, "square", 0.8);
    },

    go() {
      unlock();
      tone(523, 0.1, "square", 0.9);
      tone(784, 0.15, "square", 0.9, 0.1);
      tone(1046, 0.25, "square", 0.85, 0.22);
    },

    boost() {
      unlock();
      tone(400, 0.08, "sawtooth", 0.5);
      tone(600, 0.1, "sawtooth", 0.55, 0.06);
      tone(900, 0.14, "sawtooth", 0.5, 0.12);
    },

    slow() {
      unlock();
      tone(220, 0.18, "triangle", 0.7);
      tone(160, 0.22, "triangle", 0.6, 0.1);
    },

    nap() {
      unlock();
      tone(300, 0.2, "sine", 0.4);
      tone(250, 0.25, "sine", 0.35, 0.2);
    },

    dodge() {
      unlock();
      tone(700, 0.06, "square", 0.5);
      tone(500, 0.08, "square", 0.4, 0.05);
    },

    glitch() {
      unlock();
      tone(120, 0.05, "sawtooth", 0.5);
      tone(900, 0.04, "square", 0.4, 0.04);
      tone(80, 0.08, "sawtooth", 0.5, 0.08);
    },

    dnf() {
      unlock();
      tone(300, 0.15, "square", 0.7);
      tone(220, 0.2, "square", 0.65, 0.12);
      tone(140, 0.35, "triangle", 0.7, 0.28);
    },

    finish() {
      unlock();
      tone(523, 0.1, "square", 0.8);
      tone(659, 0.1, "square", 0.8, 0.1);
      tone(784, 0.1, "square", 0.8, 0.2);
      tone(1046, 0.35, "square", 0.85, 0.3);
    },

    win() {
      unlock();
      const notes = [523, 659, 784, 1046, 784, 1046];
      notes.forEach((n, i) => tone(n, 0.14, "square", 0.75, i * 0.12));
    },

    play(name) {
      if (!name) return;
      const map: Record<SfxName, () => void> = {
        boost: () => handle.boost(),
        slow: () => handle.slow(),
        nap: () => handle.nap(),
        dodge: () => handle.dodge(),
        glitch: () => handle.glitch(),
        dnf: () => handle.dnf(),
        finish: () => handle.finish(),
      };
      map[name as SfxName]?.();
    },

    startRaceMusic() {
      unlock();
      if (!bgm || musicPlaying) return;
      musicPlaying = true;
      bgm.currentTime = 0;
      bgm.volume = muted ? 0 : 0.55;
      void bgm.play().catch(() => {
        musicPlaying = false;
      });
    },

    stopRaceMusic() {
      musicPlaying = false;
      if (!bgm) return;
      try {
        bgm.pause();
        bgm.currentTime = 0;
      } catch {
        /* ignore */
      }
    },
  };

  return handle;
}

export const sfx = createSfx();
