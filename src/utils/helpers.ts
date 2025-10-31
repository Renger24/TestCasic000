/**
 * Форматирует число как сумму в Telegram Stars.
 * @param amount - Число для форматирования.
 * @param currency - Валюта (по умолчанию 'Stars').
 * @returns Отформатированная строка (например, "100.00 Stars").
 */
export const formatStars = (amount: number, currency: string = 'Stars'): string => {
  // Округляем до 2 знаков после запятой, как обычно делается с деньгами
  const roundedAmount = Math.round(amount * 100) / 100;
  return `${roundedAmount.toFixed(2)} ${currency}`;
};

/**
 * Проверяет, является ли сумма ставки допустимой.
 * @param amount - Сумма ставки.
 * @returns `true`, если ставка в допустимом диапазоне, иначе `false`.
 */
export const isValidBetAmount = (amount: number): boolean => {
  // Предположим, что константы MIN_BET и MAX_BET экспортированы из '../lib/constants'
  // Для самодостаточности примера, определим их здесь. Лучше импортировать из constants.ts
  const MIN_BET = 1;
  const MAX_BET = 1000;

  return Number.isInteger(amount) && amount >= MIN_BET && amount <= MAX_BET;
};

/**
 * Генерирует случайное целое число в заданном диапазоне [min, max].
 * @param min - Минимальное значение (включительно).
 * @param max - Максимальное значение (включительно).
 * @returns Случайное целое число.
 */
export const getRandomInt = (min: number, max: number): number => {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1)) + minCeiled;
};