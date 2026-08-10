/**
 * BACKEND AUTH СИСТЕМА
 * Безопасная реализация email/password аутентификации
 * 
 * Установи зависимости:
 * npm install bcryptjs jsonwebtoken express-rate-limit nodemailer validator dotenv
 */

import express, { Request, Response, NextFunction } from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import validator from 'validator';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import dotenv from 'dotenv';

dotenv.config();

// ============================================
// КОНФИГУРАЦИЯ
// ============================================

const isProduction = process.env.NODE_ENV === 'production';
const JWT_SECRET = process.env.JWT_SECRET || (isProduction ? '' : 'dev-access-secret');
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || (isProduction ? '' : 'dev-refresh-secret');
const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const getTelegramBotToken = (): string => (process.env.TELEGRAM_BOT_TOKEN || '').trim();

if (isProduction && (!JWT_SECRET || !JWT_REFRESH_SECRET)) {
  throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be configured in production');
}

// Email конфиг (Используй свой SMTP сервис)
const emailTransporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'egenetwork11@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password', // Google App Password
  },
});

// ============================================
// ТИПЫ
// ============================================

interface UserDocument {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  emailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: number;
  resetToken?: string;
  resetTokenExpiry?: number;
  lastLoginAt?: string;
  loginAttempts: number;
  lockUntil?: number; // timestamp
  status: 'active' | 'blocked';
  createdAt: string;
}

// SQLite-файл лежит в data, которая сохраняется Docker volume.
const authDatabasePath = process.env.AUTH_DB_PATH || path.resolve(process.cwd(), 'data/auth.sqlite');
fs.mkdirSync(path.dirname(authDatabasePath), { recursive: true });
const authDatabase = new DatabaseSync(authDatabasePath);
authDatabase.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL COLLATE NOCASE UNIQUE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    email_verified INTEGER NOT NULL DEFAULT 0,
    verification_token TEXT,
    verification_token_expiry INTEGER,
    reset_token TEXT,
    reset_token_expiry INTEGER,
    last_login_at TEXT,
    login_attempts INTEGER NOT NULL DEFAULT 0,
    lock_until INTEGER,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL
  );
`);

const findUserByEmail = authDatabase.prepare('SELECT * FROM users WHERE email = ?');
const findUserById = authDatabase.prepare('SELECT * FROM users WHERE id = ?');
const findUserByVerificationToken = authDatabase.prepare(
  'SELECT * FROM users WHERE verification_token = ? AND verification_token_expiry > ?'
);
const findUserByResetToken = authDatabase.prepare(
  'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > ?'
);
const insertUser = authDatabase.prepare(`
  INSERT INTO users (
    id, email, name, password_hash, email_verified, verification_token,
    verification_token_expiry, login_attempts, status, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const updateUser = authDatabase.prepare(`
  UPDATE users SET
    email_verified = ?, verification_token = ?, verification_token_expiry = ?,
    reset_token = ?, reset_token_expiry = ?, last_login_at = ?,
    login_attempts = ?, lock_until = ?, password_hash = ?, status = ?
  WHERE id = ?
`);

const mapUser = (row: any): UserDocument => ({
  id: row.id,
  email: row.email,
  name: row.name,
  passwordHash: row.password_hash,
  emailVerified: Boolean(row.email_verified),
  verificationToken: row.verification_token || undefined,
  verificationTokenExpiry: row.verification_token_expiry || undefined,
  resetToken: row.reset_token || undefined,
  resetTokenExpiry: row.reset_token_expiry || undefined,
  lastLoginAt: row.last_login_at || undefined,
  loginAttempts: row.login_attempts,
  lockUntil: row.lock_until || undefined,
  status: row.status,
  createdAt: row.created_at,
});

const saveUser = (user: UserDocument): void => {
  updateUser.run(
    user.emailVerified ? 1 : 0,
    user.verificationToken ?? null,
    user.verificationTokenExpiry ?? null,
    user.resetToken ?? null,
    user.resetTokenExpiry ?? null,
    user.lastLoginAt ?? null,
    user.loginAttempts,
    user.lockUntil ?? null,
    user.passwordHash,
    user.status,
    user.id
  );
};

// ============================================
// УТИЛИТЫ
// ============================================

const generateToken = (userId: string, secret: string, expiresIn: string = '7d'): string => {
  return jwt.sign({ userId, email: userId }, secret, { expiresIn });
};

const verifyToken = (token: string, secret: string): { userId: string; email: string } | null => {
  try {
    return jwt.verify(token, secret) as { userId: string; email: string };
  } catch {
    return null;
  }
};

const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
};

const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcryptjs.compare(password, hash);
};

type TelegramAuthInput = Record<string, unknown>;

type TelegramVerifyResult =
  | {
      success: true;
      payload: {
        id: number;
        first_name: string;
        last_name?: string;
        username?: string;
        photo_url?: string;
      };
    }
  | {
      success: false;
      code: 'bot_token_missing' | 'missing_params' | 'bad_auth_date' | 'expired_auth' | 'invalid_hash';
    };

const verifyTelegramAuthData = (input: Record<string, unknown>): TelegramVerifyResult => {
  const botToken = getTelegramBotToken();
  if (!botToken) {
    console.warn('[TelegramAuth] TELEGRAM_BOT_TOKEN is missing in environment variables (.env)');
    return { success: false, code: 'bot_token_missing' };
  }

  const id = input.id != null ? String(input.id).trim() : '';
  const authDate = input.auth_date != null ? String(input.auth_date).trim() : '';
  const hash = typeof input.hash === 'string' ? input.hash.trim() : '';

  if (!id || !authDate || !hash) {
    return { success: false, code: 'missing_params' };
  }

  const authDateSec = Number.parseInt(authDate, 10);
  if (!Number.isFinite(authDateSec)) {
    return { success: false, code: 'bad_auth_date' };
  }

  const nowSec = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSec - authDateSec) > 86400) {
    return { success: false, code: 'expired_auth' };
  }

  // Official Telegram fields used in check_string HMAC calculation
  const ALLOWED_TELEGRAM_KEYS = [
    'allows_write_to_pm',
    'auth_date',
    'first_name',
    'id',
    'last_name',
    'photo_url',
    'username',
  ];

  const computeHash = (dataCheckString: string): string => {
    const secretKey = crypto.createHash('sha256').update(botToken).digest();
    return crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  };

  const safeCompare = (calcHash: string, targetHash: string): boolean => {
    const a = Buffer.from(calcHash, 'hex');
    const b = Buffer.from(targetHash, 'hex');
    return a.length > 0 && a.length === b.length && crypto.timingSafeEqual(a, b);
  };

  const rawEntries: [string, string][] = [];
  for (const key of ALLOWED_TELEGRAM_KEYS) {
    const val = input[key];
    if (val !== undefined && val !== null && val !== '') {
      rawEntries.push([key, String(val)]);
    }
  }

  // Generate variants for allows_write_to_pm normalization
  const variants: [string, string][][] = [];

  // Variant 1: As provided
  variants.push([...rawEntries]);

  // Variant 2: Normalizing allows_write_to_pm if present
  if (rawEntries.some(([k]) => k === 'allows_write_to_pm')) {
    variants.push(
      rawEntries.map(([k, v]) => (k === 'allows_write_to_pm' ? [k, '1'] : [k, v]))
    );
    variants.push(
      rawEntries.map(([k, v]) => (k === 'allows_write_to_pm' ? [k, 'true'] : [k, v]))
    );
    variants.push(
      rawEntries.filter(([k]) => k !== 'allows_write_to_pm')
    );
  }

  let matched = false;

  for (const variant of variants) {
    variant.sort(([a], [b]) => a.localeCompare(b));
    const checkString = variant.map(([k, v]) => `${k}=${v}`).join('\n');
    const calcHash = computeHash(checkString);
    if (safeCompare(calcHash, hash)) {
      matched = true;
      break;
    }
  }

  if (!matched) {
    console.warn('[TelegramAuth] Hash mismatch for input:', {
      id,
      username: input.username || null,
      authDate,
      hasHash: Boolean(hash),
    });
    return { success: false, code: 'invalid_hash' };
  }

  const firstName = typeof input.first_name === 'string' ? input.first_name : String(input.first_name || '');
  const lastName = typeof input.last_name === 'string' && input.last_name ? input.last_name : undefined;
  const username = typeof input.username === 'string' && input.username ? input.username : undefined;
  const photoUrl = typeof input.photo_url === 'string' && input.photo_url ? input.photo_url : undefined;

  return {
    success: true,
    payload: {
      id: Number(id),
      first_name: firstName,
      last_name: lastName,
      username,
      photo_url: photoUrl,
    },
  };
};

// ============================================
// EMAIL СЕРВИС
// ============================================

const sendVerificationEmail = async (email: string, token: string, name: string) => {
  const verificationUrl = `${APP_URL}?verify=${token}`;
  
  try {
    await emailTransporter.sendMail({
      from: 'EGE Network <noreply@egenetwork.ru>',
      to: email,
      subject: 'Подтвердите ваш email - EGE Network',
      html: `
        <h2>Добро пожаловать, ${name}!</h2>
        <p>Спасибо за регистрацию. Нажмите кнопку ниже для подтверждения email:</p>
        <a href="${verificationUrl}" style="display:inline-block; padding:10px 20px; background:#0088cc; color:white; text-decoration:none; border-radius:5px;">
          Подтвердить Email
        </a>
        <p>Или скопируй ссылку: ${verificationUrl}</p>
        <p>Ссылка действительна 24 часа.</p>
      `,
    });
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send verification email: ${error}`);
    throw new Error('Failed to send verification email');
  }
};

const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetUrl = `${APP_URL}?reset=${token}`;
  
  try {
    await emailTransporter.sendMail({
      from: 'EGE Network <noreply@egenetwork.ru>',
      to: email,
      subject: 'Восстановление пароля - EGE Network',
      html: `
        <h2>Восстановление пароля</h2>
        <p>Вы запросили восстановление пароля. Нажмите кнопку ниже:</p>
        <a href="${resetUrl}" style="display:inline-block; padding:10px 20px; background:#FF6B35; color:white; text-decoration:none; border-radius:5px;">
          Восстановить Пароль
        </a>
        <p>Или скопируй ссылку: ${resetUrl}</p>
        <p>Ссылка действительна 1 час.</p>
        <p>Если вы не запрашивали восстановление, проигнорируйте это письмо.</p>
      `,
    });
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send reset email: ${error}`);
    throw new Error('Failed to send password reset email');
  }
};

// ============================================
// MIDDLEWARE
// ============================================

// JWT верификация
const authenticateToken = (req: Request & { userId?: string }, res: Response, next: NextFunction) => {
  const token = req.cookies.accessToken;
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'Токен не найден' });
  }

  const payload = verifyToken(token, JWT_SECRET);
  if (!payload) {
    return res.status(401).json({ success: false, error: 'Невалидный токен' });
  }

  req.userId = payload.userId;
  next();
};

// Rate limiting для логина (5 попыток за 15 минут)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5,
  message: 'Слишком много неудачных попыток входа. Попробуйте позже.',
  standardHeaders: false,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Слишком много регистраций. Попробуйте позже.' },
});

const recoveryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Слишком много запросов. Попробуйте позже.' },
});

// ============================================
// ROUTES
// ============================================

const router = express.Router();

// POST /api/auth/telegram/debug
router.post('/telegram/debug', (req: Request, res: Response) => {
  try {
    const body = (req.body || {}) as Record<string, unknown>;
    const event = typeof body.event === 'string' ? body.event : 'unknown';
    const source = typeof body.source === 'string' ? body.source : 'client';
    const details = typeof body.details === 'object' && body.details !== null ? body.details : {};

    console.info('[TelegramAuth] debug', {
      event,
      source,
      host: req.hostname,
      details,
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Telegram debug logging error:', error);
    return res.status(500).json({ success: false });
  }
});

// POST /api/auth/telegram/verify
router.post('/telegram/verify', (req: Request, res: Response) => {
  try {
    const body = (req.body || {}) as Record<string, unknown>;
    const verification = verifyTelegramAuthData(body);
    if (!verification.success) {
      console.warn('[TelegramAuth] verify rejected', {
        code: verification.code,
        host: req.hostname,
        hasId: Boolean(body.id),
        hasAuthDate: Boolean(body.auth_date),
        hasHash: Boolean(body.hash),
      });
      return res.status(400).json({ success: false, error: verification.code });
    }

    console.info('[TelegramAuth] verify accepted', {
      userId: body.id,
      username: body.username || null,
      host: req.hostname,
    });

    return res.json({ success: true, user: verification.payload });
  } catch (error) {
    console.error('Telegram verify error:', error);
    return res.status(500).json({ success: false, error: 'server_error' });
  }
});

// GET /api/auth/telegram/callback
router.get('/telegram/callback', (req: Request, res: Response) => {
  try {
    const rawQuery = req.query as Record<string, unknown>;
    const input: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(rawQuery)) {
      if (Array.isArray(val)) {
        input[key] = typeof val[0] === 'string' ? val[0] : '';
      } else if (typeof val === 'string') {
        input[key] = val;
      }
    }

    const getQueryValue = (key: string): string => {
      const v = input[key];
      return typeof v === 'string' ? v : '';
    };

    const resolveReturnUrl = (): URL => {
      const fallback = new URL(APP_URL);
      const rawReturnTo = getQueryValue('return_to');
      if (!rawReturnTo) return fallback;

      try {
        const parsed = new URL(rawReturnTo);
        const allowedHosts = new Set<string>([
          fallback.hostname,
          req.hostname,
          fallback.hostname.startsWith('www.') ? fallback.hostname.slice(4) : `www.${fallback.hostname}`,
        ]);

        if (parsed.protocol === 'https:' && allowedHosts.has(parsed.hostname)) {
          return parsed;
        }
      } catch {
        // Ignore malformed return_to and fallback to APP_URL.
      }

      return fallback;
    };

    const redirectWithError = (code: string): void => {
      const errorUrl = resolveReturnUrl();
      errorUrl.searchParams.set('tgAuthError', code);
      console.warn('[TelegramAuth] callback rejected', {
        code,
        host: req.hostname,
        returnTo: getQueryValue('return_to') || null,
        hasId: Boolean(getQueryValue('id')),
        hasAuthDate: Boolean(getQueryValue('auth_date')),
        hasHash: Boolean(getQueryValue('hash')),
      });
      res.redirect(errorUrl.toString());
    };

    const verification = verifyTelegramAuthData(input);
    if (!verification.success) {
      redirectWithError(verification.code);
      return;
    }

    const tgAuthResult = Buffer.from(JSON.stringify(verification.payload), 'utf8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');

    const successUrl = resolveReturnUrl();
    successUrl.searchParams.delete('tgAuthError');
    successUrl.searchParams.delete('tgAuthResult');
    successUrl.hash = `tgAuthResult=${tgAuthResult}`;
    console.info('[TelegramAuth] callback accepted', {
      userId: input.id,
      username: input.username || null,
      host: req.hostname,
      returnTo: getQueryValue('return_to') || null,
    });
    return res.redirect(successUrl.toString());
  } catch (error) {
    console.error('Telegram callback error:', error);
    const errorUrl = new URL(APP_URL);
    errorUrl.searchParams.set('tgAuthError', 'server_error');
    return res.redirect(errorUrl.toString());
  }
});

// POST /api/auth/register
router.post('/register', registerLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Валидация
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, error: 'Все поля обязательны' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, error: 'Некорректный email' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, error: 'Пароль минимум 8 символов' });
    }

    if (name.length < 2) {
      return res.status(400).json({ success: false, error: 'Имя минимум 2 символа' });
    }

    // Проверка: email уже существует?
    const normalizedEmail = email.trim().toLowerCase();
    const existingRow = findUserByEmail.get(normalizedEmail);
    
    if (existingRow) {
      return res.status(409).json({ success: false, error: 'Email уже зарегистрирован' });
    }

    // Хеширование пароля
    const passwordHash = await hashPassword(password);
    const verificationToken = generateVerificationToken();

    // Создание пользователя
    const newUser: UserDocument = {
      id: `usr-${Date.now()}`,
      email: normalizedEmail,
      name: name.trim(),
      passwordHash,
      emailVerified: false,
      verificationToken,
      verificationTokenExpiry: Date.now() + 24 * 60 * 60 * 1000, // 24 часа
      loginAttempts: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    try {
      insertUser.run(
        newUser.id,
        newUser.email,
        newUser.name,
        newUser.passwordHash,
        0,
        newUser.verificationToken,
        newUser.verificationTokenExpiry,
        0,
        newUser.status,
        newUser.createdAt
      );
    } catch (error: any) {
      if (String(error?.message).includes('UNIQUE')) {
        return res.status(409).json({ success: false, error: 'Email уже зарегистрирован' });
      }
      throw error;
    }

    // Отправка письма подтверждения
    try {
      await sendVerificationEmail(email, verificationToken, name);
    } catch (emailError) {
      console.error('Email send failed:', emailError);
      // Пользователь создан, но письмо не отправлено
    }

    return res.status(201).json({
      success: true,
      message: 'Регистрация успешна. Проверьте email для подтверждения.',
      userId: newUser.id,
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, error: 'Ошибка регистрации' });
  }
});

// POST /api/auth/verify-email
router.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Токен не предоставлен' });
    }

    // Поиск пользователя с этим токеном
    const row = findUserByVerificationToken.get(token, Date.now());
    const user = row ? mapUser(row) : null;

    if (!user) {
      return res.status(400).json({ success: false, error: 'Невалидный или истёкший токен' });
    }

    // Подтверждение email
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    saveUser(user);

    return res.json({
      success: true,
      message: 'Email подтвержден успешно!',
    });
  } catch (error: any) {
    console.error('Verify email error:', error);
    return res.status(500).json({ success: false, error: 'Ошибка проверки email' });
  }
});

// POST /api/auth/login
router.post('/login', loginLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email и пароль обязательны' });
    }

    // Поиск пользователя
    const row = findUserByEmail.get(email.trim().toLowerCase());
    const user = row ? mapUser(row) : null;

    if (!user) {
      return res.status(401).json({ success: false, error: 'Неверные учетные данные' });
    }

    // Проверка блокировки (brute-force protection)
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(429).json({
        success: false,
        error: `Аккаунт заблокирован. Попробуйте через ${minutesLeft} минут.`,
      });
    }

    // Проверка пароля
    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      // Блокировка после 5 попыток
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000; // 15 минут блокировки
      }

      saveUser(user);
      return res.status(401).json({ success: false, error: 'Неверные учетные данные' });
    }

    // Успешный вход - сброс счетчика
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLoginAt = new Date().toISOString();
    saveUser(user);

    // Создание токенов
    if (!user.emailVerified) {
      return res.status(403).json({ success: false, error: 'Сначала подтвердите email' });
    }

    const accessToken = generateToken(user.id, JWT_SECRET, '1h');
    const refreshToken = generateToken(user.id, JWT_REFRESH_SECRET, '7d');

    // Отправка токенов в secure cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1 * 60 * 60 * 1000, // 1 час
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
    });

    return res.json({
      success: true,
      message: 'Успешный вход',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: 'Ошибка входа' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  
  return res.json({
    success: true,
    message: 'Выход успешен',
  });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', recoveryLimiter, async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email обязателен' });
    }

    // Поиск пользователя
    const row = findUserByEmail.get(email.trim().toLowerCase());
    const user = row ? mapUser(row) : null;

    // ⚠️ Не раскрываем, существует ли пользователь (security best practice)
    if (!user) {
      return res.json({
        success: true,
        message: 'Если email существует, письмо отправлено',
      });
    }

    // Генерация токена для сброса
    const resetToken = generateVerificationToken();
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 1 * 60 * 60 * 1000; // 1 час
    saveUser(user);

    // Отправка письма
    try {
      await sendPasswordResetEmail(email, resetToken);
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
    }

    return res.json({
      success: true,
      message: 'Если email существует, письмо отправлено',
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ success: false, error: 'Ошибка' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', recoveryLimiter, async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, error: 'Token и password обязательны' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, error: 'Пароль минимум 8 символов' });
    }

    // Поиск пользователя с этим токеном
    const row = findUserByResetToken.get(token, Date.now());
    const user = row ? mapUser(row) : null;

    if (!user) {
      return res.status(400).json({ success: false, error: 'Невалидный или истёкший токен' });
    }

    // Обновление пароля
    user.passwordHash = await hashPassword(password);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    user.loginAttempts = 0; // Сброс попыток входа
    saveUser(user);

    return res.json({
      success: true,
      message: 'Пароль изменен успешно',
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, error: 'Ошибка сброса пароля' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ success: false, error: 'Refresh token не найден' });
  }

  const payload = verifyToken(refreshToken, JWT_REFRESH_SECRET);
  if (!payload) {
    return res.status(401).json({ success: false, error: 'Невалидный refresh token' });
  }

  // Создание нового access token
  const newAccessToken = generateToken(payload.userId, JWT_SECRET, '1h');

  res.cookie('accessToken', newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 1 * 60 * 60 * 1000,
  });

  return res.json({ success: true, message: 'Token обновлен' });
});

// GET /api/auth/me (требует аутентификации)
router.get('/me', authenticateToken, (req: Request & { userId?: string }, res: Response) => {
  const row = findUserById.get(req.userId!);
  const user = row ? mapUser(row) : null;

  if (!user) {
    return res.status(404).json({ success: false, error: 'Пользователь не найден' });
  }

  return res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
    },
  });
});

export default router;
export { authenticateToken };
export type { UserDocument };
