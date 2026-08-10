import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  ShoppingCart, 
  Tag, 
  MessageSquare, 
  Star, 
  Bell, 
  BarChart3, 
  Settings, 
  ShieldCheck, 
  FileText, 
  Lock, 
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  UserPlus,
  Edit,
  DollarSign,
  TrendingUp,
  CreditCard,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  Send,
  RefreshCw,
  AlertCircle,
  Filter,
  Gift
} from 'lucide-react';
import { 
  User, 
  AdminRole, 
  AdminStaff, 
  AdminCourse, 
  Order, 
  Promocode, 
  SupportMessage, 
  Broadcast, 
  SiteSettings, 
  SystemLog,
  ExamType,
  AcademicYear 
} from '../types';
import { getAdminStaffList, saveAdminStaffList } from '../utils/adminAuth';
import {
  getStoredUsers,
  saveStoredUsers,
  getStoredCourses,
  saveStoredCourses,
  getStoredOrders,
  saveStoredOrders,
  getStoredPromocodes,
  saveStoredPromocodes,
  getStoredSupportMessages,
  saveStoredSupportMessages,
  sendSupportMessage,
  getStoredBroadcasts,
  saveStoredBroadcasts,
  getStoredSettings,
  saveStoredSettings,
  getStoredLogs,
  addSystemLog,
  clearSystemLogs,
  createNewOrder
} from '../utils/adminStore';

interface AdminPageProps {
  currentUser: User | null;
  onExitAdmin: () => void;
  showToast: (msg: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ currentUser, onExitAdmin, showToast }) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [staffList, setStaffList] = useState<AdminStaff[]>(() => getAdminStaffList());

  // Real Store Data State
  const [usersList, setUsersList] = useState<User[]>(() => getStoredUsers());
  const [coursesList, setCoursesList] = useState<AdminCourse[]>(() => getStoredCourses());
  const [ordersList, setOrdersList] = useState<Order[]>(() => getStoredOrders());
  const [promocodesList, setPromocodesList] = useState<Promocode[]>(() => getStoredPromocodes());
  const [supportMessagesList, setSupportMessagesList] = useState<SupportMessage[]>(() => getStoredSupportMessages());
  const [broadcastsList, setBroadcastsList] = useState<Broadcast[]>(() => getStoredBroadcasts());
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => getStoredSettings());
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>(() => getStoredLogs());

  // Refresh data from storage
  const refreshAllData = () => {
    setUsersList(getStoredUsers());
    setCoursesList(getStoredCourses());
    setOrdersList(getStoredOrders());
    setPromocodesList(getStoredPromocodes());
    setSupportMessagesList(getStoredSupportMessages());
    setBroadcastsList(getStoredBroadcasts());
    setSiteSettings(getStoredSettings());
    setSystemLogs(getStoredLogs());
  };

  useEffect(() => {
    refreshAllData();
  }, [activeTab]);

  // Check if current user has admin rights
  const isAdminOrStaff = currentUser?.role && ['admin', 'manager', 'moderator', 'support'].includes(currentUser.role);

  // --- STAFF STATE ---
  const [newStaffTgId, setNewStaffTgId] = useState('');
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<AdminRole>('moderator');

  // --- USERS STATE ---
  const [userSearch, setUserSearch] = useState('');
  const [grantAccessModalUser, setGrantAccessModalUser] = useState<User | null>(null);
  const [selectedCourseToGrant, setSelectedCourseToGrant] = useState<string>('');

  // --- COURSES STATE ---
  const [courseSearch, setCourseSearch] = useState('');
  const [courseExamFilter, setCourseExamFilter] = useState<'all' | 'EGE' | 'OGE'>('all');
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<AdminCourse | null>(null);
  
  // Course Form
  const [courseFormTitle, setCourseFormTitle] = useState('');
  const [courseFormSubject, setCourseFormSubject] = useState('Русский Язык');
  const [courseFormSchool, setCourseFormSchool] = useState('100балльный репетитор');
  const [courseFormExam, setCourseFormExam] = useState<ExamType>('EGE');
  const [courseFormYear, setCourseFormYear] = useState<AcademicYear>('2027');
  const [courseFormPrice, setCourseFormPrice] = useState<number>(3490);
  const [courseFormOriginalPrice, setCourseFormOriginalPrice] = useState<number>(4500);
  const [courseFormTgLink, setCourseFormTgLink] = useState('https://t.me/EgeNetwork11_bot');

  // --- ORDERS STATE ---
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [showManualOrderModal, setShowManualOrderModal] = useState(false);
  const [manualOrderTgId, setManualOrderTgId] = useState('');
  const [manualOrderUserName, setManualOrderUserName] = useState('');
  const [manualOrderCourseId, setManualOrderCourseId] = useState('');
  const [manualOrderAmount, setManualOrderAmount] = useState<number>(3490);

  // --- PROMOCODES STATE ---
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState<number>(15);
  const [newPromoMaxUses, setNewPromoMaxUses] = useState<number>(100);

  // --- SUPPORT STATE ---
  const [activeChatTgId, setActiveChatTgId] = useState<string>('');
  const [supportReplyText, setSupportReplyText] = useState('');

  // --- BROADCAST STATE ---
  const [broadcastTarget, setBroadcastTarget] = useState('all');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');

  // Role helpers
  const getRoleLabel = (role: AdminRole) => {
    switch (role) {
      case 'admin': return 'Главный администратор';
      case 'manager': return 'Менеджер';
      case 'moderator': return 'Модератор';
      case 'support': return 'Служба поддержки';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: AdminRole) => {
    switch (role) {
      case 'admin': return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'manager': return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'moderator': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'support': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default: return 'bg-slate-700 text-slate-300';
    }
  };

  // --- STAFF HANDLERS ---
  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedId = newStaffTgId.trim().replace(/^@/, '');
    if (!cleanedId) {
      showToast('Введите корректный Telegram ID');
      return;
    }

    if (staffList.some((s) => s.telegramId === cleanedId)) {
      showToast('Пользователь с этим Telegram ID уже есть в списке!');
      return;
    }

    const newItem: AdminStaff = {
      id: `staff-${Date.now()}`,
      name: newStaffName.trim() || `Сотрудник (@${cleanedId})`,
      telegramId: cleanedId,
      role: newStaffRole,
      addedAt: new Date().toISOString().split('T')[0],
      addedBy: currentUser?.name || 'Администратор',
    };

    const updated = [...staffList, newItem];
    setStaffList(updated);
    saveAdminStaffList(updated);
    addSystemLog('Добавлен сотрудник', `Назначен @${cleanedId} с ролью ${getRoleLabel(newStaffRole)}`, currentUser?.telegramId);
    setNewStaffTgId('');
    setNewStaffName('');
    showToast(`Пользователь @${cleanedId} успешно добавлен как ${getRoleLabel(newStaffRole)}`);
  };

  const handleRemoveStaff = (id: string, tgId: string) => {
    if (tgId === '7948060541') {
      showToast('Нельзя удалить главного администратора (7948060541)!');
      return;
    }
    const updated = staffList.filter((s) => s.id !== id);
    setStaffList(updated);
    saveAdminStaffList(updated);
    addSystemLog('Отозван доступ сотрудника', `Отозван доступ у @${tgId}`, currentUser?.telegramId);
    showToast('Доступ для Telegram ID удален');
  };

  // --- USER HANDLERS ---
  const handleToggleUserStatus = (userId: string) => {
    const updated = usersList.map((u) => {
      if (u.id === userId) {
        const nextStatus = u.status === 'active' ? 'blocked' : 'active';
        addSystemLog('Смена статуса пользователя', `Пользователь @${u.telegramId} переведен в статус: ${nextStatus}`, currentUser?.telegramId);
        showToast(`Статус @${u.telegramId} изменен на ${nextStatus === 'active' ? 'Активен' : 'Заблокирован'}`);
        return { ...u, status: nextStatus as 'active' | 'blocked' };
      }
      return u;
    });
    setUsersList(updated);
    saveStoredUsers(updated);
  };

  const handleGrantAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantAccessModalUser || !selectedCourseToGrant) return;
    const course = coursesList.find((c) => c.id === selectedCourseToGrant);
    if (!course) return;

    // Create a manual paid order to grant access permanently
    createNewOrder({
      userId: grantAccessModalUser.id,
      userTelegramId: grantAccessModalUser.telegramId,
      userName: grantAccessModalUser.name,
      items: [{
        id: `grant-${Date.now()}`,
        courseId: course.id,
        subjectName: course.subject,
        schoolName: course.school,
        courseTitle: course.title,
        monthName: 'Полный доступ (Ручная выдача)',
        year: course.year,
        price: 0
      }],
      totalAmount: 0,
      status: 'paid'
    });

    addSystemLog('Ручная выдача курса', `Выдан курс "${course.title}" пользователю @${grantAccessModalUser.telegramId}`, currentUser?.telegramId);
    showToast(`Курс "${course.title}" успешно выдан пользователю @${grantAccessModalUser.telegramId}!`);
    setGrantAccessModalUser(null);
    setSelectedCourseToGrant('');
    refreshAllData();
  };

  // --- COURSE HANDLERS ---
  const handleOpenAddCourse = () => {
    setEditingCourse(null);
    setCourseFormTitle('');
    setCourseFormSubject('Русский Язык');
    setCourseFormSchool('100балльный репетитор');
    setCourseFormExam('EGE');
    setCourseFormYear('2027');
    setCourseFormPrice(3490);
    setCourseFormOriginalPrice(4500);
    setCourseFormTgLink('https://t.me/EgeNetwork11_bot');
    setShowCourseModal(true);
  };

  const handleOpenEditCourse = (course: AdminCourse) => {
    setEditingCourse(course);
    setCourseFormTitle(course.title);
    setCourseFormSubject(course.subject);
    setCourseFormSchool(course.school);
    setCourseFormExam(course.exam);
    setCourseFormYear(course.year);
    setCourseFormPrice(course.price);
    setCourseFormOriginalPrice(course.originalPrice || course.price + 1000);
    setCourseFormTgLink(course.telegramChannelLink || 'https://t.me/EgeNetwork11_bot');
    setShowCourseModal(true);
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseFormTitle.trim()) {
      showToast('Введите название курса');
      return;
    }

    let updatedList: AdminCourse[];

    if (editingCourse) {
      updatedList = coursesList.map((c) => {
        if (c.id === editingCourse.id) {
          return {
            ...c,
            title: courseFormTitle.trim(),
            subject: courseFormSubject,
            school: courseFormSchool,
            exam: courseFormExam,
            year: courseFormYear,
            price: courseFormPrice,
            originalPrice: courseFormOriginalPrice,
            telegramChannelLink: courseFormTgLink,
          };
        }
        return c;
      });
      addSystemLog('Обновление курса', `Изменен курс "${courseFormTitle}"`, currentUser?.telegramId);
      showToast(`Курс "${courseFormTitle}" успешно обновлен!`);
    } else {
      const newCourse: AdminCourse = {
        id: `crs-${Date.now()}`,
        title: courseFormTitle.trim(),
        subject: courseFormSubject,
        school: courseFormSchool,
        exam: courseFormExam,
        year: courseFormYear,
        price: courseFormPrice,
        originalPrice: courseFormOriginalPrice,
        isHidden: false,
        telegramChannelLink: courseFormTgLink,
        createdAt: new Date().toISOString().split('T')[0],
      };
      updatedList = [newCourse, ...coursesList];
      addSystemLog('Создание курса', `Создан новый курс "${newCourse.title}" (${newCourse.price} ₽)`, currentUser?.telegramId);
      showToast(`Курс "${newCourse.title}" успешно добавлен!`);
    }

    setCoursesList(updatedList);
    saveStoredCourses(updatedList);
    setShowCourseModal(false);
  };

  const handleToggleCourseHidden = (courseId: string) => {
    const updated = coursesList.map((c) => {
      if (c.id === courseId) {
        const nextHidden = !c.isHidden;
        addSystemLog('Видимость курса', `Курс "${c.title}" ${nextHidden ? 'скрыт из каталога' : 'опубликован'}`, currentUser?.telegramId);
        showToast(`Курс "${c.title}" ${nextHidden ? 'скрыт' : 'теперь виден в каталоге'}`);
        return { ...c, isHidden: nextHidden };
      }
      return c;
    });
    setCoursesList(updated);
    saveStoredCourses(updated);
  };

  const handleDeleteCourse = (courseId: string, title: string) => {
    if (!window.confirm(`Вы уверены, что хотите удалить курс "${title}"?`)) return;
    const updated = coursesList.filter((c) => c.id !== courseId);
    setCoursesList(updated);
    saveStoredCourses(updated);
    addSystemLog('Удаление курса', `Удален курс "${title}"`, currentUser?.telegramId);
    showToast(`Курс "${title}" удален`);
  };

  // --- ORDER HANDLERS ---
  const handleUpdateOrderStatus = (orderId: string, status: 'paid' | 'pending' | 'cancelled') => {
    const updated = ordersList.map((o) => {
      if (o.id === orderId) {
        addSystemLog('Смена статуса заказа', `Заказ ${o.id} переведен в статус "${status}"`, currentUser?.telegramId);
        showToast(`Статус заказа ${o.id} изменен на ${status === 'paid' ? 'Оплачен' : status === 'pending' ? 'Ожидает' : 'Отменен'}`);
        return { ...o, status };
      }
      return o;
    });
    setOrdersList(updated);
    saveStoredOrders(updated);
  };

  const handleCreateManualOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedTg = manualOrderTgId.trim().replace(/^@/, '');
    if (!cleanedTg) {
      showToast('Укажите Telegram ID покупателя');
      return;
    }

    const course = coursesList.find((c) => c.id === manualOrderCourseId);
    const orderItems = course ? [{
      id: `item-${Date.now()}`,
      courseId: course.id,
      subjectName: course.subject,
      schoolName: course.school,
      courseTitle: course.title,
      monthName: 'Полный курс',
      year: course.year,
      price: manualOrderAmount
    }] : [];

    createNewOrder({
      userId: `usr-${cleanedTg}`,
      userTelegramId: cleanedTg,
      userName: manualOrderUserName.trim() || `Пользователь @${cleanedTg}`,
      items: orderItems,
      totalAmount: manualOrderAmount,
      status: 'paid'
    });

    showToast(`Ручной заказ на сумму ${manualOrderAmount} ₽ создан!`);
    setShowManualOrderModal(false);
    setManualOrderTgId('');
    setManualOrderUserName('');
    setManualOrderAmount(3490);
    refreshAllData();
  };

  // --- PROMOCODE HANDLERS ---
  const handleCreatePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = newPromoCode.trim().toUpperCase();
    if (!cleanCode) {
      showToast('Введите код промокода');
      return;
    }

    if (promocodesList.some((p) => p.code === cleanCode)) {
      showToast('Промокод с таким названием уже существует!');
      return;
    }

    const newPromo: Promocode = {
      id: `promo-${Date.now()}`,
      code: cleanCode,
      discountPercent: newPromoDiscount,
      maxUses: newPromoMaxUses,
      usedCount: 0,
      active: true,
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updated = [newPromo, ...promocodesList];
    setPromocodesList(updated);
    saveStoredPromocodes(updated);
    addSystemLog('Создан промокод', `Промокод ${cleanCode} (-${newPromoDiscount}%) создан`, currentUser?.telegramId);
    showToast(`Промокод ${cleanCode} на скидку ${newPromoDiscount}% создан!`);
    setShowPromoModal(false);
    setNewPromoCode('');
  };

  const handleTogglePromoActive = (promoId: string) => {
    const updated = promocodesList.map((p) => {
      if (p.id === promoId) {
        const nextActive = !p.active;
        showToast(`Промокод ${p.code} ${nextActive ? 'активирован' : 'деактивирован'}`);
        return { ...p, active: nextActive };
      }
      return p;
    });
    setPromocodesList(updated);
    saveStoredPromocodes(updated);
  };

  const handleDeletePromo = (promoId: string, code: string) => {
    const updated = promocodesList.filter((p) => p.id !== promoId);
    setPromocodesList(updated);
    saveStoredPromocodes(updated);
    addSystemLog('Удален промокод', `Удален промокод ${code}`, currentUser?.telegramId);
    showToast(`Промокод ${code} удален`);
  };

  // --- SUPPORT HANDLERS ---
  const handleSendSupportReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChatTgId || !supportReplyText.trim()) return;

    sendSupportMessage({
      userTelegramId: activeChatTgId,
      userName: `Пользователь @${activeChatTgId}`,
      sender: 'admin',
      text: supportReplyText.trim()
    });

    setSupportReplyText('');
    showToast(`Ответ отправлен пользователю @${activeChatTgId}`);
    refreshAllData();
  };

  // Group support messages by user
  const supportUsersMap = supportMessagesList.reduce((acc, msg) => {
    if (!acc[msg.userTelegramId]) {
      acc[msg.userTelegramId] = {
        userName: msg.userName,
        messages: [],
      };
    }
    acc[msg.userTelegramId].messages.push(msg);
    return acc;
  }, {} as Record<string, { userName: string; messages: SupportMessage[] }>);

  // Set default active chat user if available
  useEffect(() => {
    const userKeys = Object.keys(supportUsersMap);
    if (userKeys.length > 0 && !activeChatTgId) {
      setActiveChatTgId(userKeys[0]);
    }
  }, [supportMessagesList]);

  // --- BROADCAST HANDLERS ---
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastBody.trim()) {
      showToast('Заполните заголовок и текст рассылки');
      return;
    }

    const recipientsCount = broadcastTarget === 'all' 
      ? usersList.length 
      : broadcastTarget === 'buyers' 
      ? ordersList.length 
      : Math.max(1, usersList.length);

    const newBroadcast: Broadcast = {
      id: `bc-${Date.now()}`,
      title: broadcastTitle.trim(),
      body: broadcastBody.trim(),
      target: broadcastTarget,
      sentAt: new Date().toLocaleString('ru-RU'),
      recipientsCount
    };

    const updated = [newBroadcast, ...broadcastsList];
    setBroadcastsList(updated);
    saveStoredBroadcasts(updated);

    addSystemLog('Массовая рассылка', `Отправлена рассылка "${newBroadcast.title}" (${recipientsCount} получателей)`, currentUser?.telegramId);
    showToast(`Рассылка "${broadcastTitle}" отправлена ${recipientsCount} пользователям!`);
    setBroadcastTitle('');
    setBroadcastBody('');
  };

  // --- SETTINGS HANDLERS ---
  const handleSaveSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredSettings(siteSettings);
    addSystemLog('Изменение настроек', 'Обновлены настройки сайта и ссылки', currentUser?.telegramId);
    showToast('Системные настройки успешно сохранены!');
  };

  // --- STATS CALCULATIONS ---
  const totalRevenue = ordersList
    .filter((o) => o.status === 'paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrdersCount = ordersList.filter((o) => o.status === 'pending').length;
  const pendingAmount = ordersList
    .filter((o) => o.status === 'pending')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const paidOrdersCount = ordersList.filter((o) => o.status === 'paid').length;
  const avgOrderValue = paidOrdersCount > 0 ? Math.round(totalRevenue / paidOrdersCount) : 0;

  // Render unauthorized fallback
  if (!isAdminOrStaff) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 rounded-3xl p-8 border border-slate-800 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto border border-red-500/20">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight">Доступ ограничен</h2>
            <p className="text-sm text-slate-400">
              Панель администратора доступна только при входе под авторизованным Telegram ID (например, <code className="text-emerald-400 font-mono font-bold">7948060541</code>).
            </p>
          </div>
          <button
            onClick={onExitAdmin}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Вернуться на сайт</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E131F] text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      
      {/* TOP ADMIN HEADER */}
      <header className="h-16 bg-[#151C2C] border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-sm tracking-tight text-white uppercase block leading-none">
                {siteSettings.siteName}
              </span>
              <span className="text-[10px] text-purple-400 font-bold tracking-widest uppercase">
                ПАНЕЛЬ УПРАВЛЕНИЯ
              </span>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-800 hidden sm:block" />

          <button
            onClick={onExitAdmin}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all border border-slate-700/50 hover:text-white cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Перейти на сайт</span>
          </button>
        </div>

        {/* User Info & Refresh */}
        <div className="flex items-center gap-3">
          <button
            onClick={refreshAllData}
            title="Обновить данные"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-all border border-slate-700/60 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Telegram ID: <strong className="text-white font-mono">{currentUser?.telegramId || '7948060541'}</strong></span>
          </div>

          <div className="flex items-center gap-2.5 bg-purple-950/40 border border-purple-800/50 rounded-xl py-1 px-3">
            <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center">
              {currentUser?.name?.charAt(0) || 'А'}
            </div>
            <div className="text-left text-xs">
              <div className="font-bold text-slate-100">{currentUser?.name || 'Администратор'}</div>
              <div className="text-[10px] text-purple-300 font-semibold">{getRoleLabel((currentUser?.role as AdminRole) || 'admin')}</div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT SIDEBAR */}
        <aside className="w-64 bg-[#121826] border-r border-slate-800/80 shrink-0 hidden md:flex flex-col justify-between p-3 overflow-y-auto">
          <div className="space-y-1">
            <div className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-wider">
              Навигация
            </div>

            {[
              { id: 'dashboard', label: 'Главная', icon: LayoutDashboard },
              { id: 'users', label: 'Пользователи', icon: Users, count: usersList.length },
              { id: 'courses', label: 'Каталог курсов', icon: BookOpen, count: coursesList.length },
              { id: 'orders', label: 'Заказы', icon: ShoppingCart, count: ordersList.length },
              { id: 'promocodes', label: 'Промокоды', icon: Tag, count: promocodesList.length },
              { id: 'support', label: 'Поддержка', icon: MessageSquare, count: Object.keys(supportUsersMap).length },
              { id: 'notifications', label: 'Рассылки', icon: Bell, count: broadcastsList.length },
              { id: 'analytics', label: 'Аналитика', icon: BarChart3 },
              { id: 'admins', label: 'Администраторы', icon: ShieldCheck, highlight: true, count: staffList.length },
              { id: 'logs', label: 'Системные логи', icon: FileText, count: systemLogs.length },
              { id: 'settings', label: 'Настройки', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 font-bold'
                      : item.highlight
                      ? 'text-purple-300 bg-purple-950/30 hover:bg-purple-900/40 border border-purple-800/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-purple-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-800/80">
            <button
              onClick={onExitAdmin}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Вернуться на сайт ↗</span>
            </button>
          </div>
        </aside>

        {/* CENTER CONTENT */}
        <main className="flex-1 bg-[#0E131F] p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-slate-900 p-6 rounded-3xl border border-purple-800/30">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Рабочая панель управления</h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">
                    Реальная база данных курсов, транзакций и обращений пользователей в режиме реального времени.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenAddCourse}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Добавить курс</span>
                  </button>
                  <button
                    onClick={() => setShowManualOrderModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Создать заказ</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Real Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#151C2C] p-5 rounded-2xl border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>Зарегистрировано учеников</span>
                    <Users className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-3xl font-black text-white">
                    {usersList.length}
                  </div>
                  <div className="text-[11px] text-slate-500 font-semibold">реальных пользователей</div>
                </div>

                <div className="bg-[#151C2C] p-5 rounded-2xl border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>Всего заказов</span>
                    <ShoppingCart className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="text-3xl font-black text-white">
                    {ordersList.length}
                  </div>
                  <div className="text-[11px] text-slate-500 font-semibold">
                    {paidOrdersCount} оплаченных транзакций
                  </div>
                </div>

                <div className="bg-[#151C2C] p-5 rounded-2xl border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>Общая выручка</span>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-black text-emerald-400">
                    {totalRevenue.toLocaleString('ru-RU')} ₽
                  </div>
                  <div className="text-[11px] text-slate-500 font-semibold">средний чек: {avgOrderValue} ₽</div>
                </div>

                <div className="bg-[#151C2C] p-5 rounded-2xl border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>Активных курсов в каталоге</span>
                    <BookOpen className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-3xl font-black text-white">
                    {coursesList.filter((c) => !c.isHidden).length}
                  </div>
                  <div className="text-[11px] text-slate-500 font-semibold">
                    всего: {coursesList.length} предметов
                  </div>
                </div>
              </div>

              {/* Grid: Recent Orders & Catalog overview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Recent Real Orders */}
                <div className="bg-[#151C2C] p-5 rounded-2xl border border-slate-800/80 space-y-4 lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-purple-400" />
                      Последние транзакции
                    </h3>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
                    >
                      Все заказы ({ordersList.length}) →
                    </button>
                  </div>

                  {ordersList.length === 0 ? (
                    <div className="p-8 text-center space-y-3 bg-slate-900/40 rounded-xl border border-slate-800/60">
                      <div className="text-3xl">🛒</div>
                      <div className="text-xs font-bold text-slate-400">Заказов пока нет</div>
                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                        Попробуйте добавить курс в корзину на сайте или нажмите «Создать заказ» выше.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {ordersList.slice(0, 5).map((o) => (
                        <div key={o.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-900/40 text-purple-300 font-bold flex items-center justify-center">
                              {o.userName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-white flex items-center gap-2">
                                <span>{o.userName}</span>
                                <span className="text-slate-400 font-mono text-[11px]">@{o.userTelegramId}</span>
                              </div>
                              <div className="text-[11px] text-purple-300 truncate max-w-xs">
                                {o.items.length > 0 
                                  ? o.items.map((i) => i.courseTitle).join(', ')
                                  : 'Пополнение баланса (СБП)'}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-extrabold text-emerald-400 text-sm">{o.totalAmount} ₽</div>
                            <div className="flex items-center gap-2 justify-end mt-0.5">
                              <span className="text-[10px] text-slate-400">{o.createdAt}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                o.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                              }`}>
                                {o.status === 'paid' ? 'Оплачен' : 'Ожидает'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Catalog Actions */}
                <div className="bg-[#151C2C] p-5 rounded-2xl border border-slate-800/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-400" />
                      Курсы в каталоге
                    </h3>
                    <button
                      onClick={() => setActiveTab('courses')}
                      className="text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
                    >
                      Все ({coursesList.length}) →
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {coursesList.slice(0, 5).map((c) => (
                      <div key={c.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-200 line-clamp-1">{c.title}</div>
                          <div className="text-[10px] text-slate-400">{c.exam} · {c.school}</div>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <div className="font-black text-emerald-400">{c.price} ₽</div>
                          <button
                            onClick={() => handleToggleCourseHidden(c.id)}
                            className="text-[10px] text-purple-400 hover:underline"
                          >
                            {c.isHidden ? 'Скрыт' : 'Виден'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: ADMINISTRATORS */}
          {activeTab === 'admins' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <ShieldCheck className="w-7 h-7 text-purple-400" />
                  Управление администраторами и правами
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Назначайте доступ к админ-панели по <strong>Telegram ID</strong>. Пользователь с этим Telegram ID получит доступ при входе.
                </p>
              </div>

              {/* Notice Box */}
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/40 text-purple-200 text-xs sm:text-sm space-y-1">
                <div className="font-bold flex items-center gap-2 text-white">
                  <Lock className="w-4 h-4 text-purple-400" />
                  Главный Администратор Telegram ID: <code className="bg-purple-900/60 px-2 py-0.5 rounded text-emerald-300 font-mono font-black text-sm">7948060541</code>
                </div>
                <p className="text-slate-300">
                  Этот Telegram ID всегда обладает правами Главного администратора и не может быть удален.
                </p>
              </div>

              {/* Add New Staff Form */}
              <div className="bg-[#151C2C] p-5 sm:p-6 rounded-2xl border border-slate-800/80 space-y-4">
                <h3 className="font-black text-base text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-purple-400" />
                  Назначить нового модератора / администратора
                </h3>

                <form onSubmit={handleAddStaff} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Telegram ID</label>
                    <input
                      type="text"
                      value={newStaffTgId}
                      onChange={(e) => setNewStaffTgId(e.target.value)}
                      placeholder="Например: 7912345678"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Имя / Описание</label>
                    <input
                      type="text"
                      value={newStaffName}
                      onChange={(e) => setNewStaffName(e.target.value)}
                      placeholder="Например: Арсен (Менеджер)"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Роль доступа</label>
                    <select
                      value={newStaffRole}
                      onChange={(e) => setNewStaffRole(e.target.value as AdminRole)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
                    >
                      <option value="admin">Главный администратор</option>
                      <option value="manager">Менеджер</option>
                      <option value="moderator">Модератор</option>
                      <option value="support">Служба поддержки</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Назначить доступ</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Staff Table */}
              <div className="bg-[#151C2C] rounded-2xl border border-slate-800/80 overflow-hidden">
                <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-white">Список авторизованных сотрудников</h3>
                  <span className="text-xs text-slate-400">Всего: {staffList.length}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/60 text-slate-400 uppercase font-extrabold text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3.5">Сотрудник</th>
                        <th className="p-3.5">Telegram ID</th>
                        <th className="p-3.5">Роль</th>
                        <th className="p-3.5">Дата добавления</th>
                        <th className="p-3.5 text-right">Действие</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {staffList.map((staff) => (
                        <tr key={staff.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="p-3.5 font-bold text-white flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-purple-900/50 text-purple-300 flex items-center justify-center font-black">
                              {staff.name.charAt(0)}
                            </div>
                            <span>{staff.name}</span>
                          </td>
                          <td className="p-3.5 font-mono text-emerald-400 font-bold">
                            @{staff.telegramId}
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold border ${getRoleBadgeColor(staff.role)}`}>
                              {getRoleLabel(staff.role)}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-400">{staff.addedAt}</td>
                          <td className="p-3.5 text-right">
                            {staff.telegramId === '7948060541' ? (
                              <span className="text-[10px] text-slate-500 font-semibold italic">Главный админ</span>
                            ) : (
                              <button
                                onClick={() => handleRemoveStaff(staff.id, staff.telegramId)}
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                                title="Отозвать доступ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: USERS (ПОЛЬЗОВАТЕЛИ) */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <Users className="w-7 h-7 text-purple-400" />
                    Зарегистрированные пользователи
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Реальные пользователи, авторизованные через Telegram ID</p>
                </div>
                
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Поиск по имени или Telegram ID..."
                    className="pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500 w-full sm:w-64"
                  />
                </div>
              </div>

              {usersList.length === 0 ? (
                <div className="bg-[#151C2C] p-12 rounded-2xl border border-slate-800/80 text-center space-y-3">
                  <div className="text-4xl">👥</div>
                  <h3 className="font-bold text-white text-base">Пользователей пока нет в базе</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Когда пользователи войдут на сайт под своим Telegram ID, они появится в этом списке.
                  </p>
                </div>
              ) : (
                <div className="bg-[#151C2C] rounded-2xl border border-slate-800/80 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900/60 text-slate-400 uppercase font-extrabold text-[10px] tracking-wider">
                        <tr>
                          <th className="p-3.5">Пользователь</th>
                          <th className="p-3.5">Telegram ID</th>
                          <th className="p-3.5">Дата рег.</th>
                          <th className="p-3.5">Последний вход</th>
                          <th className="p-3.5">Статус</th>
                          <th className="p-3.5 text-right">Действия</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {usersList
                          .filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.telegramId.includes(userSearch))
                          .map((u) => (
                            <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                              <td className="p-3.5 font-bold text-white flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-slate-800 text-purple-300 font-black flex items-center justify-center">
                                  {u.name.charAt(0)}
                                </div>
                                <span>{u.name}</span>
                              </td>
                              <td className="p-3.5 font-mono text-emerald-400 font-bold">@{u.telegramId}</td>
                              <td className="p-3.5 text-slate-400">{u.registeredAt || '2026-08-03'}</td>
                              <td className="p-3.5 text-slate-400">{u.lastLogin || 'Сегодня'}</td>
                              <td className="p-3.5">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  u.status === 'blocked' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                                }`}>
                                  {u.status === 'blocked' ? 'Заблокирован' : 'Активен'}
                                </span>
                              </td>
                              <td className="p-3.5 text-right space-x-2">
                                <button
                                  onClick={() => setGrantAccessModalUser(u)}
                                  className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white transition-colors font-bold text-[11px] cursor-pointer"
                                >
                                  Выдать курс
                                </button>
                                <button
                                  onClick={() => handleToggleUserStatus(u.id)}
                                  className={`px-2.5 py-1 rounded-lg transition-colors font-bold text-[11px] cursor-pointer ${
                                    u.status === 'active' 
                                      ? 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white' 
                                      : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white'
                                  }`}
                                >
                                  {u.status === 'active' ? 'Заблокировать' : 'Разблокировать'}
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: COURSES CATALOG */}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <BookOpen className="w-7 h-7 text-purple-400" />
                    Управление каталогом курсов
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Добавление, редактирование цен, скрытие и удаление предметов</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-700/80">
                    <button
                      onClick={() => setCourseExamFilter('all')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${courseExamFilter === 'all' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
                    >
                      Все
                    </button>
                    <button
                      onClick={() => setCourseExamFilter('EGE')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${courseExamFilter === 'EGE' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
                    >
                      ЕГЭ
                    </button>
                    <button
                      onClick={() => setCourseExamFilter('OGE')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${courseExamFilter === 'OGE' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
                    >
                      ОГЭ
                    </button>
                  </div>

                  <button
                    onClick={handleOpenAddCourse}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/30 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Добавить курс</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {coursesList
                  .filter((c) => courseExamFilter === 'all' || c.exam === courseExamFilter)
                  .map((c) => (
                    <div key={c.id} className={`p-4 rounded-2xl bg-[#151C2C] border transition-all ${c.isHidden ? 'border-amber-500/40 opacity-75' : 'border-slate-800/80 hover:border-slate-700'} space-y-3 flex flex-col justify-between`}>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-lg bg-purple-950 text-purple-300 font-extrabold text-[10px] border border-purple-800/40">
                            {c.exam} · {c.year} · {c.school}
                          </span>
                          {c.isHidden && (
                            <span className="text-[10px] text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                              Скрыт
                            </span>
                          )}
                        </div>

                        <h4 className="font-black text-sm text-white leading-snug">{c.title}</h4>
                        <div className="text-xs text-slate-400 font-semibold">{c.subject}</div>
                      </div>

                      <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                        <div>
                          <div className="text-lg font-black text-emerald-400">{c.price} ₽</div>
                          {c.originalPrice && (
                            <div className="text-[10px] text-slate-500 line-through">{c.originalPrice} ₽</div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleCourseHidden(c.id)}
                            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
                            title={c.isHidden ? 'Опубликовать' : 'Скрыть'}
                          >
                            {c.isHidden ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                          </button>
                          <button
                            onClick={() => handleOpenEditCourse(c)}
                            className="p-2 rounded-lg bg-purple-900/30 hover:bg-purple-900/60 text-purple-300 transition-colors cursor-pointer"
                            title="Редактировать"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(c.id, c.title)}
                            className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 transition-colors cursor-pointer"
                            title="Удалить"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 5: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <ShoppingCart className="w-7 h-7 text-purple-400" />
                    История и статусы заказов
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Все реальные транзакции пользователей с возможностью изменения статусов</p>
                </div>

                <button
                  onClick={() => setShowManualOrderModal(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Создать заказ вручную</span>
                </button>
              </div>

              <div className="bg-[#151C2C] rounded-2xl border border-slate-800/80 p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex gap-2">
                    {[
                      { id: 'all', label: 'Все' },
                      { id: 'paid', label: 'Оплачены' },
                      { id: 'pending', label: 'Ожидают' },
                      { id: 'cancelled', label: 'Отменены' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        onClick={() => setOrderFilter(st.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          orderFilter === st.id ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      placeholder="Поиск по номеру или Telegram ID..."
                      className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500 w-48 sm:w-60"
                    />
                  </div>
                </div>

                {ordersList.length === 0 ? (
                  <div className="p-12 text-center space-y-3 bg-slate-900/40 rounded-xl border border-slate-800/60">
                    <div className="text-4xl">🛒</div>
                    <h3 className="font-bold text-white text-base">Список заказов пуст</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Оформите покупку через корзину на главной странице или создайте заказ вручную.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {ordersList
                      .filter((o) => (orderFilter === 'all' || o.status === orderFilter) && (o.id.includes(orderSearch) || o.userTelegramId.includes(orderSearch)))
                      .map((o) => (
                        <div key={o.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                          <div className="space-y-1">
                            <div className="font-black text-white flex items-center gap-2">
                              <span className="text-purple-400 font-mono text-sm">{o.id}</span>
                              <span>{o.userName}</span>
                              <span className="text-emerald-400 font-mono">@{o.userTelegramId}</span>
                            </div>

                            <div className="text-slate-300 font-medium">
                              {o.items.length > 0 
                                ? o.items.map((i) => `${i.subjectName} — ${i.schoolName} (${i.monthName})`).join(' | ')
                                : 'Пополнение через СБП'}
                            </div>

                            <div className="text-[10px] text-slate-500">
                              Создан: {o.createdAt} {o.promoCode && `· Промокод: ${o.promoCode}`}
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                            <div className="text-right">
                              <div className="font-black text-emerald-400 text-base">{o.totalAmount} ₽</div>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                o.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : o.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                              }`}>
                                {o.status === 'paid' ? 'Оплачен' : o.status === 'pending' ? 'Ожидает' : 'Отменен'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              {o.status !== 'paid' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(o.id, 'paid')}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white font-bold text-[11px] transition-colors cursor-pointer"
                                >
                                  Подтвердить
                                </button>
                              )}
                              {o.status !== 'cancelled' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(o.id, 'cancelled')}
                                  className="px-2.5 py-1 rounded-lg bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white font-bold text-[11px] transition-colors cursor-pointer"
                                >
                                  Отменить
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: PROMOCODES */}
          {activeTab === 'promocodes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <Tag className="w-7 h-7 text-purple-400" />
                    Управление промокодами
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Промокоды проверяются в корзине в реальном времени</p>
                </div>
                <button
                  onClick={() => setShowPromoModal(true)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/30 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Создать промокод</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {promocodesList.map((p) => (
                  <div key={p.id} className="p-4 rounded-2xl bg-[#151C2C] border border-slate-800/80 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-lg text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-800/40">
                          {p.code}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                          {p.active ? 'Активен' : 'Неактивен'}
                        </span>
                      </div>
                      
                      <div className="text-xs text-slate-300">
                        Скидка: <strong className="text-white text-sm">-{p.discountPercent}%</strong>
                      </div>
                      <div className="text-xs text-slate-400">
                        Использовано: <strong className="text-white">{p.usedCount}</strong> / {p.maxUses}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                      <button
                        onClick={() => handleTogglePromoActive(p.id)}
                        className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 cursor-pointer"
                      >
                        {p.active ? 'Деактивировать' : 'Включить'}
                      </button>
                      <button
                        onClick={() => handleDeletePromo(p.id, p.code)}
                        className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 cursor-pointer"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: SUPPORT CHAT */}
          {activeTab === 'support' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <MessageSquare className="w-7 h-7 text-purple-400" />
                  Поддержка учеников (Онлайн-чат)
                </h2>
                <p className="text-xs text-slate-400 mt-1">Реальная переписка с пользователями и ответы на вопросы</p>
              </div>

              {Object.keys(supportUsersMap).length === 0 ? (
                <div className="bg-[#151C2C] p-12 rounded-2xl border border-slate-800/80 text-center space-y-3">
                  <div className="text-4xl">💬</div>
                  <h3 className="font-bold text-white text-base">Обращений в поддержку пока нет</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Здесь будут появляться реальные вопросы от пользователей.
                  </p>
                </div>
              ) : (
                <div className="bg-[#151C2C] rounded-2xl border border-slate-800/80 grid grid-cols-1 md:grid-cols-3 h-[480px] overflow-hidden">
                  
                  {/* Users Sidebar */}
                  <div className="border-r border-slate-800/80 p-3 space-y-2 overflow-y-auto">
                    {Object.keys(supportUsersMap).map((tgId) => {
                      const item = supportUsersMap[tgId];
                      const lastMsg = item.messages[item.messages.length - 1];
                      const isActive = activeChatTgId === tgId;
                      return (
                        <button
                          key={tgId}
                          onClick={() => setActiveChatTgId(tgId)}
                          className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer ${
                            isActive ? 'bg-purple-600 text-white font-bold shadow-md' : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="truncate">{item.userName}</span>
                            <span className="text-[10px] opacity-70">@{tgId}</span>
                          </div>
                          {lastMsg && (
                            <div className="text-[10px] opacity-80 truncate mt-1">
                              {lastMsg.sender === 'admin' ? 'Вы: ' : ''}{lastMsg.text}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Chat Timeline */}
                  <div className="md:col-span-2 flex flex-col justify-between p-4 bg-slate-950/40">
                    {activeChatTgId && supportUsersMap[activeChatTgId] ? (
                      <>
                        <div className="pb-3 border-b border-slate-800/80 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-white text-sm">
                              {supportUsersMap[activeChatTgId].userName}
                            </span>
                            <span className="text-xs text-emerald-400 font-mono ml-2">
                              @{activeChatTgId}
                            </span>
                          </div>
                        </div>

                        <div className="flex-1 space-y-3 overflow-y-auto my-3 pr-2">
                          {supportUsersMap[activeChatTgId].messages.map((m) => (
                            <div key={m.id} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[80%] p-3 rounded-2xl text-xs space-y-1 ${
                                m.sender === 'admin' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'
                              }`}>
                                <p>{m.text}</p>
                                <div className="text-[9px] opacity-70 text-right">{m.createdAt}</div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <form onSubmit={handleSendSupportReply} className="pt-3 border-t border-slate-800/80 flex gap-2">
                          <input
                            type="text"
                            value={supportReplyText}
                            onChange={(e) => setSupportReplyText(e.target.value)}
                            placeholder="Напишите ответ..."
                            className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-purple-500"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Отправить</span>
                          </button>
                        </form>
                      </>
                    ) : (
                      <div className="text-center text-slate-500 text-xs my-auto">
                        Выберите диалог из списка слева
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: BROADCASTS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <Bell className="w-7 h-7 text-purple-400" />
                  Массовая рассылка уведомлений
                </h2>
                <p className="text-xs text-slate-400 mt-1">Отправка сообщений всем подписчикам Telegram бота</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <form onSubmit={handleSendBroadcast} className="bg-[#151C2C] p-6 rounded-2xl border border-slate-800/80 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Целевая аудитория</label>
                    <select
                      value={broadcastTarget}
                      onChange={(e) => setBroadcastTarget(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
                    >
                      <option value="all">Все зарегистрированные пользователей ({usersList.length})</option>
                      <option value="buyers">Покупатели курсов ({ordersList.length})</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Заголовок рассылки</label>
                    <input
                      type="text"
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                      placeholder="Например: ⚡ Скидки 20% на курсы 2027!"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Текст сообщения</label>
                    <textarea
                      rows={5}
                      value={broadcastBody}
                      onChange={(e) => setBroadcastBody(e.target.value)}
                      placeholder="Впишите текст сообщения..."
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Запустить рассылку</span>
                  </button>
                </form>

                {/* History of Broadcasts */}
                <div className="bg-[#151C2C] p-6 rounded-2xl border border-slate-800/80 space-y-4">
                  <h3 className="font-extrabold text-sm text-white">История рассылок</h3>

                  {broadcastsList.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-500">
                      Рассылки пока не отправлялись
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[360px] overflow-y-auto">
                      {broadcastsList.map((bc) => (
                        <div key={bc.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/60 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white">{bc.title}</span>
                            <span className="text-[10px] text-purple-400 font-mono">{bc.recipientsCount} подп.</span>
                          </div>
                          <p className="text-[11px] text-slate-300 line-clamp-2">{bc.body}</p>
                          <div className="text-[9px] text-slate-500 pt-1">{bc.sentAt}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <BarChart3 className="w-7 h-7 text-purple-400" />
                  Аналитика и финансовые показатели
                </h2>
                <p className="text-xs text-slate-400 mt-1">Расчет реальных метрик на основе поступивших заказов</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#151C2C] p-5 rounded-2xl border border-slate-800/80 space-y-1">
                  <div className="text-xs text-slate-400">Средний чек (оплачен)</div>
                  <div className="text-3xl font-black text-emerald-400">{avgOrderValue} ₽</div>
                  <div className="text-[10px] text-slate-500">на основе {paidOrdersCount} оплаченных транзакций</div>
                </div>

                <div className="bg-[#151C2C] p-5 rounded-2xl border border-slate-800/80 space-y-1">
                  <div className="text-xs text-slate-400">Неподтвержденные заказы</div>
                  <div className="text-3xl font-black text-amber-400">{pendingOrdersCount}</div>
                  <div className="text-[10px] text-amber-400 font-bold font-mono">на сумму {pendingAmount} ₽</div>
                </div>

                <div className="bg-[#151C2C] p-5 rounded-2xl border border-slate-800/80 space-y-1">
                  <div className="text-xs text-slate-400">Активных промокодов</div>
                  <div className="text-3xl font-black text-purple-400">
                    {promocodesList.filter((p) => p.active).length}
                  </div>
                  <div className="text-[10px] text-slate-500">из {promocodesList.length} созданных</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: SYSTEM LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <FileText className="w-7 h-7 text-purple-400" />
                    Системные логи действий
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Журнал операций администраторов, авторизаций и транзакций</p>
                </div>

                <button
                  onClick={() => {
                    clearSystemLogs();
                    setSystemLogs([]);
                    showToast('Логи очищены');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Очистить логи
                </button>
              </div>

              <div className="bg-[#151C2C] p-4 rounded-2xl border border-slate-800/80 space-y-2">
                {systemLogs.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500">
                    Журнал логов пуст
                  </div>
                ) : (
                  systemLogs.map((log) => (
                    <div key={log.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/60 text-xs font-mono space-y-0.5">
                      <div className="flex items-center justify-between text-purple-400">
                        <span className="font-bold">[{log.timestamp}] {log.action}</span>
                        {log.adminTelegramId && <span className="text-emerald-400">@${log.adminTelegramId}</span>}
                      </div>
                      <div className="text-slate-300 font-sans">{log.details}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 11: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <Settings className="w-7 h-7 text-purple-400" />
                  Системные настройки сайта
                </h2>
                <p className="text-xs text-slate-400 mt-1">Изменение наименования, ссылок на бот и реквизитов</p>
              </div>

              <form onSubmit={handleSaveSettingsSubmit} className="bg-[#151C2C] p-6 rounded-2xl border border-slate-800/80 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Название сервиса</label>
                  <input
                    type="text"
                    value={siteSettings.siteName}
                    onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Ссылка на Telegram Бот</label>
                  <input
                    type="text"
                    value={siteSettings.telegramBotLink}
                    onChange={(e) => setSiteSettings({ ...siteSettings, telegramBotLink: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Ссылка на Поддержку Telegram</label>
                  <input
                    type="text"
                    value={siteSettings.supportTgLink}
                    onChange={(e) => setSiteSettings({ ...siteSettings, supportTgLink: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Текст промо-баннера на сайте</label>
                  <textarea
                    rows={2}
                    value={siteSettings.discountBannerText}
                    onChange={(e) => setSiteSettings({ ...siteSettings, discountBannerText: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs transition-all shadow-lg shadow-purple-600/30 cursor-pointer"
                >
                  Сохранить настройки
                </button>
              </form>
            </div>
          )}

        </main>
      </div>

      {/* MODAL: CREATE / EDIT COURSE */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#151C2C] border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 text-slate-100 shadow-2xl">
            <h3 className="text-xl font-black text-white">
              {editingCourse ? 'Редактировать курс' : 'Добавить новый курс'}
            </h3>

            <form onSubmit={handleSaveCourse} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Название курса</label>
                <input
                  type="text"
                  value={courseFormTitle}
                  onChange={(e) => setCourseFormTitle(e.target.value)}
                  placeholder="Например: Годовой курс по Математике"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Экзамен</label>
                  <select
                    value={courseFormExam}
                    onChange={(e) => setCourseFormExam(e.target.value as ExamType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="EGE">ЕГЭ</option>
                    <option value="OGE">ОГЭ</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Учебный год</label>
                  <select
                    value={courseFormYear}
                    onChange={(e) => setCourseFormYear(e.target.value as AcademicYear)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="2027">2027 (Новый)</option>
                    <option value="2026">2026 (Прошлый)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Предмет</label>
                <input
                  type="text"
                  value={courseFormSubject}
                  onChange={(e) => setCourseFormSubject(e.target.value)}
                  placeholder="Например: Русский Язык"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Онлайн-школа</label>
                <input
                  type="text"
                  value={courseFormSchool}
                  onChange={(e) => setCourseFormSchool(e.target.value)}
                  placeholder="Например: 100балльный репетитор"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Цена со скидкой (₽)</label>
                  <input
                    type="number"
                    value={courseFormPrice}
                    onChange={(e) => setCourseFormPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Старая цена (₽)</label>
                  <input
                    type="number"
                    value={courseFormOriginalPrice}
                    onChange={(e) => setCourseFormOriginalPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MANUAL ORDER */}
      {showManualOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#151C2C] border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 text-slate-100 shadow-2xl">
            <h3 className="text-xl font-black text-white">Создать заказ вручную</h3>

            <form onSubmit={handleCreateManualOrder} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Telegram ID Покупателя</label>
                <input
                  type="text"
                  value={manualOrderTgId}
                  onChange={(e) => setManualOrderTgId(e.target.value)}
                  placeholder="Например: 7912345678"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Имя пользователя (опционально)</label>
                <input
                  type="text"
                  value={manualOrderUserName}
                  onChange={(e) => setManualOrderUserName(e.target.value)}
                  placeholder="Например: Иван Иванов"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Выбрать курс</label>
                <select
                  value={manualOrderCourseId}
                  onChange={(e) => {
                    setManualOrderCourseId(e.target.value);
                    const sel = coursesList.find((c) => c.id === e.target.value);
                    if (sel) setManualOrderAmount(sel.price);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">-- Выберите курс --</option>
                  {coursesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.price} ₽)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Сумма заказа (₽)</label>
                <input
                  type="number"
                  value={manualOrderAmount}
                  onChange={(e) => setManualOrderAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowManualOrderModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black"
                >
                  Создать заказ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE PROMOCODE */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#151C2C] border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 text-slate-100 shadow-2xl">
            <h3 className="text-xl font-black text-white">Создать новый промокод</h3>

            <form onSubmit={handleCreatePromoSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Код промокода</label>
                <input
                  type="text"
                  value={newPromoCode}
                  onChange={(e) => setNewPromoCode(e.target.value)}
                  placeholder="Например: EGE2027"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold uppercase focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Процент скидки (%)</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={newPromoDiscount}
                  onChange={(e) => setNewPromoDiscount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Лимит использований</label>
                <input
                  type="number"
                  min={1}
                  value={newPromoMaxUses}
                  onChange={(e) => setNewPromoMaxUses(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPromoModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black"
                >
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GRANT ACCESS */}
      {grantAccessModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#151C2C] border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 text-slate-100 shadow-2xl">
            <h3 className="text-xl font-black text-white">Выдать курс пользователю</h3>
            <p className="text-xs text-slate-400">
              Пользователь: <strong>{grantAccessModalUser.name}</strong> (@{grantAccessModalUser.telegramId})
            </p>

            <form onSubmit={handleGrantAccessSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Выберите курс</label>
                <select
                  value={selectedCourseToGrant}
                  onChange={(e) => setSelectedCourseToGrant(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  required
                >
                  <option value="">-- Выберите курс из списка --</option>
                  {coursesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.school})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGrantAccessModalUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black"
                >
                  Выдать доступ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
