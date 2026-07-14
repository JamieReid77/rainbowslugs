/**
 * Chip SFX via Web Audio + real William Tell Overture finale as race BGM.
 * Recording: U.S. Marine Band (public domain) — see audio/CREDITS.txt
 */
export class Sfx {
  constructor() {
    /** @type {AudioContext | null} */
    this.ctx = null;
    this.muted = false;
    this._master = 0.18;
    /** @type {HTMLAudioElement | null} */
    this._bgm = null;
    this._musicPlaying = false;
  }

  unlock() {
    if (!this.ctx) {
      const AC =
        window.AudioContext ||
        /** @type {typeof AudioContext} */ (window).webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
    }
    if (this.ctx.state === "suspended") this.ctx.resume();

    if (!this._bgm) {
      this._bgm = new Audio("audio/william-tell-finale.mp3");
      this._bgm.loop = true;
      this._bgm.preload = "auto";
      this._bgm.volume = this.muted ? 0 : 0.55;
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this._bgm) this._bgm.volume = this.muted ? 0 : 0.55;
    return this.muted;
  }

  /**
   * @param {number} freq
   * @param {number} dur
   * @param {OscillatorType} [type]
   * @param {number} [vol]
   * @param {number} [delay]
   */
  tone(freq, dur, type = "square", vol = 1, delay = 0) {
    if (this.muted || !this.ctx) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(this._master * vol, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  click() {
    this.unlock();
    this.tone(880, 0.05, "square", 0.6);
  }

  bet() {
    this.unlock();
    this.tone(523, 0.08, "square", 0.7);
    this.tone(659, 0.1, "square", 0.7, 0.07);
    this.tone(784, 0.12, "square", 0.7, 0.14);
  }

  countdown() {
    this.unlock();
    this.tone(392, 0.12, "square", 0.8);
  }

  go() {
    this.unlock();
    this.tone(523, 0.1, "square", 0.9);
    this.tone(784, 0.15, "square", 0.9, 0.1);
    this.tone(1046, 0.25, "square", 0.85, 0.22);
  }

  boost() {
    this.unlock();
    this.tone(400, 0.08, "sawtooth", 0.5);
    this.tone(600, 0.1, "sawtooth", 0.55, 0.06);
    this.tone(900, 0.14, "sawtooth", 0.5, 0.12);
  }

  slow() {
    this.unlock();
    this.tone(220, 0.18, "triangle", 0.7);
    this.tone(160, 0.22, "triangle", 0.6, 0.1);
  }

  nap() {
    this.unlock();
    this.tone(300, 0.2, "sine", 0.4);
    this.tone(250, 0.25, "sine", 0.35, 0.2);
  }

  dodge() {
    this.unlock();
    this.tone(700, 0.06, "square", 0.5);
    this.tone(500, 0.08, "square", 0.4, 0.05);
  }

  glitch() {
    this.unlock();
    this.tone(120, 0.05, "sawtooth", 0.5);
    this.tone(900, 0.04, "square", 0.4, 0.04);
    this.tone(80, 0.08, "sawtooth", 0.5, 0.08);
  }

  dnf() {
    this.unlock();
    this.tone(300, 0.15, "square", 0.7);
    this.tone(220, 0.2, "square", 0.65, 0.12);
    this.tone(140, 0.35, "triangle", 0.7, 0.28);
  }

  finish() {
    this.unlock();
    this.tone(523, 0.1, "square", 0.8);
    this.tone(659, 0.1, "square", 0.8, 0.1);
    this.tone(784, 0.1, "square", 0.8, 0.2);
    this.tone(1046, 0.35, "square", 0.85, 0.3);
  }

  win() {
    this.unlock();
    const notes = [523, 659, 784, 1046, 784, 1046];
    notes.forEach((n, i) => this.tone(n, 0.14, "square", 0.75, i * 0.12));
  }

  /**
   * @param {string | null | undefined} name
   */
  play(name) {
    if (!name) return;
    /** @type {Record<string, () => void>} */
    const map = {
      boost: () => this.boost(),
      slow: () => this.slow(),
      nap: () => this.nap(),
      dodge: () => this.dodge(),
      glitch: () => this.glitch(),
      dnf: () => this.dnf(),
      finish: () => this.finish(),
    };
    map[name]?.();
  }

  startRaceMusic() {
    this.unlock();
    if (!this._bgm || this._musicPlaying) return;
    this._musicPlaying = true;
    this._bgm.currentTime = 0;
    this._bgm.volume = this.muted ? 0 : 0.55;
    const play = this._bgm.play();
    if (play && typeof play.catch === "function") {
      play.catch(() => {
        // Autoplay may block until a gesture — unlock already ran on click
        this._musicPlaying = false;
      });
    }
  }

  stopRaceMusic() {
    this._musicPlaying = false;
    if (!this._bgm) return;
    try {
      this._bgm.pause();
      this._bgm.currentTime = 0;
    } catch {
      /* ignore */
    }
  }
}

export const sfx = new Sfx();
