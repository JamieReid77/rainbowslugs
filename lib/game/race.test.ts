import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createRaceEngine } from '@/lib/game/race';

const mockContext = () =>
  ({
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    clearRect: vi.fn(),
    fillText: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    arc: vi.fn(),
    closePath: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    drawImage: vi.fn(),
    createLinearGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    measureText: vi.fn(() => ({ width: 0 })),
    fillStyle: '',
    strokeStyle: '',
    font: '',
    globalAlpha: 1,
    lineWidth: 1,
  }) as unknown as CanvasRenderingContext2D;

const mockCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = 960;
  canvas.height = 480;
  vi.spyOn(canvas, 'getContext').mockReturnValue(mockContext());
  return canvas;
};

describe('createRaceEngine', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn(() => 1),
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.spyOn(performance, 'now').mockReturnValue(1000);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('is idle until start, then seeds racers from snail data', () => {
    const onEvent = vi.fn();
    const engine = createRaceEngine(mockCanvas(), { onEvent });

    expect(engine.finished).toBe(false);
    expect(engine.elapsed).toBe(0);
    expect(engine.getProgress()).toBe(0);
    expect(engine.racers).toHaveLength(0);

    engine.start();

    expect(engine.racers).toHaveLength(6);
    expect(engine.racers.map((r) => r.id)).toEqual([
      'zippy',
      'george',
      'bungle',
      'geoffrey',
      'jane',
      'freddy',
    ]);
    expect(onEvent).toHaveBeenCalledWith(
      expect.stringMatching(/OFF/),
      expect.objectContaining({ kind: 'start' }),
    );
    expect(requestAnimationFrame).toHaveBeenCalled();

    engine.stop();
    expect(cancelAnimationFrame).toHaveBeenCalled();
  });
});
