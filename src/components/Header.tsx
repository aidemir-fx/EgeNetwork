import React from 'react';
import { ShoppingBag, Send, Menu, X, Sparkles, ShieldCheck, LogOut, User as UserIcon, PlayCircle } from 'lucide-react';
import { PageType, User } from '../types';
import logoImage from '../assets/images/logo.jpg';

interface HeaderProps {
  activePage: PageType;
  setActivePage: (page: PageType) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAuthModal: () => void;
  onOpenPlayer?: () => void;
  currentUser: User | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePage,
  setActivePage,
  cartCount,
  onOpenCart,
  onOpenAuthModal,
  onOpenPlayer,
  currentUser,
  onLogout,
}) => {

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleNav = (page: PageType) => {
    setActivePage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAdmin = currentUser?.role && ['admin', 'manager', 'moderator', 'support'].includes(currentUser.role);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/95 border-b border-slate-100 shadow-2xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-6 min-w-0">
          <button
            onClick={() => handleNav('catalog')}
            className="group flex items-center gap-2 text-left focus:outline-none cursor-pointer shrink"
          >
            <img
              src={logoImage}
              alt="EGE NETWORK Logo"
              className="h-10 sm:h-12 md:h-14 w-auto max-w-[160px] sm:max-w-[240px] md:max-w-[300px] rounded-2xl object-contain bg-white p-1 shadow-sm shadow-slate-950/10 ring-1 ring-slate-200 transition-transform group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </button>

          {/* Desktop Navigation Pills */}
          <nav className="hidden md:flex items-center gap-1.5 ml-4 bg-slate-100/60 p-1.5 rounded-full border border-slate-200/50">
            <button
              onClick={() => handleNav('catalog')}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all flex flex-col items-center justify-center cursor-pointer ${
                activePage === 'catalog'
                  ? 'bg-[#FFF1E8] text-[#FF6B35]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span>Главная</span>
              {activePage === 'catalog' && (
                <span className="w-1.5 h-1.5 bg-[#FF6B35] rounded-full mt-0.5" />
              )}
            </button>

            <button
              onClick={() => handleNav('ege')}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all cursor-pointer ${
                activePage === 'ege'
                  ? 'bg-[#FFF1E8] text-[#FF6B35]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              ЕГЭ
            </button>

            <button
              onClick={() => {
                handleNav('catalog');
                setTimeout(() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }), 80);
              }}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all cursor-pointer ${
                false
                  ? 'bg-[#E8F8EC] text-[#2DB34D]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              Как это работает
            </button>

            {onOpenPlayer && (
              <button
                onClick={onOpenPlayer}
                className="px-3.5 py-1.5 rounded-full text-sm font-extrabold text-purple-700 bg-purple-100 hover:bg-purple-200 border border-purple-300/60 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Плеер видеоуроков AliceEge"
              >
                <PlayCircle className="w-4 h-4 text-purple-600 fill-purple-200" />
                <span>Плеер</span>
              </button>
            )}
          </nav>

        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          
          {/* Admin Panel Button - ONLY DISPLAYED IF AUTHORIZED ADMIN */}
          {isAdmin && (
            <button
              onClick={() => handleNav('admin')}
              id="header-admin-btn"
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-black text-xs transition-all cursor-pointer ${
                activePage === 'admin'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-[#151C2C] text-purple-300 hover:bg-purple-950 hover:text-white border border-purple-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">Админка</span>
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            </button>
          )}

          {/* Cart Button (Always visible for all users) */}
          <button
            onClick={onOpenCart}
            id="header-cart-btn"
            className={`relative flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-extrabold transition-all border cursor-pointer ${
              cartCount > 0
                ? 'bg-[#FF6B35] text-white border-[#FF6B35] shadow-md shadow-[#FF6B35]/25 animate-pulse-subtle hover:bg-[#E65A22]'
                : 'bg-[#FFF1E8] hover:bg-[#FFEDD8] text-[#FF6B35] border-[#FFD3BA]'
            }`}
            aria-label="Открыть корзину"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Корзина</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-black ${
              cartCount > 0 ? 'bg-white text-[#FF6B35]' : 'bg-[#FF6B35] text-white'
            }`}>
              {cartCount}
            </span>
          </button>

          {/* User Auth Info or Login Button */}
          {currentUser ? (
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200/80 text-xs font-bold text-slate-800">
              <UserIcon className="w-3.5 h-3.5 text-[#FF6B35]" />
              <span>{currentUser.telegramId ? `@${currentUser.telegramId}` : currentUser.name || currentUser.email}</span>
              <button
                onClick={onLogout}
                title="Выйти"
                className="p-1 rounded-full bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors cursor-pointer ml-1"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              id="header-auth-btn"
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-extrabold transition-all cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5 text-white" />
              <span>Войти</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            aria-label="Переключить меню"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/98 px-4 pt-3 pb-5 space-y-2 animate-fadeIn shadow-lg">
          {currentUser && (
            <div className="flex items-center justify-between bg-slate-100 p-3 rounded-xl mb-2 text-xs font-bold text-slate-800">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-[#FF6B35]" />
                <span>{currentUser.telegramId ? `@${currentUser.telegramId}` : currentUser.name || currentUser.email}</span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-1 text-red-600 bg-white px-2.5 py-1 rounded-lg border border-red-200 font-extrabold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Выйти</span>
              </button>
            </div>
          )}
          {isAdmin && (
            <button
              onClick={() => handleNav('admin')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-base font-bold flex items-center gap-2 ${
                activePage === 'admin' ? 'bg-purple-600 text-white' : 'bg-purple-950 text-purple-200'
              }`}
            >
              <ShieldCheck className="w-5 h-5 text-purple-400" />
              <span>Панель Администратора</span>
            </button>
          )}
          <button
            onClick={() => handleNav('catalog')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-base font-semibold ${
              activePage === 'catalog' ? 'bg-[#FFF1E8] text-[#FF6B35] font-bold' : 'text-slate-700'
            }`}
          >
            Главная каталога
          </button>
          <button
            onClick={() => handleNav('ege')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-base font-semibold ${
              activePage === 'ege' ? 'bg-[#FFF1E8] text-[#FF6B35] font-bold' : 'text-slate-700'
            }`}
          >
            Курсы ЕГЭ 2027
          </button>

          {onOpenPlayer && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPlayer();
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-base font-bold text-purple-700 bg-purple-100 flex items-center gap-2 border border-purple-200"
            >
              <PlayCircle className="w-5 h-5 text-purple-600 fill-purple-200" />
              <span>AliceEge Видеоплеер</span>
            </button>
          )}

          <button
            onClick={() => {
              handleNav('catalog');
              setTimeout(() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }), 80);
            }}
            className="w-full text-left px-4 py-2.5 rounded-xl text-base font-semibold text-slate-700"
          >
            Как это работает
          </button>
        </div>
      )}
    </header>
  );
};
