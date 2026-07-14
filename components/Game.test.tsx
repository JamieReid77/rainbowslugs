import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';

vi.mock('@/lib/game/main', () => ({
  bootGame: vi.fn(() => vi.fn()),
}));

import Game from '@/components/Game';

describe('Game', () => {
  it('matches shell snapshot', () => {
    const { container } = render(<Game />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
