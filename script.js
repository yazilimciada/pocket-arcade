// ================= PANEL YÖNETİMİ =================
const mainMenu = document.getElementById('main-menu');
const xoxArea = document.getElementById('xox-area');
const memoryArea = document.getElementById('memory-area');
const snakeArea = document.getElementById('snake-area');
const backToMenuBtn = document.getElementById('back-to-menu-btn');

const selectXoxBtn = document.getElementById('select-xox-btn');
const selectMemoryBtn = document.getElementById('select-memory-btn');
const selectSnakeBtn = document.getElementById('select-snake-btn');

selectXoxBtn.addEventListener('click', () => switchScreen('xox'));
selectMemoryBtn.addEventListener('click', () => switchScreen('memory'));
selectSnakeBtn.addEventListener('click', () => switchScreen('snake'));
backToMenuBtn.addEventListener('click', () => switchScreen('menu'));

function switchScreen(screen) {
    mainMenu.style.display = 'none';
    xoxArea.style.display = 'none';
    memoryArea.style.display = 'none';
    snakeArea.style.display = 'none';
    backToMenuBtn.style.display = 'inline-block';
    
    clearInterval(snakeGameInterval); // Başka ekrana geçerse yılan dursun

    if (screen === 'xox') {
        xoxArea.style.display = 'block';
        resetXOXSystem();
    } else if (screen === 'memory') {
        memoryArea.style.display = 'block';
        initMemoryGame();
    } else if (screen === 'snake') {
        snakeArea.style.display = 'block';
        initSnakeGame();
    } else {
        mainMenu.style.display = 'block';
        backToMenuBtn.style.display = 'none';
    }
}

// ================= XOX MANTIĞI =================
const board = document.getElementById('game-board');
const cells = document.querySelectorAll('.cell');
const restartBtn = document.getElementById('restart-btn');
const modeSelection = document.getElementById('mode-selection');
const vsFriendBtn = document.getElementById('vs-friend-btn');
const vsComputerBtn = document.getElementById('vs-computer-btn');
const scoreBoard = document.getElementById('score-board');
const xScoreVal = document.getElementById('x-score-val');
const oScoreVal = document.getElementById('o-score-val');

let currentPlayer = 'X'; let gameState = ['', '', '', '', '', '', '', '', '']; let isGameActive = true; let gameMode = ''; let xScore = 0; let oScore = 0;
const winningConditions = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

vsFriendBtn.addEventListener('click', () => { modeSelection.style.display = 'none'; board.style.display = 'grid'; scoreBoard.style.display = 'flex'; restartBtn.style.display = 'inline-block'; gameMode = 'friend'; });
vsComputerBtn.addEventListener('click', () => { modeSelection.style.display = 'none'; board.style.display = 'grid'; scoreBoard.style.display = 'flex'; restartBtn.style.display = 'inline-block'; gameMode = 'computer'; });

cells.forEach(cell => cell.addEventListener('click', (e) => {
    const idx = parseInt(e.target.getAttribute('data-index'));
    if (gameState[idx] !== "" || !isGameActive) return;
    gameState[idx] = currentPlayer; e.target.innerText = currentPlayer;
    
    // Kazanan Kontrolü
    let won = false;
    for (let cond of winningConditions) {
        if (gameState[cond[0]]!='' && gameState[cond[0]]===gameState[cond[1]] && gameState[cond[1]]===gameState[cond[2]]) won = true;
    }
    if (won) {
        alert(`Oyuncu ${currentPlayer} Kazandı! 🎉`);
        if (currentPlayer === 'X') { xScore++; xScoreVal.innerText = xScore; } else { oScore++; oScoreVal.innerText = oScore; }
        isGameActive = false; return;
    }
    if (!gameState.includes("")) { alert("Berabere! 🤝"); isGameActive = false; return; }
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    if (isGameActive && gameMode === 'computer' && currentPlayer === 'O') {
        setTimeout(() => {
            let empties = [];
            for (let i=0; i<9; i++) if (gameState[i]==='') empties.push(i);
            if (empties.length > 0) {
                let rIdx = empties[Math.floor(Math.random() * empties.length)];
                gameState[rIdx] = 'O'; cells[rIdx].innerText = 'O';
                handleResultValidation(); // Yukarıdaki mantığın aynısı mini kontrol
            }
        }, 400);
    }
}));
restartBtn.addEventListener('click', () => { currentPlayer = 'X'; gameState = ['', '', '', '', '', '', '', '', '']; isGameActive = true; cells.forEach(c => c.innerText = ''); });
function resetXOXSystem() { board.style.display = 'none'; scoreBoard.style.display = 'none'; restartBtn.style.display = 'none'; modeSelection.style.display = 'block'; }

// ================= HAFIZA OYUNU MANTIĞI =================
const memoryBoard = document.getElementById('memory-board');
const memoryRestartBtn = document.getElementById('memory-restart-btn');
const cardSymbols = ['🚀', '🚀', '💻', '💻', '👾', '👾', '🔥', '🔥', '💎', '💎', '👑', '👑', '⚡', '⚡', '🌟', '🌟'];
let flippedCards = []; let lockBoard = false;
memoryRestartBtn.addEventListener('click', initMemoryGame);

function initMemoryGame() {
    memoryBoard.innerHTML = ''; flippedCards = []; lockBoard = false;
    const shuffled = [...cardSymbols].sort(() => Math.random() - 0.5);
    shuffled.forEach((sym) => {
        const card = document.createElement('div'); card.classList.add('memory-card'); card.innerText = sym;
        card.addEventListener('click', function() {
            if (lockBoard || this === flippedCards[0] || this.classList.contains('matched')) return;
            this.classList.add('flipped'); flippedCards.push(this);
            if (flippedCards.length === 2) {
                if (flippedCards[0].innerText === flippedCards[1].innerText) {
                    flippedCards[0].classList.add('matched'); flippedCards[1].classList.add('matched'); flippedCards = [];
                    if (document.querySelectorAll('.memory-card.matched').length === cardSymbols.length) alert("Harikasın Şefim! 🏆");
                } else {
                    lockBoard = true;
                    setTimeout(() => { flippedCards[0].classList.remove('flipped'); flippedCards[1].classList.remove('flipped'); flippedCards = []; lockBoard = false; }, 800);
                }
            }
        });
        memoryBoard.appendChild(card);
    });
}

// ================= YILAN OYUNU MANTIĞI =================
const canvas = document.getElementById('snake-canvas');
const ctx = canvas.getContext('2d');
const snakeRestartBtn = document.getElementById('snake-restart-btn');
const snakeScoreDisplay = document.getElementById('snake-score');

let boxSize = 15; let snake = []; let food = {}; let dx = boxSize; let dy = 0; let snakeScore = 0; let snakeGameInterval;

snakeRestartBtn.addEventListener('click', initSnakeGame);

// Tuş Dinleyicileri (Bilgisayar İçin)
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && dy === 0) { dx = 0; dy = -boxSize; }
    else if (e.key === 'ArrowDown' && dy === 0) { dx = 0; dy = boxSize; }
    else if (e.key === 'ArrowLeft' && dx === 0) { dx = -boxSize; dy = 0; }
    else if (e.key === 'ArrowRight' && dx === 0) { dx = boxSize; dy = 0; }
});

// Dokunmatik Buton Dinleyicileri (Mobil İçin - Parmakları yormaz!)
document.getElementById('snake-up').addEventListener('click', () => { if (dy === 0) { dx = 0; dy = -boxSize; } });
document.getElementById('snake-down').addEventListener('click', () => { if (dy === 0) { dx = 0; dy = boxSize; } });
document.getElementById('snake-left').addEventListener('click', () => { if (dx === 0) { dx = -boxSize; dy = 0; } });
document.getElementById('snake-right').addEventListener('click', () => { if (dx === 0) { dx = boxSize; dy = 0; } });

function initSnakeGame() {
    clearInterval(snakeGameInterval);
    snake = [{ x: boxSize * 5, y: boxSize * 5 }];
    dx = boxSize; dy = 0; snakeScore = 0;
    snakeScoreDisplay.innerText = snakeScore;
    createFood();
    snakeGameInterval = setInterval(drawSnakeGame, 120);
}

function createFood() {
    food = {
        x: Math.floor(Math.random() * (canvas.width / boxSize)) * boxSize,
        y: Math.floor(Math.random() * (canvas.height / boxSize)) * boxSize
    };
}

function drawSnakeGame() {
    // Kafanın gideceği yeni yeri hesapla
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Duvarlara çarpma veya kendi kendini ısırma kontrolü
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height || collisionCheck(head)) {
        clearInterval(snakeGameInterval);
        alert(`Oyun Bitti Şefim! Skorun: ${snakeScore} 🍎`);
        return;
    }

    snake.unshift(head); // Kafayı öne ekle

    // Yem yeme kontrolü
    if (head.x === food.x && head.y === food.y) {
        snakeScore += 10;
        snakeScoreDisplay.innerText = snakeScore;
        createFood();
    } else {
        snake.pop(); // Yem yemediysye kuyruktan bir eleman sil (ilerleme hissi)
    }

    // Canvas'ı temizle ve yeniden çiz
    ctx.fillStyle = '#111420';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Yemi Çiz (Neon Pembe)
    ctx.fillStyle = '#ff007f';
    ctx.shadowBlur = 10; ctx.shadowColor = '#ff007f';
    ctx.fillRect(food.x, food.y, boxSize, boxSize);

    // Yılanı Çiz (Neon Mavi)
    ctx.fillStyle = '#00f3ff';
    ctx.shadowColor = '#00f3ff';
   // Doğru olan satır:
snake.forEach(part => ctx.fillRect(part.x, part.y, boxSize, boxSize));
    ctx.shadowBlur = 0; // Gölgeyi sıfırla çakışmasın
}

function collisionCheck(head) {
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) return true;
    }
    return false;
}