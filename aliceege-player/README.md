# AliceEge Player

Статический HLS-плеер на Vidstack и `hls.js`. Получает private HLS через playback proxy `admin-back` и добавляет `X-API-Key` к каждому запросу playlist/сегмента.

## Использование

Откройте `src/config.ts` и задайте две константы:

```ts
export const PLAYBACK_URL =
	'https://admin-back.example/api/external/videos/123/playback';
export const PLAYBACK_API_KEY = 'your-api-key';
```

После этого запустите фронт. Query-параметры странице плеера не нужны.

В этом же файле можно поменять `VIDEO_TITLE`, `VIDEO_POSTER`, `AUTO_PLAY` и `MUTED`.

Важно: API-ключ, встроенный в статическую сборку, виден пользователю в DevTools. Используйте отдельный ограниченный ключ и ротируйте его при утечке.

## Запуск

```bash
npm install
npm run dev
```

## Production-сборка

```bash
npm run build
```

Содержимое `dist/` можно разместить на любом статическом хостинге.
