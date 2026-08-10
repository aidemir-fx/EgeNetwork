import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Minus, 
  ArrowRight, 
  ShoppingCart, 
  Check, 
  Sparkles,
  Lock,
  Star,
  Search,
  BookOpen,
  Filter,
  CheckCircle2,
  Award,
  Zap,
  GraduationCap,
  Users,
  ChevronRight,
  ShieldCheck,
  Flame,
  Layers,
  Calendar
} from 'lucide-react';
import { AcademicYear, Subject, School, CartItem, PageType } from '../types';
import { getAllSubjects } from '../utils/courseHelper';
import { SCHOOLS } from '../data/mockData';

// School Logos
import hundredLogo from '../assets/images/schools/100b.png';
import umschoolLogo from '../assets/images/schools/umschool.png';
import egelandLogo from '../assets/images/logo.jpg';
import smitupLogo from '../assets/images/schools/smitap.png';
import egeflexLogo from '../assets/images/schools/egeflex.jpg';
import nooLogo from '../assets/images/schools/noo.png';

interface EgePageProps {
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
  onOpenCart?: () => void;
  onOpenAuthModal: () => void;
  showToast: (msg: string) => void;
  setActivePage: (page: PageType) => void;
}

const SCHOOL_LOGOS: Record<string, string> = {
  '100b': hundredLogo,
  'umschool': umschoolLogo,
  'egeland': egelandLogo,
  'smitap': smitupLogo,
  'egeflex': egeflexLogo,
  'noo': nooLogo,
};

const SCHOOL_DESCRIPTIONS: Record<string, string> = {
  '100b': 'Харизматичные преподаватели, авторские скрипты и одна из самых высоких статистик 90+ на ЕГЭ.',
  'umschool': 'Крупнейшая онлайн-школа с собственной удобной платформой и тысячами стобалльников.',
  'egeland': 'Современный интерактивный формат подготовки, понятное объяснение сложного и яркое комьюнити.',
  'smitap': 'Понятная теория без заучивания, индивидуальный подход и постоянный трекинг прогресса.',
  'egeflex': 'Гибкие курсы, фокус на прототипах ФИПИ и эффективная методика запоминания.',
  'noo': 'Глубокая академическая база по естественным наукам, разборы сложных задач 2-й части.',
  'shkolkovo': 'Сильная физико-математическая и IT школа для поступления в топовые вузы.',
  'webium': 'Увлекательные вебинары, поддерживающая атмосфера и заботливые кураторы.',
  'kotiki': 'Качественные гуманитарные курсы с упором на историю, обществознание и языки.',
  'el': 'Системный подход к подготовке по всем предметам с детальным разбором критериев.',
};

const SUBJECT_CATEGORIES = [
  { id: 'all', label: 'Все предметы' },
  { id: 'popular', label: '🔥 Популярные' },
  { id: 'exact', label: '📐 Точные & IT', ids: ['prof_math', 'base_math', 'cs', 'phys'] },
  { id: 'natural', label: '🧬 Естественные', ids: ['chem', 'bio', 'geo'] },
  { id: 'humanitarian', label: '📚 Гуманитарные', ids: ['rus', 'soc', 'hist', 'eng', 'lit'] },
];

const COURSES_CATALOG = [
  {
    id: 'annual',
    title: 'Годовой курс (Весь год)',
    subtitle: 'Сентябрь — Май · Полная программа с 0 до 90+ баллов',
    badge: '🎁 Выгода 20%',
    price: 3490,
    desc: 'Полный комплекс подготовки на весь учебный год. Все темы, вебинары и учебные материалы.',
    features: [
      'Все вебинары и видеозаписи уроков (Сентябрь — Май)',
      'Конспекты, авторские скрипты и шпаргалки',
      'Домашние задания с ответами и решениями'
    ],
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&auto=format&fit=crop&q=80',
    isFullYear: true,
  },
  {
    id: 'monthly',
    title: 'Месячный курс',
    subtitle: 'Помесячный доступ к материалам выбранного месяца',
    badge: 'Помесячно',
    price: 490,
    desc: 'Доступ ко всем видеоурокам, материалам и домашним заданиям конкретного месяца.',
    features: [
      'Все видеоуроки и вебинары выбранного месяца',
      'Файлы, конспекты и рабочие тетради',
      'Домашние задания с ответами и критериями'
    ],
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&auto=format&fit=crop&q=80',
    isFullYear: false,
  },
];

const MONTHS_LIST = [
  { id: 'sep', name: 'Сентябрь' },
  { id: 'oct', name: 'Октябрь' },
  { id: 'nov', name: 'Ноябрь' },
  { id: 'dec', name: 'Декабрь' },
  { id: 'jan', name: 'Январь' },
  { id: 'feb', name: 'Февраль' },
  { id: 'mar', name: 'Март' },
  { id: 'apr', name: 'Апрель' },
  { id: 'may', name: 'Май' },
];

export const EgePage: React.FC<EgePageProps> = ({
  onAddToCart,
  onOpenCart,
  onOpenAuthModal,
  showToast,
  setActivePage,
}) => {
  const [selectedYear, setSelectedYear] = useState<AcademicYear>('2027');
  const [allEgeSubjects, setAllEgeSubjects] = useState(() => getAllSubjects('EGE'));
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [subjectSearchQuery, setSubjectSearchQuery] = useState<string>('');
  const [schoolSearchQuery, setSchoolSearchQuery] = useState<string>('');

  const allSchools = SCHOOLS;

  useEffect(() => {
    setAllEgeSubjects(getAllSubjects('EGE'));
  }, []);

  // Filter subjects by category & search query
  const filteredSubjects = useMemo(() => {
    return allEgeSubjects.filter((sub) => {
      // Category check
      if (selectedCategory === 'popular' && !sub.popular) return false;
      if (selectedCategory === 'exact' && !['prof_math', 'base_math', 'cs', 'phys'].includes(sub.id)) return false;
      if (selectedCategory === 'natural' && !['chem', 'bio', 'geo'].includes(sub.id)) return false;
      if (selectedCategory === 'humanitarian' && !['rus', 'soc', 'hist', 'eng', 'lit'].includes(sub.id)) return false;

      // Search query
      if (subjectSearchQuery.trim()) {
        return sub.name.toLowerCase().includes(subjectSearchQuery.toLowerCase());
      }
      return true;
    });
  }, [allEgeSubjects, selectedCategory, subjectSearchQuery]);

  // Selections
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(allSchools[0]);
  const [selectedCourse, setSelectedCourse] = useState(COURSES_CATALOG[0]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>(['sep']);
  const [isAdded, setIsAdded] = useState(false);

  // Available schools for selected subject
  const availableSchools = useMemo(() => {
    let list = selectedSubject
      ? allSchools.filter((school) => school.subjects?.includes(selectedSubject.id))
      : allSchools;

    if (schoolSearchQuery.trim()) {
      list = list.filter((sch) =>
        sch.name.toLowerCase().includes(schoolSearchQuery.toLowerCase())
      );
    }
    return list;
  }, [allSchools, selectedSubject, schoolSearchQuery]);

  // Sync available subjects & schools
  useEffect(() => {
    if (allEgeSubjects.length > 0 && !selectedSubject) {
      setSelectedSubject(allEgeSubjects[0]);
    }
  }, [allEgeSubjects, selectedSubject]);

  useEffect(() => {
    if (selectedSubject && availableSchools.length > 0) {
      // If current selected school isn't in available schools, auto-select first available
      if (!selectedSchool || !availableSchools.some((s) => s.id === selectedSchool.id)) {
        setSelectedSchool(availableSchools[0]);
      }
    }
  }, [selectedSubject, availableSchools, selectedSchool]);

  // Toggle single month in multi-month selection
  const toggleMonth = (monthId: string) => {
    setSelectedMonths((prev) => {
      if (prev.includes(monthId)) {
        if (prev.length === 1) return prev; // Require at least one selected month
        return prev.filter((id) => id !== monthId);
      } else {
        return [...prev, monthId];
      }
    });
  };

  const selectAllMonths = () => {
    setSelectedMonths(MONTHS_LIST.map((m) => m.id));
  };

  const selectMonthsRange = (ids: string[]) => {
    setSelectedMonths(ids);
  };

  // Selected month names string
  const selectedMonthNames = useMemo(() => {
    const names = MONTHS_LIST.filter((m) => selectedMonths.includes(m.id)).map((m) => m.name);
    if (names.length === MONTHS_LIST.length) return 'Все 9 месяцев (Сентябрь — Май)';
    if (names.length === 1) return names[0];
    return `${names.join(', ')} (${names.length} мес.)`;
  }, [selectedMonths]);

  // Calculate final price based on selected course
  const currentPrice = useMemo(() => {
    if (selectedCourse.id === 'annual') {
      return selectedCourse.price;
    }
    return selectedCourse.price * selectedMonths.length;
  }, [selectedCourse, selectedMonths]);

  // Handle Add to Cart
  const handleAddToCart = () => {
    if (!selectedSubject || !selectedSchool) return;

    const monthStr = selectedCourse.id === 'annual' ? 'Весь год (Сентябрь — Май)' : selectedMonthNames;
    
    onAddToCart({
      courseId: `${selectedSubject.id}-${selectedSchool.id}-${selectedCourse.id}-${
        selectedCourse.id === 'annual' ? 'full' : selectedMonths.join('_')
      }-${selectedYear}`,
      subjectName: selectedSubject.name,
      schoolName: selectedSchool.name,
      courseTitle: selectedCourse.title,
      monthName: monthStr,
      year: selectedYear,
      price: currentPrice,
    });

    setIsAdded(true);
    showToast(`Курс «${selectedSubject.name} — ${selectedSchool.name}» добавлен в корзину!`);
    setTimeout(() => setIsAdded(false), 2500);
  };

  // Sequential selection helpers with smooth scrolling
  const handleSelectSubject = (sub: Subject) => {
    setSelectedSubject(sub);
    setTimeout(() => scrollToSection('step-school'), 120);
  };

  const handleSelectSchool = (sch: School) => {
    setSelectedSchool(sch);
    setTimeout(() => scrollToSection('step-course'), 120);
  };

  const handleSelectCourse = (crs: typeof COURSES_CATALOG[0]) => {
    setSelectedCourse(crs);
    if (crs.id === 'annual') {
      setTimeout(() => scrollToSection('step-checkout'), 120);
    }
  };

  // Scroll Helper
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Accordion state for FAQ block
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqItems = [
    {
      icon: '🏫',
      question: 'Какие онлайн-школы представлены?',
      answer:
        'В каталоге EGE NETWORK собраны сливы курсов от топовых онлайн-школ: 100балльный репетитор, Умскул, ЕГЭЛенд, SmitUP, ЕГЭФлекс, НОО, Школково, Вебиум, Котики и других.',
    },
    {
      icon: '📚',
      question: 'Какие предметы доступные для покупки?',
      answer:
        'Доступны абсолютно все предметы ЕГЭ 2027: Русский язык, Профильная и Базовая математика, Информатика, Обществознание, История, Химия, Биология, Физика, Английский, Литература и География.',
    },
    {
      icon: '✅',
      question: 'Что входит в купленный курс?',
      answer:
        'Вы получаете полный комплект: записи вебинаров в 1080p, файловые скрипты, красочные конспекты, домашние задания с ответами и разборами, шпаргалки и закрытый телеграм-канал.',
    },
    {
      icon: '⚡',
      question: 'Когда я получу доступ к материалам?',
      answer:
        'Доступ предоставляется моментально прямо на сайте после быстрой оплаты. Никакого ожидания — можно начинать заниматься сразу!',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4FBF6] text-slate-900 pb-32 lg:pb-28">

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6">
        
        {/* Title */}
        <div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Конструктор курса ЕГЭ 2027
          </h1>
        </div>

        {/* STEP 01: ВЫБОР ПРЕДМЕТА */}
        <section id="step-subject" className="scroll-mt-28 bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#FFF1E8] text-[#FF6B35] text-xs font-black flex items-center justify-center shrink-0">1</span>
              <span>Выберите предмет</span>
            </h2>
          </div>

          {/* Subjects Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {filteredSubjects.map((sub) => {
              const isSelected = selectedSubject?.id === sub.id;

              return (
                <button
                  key={sub.id}
                  onClick={() => handleSelectSubject(sub)}
                  className={`p-3 rounded-xl font-bold transition-all text-left flex flex-col justify-between cursor-pointer border ${
                    isSelected
                      ? 'bg-[#FFF1E8] border-2 border-[#FF6B35] text-slate-900 shadow-xs'
                      : 'bg-white border-slate-200/80 text-slate-800 hover:border-emerald-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className={`p-2 rounded-xl ${isSelected ? 'bg-[#FF6B35] text-white' : 'bg-slate-100 text-slate-700'}`}>
                      <BookOpen className="w-4 h-4" />
                    </span>
                  </div>

                  <div className="font-black leading-tight text-slate-900 text-xs sm:text-sm">
                    {sub.name}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* STEP 02: ВЫБОР ОНЛАЙН-ШКОЛЫ */}
        <section id="step-school" className="scroll-mt-28 bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#FFF1E8] text-[#FF6B35] text-xs font-black flex items-center justify-center shrink-0">2</span>
              <span>Выберите онлайн-школу</span>
            </h2>
          </div>

          {/* Available Schools Compact Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {availableSchools.map((sch) => {
              const isSelected = selectedSchool?.id === sch.id;
              const logo = SCHOOL_LOGOS[sch.id];

              return (
                <button
                  key={sch.id}
                  onClick={() => handleSelectSchool(sch)}
                  className={`p-3 rounded-xl transition-all text-left flex flex-col justify-between cursor-pointer border ${
                    isSelected
                      ? 'bg-[#FFF1E8] border-2 border-[#FF6B35] shadow-xs'
                      : 'bg-white border-slate-200/80 hover:border-emerald-400'
                  }`}
                >
                  {/* Logo Container */}
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center overflow-hidden p-1 mb-2">
                    {logo ? (
                      <img
                        src={logo}
                        alt={sch.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full rounded-lg bg-[#2FA34F] text-white font-black text-xs flex items-center justify-center">
                        {sch.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* School Name */}
                  <div className="font-black leading-tight text-slate-900 text-xs sm:text-sm">
                    {sch.name}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* STEP 03: ВЫБОР КУРСА */}
        <section id="step-course" className="scroll-mt-28 bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#FFF1E8] text-[#FF6B35] text-xs font-black flex items-center justify-center shrink-0">3</span>
              <span>Выберите период оплаты</span>
            </h2>
          </div>

          {/* Course Program Selector (Side-by-side or Grid) */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {COURSES_CATALOG.map((crs) => {
                const isSelected = selectedCourse.id === crs.id;

                return (
                  <button
                    key={crs.id}
                    onClick={() => handleSelectCourse(crs)}
                    className={`p-3.5 sm:p-5 rounded-2xl transition-all text-left flex flex-col justify-between cursor-pointer border relative overflow-hidden ${
                      isSelected
                        ? 'bg-[#FFF1E8] border-2 border-[#FF6B35] shadow-xs'
                        : 'bg-white border-slate-200/80 hover:border-emerald-400'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <img
                        src={crs.image}
                        alt={crs.title}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-xl shrink-0 shadow-2xs"
                        referrerPolicy="no-referrer"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h3 className="font-black text-slate-900 text-sm sm:text-base">
                            {crs.title}
                          </h3>
                          <span className="text-[9px] sm:text-[10px] font-black bg-[#FF6B35] text-white px-2 py-0.5 rounded-full shrink-0">
                            {crs.badge}
                          </span>
                        </div>

                        <p className="text-[11px] sm:text-xs text-slate-500 font-semibold mb-0.5">
                          {crs.subtitle}
                        </p>

                        <div className="text-sm sm:text-base font-black text-[#FF6B35]">
                          {crs.price} ₽
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] sm:text-xs text-slate-600 font-medium mb-2.5">
                      {crs.desc}
                    </p>

                    {/* Features list */}
                    <div className="space-y-1 pt-2.5 border-t border-slate-100">
                      {crs.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-700 font-bold">
                          <Check className="w-3.5 h-3.5 text-[#2FA34F] shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MULTI-MONTH SELECTION (if monthly course selected) */}
          {selectedCourse.id === 'monthly' && (
            <div className="pt-4 border-t border-slate-100 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span>Выберите месяцы обучения (можно несколько):</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Нажмите на один или сразу несколько месяцев, чтобы оплатить их одним заказом
                  </p>
                </div>
                <div className="text-xs text-[#FF6B35] font-black bg-[#FFF1E8] px-3 py-1.5 rounded-full border border-[#FFD3BA] self-start sm:self-auto">
                  Выбрано: {selectedMonths.length} мес. · {currentPrice} ₽
                </div>
              </div>

              {/* Quick Select Preset Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-500">Быстрый выбор:</span>
                <button
                  onClick={selectAllMonths}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold cursor-pointer transition-colors ${
                    selectedMonths.length === MONTHS_LIST.length
                      ? 'bg-[#FF6B35] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Все 9 месяцев
                </button>
                <button
                  onClick={() => selectMonthsRange(['sep', 'oct', 'nov'])}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  🍁 Осень (Сен-Ноя)
                </button>
                <button
                  onClick={() => selectMonthsRange(['dec', 'jan', 'feb'])}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  ❄️ Зима (Дек-Фев)
                </button>
                <button
                  onClick={() => selectMonthsRange(['mar', 'apr', 'may'])}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  🌱 Весна (Мар-Май)
                </button>
              </div>

              {/* Months Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {MONTHS_LIST.map((m) => {
                  const isSelected = selectedMonths.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      onClick={() => toggleMonth(m.id)}
                      className={`py-3 px-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-between cursor-pointer border ${
                        isSelected
                          ? 'bg-[#FF6B35] text-white border-[#FF6B35] shadow-xs scale-[1.01]'
                          : 'bg-white border-slate-200/80 text-slate-800 hover:border-emerald-400'
                      }`}
                    >
                      <span>{m.name}</span>
                      <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${
                        isSelected ? 'bg-white text-[#FF6B35]' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {isSelected ? <Check className="w-3 h-3 stroke-[3]" /> : '+'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* STEP 04: ИТОГОВАЯ КАРТОЧКА И ОФОРМЛЕНИЕ КОРЗИНЫ */}
        <section id="step-checkout" className="scroll-mt-32">
          <div className="bg-[#FFF1E8] rounded-2xl p-5 sm:p-7 border border-[#FFD3BA] shadow-xs flex flex-col md:flex-row gap-5 items-center justify-between">
            
            {/* Course summary */}
            <div className="space-y-1.5 text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {selectedSubject?.name} — {selectedSchool?.name}
              </h3>
              <div className="text-xs sm:text-sm font-extrabold text-[#FF6B35] flex items-center gap-2 justify-center md:justify-start flex-wrap">
                <span>{selectedCourse.title}</span>
                {selectedCourse.id === 'monthly' && (
                  <>
                    <span>•</span>
                    <span>{selectedMonthNames}</span>
                  </>
                )}
              </div>
            </div>

            {/* Action Box */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2.5 shrink-0 w-full md:w-72 text-center">
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {currentPrice} ₽
              </div>

              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    if (isAdded) {
                      onOpenCart?.();
                    } else {
                      handleAddToCart();
                    }
                  }}
                  className={`w-full py-3 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isAdded
                      ? 'bg-[#FF6B35] hover:bg-[#E65A22] text-white shadow-xs'
                      : 'bg-[#2FA34F] hover:bg-[#289245] text-white shadow-emerald-500/20'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{isAdded ? 'Перейти в корзину →' : `Добавить в корзину (${currentPrice} ₽)`}</span>
                </button>

                {isAdded && (
                  <button
                    onClick={handleAddToCart}
                    className="w-full py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 transition-colors cursor-pointer"
                  >
                    + Добавить ещё один
                  </button>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* BLOCK: FAQ */}
        <div id="how-it-works" className="bg-gradient-to-b from-[#EFF9F2] via-[#F3FAF5] to-[#EBF6EE] rounded-3xl p-6 sm:p-10 border border-[#FFD3BA] shadow-xs">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFE7D7] text-[#FF6B35] text-xs font-black uppercase tracking-wider mb-4">
            Как это работает
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-3">
            Вопросы и ответы по курсам ЕГЭ
          </h2>

          <p className="text-slate-600 text-sm sm:text-base lg:text-lg font-medium leading-relaxed max-w-4xl mb-8">
            Ответы на самые частые вопросы учеников перед покупкой слива курса.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {faqItems.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-bold text-slate-900 hover:text-[#FF6B35] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{faq.icon}</span>
                      <span className="text-sm sm:text-base font-bold">{faq.question}</span>
                    </div>
                    <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-500 font-bold text-sm">
                      {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              onClick={() => setActivePage('reviews')}
              className="px-6 py-3 rounded-full bg-white text-slate-900 font-extrabold text-xs sm:text-sm border border-slate-200/80 shadow-2xs hover:border-emerald-500 hover:text-[#FF6B35] transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Отзывы учеников</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Mobile Sticky Action Bar */}
      {selectedSubject && selectedSchool && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 px-4 shadow-xl lg:hidden flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-black text-slate-900 truncate">
              {selectedSubject.name} · {selectedSchool.name}
            </div>
            <div className="text-[11px] font-extrabold text-[#FF6B35]">
              {selectedCourse.title} ({currentPrice} ₽)
            </div>
          </div>

          <button
            onClick={() => {
              if (isAdded) {
                onOpenCart?.();
              } else {
                handleAddToCart();
              }
            }}
            className="px-5 py-2.5 rounded-full font-black text-xs transition-all flex items-center gap-1.5 shrink-0 shadow-md bg-[#FF6B35] text-white hover:bg-[#E65A22] active:scale-95 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{isAdded ? 'Перейти в корзину →' : `В корзину (${currentPrice} ₽)`}</span>
          </button>
        </div>
      )}
    </div>
  );
};

