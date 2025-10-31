// Убран импорт React, так как он не используется напрямую в коде (JSX компилируется)
// import React from 'react'; // <-- Удалите эту строку
import BaccaratGame from './components/BaccaratGame.tsx';
import useTelegramWebApp from './hooks/useTelegramWebApp.tsx';

function App() {
  // Убраны user и initData из деструктуризации, так как они не используются
  const { webApp } = useTelegramWebApp();

  if (!webApp) {
    return <div>Загрузка...</div>; // Показать до инициализации Telegram WebApp
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <BaccaratGame webApp={webApp} />
    </div>
  );
}

export default App;
