import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { BettingScreen } from '@/components/game/BettingScreen';
import { LobbyScreen } from '@/components/game/LobbyScreen';
import { MuteButton } from '@/components/game/MuteButton';
import { RaceScreen } from '@/components/game/RaceScreen';
import { ResultsScreen } from '@/components/game/ResultsScreen';
import { TitleScreen } from '@/components/game/TitleScreen';

describe('game screen snapshots', () => {
  it('MuteButton', () => {
    const { container } = render(<MuteButton />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('TitleScreen', () => {
    const { container } = render(<TitleScreen />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('LobbyScreen', () => {
    const { container } = render(<LobbyScreen />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('BettingScreen', () => {
    const { container } = render(<BettingScreen />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('RaceScreen', () => {
    const { container } = render(<RaceScreen />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('ResultsScreen', () => {
    const { container } = render(<ResultsScreen />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
