import { requireGame } from '../../utils/GameError.js';

export const tradeCodeAt = index => `I${index + 1}`;

export async function resolveTrade(repos, value) {
  requireGame(typeof value === 'string' && value.trim().length > 0 && value.length <= 100, 'TRADE_NOT_FOUND');
  const text = value.trim();
  if (/^I[1-9]\d*$/i.test(text)) {
    const number = Number(text.slice(1));
    requireGame(Number.isSafeInteger(number), 'TRADE_NOT_FOUND');
    const row = (await repos.trades.all())[number - 1];
    requireGame(row, 'TRADE_NOT_FOUND');
    return row;
  }
  const row = await repos.trades.get(`TRD-${text.replace(/^TRD-/i, '').toLowerCase()}`);
  requireGame(row, 'TRADE_NOT_FOUND');
  return row;
}
