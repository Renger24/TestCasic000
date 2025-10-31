import React from 'react';
import { GameState } from '../hooks/useBaccaratLogic.ts';

interface GameTableProps {
  gameState: GameState;
  winner: 'player' | 'banker' | 'tie' | null;
}

const GameTable: React.FC<GameTableProps> = ({ gameState, winner }) => {
  const { playerCards, bankerCards, playerScore, bankerScore, isDealing } = gameState;

  const getCardEmoji = (cardStr: string) => {
    // Простая карта эмодзи для отображения. В реальности можно использовать изображения.
    const suitEmojis: Record<string, string> = {
      h: '♥️',
      d: '♦️',
      c: '♣️',
      s: '♠️',
    };
    const value = cardStr.slice(0, -1);
    const suit = cardStr.slice(-1);
    const suitEmoji = suitEmojis[suit] || '';
    return `${value}${suitEmoji}`;
  };

  return (
    <div className="p-6 bg-green-800 bg-opacity-50 rounded-lg shadow-lg my-4">
      <div className="flex justify-between items-center mb-8">
        <div className="text-center">
          <h2 className="text-xl font-bold">Player</h2>
          <div className="flex justify-center space-x-2 mt-2">
            {playerCards.map((card, index) => (
              <div
                key={index}
                className={`w-16 h-24 flex items-center justify-center text-2xl bg-white text-black rounded-lg shadow-lg ${
                  isDealing && index >= 2 ? 'opacity-50' : ''
                }`}
              >
                {getCardEmoji(card)}
              </div>
            ))}
          </div>
          <div className="mt-2 text-lg font-semibold">{playerScore}</div>
        </div>

        <div className="text-center">
          <div className="text-4xl mb-4">🃏</div> {/* Эмодзи дилера */}
          {winner && (
            <div className="text-xl font-bold mt-2">
              {winner === 'player' && 'Player Wins!'}
              {winner === 'banker' && 'Banker Wins!'}
              {winner === 'tie' && 'Tie!'}
            </div>
          )}
        </div>

        <div className="text-center">
          <h2 className="text-xl font-bold">Banker</h2>
          <div className="flex justify-center space-x-2 mt-2">
            {bankerCards.map((card, index) => (
              <div
                key={index}
                className={`w-16 h-24 flex items-center justify-center text-2xl bg-white text-black rounded-lg shadow-lg ${
                  isDealing && index >= 2 ? 'opacity-50' : ''
                }`}
              >
                {getCardEmoji(card)}
              </div>
            ))}
          </div>
          <div className="mt-2 text-lg font-semibold">{bankerScore}</div>
        </div>
      </div>
    </div>
  );
};

export default GameTable;