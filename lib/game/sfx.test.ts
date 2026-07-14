import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createSfx } from '@/lib/game/sfx';

class MockAudio {
  static instances: MockAudio[] = [];
  loop = false;
  preload = '';
  volume = 1;
  currentTime = 0;
  src: string;

  constructor(src: string) {
    this.src = src;
    MockAudio.instances.push(this);
  }

  play = vi.fn(async () => undefined);
  pause = vi.fn();
}

class MockOscillator {
  type = 'square';
  frequency = { setValueAtTime: vi.fn() };
  connect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
}

class MockGain {
  gain = {
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };
  connect = vi.fn();
}

class MockAudioContext {
  currentTime = 0;
  state: AudioContextState = 'running';
  destination = {};
  resume = vi.fn(async () => undefined);
  createOscillator = vi.fn(() => new MockOscillator());
  createGain = vi.fn(() => new MockGain());
}

describe('createSfx', () => {
  beforeEach(() => {
    MockAudio.instances = [];
    vi.stubGlobal('Audio', MockAudio);
    vi.stubGlobal('AudioContext', MockAudioContext);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('unlocks audio and loads William Tell BGM from public path', () => {
    const sfx = createSfx();
    sfx.unlock();
    expect(MockAudio.instances).toHaveLength(1);
    expect(MockAudio.instances[0].src).toBe('/audio/william-tell-finale.mp3');
    expect(MockAudio.instances[0].loop).toBe(true);
  });

  it('toggleMute flips muted state and volume', () => {
    const sfx = createSfx();
    sfx.unlock();
    expect(sfx.toggleMute()).toBe(true);
    expect(MockAudio.instances[0].volume).toBe(0);
    expect(sfx.toggleMute()).toBe(false);
    expect(MockAudio.instances[0].volume).toBe(0.55);
  });

  it('startRaceMusic plays and stopRaceMusic pauses', async () => {
    const sfx = createSfx();
    sfx.startRaceMusic();
    const audio = MockAudio.instances[0];
    expect(audio.play).toHaveBeenCalled();
    sfx.stopRaceMusic();
    expect(audio.pause).toHaveBeenCalled();
    expect(audio.currentTime).toBe(0);
  });

  it('play routes named cues without throwing', () => {
    const sfx = createSfx();
    expect(() => sfx.play('boost')).not.toThrow();
    expect(() => sfx.play('missing')).not.toThrow();
    expect(() => sfx.play(null)).not.toThrow();
  });
});
