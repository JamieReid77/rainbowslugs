'use client';

import { useEffect, useRef } from 'react';

import { BettingScreen } from '@/components/game/BettingScreen';
import { LobbyScreen } from '@/components/game/LobbyScreen';
import { MuteButton } from '@/components/game/MuteButton';
import { RaceScreen } from '@/components/game/RaceScreen';
import { ResultsScreen } from '@/components/game/ResultsScreen';
import { TitleScreen } from '@/components/game/TitleScreen';
import { bootGame } from '@/lib/game/main';

const Game = () => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    return bootGame(rootRef.current);
  }, []);

  return (
    <div className="crt" ref={rootRef}>
      <div className="scanlines" aria-hidden="true" />
      <MuteButton />
      <div id="app">
        <TitleScreen />
        <LobbyScreen />
        <BettingScreen />
        <RaceScreen />
        <ResultsScreen />
      </div>
    </div>
  );
};

export default Game;
