import { 
  User, 
  AdminCourse, 
  Order, 
  Promocode, 
  SupportMessage, 
  Broadcast, 
  SiteSettings, 
  SystemLog,
  CartItem 
} from '../types';

// STORAGE KEYS
const USERS_KEY = 'ege_network_db_users';
const COURSES_KEY = 'ege_network_db_courses';
const ORDERS_KEY = 'ege_network_db_orders';
const PROMOCODES_KEY = 'ege_network_db_promocodes';
const SUPPORT_KEY = 'ege_network_db_support';
const BROADCASTS_KEY = 'ege_network_db_broadcasts';
const SETTINGS_KEY = 'ege_network_db_settings';
const LOGS_KEY = 'ege_network_db_logs';

// DEFAULT INITIAL COURSES
const DEFAULT_COURSES: AdminCourse[] = [
  {
    id: 'crs-1',
    title: 'Годовой курс по Профильной Математике (100 баллов)',
    subject: 'Профиль (Математика)',
    school: '100балльный репетитор',
    exam: 'EGE',
    year: '2027',
    price: 3490,
    originalPrice: 4500,
    isHidden: false,
    telegramChannelLink: 'https://t.me/EgeNetwork11_bot',
    createdAt: '2026-08-01',
  },
  {
    id: 'crs-2',
    title: 'Годовой курс по Русскому Языку (Оксана Кудлай)',
    subject: 'Русский Язык',
    school: '100балльный репетитор',
    exam: 'EGE',
    year: '2027',
    price: 3490,
    originalPrice: 4500,
    isHidden: false,
    telegramChannelLink: 'https://t.me/EgeNetwork11_bot',
    createdAt: '2026-08-01',
  },
  {
    id: 'crs-3',
    title: 'Полный курс по Обществознанию',
    subject: 'Обществознание',
    school: 'ЕГЭЛенд',
    exam: 'EGE',
    year: '2027',
    price: 3490,
    originalPrice: 4200,
    isHidden: false,
    telegramChannelLink: 'https://t.me/EgeNetwork11_bot',
    createdAt: '2026-08-01',
  },
  {
    id: 'crs-4',
    title: 'Информатика с Нуля до 100 баллов',
    subject: 'Информатика',
    school: 'Умскул',
    exam: 'EGE',
    year: '2027',
    price: 3490,
    originalPrice: 4500,
    isHidden: false,
    telegramChannelLink: 'https://t.me/EgeNetwork11_bot',
    createdAt: '2026-08-02',
  },
  {
    id: 'crs-5',
    title: 'ОГЭ 2027 по Русский языку',
    subject: 'Русский Язык',
    school: 'Умскул',
    exam: 'OGE',
    year: '2027',
    price: 2490,
    originalPrice: 3500,
    isHidden: false,
    telegramChannelLink: 'https://t.me/EgeNetwork11_bot',
    createdAt: '2026-08-02',
  },
  {
    id: 'crs-6',
    title: 'ОГЭ 2027 по Математике',
    subject: 'База (Математика)',
    school: '100балльный репетитор',
    exam: 'OGE',
    year: '2027',
    price: 2490,
    originalPrice: 3500,
    isHidden: false,
    telegramChannelLink: 'https://t.me/EgeNetwork11_bot',
    createdAt: '2026-08-02',
  },
  {
    id: 'crs-7',
    title: 'Полный курс по Психологии',
    subject: 'Психология',
    school: 'Умскул',
    exam: 'EGE',
    year: '2027',
    price: 3490,
    originalPrice: 4500,
    isHidden: false,
    telegramChannelLink: 'https://t.me/EgeNetwork11_bot',
    createdAt: '2026-08-03',
  },
];

// DEFAULT SETTINGS
const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'EGE NETWORK',
  telegramBotLink: 'https://t.me/EgeNetwork11_bot',
  supportTgLink: 'https://t.me/EgeNetwork11_bot',
  maintenanceMode: false,
  seoTitle: 'Сливы курсов ЕГЭ и ОГЭ 2027 / 2026',
  discountBannerText: 'До 15 августа: Покупай весь новый курс 2027 — и получай полный курс прошлого года в подарок!',
};

// DEFAULT PROMOCODES
const DEFAULT_PROMOCODES: Promocode[] = [
  {
    id: 'p-1',
    code: 'EGE2026',
    discountPercent: 15,
    maxUses: 500,
    usedCount: 0,
    active: true,
    createdAt: '2026-08-01',
  },
  {
    id: 'p-2',
    code: 'START2027',
    discountPercent: 20,
    maxUses: 100,
    usedCount: 0,
    active: true,
    createdAt: '2026-08-02',
  },
];

// --- USERS ---
export function getStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredUsers(users: User[]): void {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users', e);
  }
}

export function registerOrUpdateUser(user: User): void {
  const users = getStoredUsers();
  // Search by telegramId OR email (for email auth)
  const index = users.findIndex(
    (u) => (user.telegramId && u.telegramId === user.telegramId) || 
           (user.email && u.email === user.email)
  );
  const now = new Date().toLocaleString('ru-RU');
  
  if (index >= 0) {
    users[index] = {
      ...users[index],
      ...user,
      lastLogin: now,
    };
  } else {
    users.push({
      ...user,
      status: user.status || 'active',
      registeredAt: user.registeredAt || new Date().toISOString().split('T')[0],
      lastLogin: now,
    });
  }
  saveStoredUsers(users);
}

// Helper: Find user by email for login
export function findUserByEmail(email: string): User | undefined {
  const users = getStoredUsers();
  return users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
}

// --- COURSES ---
export function getStoredCourses(): AdminCourse[] {
  try {
    const raw = localStorage.getItem(COURSES_KEY);
    if (!raw) {
      localStorage.setItem(COURSES_KEY, JSON.stringify(DEFAULT_COURSES));
      return DEFAULT_COURSES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_COURSES;
  }
}

export function saveStoredCourses(courses: AdminCourse[]): void {
  try {
    localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
  } catch (e) {
    console.error('Failed to save courses', e);
  }
}

// --- ORDERS ---
export function getStoredOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredOrders(orders: Order[]): void {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to save orders', e);
  }
}

export function createNewOrder(orderData: Omit<Order, 'id' | 'createdAt'>): Order {
  const orders = getStoredOrders();
  const newOrder: Order = {
    ...orderData,
    id: `#${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toLocaleString('ru-RU'),
  };
  orders.unshift(newOrder);
  saveStoredOrders(orders);
  
  // Create dynamic system log
  addSystemLog('Создан новый заказ', `Заказ ${newOrder.id} от @${newOrder.userTelegramId} на сумму ${newOrder.totalAmount} ₽`);
  return newOrder;
}

// --- PROMOCODES ---
export function getStoredPromocodes(): Promocode[] {
  try {
    const raw = localStorage.getItem(PROMOCODES_KEY);
    if (!raw) {
      localStorage.setItem(PROMOCODES_KEY, JSON.stringify(DEFAULT_PROMOCODES));
      return DEFAULT_PROMOCODES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PROMOCODES;
  }
}

export function saveStoredPromocodes(promocodes: Promocode[]): void {
  try {
    localStorage.setItem(PROMOCODES_KEY, JSON.stringify(promocodes));
  } catch (e) {
    console.error('Failed to save promocodes', e);
  }
}

export function validateAndUsePromocode(code: string): { valid: boolean; discountPercent: number; message: string } {
  const clean = code.trim().toUpperCase();
  const list = getStoredPromocodes();
  const promo = list.find((p) => p.code === clean);

  if (!promo) {
    return { valid: false, discountPercent: 0, message: 'Промокод не найден' };
  }
  if (!promo.active) {
    return { valid: false, discountPercent: 0, message: 'Промокод неактивен' };
  }
  if (promo.usedCount >= promo.maxUses) {
    return { valid: false, discountPercent: 0, message: 'Лимит использований промокода исчерпан' };
  }

  // Increment usage count
  promo.usedCount += 1;
  saveStoredPromocodes(list);

  return { 
    valid: true, 
    discountPercent: promo.discountPercent, 
    message: `Промокод ${clean} применён (-${promo.discountPercent}%)` 
  };
}

// --- SUPPORT MESSAGES ---
export function getStoredSupportMessages(): SupportMessage[] {
  try {
    const raw = localStorage.getItem(SUPPORT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredSupportMessages(msgs: SupportMessage[]): void {
  try {
    localStorage.setItem(SUPPORT_KEY, JSON.stringify(msgs));
  } catch (e) {
    console.error('Failed to save support messages', e);
  }
}

export function sendSupportMessage(msgData: Omit<SupportMessage, 'id' | 'createdAt'>): SupportMessage {
  const msgs = getStoredSupportMessages();
  const newMsg: SupportMessage = {
    ...msgData,
    id: `msg-${Date.now()}`,
    createdAt: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
  };
  msgs.push(newMsg);
  saveStoredSupportMessages(msgs);
  return newMsg;
}

// --- BROADCASTS ---
export function getStoredBroadcasts(): Broadcast[] {
  try {
    const raw = localStorage.getItem(BROADCASTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredBroadcasts(broadcasts: Broadcast[]): void {
  try {
    localStorage.setItem(BROADCASTS_KEY, JSON.stringify(broadcasts));
  } catch (e) {
    console.error('Failed to save broadcasts', e);
  }
}

// --- SETTINGS ---
export function getStoredSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }

    const storedSettings = JSON.parse(raw) as SiteSettings;
    const normalizedSettings: SiteSettings = {
      ...DEFAULT_SETTINGS,
      ...storedSettings,
    };

    const botLink = normalizedSettings.telegramBotLink?.trim();
    const isLegacyManagerLink = !botLink || /@?egemanager/i.test(botLink);

    if (isLegacyManagerLink) {
      normalizedSettings.telegramBotLink = DEFAULT_SETTINGS.telegramBotLink;
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(normalizedSettings));
    }

    return normalizedSettings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: SiteSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

// --- SYSTEM LOGS ---
export function getStoredLogs(): SystemLog[] {
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addSystemLog(action: string, details: string, adminTelegramId?: string): void {
  try {
    const logs = getStoredLogs();
    const newLog: SystemLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('ru-RU'),
      action,
      details,
      adminTelegramId,
    };
    logs.unshift(newLog);
    // Keep max 100 recent logs
    if (logs.length > 100) logs.length = 100;
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to add log', e);
  }
}

export function clearSystemLogs(): void {
  try {
    localStorage.setItem(LOGS_KEY, JSON.stringify([]));
  } catch (e) {
    console.error('Failed to clear logs', e);
  }
}
