class CrashGame {
    constructor() {
        this.balance = 1000;
        this.currentMultiplier = 1.00;
        this.gameState = 'waiting';
        this.betAmount = 0;
        this.hasBet = false;
        this.hasCashedOut = false;
        this.socket = null;
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
            
            this.userId = webApp.initDataUnsafe?.user?.id || Date.now();
            this.userName = webApp.initDataUnsafe?.user?.first_name || 'Player';
            document.body.style.backgroundColor = webApp.themeParams.bg_color || '#1a1a2e';
        } else {
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
        
        this.elements.betAmount.addEventListener('input', () => {
            const amount = parseInt(this.elements.betAmount.value) || 0;
            if (amount > this.balance) {
                this.elements.betAmount.value = this.balance;
            }
        });
    }

    connectToServer() {
        // Замените на ваш URL сервера
        this.socket = io('https://your-server-url.com');
        
        this.socket.on('connect', () => {
            console.log('Подключено к серверу');
            this.socket.emit('joinGame', {
                userId: this.userId,
                userName: this.userName
            });
        });
        
        this.socket.on('gameState', (data) => {
            this.gameState = data.state;
            this.currentMultiplier = data.multiplier;
            this.updateUI();
            
            if (data.state === 'counting') {
                this.updateTimer(data.countdown);
            }
        });
        
        this.socket.on('countdownStarted', (countdown) => {
            this.gameState = 'counting';
            this.updateTimer(countdown);
            this.elements.status.textContent = 'Игра начинается...';
            this.elements.placeBet.disabled = true;
        });
        
        this.socket.on('countdownUpdate', (countdown) => {
            this.updateTimer(countdown);
        });
        
        this.socket.on('gameStarted', () => {
            this.gameState = 'running';
            this.startTime = Date.now();
            this.elements.status.textContent = 'Игра идет!';
            this.elements.cashout.disabled = false;
        });
        
        this.socket.on('multiplierUpdate', (multiplier) => {
            this.currentMultiplier = multiplier;
            this.elements.multiplier.textContent = multiplier.toFixed(2) + 'x';
        });
        
        this.socket.on('gameCrashed', (data) => {
            this.gameState = 'crashed';
            this.elements.multiplier.textContent = data.multiplier.toFixed(2) + 'x';
            this.elements.multiplier.classList.add('crash-animation');
            this.elements.status.textContent = `Краш! ${data.multiplier.toFixed(2)}x`;
            this.elements.cashout.disabled = true;
            
            setTimeout(() => {
                this.resetGame();
            }, 5000);
        });
        
        this.socket.on('playersUpdate', (players) => {
            this.updatePlayersList(players);
        });
        
        this.socket.on('playerCashedOut', (data) => {
            if (data.playerId === this.socket.id) {
                this.hasCashedOut = true;
                this.balance += data.winAmount;
                this.updateBalance();
                this.elements.cashout.disabled = true;
            }
        });
        
        this.socket.on('gameReset', () => {
            this.resetGame();
        });
    }

    placeBet() {
        const amount = parseInt(this.elements.betAmount.value);
        
        if (amount <= 0 || amount > this.balance) {
            alert('Неверная сумма ставки!');
            return;
        }
        
        if (this.gameState !== 'waiting') {
            alert('Ставки можно делать только до начала игры!');
            return;
        }
        
        this.betAmount = amount;
        this.balance -= amount;
        this.hasBet = true;
        this.updateBalance();
        
        this.elements.placeBet.disabled = true;
        this.elements.betAmount.disabled = true;
        
        this.socket.emit('placeBet', { amount: amount });
    }

    cashOut() {
        if (!this.hasBet || this.hasCashedOut || this.gameState !== 'running') {
            return;
        }
        
        this.socket.emit('cashOut');
    }

    updatePlayersList(players) {
        this.elements.playersList.innerHTML = '';
        players.forEach(player => {
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

    updateTimer(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        this.elements.timer.textContent = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    updateBalance() {
        this.elements.balance.textContent = this.balance;
    }

    updateUI() {
        this.elements.multiplier.textContent = this.currentMultiplier.toFixed(2) + 'x';
        this.updateBalance();
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
        this.elements.cashout.disabled = true;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CrashGame();
});