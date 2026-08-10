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
import { getCurrentUser, setCurrentUser as saveCurrentUser } from './utils/adminAuth';
import { setupTokenRefresh, stopTokenRefresh } from './utils/auth-api-client';

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

  // Инициализация автоматического обновления токена
  useEffect(() => {
    setupTokenRefresh();
    return () => stopTokenRefresh();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

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
