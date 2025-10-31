import React, { useState } from 'react';

interface BettingControlsProps {
  onBet: (player: number, banker: number, tie: number) => void;
  isDealing: boolean;
}

const BettingControls: React.FC<BettingControlsProps> = ({ onBet, isDealing }) => {
  const [playerBet, setPlayerBet] = useState<number>(0);
  const [bankerBet, setBankerBet] = useState<number>(0);
  const [tieBet, setTieBet] = useState<number>(0);

  const handleBet = () => {
    if (playerBet <= 0 && bankerBet <= 0 && tieBet <= 0) {
      alert("Сделайте хотя бы одну ставку.");
      return;
    }
    onBet(playerBet, bankerBet, tieBet);
    // Сбросить поля ставок после ставки
    setPlayerBet(0);
    setBankerBet(0);
    setTieBet(0);
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow mt-4">
      <h3 className="text-lg font-semibold mb-2">Сделайте ставку</h3>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm mb-1">Player</label>
          <input
            type="number"
            value={playerBet}
            onChange={(e) => setPlayerBet(Number(e.target.value))}
            min="0"
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
            disabled={isDealing}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Banker</label>
          <input
            type="number"
            value={bankerBet}
            onChange={(e) => setBankerBet(Number(e.target.value))}
            min="0"
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
            disabled={isDealing}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Tie</label>
          <input
            type="number"
            value={tieBet}
            onChange={(e) => setTieBet(Number(e.target.value))}
            min="0"
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
            disabled={isDealing}
          />
        </div>
      </div>
      <button
        onClick={handleBet}
        disabled={isDealing}
        className={`w-full mt-4 py-3 rounded font-bold ${
          isDealing ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {isDealing ? 'Раздача...' : 'Сделать ставку'}
      </button>
    </div>
  );
};

export default BettingControls;