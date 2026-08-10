import React from 'react';
import { 
  X, 
  Play, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  GraduationCap, 
  Download, 
  ShieldCheck, 
  ArrowRight,
  Tv,
  BookOpen,
  Award,
  Zap
} from 'lucide-react';
import { PageType } from '../types';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToDashboard?: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  isOpen,
  onClose,
  onGoToDashboard,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF6B35]/20 border border-[#FF6B35]/30 flex items-center justify-center text-[#FF6B35]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                Как устроено обучение
              </h2>
              <p className="text-xs text-slate-400">
                Полный цикл от видеоурока до проверки знаний
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-8 bg-slate-50">
          
          {/* Step By Step Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#FF6B35] font-black text-xs flex items-center justify-center">
                01
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">1. Покупка курса</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Доступ ко всем популярным школам со скидками до 90%.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 font-black text-xs flex items-center justify-center">
                02
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">2. Личный кабинет</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Все купленные предметы, уроки и материалы в одном месте.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 font-black text-xs flex items-center justify-center">
                03
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">3. Плеер AliceEge</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Просмотр видео в HLS качестве с выбором скорости и разрешения.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 font-black text-xs flex items-center justify-center">
                04
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">4. Конспекты и ДЗ</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Скачивание методичек, отправка решений и трекинг успеваемости.
              </p>
            </div>
          </div>

          {/* Interactive Visual Preview Card */}
          <div className="bg-slate-900 rounded-3xl p-5 text-white border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-mono text-slate-400 ml-2">
                  Интерактивный предпросмотр урока в Личном кабинете
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                Встроенный плеер
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
              {/* Player mockup */}
              <div className="lg:col-span-2 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative group min-h-[200px] flex flex-col justify-between p-4">
                <div className="flex justify-between items-center z-10">
                  <span className="px-2.5 py-1 bg-purple-600/80 rounded-lg text-xs font-semibold text-white backdrop-blur-sm">
                    Урок 04. Программирование задач №15-27
                  </span>
                  <span className="text-xs font-mono text-slate-400">1080p • 1.25x</span>
                </div>

                <div className="my-auto text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-purple-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-purple-600/40 group-hover:scale-110 transition-transform">
                    <Play className="w-7 h-7 fill-white ml-1" />
                  </div>
                  <p className="text-xs text-slate-400 mt-3 font-medium">
                    Смотрите уроки напрямую из Вашего личного кабинета без рекламы и сбоев
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <span>01:14:20 / 01:45:00</span>
                  <span className="text-emerald-400 font-semibold">✓ Авторизация по API-ключу</span>
                </div>
              </div>

              {/* Lesson Materials Mockup */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-purple-400" />
                    Материалы к уроку
                  </h4>
                  
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                          PDF
                        </span>
                        <span className="text-slate-200 font-medium">Конспект урока #4</span>
                      </div>
                      <Download className="w-3.5 h-3.5 text-slate-400" />
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                          ДЗ
                        </span>
                        <span className="text-slate-200 font-medium">Домашнее задание</span>
                      </div>
                      <Download className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Автопроверка ДЗ
                  </div>
                  <p className="text-[10px] text-emerald-400/80 leading-normal">
                    Решайте тесты и получайте мгновенную разборку ошибок от преподавателей.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer Action */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Все материалы остаются в Вашем доступе навсегда</span>
          </div>

          <button
            onClick={() => {
              onClose();
              if (onGoToDashboard) {
                onGoToDashboard();
              }
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#FF6B35] hover:bg-[#E65A22] text-white font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-[#FF6B35]/20 cursor-pointer"
          >
            <span>Перейти в Личный кабинет</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
