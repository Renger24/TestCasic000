let balance = parseFloat(localStorage.getItem('crashBalance')) || 1000;
let gameInterval = null;
let currentMultiplier = 1.00;
let crashPoint = 0;
let betAmount = 0;
let isPlaying = false;
let graphData = [];
const maxGraphPoints = 50;

let canvas, ctx, rocket, notification;

document.addEventListener('DOMContentLoaded', init);

function init() {
  canvas = document.getElementById('graph');
  ctx = canvas.getContext('2d');
  rocket = document.getElementById('rocket');
  notification = document.getElementById('notification');

  if (canvas) resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  updateBalance();

  // Подключаем события
  const addBalanceBtn = document.getElementById('addBalanceBtn');
  const betButton = document.getElementById('betButton');
  const cashoutButton = document.getElementById('cashoutButton');

  if (addBalanceBtn) addBalanceBtn.addEventListener('click', addBalance);
  if (betButton) betButton.addEventListener('click', startGame);
  if (cashoutButton) cashoutButton.addEventListener('click', manualCashout);
}

function updateBalance() {
  const balanceEl = document.getElementById('balance');
  if (balanceEl) {
    balanceEl.textContent = balance.toFixed(2);
    localStorage.setItem('crashBalance', balance);
  }
}

function addBalance() {
  balance += 100;
  updateBalance();
}

function startGame() {
  if (isPlaying) return;

  const betInput = document.getElementById('betAmount');
  const autoInput = document.getElementById('cashoutAt');

  if (!betInput || !autoInput) return;

  const bet = parseFloat(betInput.value);
  const autoCashout = parseFloat(autoInput.value);

  if (isNaN(bet) || bet <= 0) return alert("Введите ставку!");
  if (isNaN(autoCashout) || autoCashout < 1.01) return alert("Коэф > 1.01!");
  if (bet > balance) return alert("Недостаточно средств!");

  balance -= bet;
  betAmount = bet;
  updateBalance();

  crashPoint = 1 + Math.random() * (Math.random() > 0.7 ? 20 : 5);
  console.log("💥 Крах на x" + crashPoint.toFixed(2));

  isPlaying = true;
  currentMultiplier = 1.00;
  graphData = [{ x: 0, y: 1 }];
  resetRocket();

  const betButton = document.getElementById('betButton');
  const cashoutButton = document.getElementById('cashoutButton');

  if (betButton) betButton.disabled = true;
  if (cashoutButton) cashoutButton.style.display = "block";

  playSound('launch');

  gameInterval = setInterval(() => {
    currentMultiplier += 0.05;
    updateRocket();
    updateGraph();

    if (currentMultiplier >= autoCashout) {
      autoCashoutTrigger(autoCashout);
    }
    if (currentMultiplier >= crashPoint) {
      crash();
    }
  }, 150);
}

function updateRocket() {
  if (!rocket || !canvas) return;

  const container = document.querySelector('.rocket-container');
  const graphWidth = canvas.width; // Ширина графика
  const graphHeight = canvas.height; // Высота графика

  // Максимальный коэффициент для масштаба графика
  const maxVisibleY = Math.max(5, Math.ceil(currentMultiplier));

  // Позиция по X: пропорционально количеству точек
  const x = (graphData.length - 1) * (graphWidth / (maxGraphPoints - 1));

  // Позиция по Y: как на графике, но инвертированная (вверх = меньше Y в CSS)
  const graphY = graphHeight - (currentMultiplier / maxVisibleY) * (graphHeight - 20);
  const rocketContainerHeight = container.clientHeight;
  const y = rocketContainerHeight - graphY - 40; // 40 — высота/смещение ракеты

  // Устанавливаем позицию
  rocket.style.left = x + "px";
  rocket.style.bottom = y + "px";
}

function resetRocket() {
  if (rocket) {
    rocket.style.left = "20px";
    rocket.style.bottom = "30px";
  }
}

function updateGraph() {
  if (!canvas || !ctx) return;

  graphData.push({ x: graphData.length, y: currentMultiplier });
  if (graphData.length > maxGraphPoints) graphData.shift();
  drawGraph();
}

function drawGraph() {
  if (!canvas || !ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  const maxVisibleY = Math.max(10, Math.ceil(crashPoint)); // Фиксируем масштаб под точку краха

  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = '#ffcc00';
  ctx.lineWidth = 2;
  ctx.beginPath();

  const stepX = w / (maxGraphPoints - 1);

  for (let i = 0; i < graphData.length; i++) {
    const x = i * stepX;
    const y = h - (graphData[i].y / maxVisibleY) * (h - 10);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.fillStyle = '#ffcc00';
ctx.font = 'bold 16px Arial';
ctx.textAlign = 'right';
ctx.fillText(`x${currentMultiplier.toFixed(2)}`, w - 10, 25);
}

function resizeCanvas() {
  if (!canvas) return;
  const container = canvas.parentElement;
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  drawGraph();
}

function manualCashout() {
  if (!isPlaying) return;

  clearInterval(gameInterval);
  isPlaying = false;

  const win = betAmount * currentMultiplier;
  balance += win;
  updateBalance();
  addToHistory(`+$${win.toFixed(2)} при x${currentMultiplier.toFixed(2)}`, true);

  playSound('cashout');
  showSuccessNotification();

  endRound();
}

function autoCashoutTrigger(target) {
  if (!isPlaying) return;

  clearInterval(gameInterval);
  isPlaying = false;

  const win = betAmount * target;
  balance += win;
  updateBalance();
  addToHistory(`+$${win.toFixed(2)} при x${target}`, true);

  playSound('cashout');
  showSuccessNotification();

  endRound();
}

function crash() {
  if (!isPlaying) return;

  clearInterval(gameInterval);
  isPlaying = false;

  // Анимация взрыва
  const container = document.querySelector('.rocket-container');
  if (container && rocket) {
    const explosion = document.createElement('div');
    explosion.className = 'explosion';
    explosion.textContent = '💥';
    explosion.style.left = rocket.style.left;
    explosion.style.bottom = rocket.style.bottom;
    container.appendChild(explosion);

    setTimeout(() => {
      explosion.remove();
    }, 800);
  }

  addToHistory(`-$${betAmount} (крах)`, false);
  playSound('crash');

  endRound();
}

function endRound() {
  setTimeout(() => {
    const betButton = document.getElementById('betButton');
    const cashoutButton = document.getElementById('cashoutButton');

    if (betButton) betButton.disabled = false;
    if (cashoutButton) cashoutButton.style.display = "none";
    resetRocket();
  }, 2500);
}

function showSuccessNotification() {
  if (!notification) return;

  notification.classList.remove('hide');
  notification.classList.add('show');
  setTimeout(() => {
    notification.classList.remove('show');
    notification.classList.add('hide');
  }, 2500);

}
