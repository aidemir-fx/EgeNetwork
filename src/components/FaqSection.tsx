import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { FAQ_ITEMS } from '../data/mockData';
import { PageType } from '../types';

interface FaqSectionProps {
  setActivePage?: (page: PageType) => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ setActivePage }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleIndex = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-slate-50/60 via-white to-slate-50/40 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          {/* Pill Badge */}
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[#FFF1E8] text-[#FF6B35] font-extrabold text-xs sm:text-sm tracking-wide">
            <span>FAQ</span>
          </div>

          {/* Title */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.12]">
            Частые вопросы
          </h2>

          {/* Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 font-medium leading-relaxed">
            Собрали основные вопросы по покупке, доступу к курсам и работе проекта.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                onClick={() => toggleIndex(idx)}
                className={`rounded-[24px] transition-all duration-300 cursor-pointer p-6 sm:p-7 bg-white ${
                  isOpen
                    ? 'border-2 border-[#FF6B35] shadow-md ring-4 ring-[#FF6B35]/10'
                    : 'border border-slate-100 shadow-xs hover:border-[#FFB09D] hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-black text-slate-900 text-base sm:text-lg md:text-xl">
                    {item.question}
                  </h3>

                  {/* Circle toggle button */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                      isOpen
                        ? 'bg-[#FF6B35] text-white rotate-90'
                        : 'bg-[#FFF1E8] text-[#FF6B35]'
                    }`}
                  >
                    {isOpen ? <X className="w-5 h-5 stroke-[3]" /> : <Plus className="w-5 h-5 stroke-[3]" />}
                  </div>
                </div>

                {isOpen && (
                  <div className="mt-4 pt-3 text-slate-600 text-xs sm:text-sm font-medium leading-relaxed border-t border-slate-100">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
