import { useState, useCallback } from 'react';
import { createDeck, calculateScore, drawCard, Card } from '../lib/baccarat.ts';

// Экспортируем интерфейс GameState, чтобы другие файлы могли его использовать
export interface GameState {
  playerCards: string[];
  bankerCards: string[];
  playerScore: number;
  bankerScore: number;
  winner: 'player' | 'banker' | 'tie' | null;
  isDealing: boolean;
}

const useBaccaratLogic = (initialBalance: number) => {
  const [balance, setBalance] = useState(initialBalance);
  const [gameState, setGameState] = useState<GameState>({
    playerCards: [],
    bankerCards: [],
    playerScore: 0,
    bankerScore: 0,
    winner: null,
    isDealing: false,
  });

  const playRound = useCallback((playerBet: number, bankerBet: number, tieBet: number) => {
    if (playerBet + bankerBet + tieBet > balance) {
      alert("Недостаточно средств!");
      return;
    }

    setGameState(prev => ({ ...prev, isDealing: true, winner: null }));
    setBalance(prev => prev - (playerBet + bankerBet + tieBet));

    // Инициализация новой колоды (8 колод)
    let deck = createDeck();
    let playerCards: Card[] = [drawCard(deck), drawCard(deck)];
    let bankerCards: Card[] = [drawCard(deck), drawCard(deck)];

    let playerScore = calculateScore(playerCards);
    let bankerScore = calculateScore(bankerCards);

    // Проверка на натуральный выигрыш (8 или 9)
    if (playerScore < 8 && bankerScore < 8) {
      // Логика добора третьей карты
      if (playerScore <= 5) {
        const thirdPlayerCard = drawCard(deck);
        playerCards.push(thirdPlayerCard);
        playerScore = calculateScore(playerCards);

        if (bankerScore <= 2) {
          bankerCards.push(drawCard(deck));
        } else if (bankerScore === 3 && thirdPlayerCard.value !== '8') {
          bankerCards.push(drawCard(deck));
        } else if (bankerScore === 4 && ['2', '3', '4', '5', '6', '7'].includes(thirdPlayerCard.value)) {
          bankerCards.push(drawCard(deck));
        } else if (bankerScore === 5 && ['4', '5', '6', '7'].includes(thirdPlayerCard.value)) {
          bankerCards.push(drawCard(deck));
        } else if (bankerScore === 6 && ['6', '7'].includes(thirdPlayerCard.value)) {
          bankerCards.push(drawCard(deck));
        }
      } else {
        if (bankerScore <= 5) {
          bankerCards.push(drawCard(deck));
        }
      }
      bankerScore = calculateScore(bankerCards);
    }

    // Определение победителя
    let winner: 'player' | 'banker' | 'tie' = 'tie';
    if (playerScore > bankerScore) {
      winner = 'player';
    } else if (bankerScore > playerScore) {
      winner = 'banker';
    }

    setGameState({
      playerCards: playerCards.map(c => `${c.value}${c.suit[0]}`),
      bankerCards: bankerCards.map(c => `${c.value}${c.suit[0]}`),
      playerScore,
      bankerScore,
      winner,
      isDealing: false,
    });

    // Расчёт выигрыша
    let winnings = 0;
    if (winner === 'player' && playerBet > 0) {
      winnings += playerBet * 2; // Ставка на Player выигрывает 1:1
    } else if (winner === 'banker' && bankerBet > 0) {
      winnings += bankerBet * 1.95; // Комиссия 5% на ставки на Banker
    } else if (winner === 'tie' && tieBet > 0) {
      winnings += tieBet * 8; // Ставка на Tie выигрывает 8:1
    }

    setBalance(prev => prev + winnings);
  }, [balance]);

  const resetGame = useCallback(() => {
    setGameState({
      playerCards: [],
      bankerCards: [],
      playerScore: 0,
      bankerScore: 0,
      winner: null,
      isDealing: false,
    });
  }, []);

  // Возвращаем resetGame, даже если он не используется сейчас, для будущего расширения
  return { gameState, balance, playRound, resetGame };
};

export default useBaccaratLogic;
