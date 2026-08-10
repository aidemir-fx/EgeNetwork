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

// ============================================
// КОНФИГУРАЦИЯ
// ============================================

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

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

// Имитация БД (в production используй MongoDB/PostgreSQL)
const USERS_DB: Map<string, UserDocument> = new Map();

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
  skip: (req) => !req.body?.email, // Пропустить если нет email
});

// ============================================
// ROUTES
// ============================================

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
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
    const existing = Array.from(USERS_DB.values()).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email уже зарегистрирован' });
    }

    // Хеширование пароля
    const passwordHash = await hashPassword(password);
    const verificationToken = generateVerificationToken();

    // Создание пользователя
    const newUser: UserDocument = {
      id: `usr-${Date.now()}`,
      email: email.toLowerCase(),
      name,
      passwordHash,
      emailVerified: false,
      verificationToken,
      verificationTokenExpiry: Date.now() + 24 * 60 * 60 * 1000, // 24 часа
      loginAttempts: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    USERS_DB.set(newUser.id, newUser);

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
    const user = Array.from(USERS_DB.values()).find(
      (u) => u.verificationToken === token && 
             u.verificationTokenExpiry && 
             u.verificationTokenExpiry > Date.now()
    );

    if (!user) {
      return res.status(400).json({ success: false, error: 'Невалидный или истёкший токен' });
    }

    // Подтверждение email
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;

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
    const user = Array.from(USERS_DB.values()).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

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

      return res.status(401).json({ success: false, error: 'Неверные учетные данные' });
    }

    // Успешный вход - сброс счетчика
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLoginAt = new Date().toISOString();

    // Создание токенов
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
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email обязателен' });
    }

    // Поиск пользователя
    const user = Array.from(USERS_DB.values()).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

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
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, error: 'Token и password обязательны' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, error: 'Пароль минимум 8 символов' });
    }

    // Поиск пользователя с этим токеном
    const user = Array.from(USERS_DB.values()).find(
      (u) => u.resetToken === token && 
             u.resetTokenExpiry && 
             u.resetTokenExpiry > Date.now()
    );

    if (!user) {
      return res.status(400).json({ success: false, error: 'Невалидный или истёкший токен' });
    }

    // Обновление пароля
    user.passwordHash = await hashPassword(password);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    user.loginAttempts = 0; // Сброс попыток входа

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
  const user = USERS_DB.get(req.userId!);

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
