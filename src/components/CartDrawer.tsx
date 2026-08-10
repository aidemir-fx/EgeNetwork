import React, { useState, useEffect } from 'react';
import { ShoppingBag, X, Trash2, QrCode, ArrowRight, ShieldCheck, CheckCircle2, CreditCard, Tag, Sparkles, Clock, ExternalLink } from 'lucide-react';
import { CartItem } from '../types';
import { validateAndUsePromocode, createNewOrder } from '../utils/adminStore';
import { getCurrentUser } from '../utils/adminAuth';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onOpenAuthModal: () => void;
  showToast: (msg: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems = [],
  onRemoveItem,
  onClearCart,
  onOpenAuthModal,
  showToast,
}) => {
  const [topupAmount, setTopupAmount] = useState<number>(500);
  const [isGeneratingTopup, setIsGeneratingTopup] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [qrTimeLeft, setQrTimeLeft] = useState<number>(899); // 14 mins 59 secs
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);

  // QR Timer count down
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (showQrModal && qrTimeLeft > 0) {
      interval = setInterval(() => {
        setQrTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showQrModal, qrTimeLeft]);

  if (!isOpen) return null;

  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];
  const rawSum = safeCartItems.reduce((acc, item) => acc + (item?.price || 0), 0);
  const discountAmount = Math.round((rawSum * discountPercent) / 100);
  const totalSum = Math.max(0, rawSum - discountAmount);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = promoCode.trim().toUpperCase();
    if (!cleanCode) return;

    const result = validateAndUsePromocode(cleanCode);
    if (result.valid) {
      setDiscountPercent(result.discountPercent);
      setAppliedPromo(cleanCode);
      showToast(result.message);
    } else {
      showToast(result.message);
    }
  };

  const handleCreateUrlPayPayment = async (amount: number, description: string, itemsList: CartItem[]) => {
    setIsProcessingPayment(true);
    setPaymentNotice(null);

    const curUser = getCurrentUser();
    const userTg = curUser ? curUser.telegramId : 'гость';
    const uName = curUser ? curUser.name : 'Гость (СБП)';
    const uId = curUser ? curUser.id : `usr-guest-${Date.now()}`;

    try {
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          description,
          items: itemsList.map((item) => ({
            title: `${item.subjectName} — ${item.courseTitle} (${item.schoolName})`,
            price: item.price,
          })),
          userId: uId,
          userTelegramId: userTg,
          userName: uName,
        }),
      });

      const responseText = await response.text();
      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch (parseErr) {
        console.error('[UrlPay Client Parse Error]: Non-JSON response:', responseText.substring(0, 150));
        data = { success: false, error: 'Сервер вернул некорректный ответ (не JSON)' };
      }

      if (data.success && data.paymentUrl) {
        showToast('Перенаправление на официальную форму оплаты UrlPay...');
        // Redirect to real UrlPay payment link
        window.location.href = data.paymentUrl;
        return;
      }

      if (data.isSimulation) {
        setPaymentNotice(data.message);
        showToast('Режим эмуляции (ключи UrlPay не указаны в .env)');
      } else if (!data.success) {
        showToast(`Ошибка UrlPay: ${data.error || 'Не удалось создать платеж'}`);
      }
    } catch (err: any) {
      console.error('Payment API call error:', err);
      showToast('Ошибка обращения к платежному шлюзу');
    } finally {
      setIsProcessingPayment(false);
    }

    // Fallback or preview modal display
    setTopupAmount(amount);
    setQrTimeLeft(899);
    setShowQrModal(true);
  };

  const handleTopupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!getCurrentUser()) {
      showToast('Перед оплатой нужно зарегистрировать личный кабинет');
      onClose();
      onOpenAuthModal();
      return;
    }
    if (topupAmount < 100) {
      showToast('Минимальная сумма пополнения — 100 ₽');
      return;
    }
    handleCreateUrlPayPayment(topupAmount, `Быстрое пополнение счета на ${topupAmount} ₽`, []);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      showToast('Корзина пуста');
      return;
    }
    if (!getCurrentUser()) {
      showToast('Перед оплатой курса нужно зарегистрировать личный кабинет');
      onClose();
      onOpenAuthModal();
      return;
    }
    handleCreateUrlPayPayment(totalSum, `Оплата заказа (${cartItems.length} шт.)`, cartItems);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200/80">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[#FFF3EB] text-[#FF6B35] border border-[#FFDACD]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Ваша корзина</h2>
                <p className="text-xs text-slate-500 font-semibold">Товаров в заказе: {cartItems.length}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              id="cart-close-btn"
              className="p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items Scroll Container */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {cartItems.length === 0 ? (
              <div className="text-center py-14 space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 text-slate-300 flex items-center justify-center mx-auto text-3xl shadow-inner">
                  🛒
                </div>
                <div className="space-y-1">
                  <h3 className="font-black text-slate-900 text-base">Корзина пока пуста</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    Выберите предмет и школу в каталоге, чтобы мгновенно получить доступ к курсу.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Выбранные курсы</span>
                  <button
                    onClick={onClearCart}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline transition-colors"
                  >
                    Очистить все
                  </button>
                </div>

                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-start justify-between gap-3 group hover:border-[#FFB09D] transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-[#B75228] bg-[#FFE0D0] px-2 py-0.5 rounded-md">
                          {item.year} · {item.monthName}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {item.schoolName}
                        </span>
                      </div>
                      <h4 className="font-black text-slate-900 text-sm tracking-tight">
                        {item.subjectName} — {item.courseTitle}
                      </h4>
                      <div className="text-sm font-black text-[#FF6B35] pt-1">{item.price} ₽</div>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Удалить курс"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* PROMO CODE SECTION */}
            {cartItems.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Tag className="w-3.5 h-3.5 text-[#FF6B35]" />
                  <span>Промокод на скидку</span>
                </div>

                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Например: EGE2026"
                    className="flex-1 px-3 py-2 text-xs font-mono font-bold uppercase rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#FF6B35]"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all"
                  >
                    Применить
                  </button>
                </form>

                {appliedPromo && (
                  <div className="text-[11px] font-bold text-[#FF6B35] flex items-center gap-1 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Промокод {appliedPromo} активен (-{discountPercent}%)</span>
                  </div>
                )}
              </div>
            )}

            {/* SBP quick-topup removed to avoid customer confusion */}
          </div>

          {/* Footer Checkout Summary */}
          {cartItems.length > 0 && (
            <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-3">
              {discountPercent > 0 && (
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Скидка по промокоду ({discountPercent}%):</span>
                  <span className="font-bold text-[#FF6B35]">-{discountAmount} ₽</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Итого к оплате:</span>
                  <span className="text-2xl font-black text-slate-900">{totalSum} ₽</span>
                </div>

                <div className="flex items-center gap-1.5 bg-[#FFF1E8] text-[#FF6B35] text-[11px] font-extrabold px-3 py-1.5 rounded-xl">
                  <ShieldCheck className="w-4 h-4 text-[#FF6B35]" />
                  <span>Доступ моментально</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isProcessingPayment}
                id="checkout-sbp-btn"
                className="w-full py-4 rounded-2xl bg-[#FF6B35] hover:bg-[#E65A22] text-white font-black text-sm shadow-xl shadow-[#FF6B35]/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                <span>{isProcessingPayment ? 'Создание платежа...' : `Оплатить (${totalSum} ₽)`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SBP QR MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full text-center space-y-5 shadow-2xl relative border border-slate-100 animate-fadeIn">
            <button
              onClick={() => setShowQrModal(false)}
              id="qr-modal-close-btn"
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* SBP Visual Header */}
            <div className="space-y-2">
              <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white font-black text-xs shadow-md">
                <span>СБП — Система Быстрых Платежей</span>
              </div>
              <h3 className="text-xl font-black text-slate-900">Оплата {topupAmount} ₽</h3>
              <p className="text-xs text-slate-500">
                Откройте приложение вашего банка и отсканируйте QR-код
              </p>
            </div>

            {/* QR Mock graphic with SBP watermark */}
            <div className="w-52 h-52 mx-auto p-3.5 bg-white border-2 border-slate-900 rounded-3xl relative flex flex-col items-center justify-center shadow-lg">
              <div className="w-full h-full bg-slate-900 rounded-2xl p-3 flex flex-col items-center justify-between text-white text-center">
                <div className="flex justify-between w-full text-[10px] text-emerald-400 font-mono">
                  <span>EGENETWORK-PAY</span>
                  <span>SBP-FAST</span>
                </div>
                
                <div className="p-3 bg-white rounded-xl shadow-inner text-slate-900 my-auto">
                  <QrCode className="w-20 h-20 text-slate-900" />
                </div>

                <div className="text-[10px] text-slate-400 font-mono">
                  ID: #{Math.floor(100000 + Math.random() * 900000)}
                </div>
              </div>
            </div>

            {/* Timer countdown */}
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 py-2 rounded-xl border border-amber-200/60">
              <Clock className="w-4 h-4" />
              <span>Ссылка действительна: {formatTimer(qrTimeLeft)}</span>
            </div>

            {/* Popular Russian Bank buttons shortcut */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Быстрый переход в банк:</span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => showToast('Переход в СберБанк Онлайн...')}
                  className="py-2 px-1 rounded-xl bg-[#FFF1E8] text-[#FF6B35] hover:bg-[#FFE0CF] font-bold text-xs border border-[#FFD3BA] transition-all"
                >
                  Сбер
                </button>
                <button
                  type="button"
                  onClick={() => showToast('Переход в Т-Банк...')}
                  className="py-2 px-1 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold text-xs border border-amber-200 transition-all"
                >
                  Т-Банк
                </button>
                <button
                  type="button"
                  onClick={() => showToast('Переход в ВТБ...')}
                  className="py-2 px-1 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs border border-blue-200 transition-all"
                >
                  ВТБ
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setShowQrModal(false);
                
                const curUser = getCurrentUser();
                if (!curUser) {
                  showToast('Перед подтверждением оплаты нужно зарегистрировать личный кабинет');
                  onClose();
                  onOpenAuthModal();
                  return;
                }
                const userTg = curUser.telegramId;
                const uName = curUser.name;
                const uId = curUser.id;

                if (cartItems.length > 0) {
                  createNewOrder({
                    userId: uId,
                    userTelegramId: userTg,
                    userName: uName,
                    items: [...cartItems],
                    totalAmount: totalSum,
                    discountAmount: discountAmount > 0 ? discountAmount : undefined,
                    promoCode: appliedPromo || undefined,
                    status: 'paid',
                  });
                  onClearCart();
                } else {
                  // Direct Topup Order
                  createNewOrder({
                    userId: uId,
                    userTelegramId: userTg,
                    userName: uName,
                    items: [],
                    totalAmount: topupAmount,
                    status: 'paid',
                  });
                }

                onClose();
                showToast(`Оплата ${topupAmount} ₽ успешно подтверждена! Заказ создан и доступ выдан.`);
              }}
              id="confirm-sbp-paid-btn"
              className="w-full py-3.5 rounded-2xl bg-[#FF6B35] text-white font-black text-xs hover:bg-[#E65A22] shadow-lg shadow-[#FF6B35]/25 transition-all"
            >
              Я оплатил (Подтвердить)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
