import React, { useState, useEffect } from 'react';
import { X, Play, Key, Video, Settings, FileText, Download, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { VideoPlayer, DEFAULT_ALICEEGE_API_KEY } from './player/VideoPlayer';

interface AliceEgePlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoTitle?: string;
  initialPlaybackUrl?: string;
}

export const DEMO_STREAMS = [
  {
    title: 'Тестовый HLS поток (Big Buck Bunny)',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  },
  {
    title: 'Тестовый HLS поток (Tears of Steel)',
    url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
  },
];

interface CourseMaterials {
  course_id: number;
  module_id: number;
  videos: string[];
  files: Array<{
    url: string;
    file_type: 'MATERIAL' | 'HOMEWORK';
  }>;
}

export function AliceEgePlayerModal({
  isOpen,
  onClose,
  videoTitle = 'Демо-урок с плеером AliceEge',
  initialPlaybackUrl = DEMO_STREAMS[0].url,
}: AliceEgePlayerModalProps) {
  const [playbackUrl, setPlaybackUrl] = useState(initialPlaybackUrl);
  const [apiKey, setApiKey] = useState(DEFAULT_ALICEEGE_API_KEY);
  const [showSettings, setShowSettings] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(videoTitle);

  // External API state
  const [courseId, setCourseId] = useState('1');
  const [moduleId, setModuleId] = useState('1');
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fetchedMaterials, setFetchedMaterials] = useState<CourseMaterials | null>(null);

  const fetchCourseMaterials = async (cId = courseId, mId = moduleId) => {
    setIsLoadingApi(true);
    setApiError(null);
    try {
      const response = await fetch(
        `/api/external/course-materials?courseId=${cId}&moduleId=${mId}&apiKey=${encodeURIComponent(apiKey)}`
      );
      const result = await response.json();

      if (result.success && result.data) {
        setFetchedMaterials(result.data);
        if (result.data.videos && result.data.videos.length > 0) {
          // Set first video as current playback
          setPlaybackUrl(result.data.videos[0]);
          setCurrentTitle(`Курс ${cId}, Модуль ${mId} — Видео 1`);
        }
      } else {
        setApiError(result.error || 'Не удалось загрузить материалы');
      }
    } catch (err: any) {
      setApiError(err.message || 'Ошибка запроса к серверу');
    } finally {
      setIsLoadingApi(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Fetch default course 1, module 1 on open
      fetchCourseMaterials('1', '1');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                <span className="truncate max-w-[220px] sm:max-w-[380px]">{currentTitle}</span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full shrink-0">
                  AliceEge Player
                </span>
              </h2>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Key className="w-3 h-3 text-emerald-400" />
                API-Key: <code className="text-slate-300 font-mono">{apiKey.slice(0, 12)}...</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-xl transition-all ${
                showSettings
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Настройки API и внешних видео"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Settings & External API Bar */}
        {showSettings && (
          <div className="p-4 bg-slate-900/95 border-b border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm animate-slideUp shrink-0">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Course ID
              </label>
              <input
                type="number"
                min="1"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Module ID
              </label>
              <input
                type="number"
                min="1"
                value={moduleId}
                onChange={(e) => setModuleId(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                X-API-Key
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div className="col-span-full flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => fetchCourseMaterials(courseId, moduleId)}
                disabled={isLoadingApi}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
              >
                {isLoadingApi ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Загрузить материалы урока из API
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400">Демо-потоки:</span>
                {DEMO_STREAMS.map((stream, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPlaybackUrl(stream.url);
                      setCurrentTitle(stream.title);
                    }}
                    className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors"
                  >
                    {stream.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Player Container */}
          <div className="relative bg-black min-h-[350px] sm:min-h-[440px] flex-1">
            <VideoPlayer
              source={playbackUrl}
              apiKey={apiKey}
              title={currentTitle}
              autoPlay={false}
              muted={false}
            />
          </div>

          {/* External Materials Drawer */}
          <div className="bg-slate-900/90 border-t border-slate-800 p-4 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-semibold text-white">
                  Материалы модуля (Курс #{courseId}, Модуль #{moduleId})
                </h3>
              </div>

              <button
                onClick={() => fetchCourseMaterials(courseId, moduleId)}
                disabled={isLoadingApi}
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingApi ? 'animate-spin' : ''}`} />
                Обновить
              </button>
            </div>

            {apiError && (
              <div className="p-3 mb-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{apiError} (сервер new-admin.aliceege.site вернул ошибку)</span>
              </div>
            )}

            {fetchedMaterials && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Videos list */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="font-semibold text-slate-300 block mb-2">
                    Видеоуроков ({fetchedMaterials.videos?.length || 0}):
                  </span>
                  {fetchedMaterials.videos && fetchedMaterials.videos.length > 0 ? (
                    <div className="space-y-1.5">
                      {fetchedMaterials.videos.map((vidUrl, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setPlaybackUrl(vidUrl);
                            setCurrentTitle(`Курс #${courseId}, Модуль #${moduleId} — Видео ${idx + 1}`);
                          }}
                          className={`w-full text-left p-2 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                            playbackUrl === vidUrl
                              ? 'bg-purple-950/50 border-purple-500/50 text-purple-200'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span className="truncate max-w-[280px]">
                            {idx + 1}. HLS Поток
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-purple-400 font-medium">
                            <Play className="w-3 h-3 fill-purple-400" /> Смотреть
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 italic">Видео в этом модуле пока нет</p>
                  )}
                </div>

                {/* Files list */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="font-semibold text-slate-300 block mb-2">
                    Файлы и ДЗ ({fetchedMaterials.files?.length || 0}):
                  </span>
                  {fetchedMaterials.files && fetchedMaterials.files.length > 0 ? (
                    <div className="space-y-1.5">
                      {fetchedMaterials.files.map((file, idx) => (
                        <a
                          key={idx}
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 flex items-center justify-between transition-colors"
                        >
                          <span className="flex items-center gap-1.5">
                            <span className={`px-1.5 py-0.5 text-[10px] rounded font-semibold ${
                              file.file_type === 'HOMEWORK'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-blue-500/20 text-blue-300'
                            }`}>
                              {file.file_type === 'HOMEWORK' ? 'ДЗ' : 'МАТЕРИАЛ'}
                            </span>
                            <span>Файл #{idx + 1}</span>
                          </span>
                          <Download className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 italic">Дополнительных файлов не прикреплено</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="px-5 py-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Интеграция External Content API (`/api/external/courses/:cId/modules/:mId/materials`)
          </span>
          <span className="font-mono text-slate-500">AliceEge Core</span>
        </div>
      </div>
    </div>
  );
}
