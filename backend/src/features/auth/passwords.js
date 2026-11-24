const { randomBytes, scrypt, timingSafeEqual } = require('node:crypto');
const { promisify } = require('node:util');

const deriveKey = promisify(scrypt);
const keyLength = 64;
const options = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const key = await deriveKey(password, salt, keyLength, options);
  return `${salt}:${key.toString('hex')}`;
}

async function matchesPassword(password, passwordHash) {
  const [salt, hash] = passwordHash.split(':');
  const expected = Buffer.from(hash, 'hex');
  const key = await deriveKey(password, salt, keyLength, options);
  return timingSafeEqual(key, expected);
}

module.exports = { hashPassword, matchesPassword };
