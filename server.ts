import express from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './src/server/auth-backend.ts';

// Load .env first, fallback to .env.example if variables are missing
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env.example') });

const app = express();
const PORT = 3000;

app.set('trust proxy', 1);
app.use(express.json({ limit: '32kb' }));

// Helmet с исключением для Vite в dev режиме
if (process.env.NODE_ENV === 'production') {
  app.use(
    helmet({
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
      contentSecurityPolicy: {
        directives: {
          scriptSrc: ["'self'", "'unsafe-eval'", 'https://telegram.org', 'https://oauth.telegram.org'],
          frameSrc: ["'self'", 'https://oauth.telegram.org', 'https://telegram.org'],
          connectSrc: ["'self'", 'https://telegram.org', 'https://oauth.telegram.org'],
          imgSrc: ["'self'", 'data:', 'https://telegram.org', 'https://*.telegram.org', 'https://images.unsplash.com'],
        },
      },
    })
  );
} else {
  // В dev режиме отключаем CSP чтобы Vite работал нормально
  app.use(helmet({ contentSecurityPolicy: false }));
}

app.use(cors({ origin: process.env.APP_URL, credentials: true }));
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Debug: Check if authRoutes is loaded
console.log('[Auth] Registering auth routes at /api/auth');
console.log('[Auth] authRoutes type:', typeof authRoutes);
app.use('/api/auth', authRoutes);

// API route: Check UrlPay Configuration Status
app.get('/api/payment-config-status', (req, res) => {
  const apiKey = process.env.URLPAY_API_KEY;
  const secretKey = process.env.URLPAY_SECRET_KEY;
  const shopId = process.env.URLPAY_SHOP_ID;

  res.json({
    configured: Boolean(apiKey && secretKey && shopId),
    hasApiKey: Boolean(apiKey),
    hasSecretKey: Boolean(secretKey),
    hasShopId: Boolean(shopId),
    shopId: shopId || null,
  });
});

// API route: Create UrlPay Payment according to UrlPay API V1 spec
app.post('/api/create-payment', async (req, res) => {
  try {
    const { amount, description, items, userId, userTelegramId, userName } = req.body;

    const apiKey = process.env.URLPAY_API_KEY;
    const secretKey = process.env.URLPAY_SECRET_KEY;
    const shopId = process.env.URLPAY_SHOP_ID;
    let apiUrl = process.env.URLPAY_API_URL || 'https://urlpay.net/api/v2/payments';
    const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, error: 'Некорректная сумма платежа' });
    }

    // Check if real UrlPay credentials exist
    if (!apiKey || !secretKey || !shopId) {
      console.warn('[UrlPay] Missing environment variables. Returning simulation response.');
      return res.json({
        success: true,
        isSimulation: true,
        message: 'UrlPay ключи не найдены в .env. Для реальной оплаты укажите URLPAY_API_KEY, URLPAY_SECRET_KEY и URLPAY_SHOP_ID.',
        simulatedOrder: {
          uuid: `inv-sim-${Date.now()}`,
          amount,
          description: description || 'Оплата заказа',
        },
      });
    }

    const currency = 'rub';
    const formattedAmount = Number(amount).toFixed(2); // e.g. "1000.00"
    const uuid = `inv-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // UrlPay signature calculation: sha1(currency + amount + shopId + secretKey)
    const signString = `${currency}${formattedAmount}${shopId}${secretKey}`;
    const sign = crypto.createHash('sha1').update(signString).digest('hex');

    const paymentPayload = {
      currency,
      amount: formattedAmount,
      uuid,
      order_id: uuid,
      shopId: Number(shopId),
      shop_id: Number(shopId),
      apiKey: apiKey,
      api_key: apiKey,
      description: description || 'Оплата обучения EGE Network',
      website_url: appUrl,
      subscribe: null,
      holdTime: null,
      language: 'ru',
      items: Array.isArray(items) && items.length > 0
        ? items.map((item: any) => ({
            name: String(item.title || item.name || 'Обучающий курс'),
            price: Number(item.price || amount),
            count: 1,
          }))
        : [
            {
              name: description || 'Оплата заказа',
              price: Number(formattedAmount),
              count: 1,
            },
          ],
      sign,
      signature: sign,
    };

    const extractPaymentUrl = (data: any) => {
      if (!data || typeof data !== 'object') return null;
      return data.paymentUrl || data.payment_url || data.url || data.link ||
        data.data?.paymentUrl || data.data?.payment_url || data.data?.url || data.data?.link || null;
    };

    console.log('[UrlPay Request Payload]:', JSON.stringify(paymentPayload, null, 2));

    let response: Response;
    let responseText = '';
    let responseData: any = null;
    let resolvedPaymentUrl: string | null = null;

    const urlsToTry: string[] = [];
    if (apiUrl) urlsToTry.push(apiUrl);
    
    // Add domain fallbacks for urlpay.net and urlpay.io
    if (apiUrl.includes('urlpay.io')) {
      urlsToTry.push(apiUrl.replace('urlpay.io', 'urlpay.net'));
    } else if (apiUrl.includes('urlpay.net')) {
      urlsToTry.push(apiUrl.replace('urlpay.net', 'urlpay.io'));
    }
    // Also try v1 if v2 is specified
    if (!urlsToTry.some(u => u.includes('/v1/'))) {
      urlsToTry.push('https://urlpay.net/api/v1/payments');
    }

    let lastErrorMsg = '';

    for (const targetUrl of urlsToTry) {
      try {
        console.log(`[UrlPay] Sending request to: ${targetUrl}`);
        response = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'api-key': apiKey,
            'x-api-key': apiKey,
            'x-shop-id': shopId,
            'X-Shop-Id': shopId,
          },
          body: JSON.stringify(paymentPayload),
          signal: AbortSignal.timeout(6000), // 6 second timeout
        });

        responseText = await response.text();

        try {
          responseData = JSON.parse(responseText);
          resolvedPaymentUrl = extractPaymentUrl(responseData);
          if (responseData && (responseData.success || responseData.data?.success || resolvedPaymentUrl)) {
            // Successfully parsed a valid payment response
            break;
          }
          lastErrorMsg = responseData?.message || responseData?.error || `HTTP ${response.status}`;
        } catch (jsonErr) {
          console.warn(`[UrlPay] Non-JSON response from ${targetUrl}:`, responseText.substring(0, 200));
          lastErrorMsg = `Сервер ${targetUrl} вернул HTML/текст вместо JSON`;
        }
      } catch (fetchErr: any) {
        console.error(`[UrlPay] Fetch error for ${targetUrl}:`, fetchErr);
        lastErrorMsg = fetchErr.message || 'Ошибка подключения к сети UrlPay';
      }
    }

    if (!responseData) {
      return res.status(502).json({
        success: false,
        error: `Не удалось получить отклик от API UrlPay (${lastErrorMsg}). Проверьте правильность URLPAY_API_URL и доступ к хосту.`,
      });
    }

    console.log('[UrlPay Response]:', responseData);

    if (responseData && (responseData.success || responseData.data?.success || resolvedPaymentUrl)) {
      return res.json({
        success: true,
        paymentUrl: resolvedPaymentUrl || responseData.paymentUrl,
        paymentId: responseData.id || responseData.data?.id,
        uuid,
        rawResponse: responseData,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: responseData.message || responseData.error || 'Ошибка при вызове UrlPay API',
        details: responseData,
      });
    }
  } catch (error: any) {
    console.error('[UrlPay Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Внутренняя ошибка сервера при создании платежа',
    });
  }
});

// API Route: UrlPay Webhook Callback
app.post('/api/urlpay/callback', (req, res) => {
  try {
    const { id, amount, currency, uuid, payment_status } = req.body;
    console.log('[UrlPay Callback Received]:', { id, amount, currency, uuid, payment_status });

    if (payment_status === 'success') {
      // Payment confirmed via UrlPay
      return res.json({ success: true, message: 'Callback processed' });
    }

    return res.json({ success: true, message: 'Callback received' });
  } catch (err: any) {
    console.error('[UrlPay Callback Error]:', err);
    return res.status(400).json({ success: false, error: err.message });
  }
});

// API Route: External Course Module Materials Proxy
app.get('/api/external/course-materials', async (req, res) => {
  try {
    const courseId = req.query.courseId || '1';
    const moduleId = req.query.moduleId || '1';
    const apiKey = (req.query.apiKey as string) || req.headers['x-api-key'] || '8d80584f02d604759a5fad01db47f2e488de412cb6cb5237';

    const targetUrl = `https://new-admin.aliceege.site/api/external/courses/${courseId}/modules/${moduleId}/materials`;
    console.log(`[External API] Fetching materials from: ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey as string,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        success: false,
        error: `API вернул ошибку ${response.status}`,
        details: errorText,
      });
    }

    const data = await response.json();
    return res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    console.error('[External API Error]:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Ошибка подключения к внешнему API',
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
