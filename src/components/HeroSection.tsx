import React from 'react';
import heroImage from '../assets/images/hero-courses.jpeg';

interface HeroSectionProps {
  onSelectCourseClick: () => void;
  onReviewsClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSelectCourseClick,
  onReviewsClick,
}) => {
  return (
    <div className="relative overflow-hidden bg-slate-50/60 pt-6 pb-12 sm:pt-10 sm:pb-16 lg:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* LEFT COLUMN: Text Content */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF1E8] text-[#FF6B35] font-extrabold text-xs sm:text-sm tracking-wide">
              <span>Лучшие курсы 2027</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
              СЛИВЫ КУРСОВ <span className="text-[#FF6B35]">ЕГЭ</span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-xl">
              Курсы Умскул, 100балльного репетитора, ЕГЭЛенд и других онлайн-школ — уроки и материалы для подготовки к ЕГЭ в одном месте.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-row items-center gap-2.5 sm:gap-3.5 pt-2 w-full">
              <button
                onClick={onSelectCourseClick}
                className="flex-1 sm:w-64 py-3.5 sm:py-4 px-2.5 sm:px-8 rounded-2xl bg-[#FF6B35] hover:bg-[#E65A22] text-white font-black text-xs sm:text-base shadow-lg shadow-[#FF6B35]/30 hover:scale-[1.02] active:scale-[0.98] transition-all text-center whitespace-nowrap cursor-pointer"
              >
                Выбрать курс
              </button>

              <button
                onClick={onReviewsClick}
                className="flex-1 sm:w-64 py-3.5 sm:py-4 px-2.5 sm:px-8 rounded-2xl bg-[#FFF1E8] hover:bg-[#FFE3D6] text-[#973E1A] border border-[#FF6B35]/30 font-black text-xs sm:text-base shadow-lg shadow-[#FF6B35]/10 hover:scale-[1.02] active:scale-[0.98] transition-all text-center whitespace-nowrap cursor-pointer"
              >
                Как это работает
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Hero Image */}
          <div className="lg:col-span-6 relative mt-6 lg:mt-0 flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-xl">
              <div className="absolute -inset-4 rounded-[2rem] bg-[#FFD3C2]/40 blur-3xl" />
              <img
                src={heroImage}
                alt="Онлайн-обучение ЕГЭ"
                className="relative w-full rounded-[2rem] object-cover shadow-2xl border border-white/80"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
