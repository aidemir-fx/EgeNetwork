import React from 'react';
import { ExamType } from '../types';
import umschoolLogo from '../assets/images/schools/umschool.png';
import hundredLogo from '../assets/images/schools/100b.png';
import egelandLogo from '../assets/images/logo.jpg';
import smitupLogo from '../assets/images/schools/smitap.png';
import egeflexLogo from '../assets/images/schools/egeflex.jpg';
import nooLogo from '../assets/images/schools/noo.png';

interface PopularSchoolsSectionProps {
  onSelectExam?: (exam: ExamType) => void;
  onSchoolClick?: (schoolId: string) => void;
}

export const PopularSchoolsSection: React.FC<PopularSchoolsSectionProps> = ({
  onSelectExam,
  onSchoolClick,
}) => {
  const schools = [
    {
      id: 'umschool',
      name: 'Умскул',
      desc: 'Курсы ЕГЭ по основным предметам',
      logo: umschoolLogo,
    },
    {
      id: '100bal',
      name: '100балльный репетитор',
      desc: 'Годовые программы и отдельные месяцы',
      logo: hundredLogo,
    },
    {
      id: 'egeland',
      name: 'ЕГЭЛенд',
      desc: 'Подготовка к экзаменам в удобном формате',
      logo: egelandLogo,
    },
    {
      id: 'smitup',
      name: 'SmitUP',
      desc: 'Уроки, практика и материалы курса',
      logo: smitupLogo,
    },
    {
      id: 'egeflex',
      name: 'ЕГЭФлекс',
      desc: 'Курсы по востребованным предметам',
      logo: egeflexLogo,
    },
    {
      id: 'noo',
      name: 'НОО',
      desc: 'Записи занятий и учебные материалы',
      logo: nooLogo,
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-slate-50/60 via-white to-slate-50/40 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* Top Header Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          {/* Pill Badge */}
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[#E8F8EC] text-[#3CB356] font-extrabold text-xs sm:text-sm tracking-wide">
            <span>Онлайн-школы</span>
          </div>

          {/* Title */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.12]">
            Курсы популярных школ в одном месте
          </h2>

          {/* Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 font-medium leading-relaxed">
            На EGE NETWORK собраны сливы курсов ЕГЭ 2027 от 100балльного репетитора, Умскул, ЕГЭЛенда и других онлайн-школ. Выберите предмет и подходящую программу.
          </p>
        </div>

        {/* Schools Grid (3x2) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {schools.map((school) => (
            <div
              key={school.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs transition-all duration-300 flex items-center gap-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src={school.logo}
                  alt={`${school.name} logo`}
                  className="w-full h-full object-contain p-2"
                />
              </div>

              {/* Info */}
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-900 text-base">
                  {school.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-snug">
                  {school.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
