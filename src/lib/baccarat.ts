// Типы для карт
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Value = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  value: Value;
  suit: Suit;
}

// Создание колоды (8 колод)
export function createDeck(): Card[] {
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const values: Value[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck: Card[] = [];
  for (let i = 0; i < 8; i++) { // 8 колод
    for (const suit of suits) {
      for (const value of values) {
        deck.push({ suit, value });
      }
    }
  }
  return shuffleDeck(deck);
}

// Перемешивание колоды (алгоритм Фишера-Йетса)
function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Подсчёт очков
export function calculateScore(cards: Card[]): number {
  let score = 0;
  for (const card of cards) {
    if (['10', 'J', 'Q', 'K'].includes(card.value)) {
      score += 0;
    } else if (card.value === 'A') {
      score += 1;
    } else {
      score += parseInt(card.value, 10);
    }
  }
  return score % 10;
}

// Вытягивание карты из колоды
export function drawCard(deck: Card[]): Card {
  if (deck.length === 0) {
    throw new Error("Колода пуста");
  }
  return deck.pop()!;
}