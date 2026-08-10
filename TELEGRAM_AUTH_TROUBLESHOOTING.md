# Руководство по Telegram Авторизации и Деплою (Troubleshooting)

В данном документе собраны решения проблем, возникавших при интеграции Telegram Login Widget, проксировании Nginx, настройке безопасности (Helmet/COOP) и деплое в Docker.

---

## 1. Проблема: Всплывающее окно Telegram мгновенно закрывается / сайт возвращает на страницу входа

### Причина
По умолчанию пакет `helmet` устанавливает HTTP-заголовок безопасности:
```http
Cross-Origin-Opener-Policy: same-origin
```
Из-за этого браузер блокирует межоконный обмен данными между всплывающим окном авторизации Telegram (`https://oauth.telegram.org`) и вашим сайтом.

### Решение
В файле `server.ts` при конфигурации Helmet явно разрешите всплывающие окна:
```typescript
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
```

---

## 2. Проблема: Несовпадение подписи Telegram (`invalid_hash`)

### Причина
Виджет Telegram с параметром `data-request-access="write"` передает поле `allows_write_to_pm`. Если вырезать это или посторонние параметры при отправке на бэкенд, проверка HMAC-SHA256 завершается ошибкой.

### Решение
В функции валидации данных Telegram (`verifyTelegramAuthData` в `src/server/auth-backend.ts`):
1. Отфильтровывайте ключи строго по разрешенному списку Telegram (`id`, `first_name`, `last_name`, `username`, `photo_url`, `auth_date`, `allows_write_to_pm`).
2. Составляйте строку проверки в алфавитном порядке: `key=value\n...`
3. Сравнивайте HMAC-SHA256 хеш с помощью безопасной по времени функции `crypto.timingSafeEqual`.

---

## 3. Проблема: Telegram Login Widget не открывается / редиректит на 404

### Причина
Домен сайта не привязан к боту в Telegram.

### Решение
1. Напишите боту `@BotFather` в Telegram.
2. Команда `/mybots` -> Выберите бота -> **Bot Settings** -> **Domain**.
3. Введите чистый домен без протокола (например: `egenetwork11.com`).

---

## 4. Проблема: `502 Bad Gateway` после деплоя в Docker

### Причина
Порт `3000` на сервере уже занят другим процессом/контейнером, либо в `docker-compose.yml` не проброшены порты.

### Решение
1. Остановите зависшие контейнеры/процессы:
   ```bash
   docker stop $(docker ps -q) 2>/dev/null || true
   pkill -9 node 2>/dev/null || true
   ```
2. Убедитесь, что в `docker-compose.yml` указано:
   ```yaml
   ports:
     - "3000:3000"
   ```
3. Запустите контейнер с флагом принудительной сборки:
   ```bash
   docker compose down && docker compose up -d --build
   ```

---

## 5. Проблема: Изменения кода не отображаются на боевом сервере

### Причина
Запускается кэшированный старый образ Docker без пересборки.

### Решение
Всегда используйте флаг `--build` при перезапуске на сервере:
```bash
docker compose up -d --build
```
Также сбрасывайте кэш браузера сочетанием клавиш `Ctrl + F5` (`Cmd + Shift + R` на Mac).

---

## 6. Настройка Nginx Reverse Proxy для HTTPS

Файл конфигурации `/etc/nginx/sites-available/egenetwork`:

```nginx
server {
    listen 80;
    server_name egenetwork11.com www.egenetwork11.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name egenetwork11.com www.egenetwork11.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Сертификаты Let's Encrypt / Certbot
    ssl_certificate /etc/letsencrypt/live/egenetwork11.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/egenetwork11.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}
```
