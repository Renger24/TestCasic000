// Инициализация Telegram Web App
const tg = window.Telegram?.WebApp;

class PremiumCasino {
    constructor() {
        this.balance = 1000;
        this.totalGames = 0;
        this.totalWins = 0;
        this.bestWin = 0;
        this.level = 3;
        this.xp = 300;
        this.xpToNextLevel = 1000;
        
        // Dice Game
        this.dice = {
            selectedNumber: null,
            lastRoll: null,
            lastWin: 0
        };
        
        // Tower Game
        this.tower = {
            active: false,
            level: 0,
            multiplier: 1.00,
            bet: 100,
            difficulty: 'medium',
            board: []
        };
        
        // Mines Game
        this.mines = {
            active: false,
            revealed: 0,
            mines: 5,
            multiplier: 1.00,
            bet: 100,
            board: [],
            minePositions: []
        };
        
        this.multipliers = {
            tower: {
                easy: [1.1, 1.2, 1.4, 1.6, 1.9, 2.3, 2.8, 3.4, 4.2, 5.2],
                medium: [1.2, 1.5, 2.0, 2.7, 3.6, 4.8, 6.5, 8.8, 12.0, 16.5],
                hard: [1.5, 2.3, 3.5, 5.5, 8.5, 13.5, 21.5, 34.5, 55.5, 89.5]
            },
            mines: {
                3: 1.3,
                5: 2.0,
                10: 3.0,
                15: 5.0,
                20: 10.0,
                24: 20.0
            }
        };
        
        this.initializeElements();
        this.loadGameState();
        this.setupEventListeners();
        this.updateUI();
        this.createParticles();
        
        if (tg) {
            tg.ready();
            tg.expand();
            this.applyTelegramTheme();
        }
    }
    
    createParticles() {
        const container = document.querySelector('.particles-container');
        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 5}s`;
            particle.style.width = `${Math.random() * 6 + 2}px`;
            particle.style.height = particle.style.width;
            container.appendChild(particle);
        }
    }
    
    initializeElements() {
        this.elements = {
            // Main menu
            mainBalance: document.getElementById('main-balance'),
            totalGames: document.getElementById('total-games'),
            totalWins: document.getElementById('total-wins'),
            bestWin: document.getElementById('best-win'),
            gameCards: document.querySelectorAll('.game-card'),
            levelProgress: document.querySelector('.level-progress'),
            
            // Dice
            diceBalance: document.getElementById('dice-balance'),
            diceBet: document.getElementById('dice-bet'),
            diceNumberBtns: document.querySelectorAll('[data-game="dice"] .number-btn-glow'),
            rollDice: document.getElementById('roll-dice'),
            diceElement: document.getElementById('dice'),
            diceLastRoll: document.getElementById('dice-last-roll'),
            diceLastWin: document.getElementById('dice-last-win'),
            
            // Tower
            towerBalance: document.getElementById('tower-balance'),
            towerBet: document.getElementById('tower-bet'),
            towerDifficulty: document.getElementById('tower-difficulty'),
            startTower: document.getElementById('start-tower'),
            cashoutTower: document.getElementById('cashout-tower'),
            towerElement: document.getElementById('tower'),
            towerMultiplier: document.getElementById('tower-multiplier'),
            towerWin: document.getElementById('tower-win'),
            
            // Mines
            minesBalance: document.getElementById('mines-balance'),
            minesBet: document.getElementById('mines-bet'),
            minesCount: document.getElementById('mines-count'),
            startMines: document.getElementById('start-mines'),
            cashoutMines: document.getElementById('cashout-mines'),
            minesBoard: document.getElementById('mines-board'),
            minesMultiplier: document.getElementById('mines-multiplier'),
            minesWin: document.getElementById('mines-win')
        };
    }
    
    applyTelegramTheme() {
        if (tg && tg.themeParams) {
            const theme = tg.themeParams;
            document.body.style.backgroundColor = theme.bg_color || '#0f0c29';
        }
    }
    
    setupEventListeners() {
        // Game selection with animation
        this.elements.gameCards.forEach((card, index) => {
            card.addEventListener('click', () => {
                const game = card.dataset.game;
                card.classList.add('animate__animated', 'animate__rubberBand');
                setTimeout(() => {
                    card.classList.remove('animate__animated', 'animate__rubberBand');
                    showScreen(`${game}-game`);
                }, 500);
            });
        });
        
        // Dice game
        this.elements.diceNumberBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectDiceNumber(parseInt(btn.dataset.number));
                btn.classList.add('animate__animated', 'animate__bounce');
                setTimeout(() => {
                    btn.classList.remove('animate__animated', 'animate__bounce');
                }, 1000);
            });
        });
        
        this.elements.rollDice.addEventListener('click', () => {
            this.rollDice();
            this.elements.rollDice.classList.add('animate__animated', 'animate__pulse');
            setTimeout(() => {
                this.elements.rollDice.classList.remove('animate__animated', 'animate__pulse');
            }, 1000);
        });
        
        // Tower game
        this.elements.startTower.addEventListener('click', () => {
            this.startTower();
            this.elements.startTower.classList.add('animate__animated', 'animate__tada');
            setTimeout(() => {
                this.elements.startTower.classList.remove('animate__animated', 'animate__tada');
            }, 1000);
        });
        
        this.elements.cashoutTower.addEventListener('click', () => {
            this.cashoutTower();
            this.elements.cashoutTower.classList.add('animate__animated', 'animate__rubberBand');
            setTimeout(() => {
                this.elements.cashoutTower.classList.remove('animate__animated', 'animate__rubberBand');
            }, 1000);
        });
        
        this.elements.towerDifficulty.addEventListener('change', () => {
            this.tower.difficulty = this.elements.towerDifficulty.value;
            this.updateTowerWin();
        });
        
        // Mines game
        this.elements.startMines.addEventListener('click', () => {
            this.startMines();
            this.elements.startMines.classList.add('animate__animated', 'animate__tada');
            setTimeout(() => {
                this.elements.startMines.classList.remove('animate__animated', 'animate__tada');
            }, 1000);
        });
        
        this.elements.cashoutMines.addEventListener('click', () => {
            this.cashoutMines();
            this.elements.cashoutMines.classList.add('animate__animated', 'animate__rubberBand');
            setTimeout(() => {
                this.elements.cashoutMines.classList.remove('animate__animated', 'animate__rubberBand');
            }, 1000);
        });
        
        this.elements.minesCount.addEventListener('change', () => {
            this.mines.mines = parseInt(this.elements.minesCount.value);
            this.updateMinesWin();
        });
        
        // Bet inputs
        this.elements.diceBet.addEventListener('change', () => this.validateBet('dice'));
        this.elements.towerBet.addEventListener('change', () => this.validateBet('tower'));
        this.elements.minesBet.addEventListener('change', () => this.validateBet('mines'));
    }
    
    validateBet(game) {
        const betElement = this.elements[`${game}Bet`];
        const bet = parseInt(betElement.value) || 10;
        if (bet < 10) {
            betElement.value = 10;
        } else if (bet > this.balance) {
            betElement.value = this.balance;
        }
    }
    
    // Dice Game Methods
    selectDiceNumber(number) {
        this.dice.selectedNumber = number;
        this.elements.diceNumberBtns.forEach(btn => {
            btn.classList.remove('selected');
        });
        document.querySelector(`[data-game="dice"] [data-number="${number}"]`).classList.add('selected');
    }
    
    async rollDice() {
        if (!this.dice.selectedNumber) {
            this.showMessage('Выберите число!', 'error');
            return;
        }
        
        const bet = parseInt(this.elements.diceBet.value) || 100;
        if (bet < 10 || bet > this.balance) {
            this.showMessage('Неверная ставка!', 'error');
            return;
        }
        
        this.balance -= bet;
        this.totalGames++;
        
        // Animation
        this.elements.diceElement.classList.add('rolling');
        await this.delay(1500);
        
        const result = Math.floor(Math.random() * 6) + 1;
        this.dice.lastRoll = result;
        this.showDiceFace(result);
        this.elements.diceElement.classList.remove('rolling');
        
        const isWin = result === this.dice.selectedNumber;
        const winAmount = isWin ? bet * 6 : 0;
        
        if (isWin) {
            this.balance += winAmount;
            this.totalWins++;
            if (winAmount > this.bestWin) this.bestWin = winAmount;
            this.dice.lastWin = winAmount;
            this.addXP(50);
        } else {
            this.dice.lastWin = 0;
            this.addXP(10);
        }
        
        this.updateUI();
        this.saveGameState();
        this.showMessage(isWin ? `🎉 Вы выиграли ${winAmount} T$!` : '💥 Вы проиграли!', isWin ? 'success' : 'error');
        
        // Dice celebration animation
        if (isWin) {
            this.celebrateWin();
        }
    }
    
    showDiceFace(number) {
        const faces = this.elements.diceElement.querySelectorAll('.dice-face');
        faces.forEach(face => face.style.display = 'none');
        this.elements.diceElement.querySelector(`.dice-face-${number}`).style.display = 'grid';
    }
    
    // Tower Game Methods
    startTower() {
        const bet = parseInt(this.elements.towerBet.value) || 100;
        if (bet < 10 || bet > this.balance) {
            this.showMessage('Неверная ставка!', 'error');
            return;
        }
        
        this.balance -= bet;
        this.totalGames++;
        this.tower.active = true;
        this.tower.level = 0;
        this.tower.multiplier = 1.00;
        this.tower.bet = bet;
        
        this.generateTower();
        this.renderTower();
        this.updateTowerWin();
        
        this.elements.startTower.disabled = true;
        this.elements.cashoutTower.disabled = false;
        
        this.updateUI();
        this.saveGameState();
        this.showMessage('🚀 Выберите безопасную ячейку!', 'info');
    }
    
    generateTower() {
        this.tower.board = [];
        for (let level = 0; level < 10; level++) {
            const row = [];
            const safePosition = Math.floor(Math.random() * 3);
            for (let i = 0; i < 3; i++) {
                row.push({
                    level: level,
                    position: i,
                    isSafe: i === safePosition,
                    revealed: false
                });
            }
            this.tower.board.push(row);
        }
    }
    
    renderTower() {
        this.elements.towerElement.innerHTML = '';
        
        this.tower.board.forEach((row, levelIndex) => {
            const rowElement = document.createElement('div');
            rowElement.className = 'tower-row';
            
            row.forEach((cell, cellIndex) => {
                const cellElement = document.createElement('div');
                cellElement.className = 'tower-cell';
                cellElement.dataset.level = levelIndex;
                cellElement.dataset.position = cellIndex;
                
                if (levelIndex <= this.tower.level && cell.revealed) {
                    cellElement.classList.add('revealed');
                    cellElement.classList.add(cell.isSafe ? 'safe' : 'mine');
                    cellElement.textContent = cell.isSafe ? '✓' : '💣';
                } else if (this.tower.active && levelIndex === this.tower.level + 1) {
                    cellElement.classList.add('active');
                    cellElement.textContent = '?';
                    cellElement.addEventListener('click', () => this.selectTowerCell(levelIndex, cellIndex));
                } else {
                    cellElement.classList.add('locked');
                    cellElement.textContent = '?';
                }
                
                rowElement.appendChild(cellElement);
            });
            
            this.elements.towerElement.appendChild(rowElement);
        });
    }
    
    selectTowerCell(level, position) {
        if (!this.tower.active || level !== this.tower.level + 1) return;
        
        const cell = this.tower.board[level][position];
        cell.revealed = true;
        this.tower.level = level;
        
        if (cell.isSafe) {
            this.tower.multiplier = this.multipliers.tower[this.tower.difficulty][level];
            this.renderTower();
            this.updateTowerWin();
            
            if (level === 9) {
                this.winTower();
            } else {
                this.showMessage(`✅ Уровень ${level + 1} пройден!`, 'success');
                this.addXP(20);
            }
        } else {
            this.tower.active = false;
            this.renderTower();
            this.elements.startTower.disabled = false;
            this.elements.cashoutTower.disabled = true;
            this.updateUI();
            this.saveGameState();
            this.showMessage('💥 Вы взорвались!', 'error');
            this.addXP(5);
        }
    }
    
    cashoutTower() {
        if (!this.tower.active) return;
        
        const winAmount = Math.floor(this.tower.bet * this.tower.multiplier);
        this.balance += winAmount;
        this.totalWins++;
        if (winAmount > this.bestWin) this.bestWin = winAmount;
        
        this.tower.active = false;
        this.elements.startTower.disabled = false;
        this.elements.cashoutTower.disabled = true;
        
        this.updateUI();
        this.saveGameState();
        this.showMessage(`💰 Вы выиграли ${winAmount} T$!`, 'success');
        this.addXP(Math.floor(winAmount / 10));
        this.celebrateWin();
    }
    
    winTower() {
        const winAmount = Math.floor(this.tower.bet * this.tower.multiplier);
        this.balance += winAmount;
        this.totalWins++;
        if (winAmount > this.bestWin) this.bestWin = winAmount;
        
        this.tower.active = false;
        this.elements.startTower.disabled = false;
        this.elements.cashoutTower.disabled = true;
        
        this.updateUI();
        this.saveGameState();
        this.showMessage(`🏆 Поздравляем! Вы выиграли ${winAmount} T$!`, 'success');
        this.addXP(100);
        this.celebrateWin();
    }
    
    updateTowerWin() {
        const win = Math.floor(this.tower.bet * this.tower.multiplier);
        this.elements.towerMultiplier.textContent = `${this.tower.multiplier.toFixed(2)}x`;
        this.elements.towerWin.textContent = `${win} T$`;
    }
    
    // Mines Game Methods
    startMines() {
        const bet = parseInt(this.elements.minesBet.value) || 100;
        if (bet < 10 || bet > this.balance) {
            this.showMessage('Неверная ставка!', 'error');
            return;
        }
        
        this.balance -= bet;
        this.totalGames++;
        this.mines.active = true;
        this.mines.revealed = 0;
        this.mines.multiplier = 1.00;
        this.mines.bet = bet;
        
        this.generateMines();
        this.renderMines();
        this.updateMinesWin();
        
        this.elements.startMines.disabled = true;
        this.elements.cashoutMines.disabled = false;
        
        this.updateUI();
        this.saveGameState();
        this.showMessage('🔍 Открывайте безопасные ячейки!', 'info');
    }
    
    generateMines() {
        this.mines.board = Array(25).fill(false);
        this.mines.minePositions = [];
        
        while (this.mines.minePositions.length < this.mines.mines) {
            const pos = Math.floor(Math.random() * 25);
            if (!this.mines.minePositions.includes(pos)) {
                this.mines.minePositions.push(pos);
            }
        }
    }
    
    renderMines() {
        this.elements.minesBoard.innerHTML = '';
        
        for (let i = 0; i < 25; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = i;
            
            if (this.mines.board[i]) {
                cell.classList.add('revealed');
                if (this.mines.minePositions.includes(i)) {
                    cell.classList.add('mine');
                    cell.textContent = '💣';
                } else {
                    cell.classList.add('safe');
                    cell.textContent = '✓';
                }
            } else if (this.mines.active) {
                cell.addEventListener('click', () => this.revealMineCell(i));
            }
            
            this.elements.minesBoard.appendChild(cell);
        }
    }
    
    revealMineCell(index) {
        if (!this.mines.active || this.mines.board[index]) return;
        
        this.mines.board[index] = true;
        
        if (this.mines.minePositions.includes(index)) {
            // Mine hit
            this.mines.active = false;
            this.renderMines();
            this.elements.startMines.disabled = false;
            this.elements.cashoutMines.disabled = true;
            this.updateUI();
            this.saveGameState();
            this.showMessage('💥 Вы взорвались!', 'error');
            this.addXP(5);
        } else {
            // Safe cell
            this.mines.revealed++;
            this.mines.multiplier *= this.multipliers.mines[this.mines.mines];
            this.renderMines();
            this.updateMinesWin();
            
            this.showMessage(`✅ Открыто ${this.mines.revealed} ячеек!`, 'success');
            this.addXP(15);
        }
    }
    
    cashoutMines() {
        if (!this.mines.active) return;
        
        const winAmount = Math.floor(this.mines.bet * this.mines.multiplier);
        this.balance += winAmount;
        this.totalWins++;
        if (winAmount > this.bestWin) this.bestWin = winAmount;
        
        this.mines.active = false;
        this.elements.startMines.disabled = false;
        this.elements.cashoutMines.disabled = true;
        
        this.updateUI();
        this.saveGameState();
        this.showMessage(`💰 Вы выиграли ${winAmount} T$!`, 'success');
        this.addXP(Math.floor(winAmount / 10));
        this.celebrateWin();
    }
    
    updateMinesWin() {
        const win = Math.floor(this.mines.bet * this.mines.multiplier);
        this.elements.minesMultiplier.textContent = `${this.mines.multiplier.toFixed(2)}x`;
        this.elements.minesWin.textContent = `${win} T$`;
    }
    
    // UI Methods
    updateUI() {
        // Update balances
        this.elements.mainBalance.textContent = this.balance;
        this.elements.diceBalance.textContent = this.balance;
        this.elements.towerBalance.textContent = this.balance;
        this.elements.minesBalance.textContent = this.balance;
        
        // Update stats
        this.elements.totalGames.textContent = this.totalGames;
        this.elements.totalWins.textContent = this.totalWins;
        this.elements.bestWin.textContent = `${this.bestWin} T$`;
        
        // Update level
        const progress = (this.xp / this.xpToNextLevel) * 100;
        this.elements.levelProgress.style.width = `${Math.min(progress, 100)}%`;
        
        // Update dice stats
        this.elements.diceLastRoll.textContent = this.dice.lastRoll || '-';
        this.elements.diceLastWin.textContent = `${this.dice.lastWin} T$`;
        
        // Update tower stats
        this.updateTowerWin();
        
        // Update mines stats
        this.updateMinesWin();
    }
    
    addXP(amount) {
        this.xp += amount;
        if (this.xp >= this.xpToNextLevel) {
            this.level++;
            this.xp = this.xp - this.xpToNextLevel;
            this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5);
            this.showMessage(`🎉 Новый уровень ${this.level}!`, 'success');
        }
        this.updateUI();
    }
    
    celebrateWin() {
        // Create celebration particles
        const container = document.querySelector('.particles-container');
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.animation = `float ${Math.random() * 2 + 1}s ease-in-out infinite`;
            particle.style.width = `${Math.random() * 8 + 4}px`;
            particle.style.height = particle.style.width;
            particle.style.background = `hsl(${Math.random() * 360}, 100%, 70%)`;
            container.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 3000);
        }
    }
    
    saveGameState() {
        const gameState = {
            balance: this.balance,
            totalGames: this.totalGames,
            totalWins: this.totalWins,
            bestWin: this.bestWin,
            level: this.level,
            xp: this.xp,
            xpToNextLevel: this.xpToNextLevel,
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem('premiumCasino_save', JSON.stringify(gameState));
        } catch (e) {
            console.warn('Save failed');
        }
    }
    
    loadGameState() {
        try {
            const saved = localStorage.getItem('premiumCasino_save');
            if (saved) {
                const gameState = JSON.parse(saved);
                const oneDay = 24 * 60 * 60 * 1000;
                
                if (Date.now() - gameState.timestamp < oneDay) {
                    this.balance = gameState.balance || 1000;
                    this.totalGames = gameState.totalGames || 0;
                    this.totalWins = gameState.totalWins || 0;
                    this.bestWin = gameState.bestWin || 0;
                    this.level = gameState.level || 1;
                    this.xp = gameState.xp || 0;
                    this.xpToNextLevel = gameState.xpToNextLevel || 1000;
                }
            }
        } catch (e) {
            console.warn('Load failed');
        }
    }
    
    showMessage(text, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type} animate__animated animate__bounceInDown`;
        notification.textContent = text;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '15px 25px',
            borderRadius: '15px',
            color: 'white',
            fontWeight: '600',
            zIndex: '1000',
            maxWidth: '90%',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
        });
        
        if (type === 'success') {
            notification.style.background = 'linear-gradient(45deg, #4ecdc4, #44a08d)';
        } else if (type === 'error') {
            notification.style.background = 'linear-gradient(45deg, #ff6b6b, #ff5252)';
        } else {
            notification.style.background = 'linear-gradient(45deg, #a8edea, #fed6e3)';
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.remove('animate__bounceInDown');
            notification.classList.add('animate__bounceOutUp');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 1000);
        }, 3000);
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Global functions
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    
    // Add entrance animation
    const screen = document.getElementById(screenId);
    screen.classList.add('animate__animated', 'animate__fadeIn');
    setTimeout(() => {
        screen.classList.remove('animate__animated', 'animate__fadeIn');
    }, 1000);
}

// Initialize game
let casino;
document.addEventListener('DOMContentLoaded', () => {
    casino = new PremiumCasino();
});

document.addEventListener('visibilitychange', () => {
    if (!document.hidden && casino) {
        console.log('Premium Casino active');
    }
});