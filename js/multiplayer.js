// Имитация мультиплеера — просто добавляем случайных игроков
let playersList = [];

function addPlayerEvent(playerName, cashout, isCrash = false) {
  const playersContainer = document.getElementById('playersList');
  if (!playersContainer) return;

  const playerItem = document.createElement('div');
  playerItem.className = `player-item ${isCrash ? 'lose' : 'win'}`;
  playerItem.textContent = isCrash 
    ? `${playerName} 💥 крах!` 
    : `${playerName} забрал x${cashout}!`;

  playersContainer.prepend(playerItem);

  if (playersContainer.children.length > 4) {
    playersContainer.removeChild(playersContainer.lastChild);
  }
}

function simulatePlayers() {
  const names = ["Alex", "Sam", "Jordan", "Casey", "Riley", "Taylor", "Morgan"];
  setInterval(() => {
    if (Math.random() > 0.7) {
      const name = names[Math.floor(Math.random() * names.length)];
      const cashout = (1 + Math.random() * 5).toFixed(2);
      addPlayerEvent(name, cashout, false);
    } else if (Math.random() > 0.9) {
      const name = names[Math.floor(Math.random() * names.length)];
      addPlayerEvent(name, "—", true);
    }
  }, 3000);
}

// Запускаем имитацию при загрузке страницы
document.addEventListener('DOMContentLoaded', simulatePlayers);