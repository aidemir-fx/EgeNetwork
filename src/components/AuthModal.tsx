/**
 * PRODUCTION AUTH MODAL
 * Интегрирован с backend API
 * 
 * Заменяет старый AuthModal.tsx
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Send, Copy, Check, X, ShieldCheck, Sparkles, Bot, Smartphone,
  Mail, Lock, Eye, EyeOff, Loader
} from 'lucide-react';
import { User } from '../types';
import { checkAdminByTelegramId, setCurrentUser } from '../utils/adminAuth';
import { authAPI, validators } from '../utils/auth-api-client';
import { addSystemLog, getStoredSettings, registerOrUpdateUser } from '../utils/adminStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
  onLoginSuccess: (user: User) => void;
}

type AuthTab = 'telegram' | 'email';
type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, showToast, onLoginSuccess }) => {
  const [authTab, setAuthTab] = useState<AuthTab>('telegram');
  const [mode, setMode] = useState<AuthMode>('login');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tgInput, setTgInput] = useState('');
  const [showTgIdInput, setShowTgIdInput] = useState(false);
  const [copied, setCopied] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  const defaultTelegramBotLink = 'https://t.me/egemanager';
  const siteSettings = getStoredSettings();
  const authBotLink = siteSettings.telegramBotLink?.trim() || defaultTelegramBotLink;
  const botUsername = authBotLink.replace(/^https?:\/\/t\.me\//, '').replace(/^@/, '').trim();

  useEffect(() => {
    if (isOpen && window.Telegram?.WebApp?.initDataUnsafe?.user) {
      const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
      const tgIdStr = String(tgUser.id);
      const adminStaff = checkAdminByTelegramId(tgIdStr);

      const authenticatedUser: User = {
        id: `usr-${tgIdStr}`,
        name: tgUser.first_name + (tgUser.last_name ? ` ${tgUser.last_name}` : ''),
        telegramId: tgIdStr,
        role: adminStaff ? adminStaff.role : 'user',
        avatar: tgUser.photo_url,
        status: 'active',
        registeredAt: new Date().toISOString().split('T')[0],
        authMethod: 'telegram',
      };

      setCurrentUser(authenticatedUser);
      addSystemLog('Вход через WebApp', `Пользователь @${tgUser.username || tgIdStr} вошел через Telegram WebApp`, tgIdStr);
      onLoginSuccess(authenticatedUser);
      showToast(`Добро пожаловать, ${tgUser.first_name}!`);
      onClose();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    window.onTelegramAuth = (user) => {
      try {
        const tgIdStr = String(user.id);
        const adminStaff = checkAdminByTelegramId(tgIdStr);

        const authenticatedUser: User = {
          id: `usr-${tgIdStr}`,
          name: user.first_name + (user.last_name ? ` ${user.last_name}` : ''),
          telegramId: tgIdStr,
          role: adminStaff ? adminStaff.role : 'user',
          avatar: user.photo_url,
          status: 'active',
          registeredAt: new Date().toISOString().split('T')[0],
          authMethod: 'telegram',
        };

        setCurrentUser(authenticatedUser);
        registerOrUpdateUser(authenticatedUser);
        addSystemLog(
          adminStaff ? 'Вход администратора (Widget)' : 'Авторизация (Widget)',
          `Пользователь @${user.username || tgIdStr} вошел через Telegram Widget`,
          tgIdStr
        );
        onLoginSuccess(authenticatedUser);
        showToast(`Успешная авторизация через Telegram (@${user.username || user.first_name})`);
        onClose();
      } catch (err) {
        console.error('Telegram auth error:', err);
        showToast('Ошибка при авторизации через Telegram');
      }
    };

    try {
      if (widgetRef.current && botUsername) {
        widgetRef.current.innerHTML = '';
        const script = document.createElement('script');
        script.src = 'https://telegram.org/js/telegram-widget.js?22';
        script.setAttribute('data-telegram-login', botUsername);
        script.setAttribute('data-size', 'large');
        script.setAttribute('data-radius', '12');
        script.setAttribute('data-onauth', 'onTelegramAuth(user)');
        script.setAttribute('data-request-access', 'write');
        script.async = true;
        widgetRef.current.appendChild(script);
      }
    } catch (err) {
      console.warn('Telegram widget loading skipped or failed:', err);
    }
  }, [isOpen, botUsername]);

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!validators.email(emailInput).valid) {
      showToast(validators.email(emailInput).error || 'Ошибка');
      setLoading(false);
      return;
    }

    if (!validators.password(passwordInput).valid) {
      showToast(validators.password(passwordInput).error || 'Ошибка');
      setLoading(false);
      return;
    }

    if (!validators.name(nameInput).valid) {
      showToast(validators.name(nameInput).error || 'Ошибка');
      setLoading(false);
      return;
    }

    const result = await authAPI.register({
      email: emailInput.toLowerCase(),
      password: passwordInput,
      name: nameInput.trim(),
    });

    setLoading(false);

    if (!result.success) {
      showToast(result.error || 'Ошибка регистрации');
      return;
    }

    showToast('Регистрация успешна! Проверьте email для подтверждения.');
    addSystemLog('Регистрация через Email', `Новый пользователь ${emailInput} зарегистрирован`, '');

    setTimeout(() => {
      setMode('login');
      setEmailInput('');
      setPasswordInput('');
      setNameInput('');
    }, 2000);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!validators.email(emailInput).valid) {
      showToast(validators.email(emailInput).error || 'Ошибка');
      setLoading(false);
      return;
    }

    if (!validators.password(passwordInput).valid) {
      showToast(validators.password(passwordInput).error || 'Ошибка');
      setLoading(false);
      return;
    }

    const result = await authAPI.login({
      email: emailInput.toLowerCase(),
      password: passwordInput,
    });

    setLoading(false);

    if (!result.success) {
      showToast(result.error || 'Ошибка входа');
      return;
    }

    if (!result.user) {
      showToast('Ошибка: данные пользователя не получены');
      return;
    }

    const user: User = {
      id: result.user.id || `usr-${Date.now()}`,
      name: result.user.name || 'Пользователь',
      email: result.user.email,
      role: result.user.role || 'user',
      status: result.user.status || 'active',
      authMethod: 'email',
      registeredAt: new Date().toISOString().split('T')[0],
    };

    setCurrentUser(user);
    addSystemLog('Вход через Email', `Пользователь ${emailInput} вошел в систему`, '');
    onLoginSuccess(user);
    showToast(`Добро пожаловать, ${result.user.name}!`);
    onClose();
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!validators.email(emailInput).valid) {
      showToast(validators.email(emailInput).error || 'Ошибка');
      setLoading(false);
      return;
    }

    const result = await authAPI.forgotPassword(emailInput.toLowerCase());

    setLoading(false);

    showToast('Если email существует, письмо отправлено.');
    setEmailInput('');
    setMode('login');
  };

  const handleTelegramIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = tgInput.trim().replace(/^@/, '');
    if (!cleaned) {
      showToast('Введите ваш Telegram ID');
      return;
    }

    const adminStaff = checkAdminByTelegramId(cleaned);
    const authenticatedUser: User = {
      id: `usr-${cleaned}`,
      name: adminStaff ? adminStaff.name : `Пользователь (@${cleaned})`,
      telegramId: cleaned,
      role: adminStaff ? adminStaff.role : 'user',
      status: 'active',
      registeredAt: new Date().toISOString().split('T')[0],
      authMethod: 'telegram',
    };

    setCurrentUser(authenticatedUser);
    registerOrUpdateUser(authenticatedUser);
    addSystemLog(
      adminStaff ? 'Вход администратора' : 'Авторизация пользователя',
      `Пользователь @${cleaned} вошел в систему`,
      cleaned
    );
    onLoginSuccess(authenticatedUser);
    showToast(`Успешный вход через Telegram ID: ${cleaned}`);
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(authBotLink);
    setCopied(true);
    showToast('Ссылка скопирована!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 relative shadow-2xl border border-slate-100 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-[#FF6B35]/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all z-10 cursor-pointer"
          aria-label="Закрыть"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0088cc] to-[#229ed9] text-white shadow-lg shadow-[#0088cc]/30 mx-auto relative group">
            <Send className="w-7 h-7 ml-0.5 fill-white transition-transform group-hover:scale-110" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-[11px] font-black uppercase tracking-wider mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Авторизация</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {authTab === 'telegram' ? 'Вход через Telegram' : 'Вход по Email'}
            </h2>
          </div>
        </div>

        <div className="flex gap-2 bg-slate-100 rounded-xl p-1">
          <button
            onClick={() => { setAuthTab('telegram'); setMode('login'); }}
            className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all ${
              authTab === 'telegram'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bot className="w-4 h-4 inline mr-1" />
            Telegram
          </button>
          <button
            onClick={() => { setAuthTab('email'); setMode('login'); }}
            className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all ${
              authTab === 'email'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-4 h-4 inline mr-1" />
            Email
          </button>
        </div>

        {authTab === 'telegram' && (
          <>
            <div className="flex flex-col items-center justify-center py-2 min-h-[50px] bg-slate-50/80 rounded-2xl border border-slate-200/80 p-3">
              <div ref={widgetRef} className="flex justify-center" />
              <p className="text-[10px] text-slate-400 font-medium mt-2 text-center">
                Нажмите «Log in with Telegram» для входа
              </p>
            </div>

            <div className="space-y-2.5">
              <a
                href={authBotLink}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-[#0088cc] to-[#229ed9] hover:from-[#0077b5] hover:to-[#1d8cb8] text-white font-extrabold text-xs transition-all shadow-md shadow-[#0088cc]/20 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
              >
                <Bot className="w-4 h-4" />
                <span>Перейти в Telegram Бот (@{botUsername})</span>
              </a>

              {!showTgIdInput ? (
                <button
                  onClick={() => setShowTgIdInput(true)}
                  className="w-full py-2 text-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Ввести Telegram ID вручную ↵
                </button>
              ) : (
                <form onSubmit={handleTelegramIdSubmit} className="pt-2 space-y-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700">Telegram ID или @username</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tgInput}
                      onChange={(e) => setTgInput(e.target.value)}
                      placeholder="Например: 7948060541"
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-mono"
                      required
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all cursor-pointer"
                    >
                      Войти
                    </button>
                  </div>
                </form>
              )}
            </div>

            <button
              onClick={handleCopy}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                copied
                  ? 'bg-[#FF6B35] text-white border-[#FF6B35]'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Ссылка скопирована' : 'Скопировать ссылку'}</span>
            </button>
          </>
        )}

        {authTab === 'email' && (
          <form onSubmit={mode === 'register' ? handleEmailRegister : mode === 'forgot' ? handleForgotPassword : handleEmailLogin} className="space-y-3">
            {mode !== 'forgot' && (
              <div className="flex gap-2 bg-slate-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className={`flex-1 py-1.5 px-2 rounded-md font-bold text-xs transition-all ${
                    mode === 'login'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Вход
                </button>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className={`flex-1 py-1.5 px-2 rounded-md font-bold text-xs transition-all ${
                    mode === 'register'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Регистрация
                </button>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Имя</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Иван"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
                  disabled={loading}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
                  disabled={loading}
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Пароль</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder={mode === 'register' ? 'Минимум 8 символов' : 'Введите пароль'}
                    className="w-full pl-9 pr-9 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-[#0088cc] to-[#229ed9] hover:from-[#0077b5] hover:to-[#1d8cb8] disabled:from-slate-400 disabled:to-slate-400 text-white font-bold text-xs transition-all shadow-md shadow-[#0088cc]/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {mode === 'register' ? 'Зарегистрироваться' : mode === 'forgot' ? 'Отправить ссылку' : 'Войти'}
            </button>

            <div className="text-center text-xs text-slate-500 space-y-1">
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="block w-full hover:text-slate-700 transition-colors"
                >
                  Забыли пароль?
                </button>
              )}
              {mode === 'forgot' && (
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="block w-full hover:text-slate-700 transition-colors"
                >
                  Вернуться ко входу
                </button>
              )}
            </div>

            <p className="text-[10px] text-slate-400 text-center">
              {mode === 'register'
                ? 'Пароли хешируются на сервере с помощью bcrypt'
                : 'Ваши данные защищены и не будут переданы третьим лицам'}
            </p>
          </form>
        )}

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6B35]/50"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{authTab === 'telegram' ? 'SSL Secure' : 'Password Protected'}</span>
          </div>
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FF6B35]" />
            <span>256-bit</span>
          </div>
        </div>
      </div>
    </div>
  );
};
