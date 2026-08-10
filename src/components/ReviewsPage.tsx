import React, { useState } from 'react';
import { Star, Send, MessageSquare, X, ThumbsUp, Sparkles, Filter } from 'lucide-react';
import { REVIEWS } from '../data/mockData';
import { Review } from '../types';

export const ReviewsPage: React.FC = () => {
  const [activeReviewModal, setActiveReviewModal] = useState<Review | null>(null);
  const [subjectFilter, setSubjectFilter] = useState<string>('Все');

  const filteredReviews =
    subjectFilter === 'Все'
      ? REVIEWS
      : REVIEWS.filter((r) => r.subject.toLowerCase().includes(subjectFilter.toLowerCase()));

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Hero */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFF1E8] text-[#FF6B35] text-xs font-black uppercase tracking-wider">
            <Star className="w-3.5 h-3.5 fill-[#FF6B35] text-[#FF6B35]" />
            <span>Настоящие отзывы</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Отзывы <span className="text-[#FF6B35]">EGE NETWORK</span>
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            О курсах, подготовке к ЕГЭ & ОГЭ и работе сервиса. Все отзывы от настоящих учеников.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
          {['Все', 'Русский', 'Биология', 'История', 'Физика', 'Обществознание', 'Информатика'].map((filter) => (
            <button
              key={filter}
              onClick={() => setSubjectFilter(filter)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                subjectFilter === filter
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((rev) => (
            <article
              key={rev.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs hover:shadow-md hover:border-[#FFB09D] transition-all flex flex-col justify-between space-y-4 cursor-pointer group"
              onClick={() => setActiveReviewModal(rev)}
            >
              <div className="space-y-3">
                {/* Author Info */}
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#FFF1E8] text-[#FF6B35] font-black text-lg flex items-center justify-center overflow-hidden border border-[#FFD3BA] shrink-0">
                    {rev.avatarUrl ? (
                      <img src={rev.avatarUrl} alt={rev.author} className="w-full h-full object-cover" />
                    ) : (
                      rev.author.charAt(0)
                    )}
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-[#FF6B35] transition-colors">
                      {rev.author}
                    </h3>
                    <div className="text-xs text-slate-500 font-medium">
                      {rev.subject} · <span className="text-[#FF6B35] font-bold">{rev.year}</span>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Preview text */}
                <p className="text-xs text-slate-700 leading-relaxed line-clamp-4">
                  "{rev.previewText}"
                </p>
              </div>

              {/* Action hint */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition-transform">
                <span>Читать полностью</span>
                <span>→</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* REVIEW MODAL POPUP */}
      {activeReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 relative shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveReviewModal(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#FFF1E8] text-[#FF6B35] font-black text-2xl flex items-center justify-center overflow-hidden border-2 border-[#FFD3BA] shrink-0">
                {activeReviewModal.avatarUrl ? (
                  <img src={activeReviewModal.avatarUrl} alt={activeReviewModal.author} className="w-full h-full object-cover" />
                ) : (
                  activeReviewModal.author.charAt(0)
                )}
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">{activeReviewModal.author}</h3>
                <p className="text-xs text-slate-500 font-bold">
                  {activeReviewModal.subject} · Выпуск <span className="text-[#FF6B35]">{activeReviewModal.year}</span>
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(activeReviewModal.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 text-sm text-slate-800 leading-relaxed whitespace-pre-line">
              {activeReviewModal.fullText}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400 font-medium">Проверено EGE NETWORK Verification</span>
              <button
                onClick={() => setActiveReviewModal(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
