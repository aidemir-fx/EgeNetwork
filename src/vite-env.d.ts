/// <reference types="vite/client" />

interface TelegramWebApp {
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      photo_url?: string;
    };
  };
}

interface Window {
  Telegram?: {
    WebApp?: TelegramWebApp;
  };
  onTelegramAuth?: (user: any) => void;
}
