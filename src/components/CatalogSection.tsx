import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Send, 
  Gift, 
  HelpCircle, 
  ChevronRight, 
  ShoppingCart, 
  Clock, 
  BookOpen, 
  Star,
  Check,
  ShieldCheck,
  Zap,
  Sparkles
} from 'lucide-react';
import { SCHOOLS } from '../data/mockData';
import { ExamType, School, CartItem, PageType } from '../types';
import { HeroSection } from './HeroSection';
import { PopularSchoolsSection } from './PopularSchoolsSection';
import { AdvantagesSection } from './AdvantagesSection';
import { ReviewsSection } from './ReviewsSection';
import { FaqSection } from './FaqSection';
import { getAllSubjects } from '../utils/courseHelper';

interface CatalogSectionProps {
  examFilter: ExamType;
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
  onOpenCart?: () => void;
  onOpenAuthModal: () => void;
  showToast: (msg: string) => void;
  setActivePage?: (page: PageType) => void;
}

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  examFilter,
  onAddToCart,
  showToast,
  setActivePage,
}) => {
  const [availableSubjects, setAvailableSubjects] = useState<{ id: string; name: string }[]>(() => getAllSubjects());
  const [selectedSchool, setSelectedSchool] = useState<School | null>(SCHOOLS[0]);

  useEffect(() => {
    setAvailableSubjects(getAllSubjects());
  }, []);

  const openEgeCourses = () => {
    setActivePage?.('ege');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div>
      {/* Top Hero Section matching reference design */}
      <HeroSection
        onSelectCourseClick={openEgeCourses}
        onReviewsClick={scrollToHowItWorks}
      />

      {/* Popular Schools Overview Section */}
      <PopularSchoolsSection
        onSelectExam={(exam) => {
          openEgeCourses();
        }}
        onSchoolClick={(schoolId) => {
          const matchedSchool = SCHOOLS.find((s) => s.id === schoolId);
          if (matchedSchool) {
            setSelectedSchool(matchedSchool);
          }
          openEgeCourses();
        }}
      />

      {/* Advantages Section */}
      <AdvantagesSection />

      {/* Reviews Section */}
      <ReviewsSection onSeeAllClick={() => setActivePage?.('reviews')} />

      {/* FAQ Section */}
      <FaqSection setActivePage={setActivePage} />
    </div>
  );
};
