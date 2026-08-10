export type PageType = 'catalog' | 'ege' | 'reviews' | 'admin';
export type ExamType = 'EGE' | 'OGE';
export type AcademicYear = '2027';
export type AdminRole = 'admin' | 'manager' | 'moderator' | 'support';

export interface User {
  id: string;
  name: string;
  telegramId?: string; // Optional now for email-based auth
  role?: AdminRole | 'user';
  avatar?: string;
  email?: string;
  passwordHash?: string; // For email/password auth (client-side storage)
  authMethod?: 'telegram' | 'email'; // Track auth method
  status?: 'active' | 'blocked';
  registeredAt?: string;
  lastLogin?: string;
}

export interface AdminStaff {
  id: string;
  name: string;
  telegramId: string;
  role: AdminRole;
  addedAt: string;
  addedBy?: string;
}

export interface Subject {
  id: string;
  name: string;
  iconName?: string;
  popular?: boolean;
  exam?: ExamType[];
}

export interface School {
  id: string;
  name: string;
  logoUrl?: string;
  badge?: string;
  rating: number;
  subjects?: string[]; // Array of subject IDs that this school teaches
}

export interface CourseOption {
  id: string;
  subjectId: string;
  schoolId: string;
  title: string;
  year: AcademicYear;
  exam: ExamType;
  description: string;
  originalPrice: number;
  discountPrice: number;
  months: { id: string; name: string; price: number }[];
  features: string[];
}

export interface FreeMaterial {
  id: string;
  subject: string;
  title: string;
  school: string;
  type: string;
  fileSize: string;
  downloadUrl: string;
}

export interface Review {
  id: string;
  author: string;
  subject: string;
  year: string;
  rating: number;
  avatarUrl?: string;
  previewText: string;
  fullText: string;
}

export interface CartItem {
  id: string;
  courseId: string;
  subjectName: string;
  schoolName: string;
  courseTitle: string;
  monthName: string;
  year: AcademicYear;
  price: number;
}

export interface AdminCourse {
  id: string;
  title: string;
  subject: string;
  school: string;
  exam: ExamType;
  year: AcademicYear;
  price: number;
  originalPrice?: number;
  isHidden: boolean;
  telegramChannelLink?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  userTelegramId: string;
  userName: string;
  items: CartItem[];
  totalAmount: number;
  discountAmount?: number;
  promoCode?: string;
  status: 'paid' | 'pending' | 'cancelled';
  createdAt: string;
}

export interface Promocode {
  id: string;
  code: string;
  discountPercent: number;
  maxUses: number;
  usedCount: number;
  active: boolean;
  createdAt: string;
}

export interface SupportMessage {
  id: string;
  userTelegramId: string;
  userName: string;
  sender: 'user' | 'admin';
  text: string;
  createdAt: string;
  isRead?: boolean;
}

export interface Broadcast {
  id: string;
  title: string;
  body: string;
  target: string;
  sentAt: string;
  recipientsCount: number;
}

export interface SiteSettings {
  siteName: string;
  telegramBotLink: string;
  supportTgLink: string;
  maintenanceMode: boolean;
  seoTitle: string;
  discountBannerText: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  adminTelegramId?: string;
}
