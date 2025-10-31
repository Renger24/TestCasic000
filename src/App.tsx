import BaccaratGame from './components/BaccaratGame.tsx';
import useTelegramWebApp from './hooks/useTelegramWebApp.tsx';

function App() {
  // ВНИМАНИЕ: user и initData - ДОЛЖНЫ БЫТЬ УДАЛЕНЫ из деструктуризации
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
