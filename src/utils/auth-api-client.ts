/**
 * FRONTEND API CLIENT
 * Работа с backend auth сервисом
 * 
 * Используется вместо localStorage для production
 */

import { User } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// ============================================
// ТИПЫ
// ============================================

interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  userId?: string;
  user?: Partial<User>;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

// ============================================
// AUTH API
// ============================================

export const authAPI = {
  /**
   * Регистрация нового пользователя
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include', // Для cookies
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Ошибка регистрации',
        };
      }

      return result;
    } catch (error: any) {
      console.error('Register error:', error);
      return {
        success: false,
        error: 'Ошибка подключения к серверу',
      };
    }
  },

  /**
   * Вход в систему
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Ошибка входа',
        };
      }

      return result;
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Ошибка подключения к серверу',
      };
    }
  },

  /**
   * Выход из системы
   */
  async logout(): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      return await response.json();
    } catch (error: any) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: 'Ошибка выхода',
      };
    }
  },

  /**
   * Получить текущего пользователя
   */
  async getCurrentUser(): Promise<{ user?: Partial<User>; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        return { error: 'Пользователь не авторизован' };
      }

      const result = await response.json();
      return result.success ? { user: result.user } : { error: 'Ошибка получения пользователя' };
    } catch (error: any) {
      console.error('Get current user error:', error);
      return { error: 'Ошибка подключения' };
    }
  },

  /**
   * Подтверждение email по токену
   */
  async verifyEmail(token: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
        credentials: 'include',
      });

      return await response.json();
    } catch (error: any) {
      console.error('Verify email error:', error);
      return {
        success: false,
        error: 'Ошибка проверки email',
      };
    }
  },

  /**
   * Запрос на восстановление пароля
   */
  async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include',
      });

      return await response.json();
    } catch (error: any) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        error: 'Ошибка при отправке запроса',
      };
    }
  },

  /**
   * Сброс пароля по токену
   */
  async resetPassword(token: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
        credentials: 'include',
      });

      return await response.json();
    } catch (error: any) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: 'Ошибка при сбросе пароля',
      };
    }
  },

  /**
   * Обновление токена
   */
  async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      return await response.json();
    } catch (error: any) {
      console.error('Refresh token error:', error);
      return {
        success: false,
        error: 'Ошибка обновления токена',
      };
    }
  },
};

// ============================================
// ВАЛИДАЦИЯ (КЛИЕНТ)
// ============================================

export const validators = {
  email: (email: string): { valid: boolean; error?: string } => {
    if (!email) return { valid: false, error: 'Email обязателен' };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'Некорректный email' };
    }
    return { valid: true };
  },

  password: (password: string): { valid: boolean; error?: string } => {
    if (!password) return { valid: false, error: 'Пароль обязателен' };
    if (password.length < 8) {
      return { valid: false, error: 'Пароль минимум 8 символов' };
    }
    return { valid: true };
  },

  name: (name: string): { valid: boolean; error?: string } => {
    if (!name) return { valid: false, error: 'Имя обязательно' };
    if (name.length < 2) {
      return { valid: false, error: 'Имя минимум 2 символа' };
    }
    return { valid: true };
  },
};

// ============================================
// HELPER - для автоматического обновления токена
// ============================================

let tokenRefreshInterval: NodeJS.Timeout | null = null;

export const setupTokenRefresh = () => {
  // Обновление токена каждые 50 минут (access token на 1 час)
  tokenRefreshInterval = setInterval(async () => {
    const result = await authAPI.refreshToken();
    if (!result.success) {
      console.warn('Token refresh failed, user may be logged out');
    }
  }, 50 * 60 * 1000);
};

export const stopTokenRefresh = () => {
  if (tokenRefreshInterval) {
    clearInterval(tokenRefreshInterval);
    tokenRefreshInterval = null;
  }
};
