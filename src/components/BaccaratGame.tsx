import React, { useEffect } from 'react';
import useBaccaratLogic from '../hooks/useBaccaratLogic.ts';
import BalanceDisplay from './BalanceDisplay.tsx'; // Правильный путь
import BettingControls from './BettingControls.tsx';
import GameTable from './GameTable.tsx';

interface BaccaratGameProps {
  webApp: any; // Типизировать как Telegram WebApp SDK object
}

const BaccaratGame: React.FC<BaccaratGameProps> = ({ webApp }) => {
  const { gameState, balance, playRound, resetGame } = useBaccaratLogic(100); // Начальный демо-баланс

  useEffect(() => {
    // Установка начального размера окна Telegram Mini App
    webApp.expand();
  }, [webApp]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Baccarat</h1>
      <BalanceDisplay balance={balance} />
      <GameTable gameState={gameState} winner={gameState.winner} />
      <BettingControls onBet={playRound} isDealing={gameState.isDealing} />
    </div>
  );
};

export default BaccaratGame;
