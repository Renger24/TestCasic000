import React from 'react';

interface BalanceDisplayProps {
  balance: number;
}

const BalanceDisplay: React.FC<BalanceDisplayProps> = ({ balance }) => {
  return (
    <div className="flex justify-between items-center p-4 bg-gray-800 rounded-lg shadow">
      <span className="text-lg font-semibold">Баланс:</span>
      <span className="text-xl font-bold text-yellow-400">{balance.toFixed(2)} Stars</span>
    </div>
  );
};

export default BalanceDisplay;