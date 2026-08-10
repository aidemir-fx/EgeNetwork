import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  BookOpen, 
  Play, 
  FileText, 
  Download, 
  Video, 
  LogOut, 
  Zap,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  ShoppingBag,
  PlusCircle,
  Lock
} from 'lucide-react';
import { User, PageType } from '../types';
import { VideoPlayer, DEFAULT_ALICEEGE_API_KEY } from './player/VideoPlayer';

interface DashboardPageProps {
  currentUser: User | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  setActivePage: (page: PageType) => void;
  showToast: (msg: string) => void;
}

interface ExternalCourseMaterials {
  course_id: number;
  module_id: number;
  videos: string[];
  files: Array<{
    url: string;
    file_type: 'MATERIAL' | 'HOMEWORK';
  }>;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  currentUser,
  onOpenAuthModal,
  onLogout,
  setActivePage,
  showToast,
}) => {
  // External API integration state
  const [apiCourseId, setApiCourseId] = useState('1');
  const [apiModuleId, setApiModuleId] = useState('1');
  const [apiKey, setApiKey] = useState(DEFAULT_ALICEEGE_API_KEY);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [materials, setMaterials] = useState<ExternalCourseMaterials | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [userBalance, setUserBalance] = useState<number>(0);

  const [activeLesson, setActiveLesson] = useState<{
    title: string;
    streamUrl: string;
    notesUrl?: string;
    homeworkUrl?: string;
  } | null>(null);

  const fetchExternalMaterials = async (cId = apiCourseId, mId = apiModuleId) => {
    setIsLoadingApi(true);
    setApiError(null);
    try {
      const response = await fetch(
        `/api/external/course-materials?courseId=${cId}&moduleId=${mId}&apiKey=${encodeURIComponent(apiKey)}`
      );
      const res = await response.json();
      if (res.success && res.data) {
        setMaterials(res.data);
      } else {
        setApiError(res.error || 'Ошибка загрузки материалов');
      }
    } catch (err: any) {
      setApiError(err.message || 'Ошибка подключения к API');
    } finally {
      setIsLoadingApi(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchExternalMaterials('1', '1');
    }
  }, [currentUser]);

  // If user is not logged in, show Auth Gate Card
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-[2rem] p-8 border border-slate-100 shadow-lg text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-50 text-[#22c55e] rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-10 h-10" />
          </div>

          <div>
            <span className="text-[11px] font-extrabold text-[#22c55e] uppercase tracking-wider block mb-1">
              ЛИЧНЫЙ КАБИНЕТ
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Доступ ограничен
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              Личный кабинет доступен только авторизованным пользователям. Войдите, чтобы просматривать ваши купленные курсы и материалы.
            </p>
          </div>

          <button
            onClick={onOpenAuthModal}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-extrabold text-sm transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            Войти в Личный Кабинет
          </button>
        </div>
      </div>
    );
  }

  const telegramHandle = currentUser.telegramId ? `@${currentUser.telegramId}` : currentUser.email || '@market_hedge';
  const telegramIdValue = currentUser.telegramId || '7948060541';

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* 1. TOP PROFILE CARD (MATCHES SCREENSHOT EXACTLY) */}
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-slate-900 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-md shrink-0 overflow-hidden">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                currentUser.name?.[0]?.toUpperCase() || 'Z'
              )}
            </div>

            <div>
              <span className="text-[11px] font-extrabold text-[#22c55e] uppercase tracking-wider block">
                ЛИЧНЫЙ КАБИНЕТ
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mt-0.5">
                {currentUser.name || 'Zero'}
              </h1>
              <p className="text-sm font-semibold text-slate-500 mt-0.5">
                {telegramHandle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setActivePage('ege')}
              className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-[#22c55e] hover:bg-[#1bb052] text-white font-extrabold text-sm transition-all shadow-sm cursor-pointer text-center"
            >
              Купить курсы
            </button>

            <button
              onClick={onLogout}
              className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-extrabold text-sm transition-all cursor-pointer text-center"
            >
              Выйти
            </button>
          </div>
        </div>

        {/* 2. STATS GRID (3 CARDS - MATCHES SCREENSHOT EXACTLY) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
          
          {/* Card 1: Баланс */}
          <div className="bg-white rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 border border-slate-100 shadow-2xs space-y-1.5 sm:space-y-2">
            <span className="text-slate-500 font-medium text-xs sm:text-sm block">
              Баланс
            </span>
            <div className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {userBalance} ₽
            </div>
            <div className="pt-1 sm:pt-2">
              <button
                onClick={() => showToast('Функция пополнения баланса доступна в платежном шлюзе')}
                className="bg-[#e8f5e9] hover:bg-[#d0edd3] text-[#22c55e] font-extrabold text-xs px-3 sm:px-4 py-1.5 rounded-full transition-all cursor-pointer inline-flex items-center gap-1"
              >
                Пополнить
              </button>
            </div>
          </div>

          {/* Card 2: Мои курсы */}
          <div className="bg-white rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 border border-slate-100 shadow-2xs space-y-1.5 sm:space-y-2">
            <span className="text-slate-500 font-medium text-xs sm:text-sm block">
              Мои курсы
            </span>
            <div className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {materials?.videos?.length ? 1 : 0}
            </div>
          </div>

          {/* Card 3: Telegram ID */}
          <div className="bg-white rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 border border-slate-100 shadow-2xs space-y-1.5 sm:space-y-2 overflow-hidden">
            <span className="text-slate-500 font-medium text-xs sm:text-sm block">
              Telegram ID
            </span>
            <div className="text-xl sm:text-4xl font-black text-slate-900 tracking-tight font-mono truncate">
              {telegramIdValue}
            </div>
          </div>

        </div>

        {/* 3. MAIN SECTION: KUPILENNYE COURSY (MATCHES SCREENSHOT) */}
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-2xs space-y-6">
          <div>
            <span className="bg-[#e8f5e9] text-[#22c55e] px-3.5 py-1 rounded-full text-xs font-extrabold inline-block mb-3">
              Мои курсы
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Купленные курсы
            </h2>
          </div>

          {/* ACTIVE LESSON PLAYER IF SELECTING A VIDEO */}
          {activeLesson && (
            <div className="bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl animate-fadeIn mb-6">
              <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-[#22c55e] flex items-center justify-center">
                    <Play className="w-4 h-4 fill-[#22c55e]" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-white">
                      {activeLesson.title}
                    </h2>
                    <p className="text-xs text-slate-400">
                      Видеоплеер AliceEge • Воспроизведение HLS
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveLesson(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Закрыть
                </button>
              </div>

              <div className="relative min-h-[380px] sm:min-h-[460px] bg-black">
                <VideoPlayer
                  source={activeLesson.streamUrl}
                  apiKey={apiKey}
                  title={activeLesson.title}
                  autoPlay={true}
                />
              </div>

              <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-3">
                  {activeLesson.notesUrl && activeLesson.notesUrl !== '#' && (
                    <a
                      href={activeLesson.notesUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500 hover:text-white font-semibold transition-all flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Скачать Конспект
                    </a>
                  )}

                  {activeLesson.homeworkUrl && activeLesson.homeworkUrl !== '#' && (
                    <a
                      href={activeLesson.homeworkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500 hover:text-slate-950 font-semibold transition-all flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Скачать ДЗ
                    </a>
                  )}
                </div>

                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> Авторизовано через X-API-Key
                </span>
              </div>
            </div>
          )}

          {/* CONTENT INSIDE "КУПЛЕННЫЕ КУРСЫ" */}
          {materials?.videos && materials.videos.length > 0 ? (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      ЕГЭ Информатика 2027 — Доступный модуль #{materials.module_id}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Найдено {materials.videos.length} видеоуроков • AliceEge HLS Player
                    </p>
                  </div>

                  <span className="px-3 py-1 bg-emerald-100 text-[#22c55e] text-xs font-bold rounded-full">
                    Активен
                  </span>
                </div>

                <div className="pt-2 space-y-2">
                  {materials.videos.map((vidUrl, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between gap-3 hover:border-emerald-300 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#22c55e] flex items-center justify-center font-bold text-xs">
                          <Play className="w-4 h-4 fill-[#22c55e]" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                            Урок #{idx + 1}. Видеоматериал модуля #{materials.module_id}
                          </h4>
                          <span className="text-[11px] text-slate-500 font-mono">
                            HLS Stream ready
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const matFile = materials.files?.find((f) => f.file_type === 'MATERIAL')?.url;
                          const hwFile = materials.files?.find((f) => f.file_type === 'HOMEWORK')?.url;
                          setActiveLesson({
                            title: `Модуль #${materials.module_id} — Видеоурок ${idx + 1}`,
                            streamUrl: vidUrl,
                            notesUrl: matFile,
                            homeworkUrl: hwFile,
                          });
                        }}
                        className="px-4 py-1.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-extrabold text-xs transition-all cursor-pointer shadow-sm"
                      >
                        Смотреть
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-12 text-center">
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Курсов пока нет
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                После покупки курсы появятся здесь.
              </p>
              <button
                onClick={() => setActivePage('ege')}
                className="px-6 py-2.5 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-extrabold text-xs transition-all cursor-pointer"
              >
                Перейти к выбору курсов
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
