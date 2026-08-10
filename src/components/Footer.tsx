import React from 'react';
import { Send, Heart, ShieldCheck } from 'lucide-react';
import { PageType } from '../types';
import logoImage from '../assets/images/logo.jpg';

interface FooterProps {
  setActivePage: (page: PageType) => void;
  onOpenPrivacyModal?: () => void;
  onOpenTermsModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setActivePage, onOpenPrivacyModal, onOpenTermsModal }) => {
  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={logoImage}
                alt="EGE NETWORK Logo"
                className="w-[220px] h-16 rounded-3xl object-cover bg-white p-2 shadow-lg shadow-slate-950/15 ring-1 ring-slate-300/60"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="flex items-center gap-1 leading-none">
                  <span className="font-black text-xl tracking-tight text-white">
                    EGE
                  </span>
                  <span className="bg-[#FF6B35] text-white text-[10px] font-black px-1.5 py-0.5 rounded-md transform rotate-6">
                    %
                  </span>
                </div>
                <div className="text-[9px] font-black tracking-[0.25em] text-[#FF6B35] uppercase mt-0.5">
                  NETWORK
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Все топовые онлайн-школы в одном месте.
            </p>
          </div>

          {/* Nav Col */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Навигация</h3>
            <ul className="space-y-2 text-xs font-semibold text-slate-300">
              <li>
                <button onClick={() => setActivePage('catalog')} className="hover:text-[#FF6B35] transition-colors">
                  Главная
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('ege')} className="hover:text-[#FF6B35] transition-colors">
                  Курсы ЕГЭ
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('reviews')} className="hover:text-[#FF6B35] transition-colors">
                  Отзывы учеников
                </button>
              </li>
            </ul>
          </div>

          {/* Social / Links Col */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Связь</h3>
            <ul className="space-y-2 text-xs font-semibold text-slate-300">
              <li>
                <a
                  href="https://t.me/egemanager"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#FF6B35] transition-colors"
                >
                  Поддержка
                </a>
              </li>
            </ul>
          </div>

          {/* Online Support Contact Card */}
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 space-y-3">
            <div className="text-[11px] font-extrabold text-[#FF6B35] uppercase tracking-wider">
              Поддержка онлайн
            </div>
            <p className="text-xs text-slate-200 font-bold leading-snug">
              Техподдержка работает через сайт: напишите нам через форму обратной связи.
            </p>

            <a
              href="https://t.me/egemanager"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#FF6B35] hover:bg-[#E65A22] text-white font-bold text-xs transition-all shadow-md shadow-[#FF6B35]/20"
            >
              <Send className="w-3.5 h-3.5 fill-white" />
              <span>Обратиться в поддержку</span>
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <div>© 2021–2026 EGE NETWORK. Все права защищены.</div>

          <div className="flex items-center gap-4">
            <button onClick={onOpenPrivacyModal} className="hover:text-slate-300 transition-colors">
              Политика конфиденциальности
            </button>
            <span>·</span>
            <button onClick={onOpenTermsModal} className="hover:text-slate-300 transition-colors">
              Условия использования
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
