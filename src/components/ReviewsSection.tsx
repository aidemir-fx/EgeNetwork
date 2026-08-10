import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { REVIEWS } from '../data/mockData';
import { Review } from '../types';

interface ReviewsSectionProps {
  onSeeAllClick?: () => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ onSeeAllClick }) => {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  // Take first 6 reviews to display in the 3x2 grid matching screenshot
  const displayedReviews = REVIEWS.slice(0, 6);

  const getAvatarBadge = (review: Review, index: number) => {
    if (review.avatarUrl) {
      return (
        <img
          src={review.avatarUrl}
          alt={review.author}
          className="w-12 h-12 rounded-full object-cover shrink-0"
        />
      );
    }

    // Color variants matching screenshot style
    const colors = [
      'bg-sky-400 text-white',
      'bg-gradient-to-tr from-amber-500 to-orange-400 text-white',
      'bg-indigo-400 text-white',
      'bg-[#FF6B35] text-white',
      'bg-purple-400 text-white',
    ];
    const colorClass = colors[index % colors.length];

    return (
      <div className={`w-12 h-12 rounded-full ${colorClass} font-black text-xl flex items-center justify-center shrink-0`}>
        {review.author.charAt(0)}
      </div>
    );
  };

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-slate-50/40 via-white to-slate-50/60 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          {/* Pill Badge */}
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[#FFF1E8] text-[#FF6B35] font-extrabold text-xs sm:text-sm tracking-wide">
            <span>Отзывы</span>
          </div>

          {/* Title */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.12]">
            Отзывы учеников о курсах<br className="hidden sm:inline" /> ЕГЭ
          </h2>

          {/* Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 font-medium leading-relaxed">
            О курсах, подготовке к егэ&огэ и работе сервиса.
          </p>
        </div>

        {/* 3x2 Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedReviews.map((rev, index) => (
            <div
              key={rev.id}
              className="bg-white rounded-[28px] p-6 sm:p-7 border border-slate-100 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-5 cursor-pointer group"
              onClick={() => setSelectedReview(rev)}
            >
              <div className="space-y-4">
                {/* Author Info */}
                <div className="flex items-center gap-3.5">
                  {getAvatarBadge(rev, index)}
                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-[#FF6B35] transition-colors">
                      {rev.author}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {rev.subject} · {rev.year}
                    </p>
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed line-clamp-4">
                  {rev.previewText}
                </p>
              </div>

              {/* Bottom Row: Green Stars & Read Button */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#FF6B35] text-[#FF6B35]" />
                  ))}
                </div>

                <div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedReview(rev);
                    }}
                    className="inline-flex items-center px-4 py-2 rounded-full bg-[#FFF1E8] text-[#FF6B35] hover:bg-[#FFE0CF] font-extrabold text-xs transition-colors"
                  >
                    Читать полностью
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Full Review Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[32px] max-w-lg w-full p-6 sm:p-8 space-y-6 relative shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedReview(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              {getAvatarBadge(selectedReview, 0)}
              <div>
                <h3 className="text-xl font-black text-slate-900">{selectedReview.author}</h3>
                <p className="text-xs text-slate-500 font-bold">
                  {selectedReview.subject} · Выпуск <span className="text-[#FF6B35]">{selectedReview.year}</span>
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#FF6B35] text-[#FF6B35]" />
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/70 text-sm text-slate-800 leading-relaxed font-medium whitespace-pre-line">
              {selectedReview.fullText}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400 font-bold">EGE NETWORK Verification</span>
              <button
                onClick={() => setSelectedReview(null)}
                className="px-5 py-2.5 rounded-full bg-[#FF6B35] text-white font-black text-xs hover:bg-[#E65A22] transition-all"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
