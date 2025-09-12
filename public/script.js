class CrashGame {
    constructor() {
        this.balance = 1000;
        this.currentMultiplier = 1.00;
        this.gameState = 'waiting'; // waiting, counting, running, crashed
        this.betAmount = 0;
        this.hasBet = false;
        this.hasCashedOut = false;
        this.startTime = null;
        this.crashTime = null;
        this.countdownInterval = null;
        this.gameInterval = null;
        this.players = new Map();
        this.gameHistory = [];
        this.userId = null;
        this.userName = null;
        
        this.initializeTelegram();
        this.initializeElements();
        this.initializeEventListeners();
        this.connectToServer();
    }

    initializeTelegram() {
        if (window.Telegram && window.Telegram.WebApp) {
            const webApp = window.Telegram.WebApp;
            webApp.ready();
            webApp.expand();
            
            // Получаем данные пользователя
            this.userId = webApp.initDataUnsafe?.user?.id || Date.now();
            this.userName = webApp.initDataUnsafe?.user?.first_name || 'Player';
            
            // Устанавливаем тему
            document.body.style.backgroundColor = webApp.themeParams.bg_color || '#1a1a2e';
        } else {
            // Для тестирования
            this.userId = 'test_' + Date.now();
            this.userName = 'Test User';
        }
    }

    initializeElements() {
        this.elements = {
            balance: document.getElementById('balance'),
            multiplier: document.getElementById('multiplier'),
            timer: document.getElementById('timer'),
            status: document.getElementById('status'),
            betAmount: document.getElementById('betAmount'),
            placeBet: document.getElementById('placeBet'),
            cashout: document.getElementById('cashout'),
            playersList: document.getElementById('playersList'),
            historyList: document.getElementById('historyList')
        };
    }

    initializeEventListeners() {
        this.elements.placeBet.addEventListener('click', () => this.placeBet());
        this.elements.cashout.addEventListener('click', () => this.cashOut());
        
        // Обновляем баланс при изменении поля ставки
        this.elements.betAmount.addEventListener('input', () => {
            const amount = parseInt(this.elements.betAmount.value) || 0;
            if (amount > this.balance) {
                this.elements.betAmount.value = this.balance;
            }
        });
    }

    connectToServer() {
        // В реальной реализации здесь будет WebSocket соединение
        // Для демонстрации используем имитацию
        this.simulateServerConnection();
    }

    simulateServerConnection() {
        // Имитация получения данных от сервера
        setInterval(() => {
            if (this.gameState === 'waiting') {
                // Случайный старт игры
                if (Math.random() < 0.02) { // 2% шанс каждый интервал
                    this.startCountdown();
                }
            }
        }, 1000);

        // Имитация других игроков
        setInterval(() => {
            if (this.gameState === 'waiting' || this.gameState === 'counting') {
                const randomUserId = 'player_' + Math.floor(Math.random() * 1000);
                const randomUserName = 'Player ' + Math.floor(Math.random() * 100);
                if (!this.players.has(randomUserId)) {
                    this.addPlayer(randomUserId, randomUserName);
                    setTimeout(() => {
                        if (this.gameState === 'waiting' || this.gameState === 'counting') {
                            this.placePlayerBet(randomUserId, Math.floor(Math.random() * 500) + 50);
                        }
                    }, Math.random() * 3000);
                }
            }
        }, 5000);
    }

    startCountdown() {
        this.gameState = 'counting';
        this.elements.status.textContent = 'Игра начинается...';
        this.elements.placeBet.disabled = true;
        
        let countdown = 5;
        this.updateTimer(countdown);
        
        this.countdownInterval = setInterval(() => {
            countdown--;
            this.updateTimer(countdown);
            
            if (countdown <= 0) {
                clearInterval(this.countdownInterval);
                this.startGame();
            }
        }, 1000);
    }

    updateTimer(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        this.elements.timer.textContent = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    startGame() {
        this.gameState = 'running';
        this.startTime = Date.now();
        this.crashTime = this.generateCrashTime();
        this.currentMultiplier = 1.00;
        
        this.elements.status.textContent = 'Игра идет!';
        this.elements.cashout.disabled = false;
        
        this.addPlayer(this.userId, this.userName);
        this.updatePlayerStatus(this.userId, 'betting');
        
        this.gameInterval = setInterval(() => {
            const elapsed = (Date.now() - this.startTime) / 1000;
            this.currentMultiplier = Math.pow(Math.E, 0.05 * elapsed);
            
            this.elements.multiplier.textContent = this.currentMultiplier.toFixed(2) + 'x';
            
            // Проверяем краш
            if (elapsed >= this.crashTime) {
                this.crashGame();
            }
        }, 50);
    }

    generateCrashTime() {
        // Генерируем случайное время краша (от 5 до 30 секунд)
        return Math.random() * 25 + 5;
    }

    crashGame() {
        clearInterval(this.gameInterval);
        this.gameState = 'crashed';
        
        this.elements.multiplier.textContent = this.currentMultiplier.toFixed(2) + 'x';
        this.elements.multiplier.classList.add('crash-animation');
        this.elements.status.textContent = `Краш! ${this.currentMultiplier.toFixed(2)}x`;
        this.elements.cashout.disabled = true;
        
        // Обрабатываем проигрыши
        this.players.forEach((player, userId) => {
            if (player.status === 'betting') {
                this.updatePlayerStatus(userId, 'lost');
            }
        });
        
        this.addToHistory(this.currentMultiplier.toFixed(2) + 'x', 'crash');
        
        // Подготовка к следующему раунду
        setTimeout(() => {
            this.resetGame();
        }, 3000);
    }

    placeBet() {
        const amount = parseInt(this.elements.betAmount.value);
        
        if (amount <= 0 || amount > this.balance) {
            alert('Неверная сумма ставки!');
            return;
        }
        
        if (this.gameState !== 'waiting' && this.gameState !== 'counting') {
            alert('Ставки можно делать только до начала игры!');
            return;
        }
        
        this.betAmount = amount;
        this.balance -= amount;
        this.hasBet = true;
        this.updateBalance();
        
        this.elements.placeBet.disabled = true;
        this.elements.betAmount.disabled = true;
        
        this.addPlayer(this.userId, this.userName);
        this.placePlayerBet(this.userId, amount);
        
        // Имитация других игроков
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const randomUserId = 'bot_' + Math.floor(Math.random() * 1000);
                const randomUserName = 'Bot ' + Math.floor(Math.random() * 100);
                this.addPlayer(randomUserId, randomUserName);
                this.placePlayerBet(randomUserId, Math.floor(Math.random() * 500) + 50);
            }, Math.random() * 2000);
        }
    }

    cashOut() {
        if (!this.hasBet || this.hasCashedOut || this.gameState !== 'running') {
            return;
        }
        
        const winAmount = Math.floor(this.betAmount * this.currentMultiplier);
        this.balance += winAmount;
        this.hasCashedOut = true;
        
        this.updateBalance();
        this.elements.cashout.disabled = true;
        this.updatePlayerStatus(this.userId, 'cashed-out', winAmount);
        
        this.addToHistory(`${this.currentMultiplier.toFixed(2)}x (${winAmount})`, 'win');
    }

    addPlayer(userId, userName) {
        if (!this.players.has(userId)) {
            this.players.set(userId, {
                name: userName,
                bet: 0,
                status: 'waiting',
                winAmount: 0
            });
            this.updatePlayersList();
        }
    }

    placePlayerBet(userId, amount) {
        if (this.players.has(userId)) {
            const player = this.players.get(userId);
            player.bet = amount;
            player.status = 'betting';
            this.players.set(userId, player);
            this.updatePlayersList();
        }
    }

    updatePlayerStatus(userId, status, winAmount = 0) {
        if (this.players.has(userId)) {
            const player = this.players.get(userId);
            player.status = status;
            player.winAmount = winAmount;
            this.players.set(userId, player);
            this.updatePlayersList();
        }
    }

    updatePlayersList() {
        this.elements.playersList.innerHTML = '';
        this.players.forEach((player, userId) => {
            const playerElement = document.createElement('div');
            playerElement.className = `player-item ${player.status}`;
            
            let statusText = '';
            switch (player.status) {
                case 'betting':
                    statusText = `Ставка: ${player.bet}`;
                    break;
                case 'cashed-out':
                    statusText = `Выигрыш: ${player.winAmount}`;
                    break;
                case 'lost':
                    statusText = 'Проиграл';
                    break;
                default:
                    statusText = 'Ожидание';
            }
            
            playerElement.innerHTML = `
                <span>${player.name}</span>
                <span>${statusText}</span>
            `;
            
            this.elements.playersList.appendChild(playerElement);
        });
    }

    addToHistory(multiplier, type) {
        const historyItem = {
            multiplier: multiplier,
            type: type,
            timestamp: new Date().toLocaleTimeString()
        };
        
        this.gameHistory.unshift(historyItem);
        if (this.gameHistory.length > 10) {
            this.gameHistory.pop();
        }
        
        this.updateHistoryList();
    }

    updateHistoryList() {
        this.elements.historyList.innerHTML = '';
        this.gameHistory.forEach(item => {
            const historyElement = document.createElement('div');
            historyElement.className = `history-item ${item.type}`;
            historyElement.innerHTML = `
                <span>${item.multiplier}</span>
                <span>${item.timestamp}</span>
            `;
            this.elements.historyList.appendChild(historyElement);
        });
    }

    updateBalance() {
        this.elements.balance.textContent = this.balance;
    }

    resetGame() {
        this.currentMultiplier = 1.00;
        this.gameState = 'waiting';
        this.hasBet = false;
        this.hasCashedOut = false;
        this.betAmount = 0;
        
        this.elements.multiplier.textContent = '1.00x';
        this.elements.multiplier.classList.remove('crash-animation');
        this.elements.status.textContent = 'Ожидание начала...';
        this.elements.timer.textContent = '00:00';
        this.elements.placeBet.disabled = false;
        this.elements.betAmount.disabled = false;
        this.elements.betAmount.value = '100';
        
        // Очищаем игроков
        this.players.clear();
        this.updatePlayersList();
    }
}

// Инициализация игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new CrashGame();
});