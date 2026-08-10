import React from 'react';

export const AdvantagesSection: React.FC = () => {
  const advantages = [
    {
      num: '01',
      title: 'Бесплатный доступ к каждому курсу',
      desc: 'Проверьте курс перед покупкой: ознакомьтесь с программой и материалами.',
    },
    {
      num: '02',
      title: 'Помощь и поддержка в любое время',
      desc: 'Ответим на любые вопросы по выбору курса, оплате и обучению.',
    },
    {
      num: '03',
      title: 'Опыт с 2020 года',
      desc: 'Тысячи учеников уже достигли своих целей с нашей помощью. Присоединяйтесь!',
    },
    {
      num: '04',
      title: 'Удобный личный кабинет на сайте',
      desc: 'Все материалы по приобретённым курсам удобно предоставлены в личном кабинете на сайте.',
    },
    {
      num: '05',
      title: 'Регулярное обновление материалов',
      desc: 'Мы следим за актуальностью программ и быстро добавляем новые материалы.',
    },
    {
      num: '06',
      title: 'Уроки доступны навсегда',
      desc: 'Смотрите занятия и пользуйтесь материалами без ограничений по времени.',
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-slate-50/40 via-white to-slate-50/60 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          {/* Pill Badge */}
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[#FFF1E8] text-[#FF6B35] font-extrabold text-xs sm:text-sm tracking-wide">
            <span>Почему выбирают нас</span>
          </div>

          {/* Title */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.12]">
            Преимущества нашего сервиса
          </h2>

          {/* Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 font-medium leading-relaxed">
            Мы сделали процесс покупки и обучения максимально удобным и безопасным — собрано всё в одном месте.
          </p>
        </div>

        {/* 3x2 Grid of Advantages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {advantages.map((item) => (
            <div
              key={item.num}
              className="bg-white rounded-[28px] p-7 border border-slate-100/90 shadow-sm relative overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Top-Right Decorative Blob */}
              <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#FFE5D3] rounded-full pointer-events-none transition-transform group-hover:scale-110" />

              <div className="relative space-y-4 z-10">
                {/* Number Badge */}
                <div className="w-12 h-10 rounded-2xl bg-[#FF6B35] text-white font-black text-sm flex items-center justify-center shadow-xs">
                  {item.num}
                </div>

                {/* Advantage Title */}
                <h3 className="text-xl font-black text-slate-900 tracking-tight leading-snug">
                  {item.title}
                </h3>

                {/* Advantage Description */}
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
