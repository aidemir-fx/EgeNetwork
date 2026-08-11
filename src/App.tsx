import React, { useState, useEffect } from 'react';
import { PageType, CartItem, ExamType, User } from './types';
import { Header } from './components/Header';
import { CatalogSection } from './components/CatalogSection';
import { EgePage } from './components/EgePage';
import { ReviewsPage } from './components/ReviewsPage';
import { AdminPage } from './components/AdminPage';
import { DashboardPage } from './components/DashboardPage';
import { HowItWorksModal } from './components/HowItWorksModal';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { LegalModal } from './components/LegalModal';
import { AliceEgePlayerModal } from './components/AliceEgePlayerModal';
import { checkAdminByTelegramId, getCurrentUser, setCurrentUser as saveCurrentUser } from './utils/adminAuth';
import { authAPI, setupTokenRefresh, stopTokenRefresh } from './utils/auth-api-client';

export default function App() {
  const [activePage, setActivePage] = useState<PageType>('catalog');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState<boolean>(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState<boolean>(false);
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(() => getCurrentUser());
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('ege_network_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('ege_network_theme', theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Инициализация автоматического обновления токена
  useEffect(() => {
    setupTokenRefresh();
    return () => stopTokenRefresh();
  }, []);

  // Обработка токенов подтверждения email из URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyToken = params.get('verify');
    if (verifyToken) {
      authAPI.verifyEmail(verifyToken).then((res) => {
        if (res.success) {
          showToast('Email успешно подтвержден!');
        } else {
          showToast(res.error || 'Ошибка подтверждения email');
        }
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete('verify');
        window.history.replaceState(null, '', cleanUrl.toString());
      });
    }
  }, []);

  useEffect(() => {
    const consumeTelegramAuthResult = () => {
      const hashRaw = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
      const hashParams = new URLSearchParams(hashRaw);
      const searchParams = new URLSearchParams(window.location.search);
      const getTelegramParam = (key: string): string => hashParams.get(key) || searchParams.get(key) || '';

      const directTelegramId = getTelegramParam('id');
      const directTelegramAuthDate = getTelegramParam('auth_date');
      const directTelegramHash = getTelegramParam('hash');
      const hasAuthError = Boolean(searchParams.get('tgAuthError'));

      // Fallback for Telegram widget flows that return raw auth params to the current page.
      if (directTelegramId && directTelegramAuthDate && directTelegramHash && !hasAuthError) {
        const callbackUrl = new URL('/api/auth/telegram/callback', window.location.origin);
        searchParams.forEach((val, key) => callbackUrl.searchParams.set(key, val));
        hashParams.forEach((val, key) => {
          if (!callbackUrl.searchParams.has(key)) callbackUrl.searchParams.set(key, val);
        });

        const returnTo = `${window.location.origin}${window.location.pathname}`;
        callbackUrl.searchParams.set('return_to', returnTo);

        // Clean current URL before replacing to prevent infinite loops
        const cleanUrl = new URL(window.location.href);
        ['id', 'auth_date', 'hash', 'first_name', 'last_name', 'username', 'photo_url'].forEach((k) => cleanUrl.searchParams.delete(k));
        window.history.replaceState(null, '', cleanUrl.toString());

        window.location.replace(callbackUrl.toString());
        return;
      }

      const authResult = hashParams.get('tgAuthResult') || searchParams.get('tgAuthResult');

      if (!authResult) return;

      try {
        const encoded = decodeURIComponent(authResult).replace(/-/g, '+').replace(/_/g, '/');
        const padded = encoded + '='.repeat((4 - (encoded.length % 4)) % 4);
        const telegramUser = JSON.parse(window.atob(padded));
        const telegramId = String(telegramUser.id);
        const adminStaff = checkAdminByTelegramId(telegramId);
        const authenticatedUser: User = {
          id: `usr-${telegramId}`,
          name: telegramUser.first_name + (telegramUser.last_name ? ` ${telegramUser.last_name}` : ''),
          telegramId,
          role: adminStaff ? adminStaff.role : 'user',
          avatar: telegramUser.photo_url,
          status: 'active',
          registeredAt: new Date().toISOString().split('T')[0],
          authMethod: 'telegram',
        };

        saveCurrentUser(authenticatedUser);
        setCurrentUser(authenticatedUser);
        setIsAuthOpen(false);
        setActivePage('dashboard');

        const nextUrl = new URL(window.location.href);
        nextUrl.searchParams.delete('tgAuthResult');
        if (nextUrl.hash.includes('tgAuthResult=')) {
          const currentHashRaw = nextUrl.hash.startsWith('#') ? nextUrl.hash.slice(1) : nextUrl.hash;
          const currentHashParams = new URLSearchParams(currentHashRaw);
          currentHashParams.delete('tgAuthResult');
          const cleanedHash = currentHashParams.toString();
          nextUrl.hash = cleanedHash ? `#${cleanedHash}` : '';
        }

        window.history.replaceState(null, '', `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
      } catch (error) {
        console.error('Failed to restore Telegram auth result:', error);
      }
    };

    consumeTelegramAuthResult();
    window.addEventListener('hashchange', consumeTelegramAuthResult);

    return () => {
      window.removeEventListener('hashchange', consumeTelegramAuthResult);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tgAuthError = params.get('tgAuthError');
    if (!tgAuthError) return;

    const messageByCode: Record<string, string> = {
      bot_token_missing: 'Telegram вход временно недоступен: не настроен bot token.',
      missing_params: 'Telegram вход не завершен. Повторите попытку еще раз.',
      bad_auth_date: 'Telegram вернул некорректное время авторизации. Повторите вход.',
      expired_auth: 'Сессия Telegram истекла. Выполните вход заново.',
      invalid_hash: 'Ошибка проверки Telegram-подписи. Проверьте домен и токен бота.',
      server_error: 'Внутренняя ошибка Telegram входа. Попробуйте позже.',
    };

    showToast(messageByCode[tgAuthError] || `Ошибка Telegram входа: ${tgAuthError}`);

    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete('tgAuthError');
    window.history.replaceState(null, '', cleanUrl.toString());
  }, []);

  const handleAddToCart = (newItem: Omit<CartItem, 'id'>) => {
    const itemWithId: CartItem = {
      ...newItem,
      id: `${newItem.courseId}-${Date.now()}`,
    };
    setCartItems((prev) => [...prev, itemWithId]);
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    showToast('Курс удалён из корзины');
  };

  const handleClearCart = () => {
    setCartItems([]);
    showToast('Корзина очищена');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveCurrentUser(null);
    showToast('Вы вышли из системы');
    if (activePage === 'admin' || activePage === 'dashboard') {
      setActivePage('catalog');
    }
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    showToast(`С возвращением, ${user.name || 'ученик'}!`);
    setActivePage('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Sticky Header */}
      {activePage !== 'admin' && (
        <Header
          activePage={activePage}
          setActivePage={setActivePage}
          cartCount={cartItems.length}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenAuthModal={() => setIsAuthOpen(true)}
          onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
          currentUser={currentUser}
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}

      {/* Main Content Render */}
      <main className="flex-1">
        {activePage === 'catalog' && (
          <CatalogSection
            examFilter="EGE"
            onAddToCart={handleAddToCart}
            onOpenCart={() => setIsCartOpen(true)}
            onOpenAuthModal={() => setIsAuthOpen(true)}
            onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
            showToast={showToast}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'ege' && (
          <EgePage
            onAddToCart={handleAddToCart}
            onOpenCart={() => setIsCartOpen(true)}
            onOpenAuthModal={() => setIsAuthOpen(true)}
            showToast={showToast}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'reviews' && <ReviewsPage />}

        {activePage === 'dashboard' && (
          <DashboardPage
            currentUser={currentUser}
            onOpenAuthModal={() => setIsAuthOpen(true)}
            onLogout={handleLogout}
            setActivePage={setActivePage}
            showToast={showToast}
          />
        )}

        {activePage === 'admin' && (
          <AdminPage
            currentUser={currentUser}
            onExitAdmin={() => setActivePage('catalog')}
            showToast={showToast}
          />
        )}
      </main>

      {/* Footer */}
      {activePage !== 'admin' && (
        <Footer
          setActivePage={setActivePage}
          onOpenPrivacyModal={() => setLegalModalType('privacy')}
          onOpenTermsModal={() => setLegalModalType('terms')}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onOpenAuthModal={() => setIsAuthOpen(true)}
        showToast={showToast}
      />

      {/* Telegram Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        showToast={showToast}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* How It Works Visual Modal */}
      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
        onGoToDashboard={() => {
          setActivePage('dashboard');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Legal Privacy/Terms Modal */}
      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />

      {/* AliceEge Player Modal */}
      <AliceEgePlayerModal
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
      />

      {/* Toast Notifications */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
