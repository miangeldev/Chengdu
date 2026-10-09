export class GameError extends Error {
  constructor(code, details = {}, options = {}) {
    super(code, options);
    this.name = 'GameError';
    this.code = code;
    this.details = details;
  }
}

export function requireGame(condition, code, details) {
  if (!condition) throw new GameError(code, details);
}
