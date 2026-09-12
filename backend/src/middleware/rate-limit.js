import { ApiError } from '../lib/errors.js';

export function createRateLimiter({ windowMs, max }) {
  const attempts = new Map();

  return (request, response, next) => {
    const key = request.ip || request.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const current = (attempts.get(key) || []).filter((time) => now - time < windowMs);
    if (current.length >= max) {
      response.set('Retry-After', String(Math.ceil((windowMs - (now - current[0])) / 1000)));
      return next(new ApiError(429, 'RATE_LIMITED', 'Too many requests. Please try again shortly.'));
    }
    current.push(now);
    attempts.set(key, current);
    next();
  };
}
