import { AdminStaff, User } from '../types';

const INITIAL_STAFF: AdminStaff[] = [
  {
    id: 'admin-1',
    name: 'Главный Администратор',
    telegramId: '7948060541',
    role: 'admin',
    addedAt: '2026-08-03',
    addedBy: 'Система',
  },
];

const STAFF_STORAGE_KEY = 'ege_network_admin_staff';
const CURRENT_USER_STORAGE_KEY = 'ege_network_current_user';

export function getAdminStaffList(): AdminStaff[] {
  try {
    const data = localStorage.getItem(STAFF_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(INITIAL_STAFF));
      return INITIAL_STAFF;
    }
    const parsed = JSON.parse(data);
    // Ensure 7948060541 is always present as main admin
    if (!parsed.some((s: AdminStaff) => s.telegramId === '7948060541')) {
      parsed.unshift(INITIAL_STAFF[0]);
      localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch (e) {
    return INITIAL_STAFF;
  }
}

export function saveAdminStaffList(list: AdminStaff[]): void {
  try {
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save admin staff list', e);
  }
}

export function checkAdminByTelegramId(rawTgInput: string): AdminStaff | null {
  if (!rawTgInput) return null;
  const cleaned = rawTgInput.trim().replace(/^@/, '');
  const staffList = getAdminStaffList();
  
  // Match exact ID or match username if stored
  const match = staffList.find(
    (s) => s.telegramId === cleaned || s.telegramId === rawTgInput.trim()
  );

  return match || null;
}

export function getCurrentUser(): User | null {
  try {
    const data = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

export function setCurrentUser(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to set current user', e);
  }
}
