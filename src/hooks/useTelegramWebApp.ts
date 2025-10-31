import { useEffect, useState } from 'react';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: any;
    };
  }
}

const useTelegramWebApp = () => {
  const [webApp, setWebApp] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [initData, setInitData] = useState<string | null>(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      setWebApp(tg);
      setUser(tg.initDataUnsafe?.user);
      setInitData(tg.initData);
      // Установка цвета темы и т.д.
      document.body.style.backgroundColor = tg.backgroundColor;
    }
  }, []);

  return { webApp, user, initData };
};

export default useTelegramWebApp;