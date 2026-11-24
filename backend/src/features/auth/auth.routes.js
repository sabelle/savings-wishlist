const express = require('express');
const { createHash, randomBytes } = require('node:crypto');
const pool = require('../../db/client');
const { hashPassword, matchesPassword } = require('./passwords');

const router = express.Router();
const cookieName = 'savings_session';
const sessionLifetime = 7 * 24 * 60 * 60 * 1000;
const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

function newSession() {
  const token = randomBytes(32).toString('hex');
  return { token, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + sessionLifetime) };
}

function readSessionHash(req) {
  const match = req.headers.cookie?.match(/(?:^|;\s*)savings_session=([a-f0-9]{64})(?=;|$)/);
  return match ? hashToken(match[1]) : null;
}

function readCredentials(body) {
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  const validEmail = email.length <= 254 && !email.includes('\0') && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  return { email, password, validEmail };
}

router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  if (req.method === 'POST' && !req.is('application/json')) {
    return res.status(415).json({ error: 'Send the request as JSON.' });
  }
  next();
});

router.use(express.json({ limit: '4kb' }));

router.post('/register', async (req, res) => {
  const { email, password, validEmail } = readCredentials(req.body);
  if (!validEmail || password.length < 8 || password.length > 128) {
    return res.status(400).json({ error: 'Enter a valid email and a password of 8 to 128 characters.' });
  }

  const passwordHash = await hashPassword(password);
  const session = newSession();
  const { rows: [user] } = await pool.query(`
    WITH new_user AS (
      INSERT INTO users (email, password_hash) VALUES ($1, $2)
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email
    ), new_session AS (
      INSERT INTO auth_sessions (token_hash, user_id, expires_at)
      SELECT $3, id, $4 FROM new_user
    )
    SELECT id, email FROM new_user
  `, [email, passwordHash, session.tokenHash, session.expiresAt]);

  if (!user) {
    return res.status(409).json({ error: 'An account with that email already exists.' });
  }

  res.cookie(cookieName, session.token, { ...cookieOptions, maxAge: sessionLifetime });
  res.status(201).json({ user });
});

router.post('/login', async (req, res) => {
  const { email, password, validEmail } = readCredentials(req.body);
  if (!validEmail || !password || password.length > 128) {
    return res.status(400).json({ error: 'Enter a valid email and password.' });
  }

  const { rows: [user] } = await pool.query(
    'SELECT id, email, password_hash FROM users WHERE email = $1',
    [email],
  );
  if (!user || !(await matchesPassword(password, user.password_hash))) {
    return res.status(401).json({ error: 'Email or password is incorrect.' });
  }

  const session = newSession();
  await pool.query(`
    WITH expired_sessions AS (
      DELETE FROM auth_sessions WHERE expires_at <= CURRENT_TIMESTAMP
    )
    INSERT INTO auth_sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)
  `, [session.tokenHash, user.id, session.expiresAt]);

  res.cookie(cookieName, session.token, { ...cookieOptions, maxAge: sessionLifetime });
  res.json({ user: { id: user.id, email: user.email } });
});

router.get('/me', async (req, res) => {
  const tokenHash = readSessionHash(req);
  if (tokenHash) {
    const { rows: [user] } = await pool.query(`
      SELECT users.id, users.email
      FROM auth_sessions
      JOIN users ON users.id = auth_sessions.user_id
      WHERE token_hash = $1 AND expires_at > CURRENT_TIMESTAMP
    `, [tokenHash]);

    if (user) {
      return res.json({ user });
    }

    res.clearCookie(cookieName, cookieOptions);
  }

  res.status(401).json({ error: 'Sign in to continue.' });
});

router.post('/logout', async (req, res) => {
  const tokenHash = readSessionHash(req);
  if (tokenHash) {
    await pool.query('DELETE FROM auth_sessions WHERE token_hash = $1', [tokenHash]);
  }

  res.clearCookie(cookieName, cookieOptions);
  res.sendStatus(204);
});

router.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  if (error.status === 400 || error.status === 413 || error.status === 415) {
    return res.status(error.status).json({ error: 'Invalid request body.' });
  }

  console.error('Authentication request failed:', error.message);
  res.status(500).json({ error: 'Authentication is unavailable. Try again.' });
});

module.exports = router;
