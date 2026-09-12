import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password, encoded) {
  const [algorithm, salt, storedHash] = String(encoded).split(':');
  if (algorithm !== 'scrypt' || !salt || !storedHash) return false;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(storedHash, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function createToken() {
  return randomBytes(32).toString('base64url');
}

export function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

export function createAccessToken(user, secret, ttlMinutes) {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ sub: user.id, role: user.role, type: 'access', iat: now, exp: now + ttlMinutes * 60 })).toString('base64url');
  const signature = signJwt(`${header}.${payload}`, secret);
  return `${header}.${payload}.${signature}`;
}

export function verifyAccessToken(token, secret) {
  try {
    const [header, payload, signature] = String(token).split('.');
    if (!header || !payload || !signature) return null;
    const expected = signJwt(`${header}.${payload}`, secret);
    const actual = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (actual.length !== expectedBuffer.length || !timingSafeEqual(actual, expectedBuffer)) return null;
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (claims.type !== 'access' || typeof claims.sub !== 'string' || typeof claims.exp !== 'number' || claims.exp <= Math.floor(Date.now() / 1000)) return null;
    return claims;
  } catch {
    return null;
  }
}

function signJwt(value, secret) {
  return createHmac('sha256', secret).update(value).digest('base64url');
}
