const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Health check endpoint for Railway
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Game state
let gameState = {
    state: 'waiting', // waiting, counting, running, crashed
    multiplier: 1.00,
    startTime: null,
    crashTime: null,
    countdown: 5,
    players: new Map(),
    history: []
};

let countdownInterval = null;
let gameInterval = null;

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Send current game state to new player
    socket.emit('gameState', {
        state: gameState.state,
        multiplier: gameState.multiplier,
        countdown: gameState.countdown,
        players: Array.from(gameState.players.values())
    });
    
    // Player joins game
    socket.on('joinGame', (data) => {
        const player = {
            id: socket.id,
            userId: data.userId,
            name: data.userName,
            bet: 0,
            status: 'waiting',
            winAmount: 0
        };
        
        gameState.players.set(socket.id, player);
        io.emit('playerJoined', player);
        io.emit('playersUpdate', Array.from(gameState.players.values()));
    });
    
    // Player places bet
    socket.on('placeBet', (data) => {
        if (gameState.state !== 'waiting' && gameState.state !== 'counting') {
            return;
        }
        
        const player = gameState.players.get(socket.id);
        if (player) {
            player.bet = data.amount;
            player.status = 'betting';
            gameState.players.set(socket.id, player);
            
            io.emit('playerBet', { playerId: socket.id, amount: data.amount });
            io.emit('playersUpdate', Array.from(gameState.players.values()));
            
            if (gameState.state === 'waiting' && gameState.players.size >= 1) {
                startCountdown();
            }
        }
    });
    
    // Player cashes out
    socket.on('cashOut', () => {
        if (gameState.state !== 'running') {
            return;
        }
        
        const player = gameState.players.get(socket.id);
        if (player && player.status === 'betting') {
            const winAmount = Math.floor(player.bet * gameState.multiplier);
            player.status = 'cashed-out';
            player.winAmount = winAmount;
            gameState.players.set(socket.id, player);
            
            io.emit('playerCashedOut', { 
                playerId: socket.id, 
                multiplier: gameState.multiplier,
                winAmount: winAmount
            });
            io.emit('playersUpdate', Array.from(gameState.players.values()));
        }
    });
    
    // Player disconnects
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        gameState.players.delete(socket.id);
        io.emit('playerLeft', socket.id);
        io.emit('playersUpdate', Array.from(gameState.players.values()));
    });
});

function startCountdown() {
    if (gameState.state !== 'waiting') return;
    
    gameState.state = 'counting';
    gameState.countdown = 5;
    
    io.emit('countdownStarted', gameState.countdown);
    
    countdownInterval = setInterval(() => {
        gameState.countdown--;
        io.emit('countdownUpdate', gameState.countdown);
        
        if (gameState.countdown <= 0) {
            clearInterval(countdownInterval);
            startGame();
        }
    }, 1000);
}

function startGame() {
    gameState.state = 'running';
    gameState.startTime = Date.now();
    gameState.crashTime = generateCrashTime();
    gameState.multiplier = 1.00;
    
    io.emit('gameStarted');
    
    gameInterval = setInterval(() => {
        const elapsed = (Date.now() - gameState.startTime) / 1000;
        gameState.multiplier = Math.pow(Math.E, 0.05 * elapsed);
        
        io.emit('multiplierUpdate', gameState.multiplier);
        
        if (elapsed >= gameState.crashTime) {
            crashGame();
        }
    }, 50);
}

function generateCrashTime() {
    return Math.random() * 25 + 5;
}

function crashGame() {
    clearInterval(gameInterval);
    gameState.state = 'crashed';
    
    gameState.players.forEach((player, id) => {
        if (player.status === 'betting') {
            player.status = 'lost';
            gameState.players.set(id, player);
        }
    });
    
    io.emit('gameCrashed', {
        multiplier: gameState.multiplier,
        players: Array.from(gameState.players.values())
    });
    
    gameState.history.unshift({
        multiplier: gameState.multiplier.toFixed(2) + 'x',
        timestamp: new Date().toISOString()
    });
    
    if (gameState.history.length > 20) {
        gameState.history.pop();
    }
    
    setTimeout(() => {
        resetGame();
    }, 5000);
}

function resetGame() {
    gameState.state = 'waiting';
    gameState.multiplier = 1.00;
    gameState.startTime = null;
    gameState.crashTime = null;
    gameState.countdown = 5;
    
    gameState.players.forEach((player, id) => {
        player.status = 'waiting';
        player.bet = 0;
        player.winAmount = 0;
        gameState.players.set(id, player);
    });
    
    io.emit('gameReset', Array.from(gameState.players.values()));
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});