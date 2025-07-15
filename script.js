// 遊戲大補帖 - 主控制器
class GameMaster {
    constructor() {
        this.currentGame = null;
        this.score = 0;
        this.timeLeft = 60;
        this.timer = null;
        this.highScores = this.loadHighScores();
        
        // 遊戲實例
        this.whackAMole = new WhackAMoleGame();
        this.memoryCards = new MemoryCardsGame();
        this.blockCrush = new BlockCrushGame();
    }

    init() {
        // DOM準備好後調用的初始化方法
        this.updateHighScoreDisplay();
    }

    loadHighScores() {
        const saved = localStorage.getItem('gameHighScores');
        return saved ? JSON.parse(saved) : {
            'whack-a-mole': 0,
            'memory-cards': 0,
            'block-crush': 0
        };
    }

    saveHighScores() {
        localStorage.setItem('gameHighScores', JSON.stringify(this.highScores));
    }

    updateHighScoreDisplay() {
        const whackScoreElement = document.getElementById('whack-high-score');
        const memoryScoreElement = document.getElementById('memory-high-score');
        const blockScoreElement = document.getElementById('block-high-score');
        
        if (whackScoreElement) whackScoreElement.textContent = this.highScores['whack-a-mole'];
        if (memoryScoreElement) memoryScoreElement.textContent = this.highScores['memory-cards'];
        if (blockScoreElement) blockScoreElement.textContent = this.highScores['block-crush'];
    }

    startGame(gameType) {
        this.currentGame = gameType;
        this.score = 0;
        this.timeLeft = 60;
        
        // 隱藏主選單，顯示遊戲畫面
        document.getElementById('main-menu').classList.remove('active');
        document.querySelector('.game-header').style.display = 'flex';
        document.getElementById(gameType).classList.add('active');
        
        // 重置分數和時間顯示
        document.getElementById('score').textContent = this.score;
        document.getElementById('timer').textContent = this.timeLeft;
        
        // 啟動對應的遊戲
        switch(gameType) {
            case 'whack-a-mole':
                this.whackAMole.start();
                break;
            case 'memory-cards':
                this.memoryCards.start();
                break;
            case 'block-crush':
                this.blockCrush.start();
                break;
        }
        
        // 開始計時
        this.startTimer();
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.timeLeft--;
            document.getElementById('timer').textContent = this.timeLeft;
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    addScore(points) {
        this.score += points;
        document.getElementById('score').textContent = this.score;
    }

    endGame() {
        this.stopTimer();
        
        // 停止當前遊戲
        switch(this.currentGame) {
            case 'whack-a-mole':
                this.whackAMole.stop();
                break;
            case 'memory-cards':
                this.memoryCards.stop();
                break;
            case 'block-crush':
                this.blockCrush.stop();
                break;
        }
        
        // 檢查是否創新紀錄
        const isNewRecord = this.score > this.highScores[this.currentGame];
        if (isNewRecord) {
            this.highScores[this.currentGame] = this.score;
            this.saveHighScores();
            this.updateHighScoreDisplay();
        }
        
        // 隱藏遊戲畫面，顯示結束畫面
        document.getElementById(this.currentGame).classList.remove('active');
        document.querySelector('.game-header').style.display = 'none';
        
        const gameOverScreen = document.getElementById('game-over');
        gameOverScreen.classList.add('active');
        document.getElementById('final-score').textContent = this.score;
        
        const newRecordElement = document.getElementById('new-record');
        if (isNewRecord) {
            newRecordElement.classList.remove('hidden');
        } else {
            newRecordElement.classList.add('hidden');
        }
    }

    backToMenu() {
        this.stopTimer();
        
        // 停止當前遊戲
        if (this.currentGame) {
            switch(this.currentGame) {
                case 'whack-a-mole':
                    this.whackAMole.stop();
                    break;
                case 'memory-cards':
                    this.memoryCards.stop();
                    break;
                case 'block-crush':
                    this.blockCrush.stop();
                    break;
            }
        }
        
        // 隱藏所有畫面
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.querySelector('.game-header').style.display = 'none';
        
        // 顯示主選單
        document.getElementById('main-menu').classList.add('active');
        this.currentGame = null;
    }

    restartCurrentGame() {
        if (this.currentGame) {
            // 隱藏結束畫面
            document.getElementById('game-over').classList.remove('active');
            // 重新開始當前遊戲
            this.startGame(this.currentGame);
        }
    }
}

// 打地鼠遊戲
class WhackAMoleGame {
    constructor() {
        this.moleInterval = null;
        this.activeMoles = new Set();
        this.holes = null;
        this.isInitialized = false;
    }

    setupEventListeners() {
        if (!this.holes) {
            this.holes = document.querySelectorAll('.mole-hole');
        }
        this.holes.forEach(hole => {
            const mole = hole.querySelector('.mole');
            mole.addEventListener('click', (e) => {
                e.stopPropagation();
                this.hitMole(hole);
            });
        });
    }

    start() {
        if (!this.isInitialized) {
            this.setupEventListeners();
            this.isInitialized = true;
        }
        this.activeMoles.clear();
        this.hideAllMoles();
        this.moleInterval = setInterval(() => {
            this.showRandomMole();
        }, 800);
    }

    stop() {
        if (this.moleInterval) {
            clearInterval(this.moleInterval);
            this.moleInterval = null;
        }
        this.hideAllMoles();
    }

    showRandomMole() {
        if (!this.holes) {
            this.holes = document.querySelectorAll('.mole-hole');
        }
        // 隨機選擇一個洞
        const availableHoles = Array.from(this.holes).filter(hole => 
            !this.activeMoles.has(hole)
        );
        
        if (availableHoles.length === 0) return;
        
        const randomHole = availableHoles[Math.floor(Math.random() * availableHoles.length)];
        const mole = randomHole.querySelector('.mole');
        
        // 顯示地鼠
        mole.classList.add('active');
        this.activeMoles.add(randomHole);
        
        // 1.5秒後自動隱藏
        setTimeout(() => {
            mole.classList.remove('active');
            this.activeMoles.delete(randomHole);
        }, 1500);
    }

    hitMole(hole) {
        const mole = hole.querySelector('.mole');
        if (mole.classList.contains('active')) {
            mole.classList.remove('active');
            this.activeMoles.delete(hole);
            gameMaster.addScore(10);
            
            // 添加打擊效果
            mole.style.background = '#ff6b6b';
            setTimeout(() => {
                mole.style.background = '#D2691E';
            }, 200);
        }
    }

    hideAllMoles() {
        if (!this.holes) {
            this.holes = document.querySelectorAll('.mole-hole');
        }
        this.holes.forEach(hole => {
            const mole = hole.querySelector('.mole');
            mole.classList.remove('active');
        });
        this.activeMoles.clear();
    }
}

// 翻牌記憶遊戲
class MemoryCardsGame {
    constructor() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.totalPairs = 8;
        this.flipsCount = 0;
        this.canFlip = true;
        this.symbols = ['🐶', '🐱', '🐸', '🦊', '🐻', '🐼', '🐨', '🦄'];
    }

    start() {
        this.setupGrid();
        this.generateCards();
        this.shuffleCards();
        this.renderCards();
        this.resetGameState();
    }

    stop() {
        // 記憶卡遊戲沒有需要停止的計時器
    }

    setupGrid() {
        const gridElement = document.getElementById('memory-grid');
        gridElement.innerHTML = '';
        
        for (let i = 0; i < 16; i++) {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.index = i;
            card.addEventListener('click', () => this.flipCard(i));
            
            // 卡片背面
            const cardBack = document.createElement('div');
            cardBack.className = 'memory-card-back';
            cardBack.textContent = '❓';
            
            // 卡片正面
            const cardFront = document.createElement('div');
            cardFront.className = 'memory-card-front';
            
            card.appendChild(cardBack);
            card.appendChild(cardFront);
            gridElement.appendChild(card);
        }
    }

    generateCards() {
        this.cards = [];
        // 每種符號放兩張牌
        for (let i = 0; i < this.totalPairs; i++) {
            this.cards.push(this.symbols[i], this.symbols[i]);
        }
    }

    shuffleCards() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    renderCards() {
        const cardElements = document.querySelectorAll('.memory-card');
        cardElements.forEach((cardElement, index) => {
            const frontElement = cardElement.querySelector('.memory-card-front');
            frontElement.textContent = this.cards[index];
        });
    }

    resetGameState() {
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.flipsCount = 0;
        this.canFlip = true;
        this.updateInfo();
        
        // 重置所有卡片狀態
        document.querySelectorAll('.memory-card').forEach(card => {
            card.classList.remove('flipped', 'matched', 'wrong');
        });
    }

    flipCard(index) {
        if (!this.canFlip) return;
        
        const cardElement = document.querySelector(`[data-index="${index}"]`);
        
        // 檢查卡片是否已經翻開或配對
        if (cardElement.classList.contains('flipped') || 
            cardElement.classList.contains('matched')) {
            return;
        }
        
        // 翻開卡片
        cardElement.classList.add('flipped');
        this.flippedCards.push(index);
        this.flipsCount++;
        this.updateInfo();
        
        // 檢查是否翻開了兩張卡片
        if (this.flippedCards.length === 2) {
            this.canFlip = false;
            setTimeout(() => this.checkMatch(), 1000);
        }
    }

    checkMatch() {
        const [firstIndex, secondIndex] = this.flippedCards;
        const firstCard = document.querySelector(`[data-index="${firstIndex}"]`);
        const secondCard = document.querySelector(`[data-index="${secondIndex}"]`);
        
        if (this.cards[firstIndex] === this.cards[secondIndex]) {
            // 配對成功
            firstCard.classList.add('matched');
            secondCard.classList.add('matched');
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            
            this.matchedPairs++;
            gameMaster.addScore(20);
            
            // 檢查遊戲是否完成
            if (this.matchedPairs === this.totalPairs) {
                // 完成遊戲，額外獎勵
                const bonus = Math.max(0, 100 - this.flipsCount);
                gameMaster.addScore(bonus);
                
                // 重新開始新的一輪
                setTimeout(() => {
                    this.start();
                }, 1500);
            }
        } else {
            // 配對失敗
            firstCard.classList.add('wrong');
            secondCard.classList.add('wrong');
            
            setTimeout(() => {
                firstCard.classList.remove('flipped', 'wrong');
                secondCard.classList.remove('flipped', 'wrong');
            }, 500);
        }
        
        this.flippedCards = [];
        this.canFlip = true;
    }

    updateInfo() {
        document.getElementById('pairs-found').textContent = this.matchedPairs;
        document.getElementById('flips-count').textContent = this.flipsCount;
    }
}

// 消除方塊遊戲
class BlockCrushGame {
    constructor() {
        this.grid = [];
        this.gridWidth = 8;
        this.gridHeight = 10;
        this.colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
        this.selectedBlocks = [];
        this.blocksCrushed = 0;
        this.comboCount = 0;
        this.isAnimating = false;
    }

    start() {
        this.setupGrid();
        this.generateBlocks();
        this.renderGrid();
        this.resetGameState();
    }

    stop() {
        // 消除方塊遊戲沒有需要停止的計時器
    }

    setupGrid() {
        const gridElement = document.getElementById('block-grid');
        gridElement.innerHTML = '';
        
        // 創建80個方塊 (8x10)
        for (let i = 0; i < this.gridWidth * this.gridHeight; i++) {
            const block = document.createElement('div');
            block.className = 'block-cell';
            block.dataset.index = i;
            block.addEventListener('click', () => this.selectBlock(i));
            gridElement.appendChild(block);
        }
    }

    generateBlocks() {
        this.grid = [];
        for (let i = 0; i < this.gridWidth * this.gridHeight; i++) {
            const colorIndex = Math.floor(Math.random() * this.colors.length);
            this.grid[i] = this.colors[colorIndex];
        }
    }

    renderGrid() {
        const blockElements = document.querySelectorAll('.block-cell');
        blockElements.forEach((block, index) => {
            const color = this.grid[index];
            block.className = `block-cell color-${color}`;
            block.dataset.index = index;
        });
    }

    resetGameState() {
        this.selectedBlocks = [];
        this.blocksCrushed = 0;
        this.comboCount = 0;
        this.isAnimating = false;
        this.updateInfo();
    }

    selectBlock(index) {
        if (this.isAnimating) return;
        
        const color = this.grid[index];
        if (!color) return; // 空方塊
        
        // 找到所有連接的同色方塊
        const connectedBlocks = this.findConnectedBlocks(index, color);
        
        if (connectedBlocks.length >= 3) {
            this.crushBlocks(connectedBlocks);
        } else {
            // 少於3個，顯示選中效果但不消除
            this.showSelection(connectedBlocks);
            setTimeout(() => this.clearSelection(), 800);
        }
    }

    findConnectedBlocks(startIndex, targetColor, visited = new Set()) {
        if (visited.has(startIndex)) return [];
        if (this.grid[startIndex] !== targetColor) return [];
        
        visited.add(startIndex);
        const connected = [startIndex];
        
        // 檢查四個方向的鄰居
        const neighbors = this.getNeighbors(startIndex);
        for (const neighborIndex of neighbors) {
            if (!visited.has(neighborIndex) && this.grid[neighborIndex] === targetColor) {
                connected.push(...this.findConnectedBlocks(neighborIndex, targetColor, visited));
            }
        }
        
        return connected;
    }

    getNeighbors(index) {
        const neighbors = [];
        const row = Math.floor(index / this.gridWidth);
        const col = index % this.gridWidth;
        
        // 上
        if (row > 0) neighbors.push(index - this.gridWidth);
        // 下
        if (row < this.gridHeight - 1) neighbors.push(index + this.gridWidth);
        // 左
        if (col > 0) neighbors.push(index - 1);
        // 右
        if (col < this.gridWidth - 1) neighbors.push(index + 1);
        
        return neighbors;
    }

    showSelection(blocks) {
        this.clearSelection();
        blocks.forEach(index => {
            const blockElement = document.querySelector(`[data-index="${index}"]`);
            blockElement.classList.add('selected');
        });
        this.selectedBlocks = blocks;
    }

    clearSelection() {
        document.querySelectorAll('.block-cell').forEach(block => {
            block.classList.remove('selected');
        });
        this.selectedBlocks = [];
    }

    crushBlocks(blocks) {
        this.isAnimating = true;
        this.clearSelection();
        
        // 添加壓碎動畫
        blocks.forEach(index => {
            const blockElement = document.querySelector(`[data-index="${index}"]`);
            blockElement.classList.add('crushing');
            this.grid[index] = null; // 清空方塊
        });
        
        // 計分
        const baseScore = blocks.length * 5;
        const comboBonus = this.comboCount * 10;
        const totalScore = baseScore + comboBonus;
        gameMaster.addScore(totalScore);
        
        this.blocksCrushed += blocks.length;
        this.comboCount++;
        this.updateInfo();
        
        // 動畫結束後處理
        setTimeout(() => {
            this.applyGravity();
            this.fillEmptySpaces();
            this.renderGrid();
            
            // 檢查是否還有可消除的方塊
            setTimeout(() => {
                if (!this.hasValidMoves()) {
                    // 沒有可消除的方塊，重新生成
                    this.generateBlocks();
                    this.renderGrid();
                    this.comboCount = 0;
                }
                this.isAnimating = false;
            }, 300);
        }, 600);
    }

    applyGravity() {
        // 讓方塊下落
        for (let col = 0; col < this.gridWidth; col++) {
            const column = [];
            
            // 收集該列的非空方塊
            for (let row = this.gridHeight - 1; row >= 0; row--) {
                const index = row * this.gridWidth + col;
                if (this.grid[index]) {
                    column.push(this.grid[index]);
                }
            }
            
            // 重新填充該列，從底部開始
            for (let row = this.gridHeight - 1; row >= 0; row--) {
                const index = row * this.gridWidth + col;
                if (column.length > this.gridHeight - 1 - row) {
                    this.grid[index] = column[this.gridHeight - 1 - row];
                } else {
                    this.grid[index] = null;
                }
            }
        }
    }

    fillEmptySpaces() {
        // 在頂部生成新的方塊
        for (let i = 0; i < this.grid.length; i++) {
            if (!this.grid[i]) {
                const colorIndex = Math.floor(Math.random() * this.colors.length);
                this.grid[i] = this.colors[colorIndex];
            }
        }
    }

    hasValidMoves() {
        // 檢查是否還有3個或以上的連接方塊
        for (let i = 0; i < this.grid.length; i++) {
            if (this.grid[i]) {
                const connected = this.findConnectedBlocks(i, this.grid[i]);
                if (connected.length >= 3) {
                    return true;
                }
            }
        }
        return false;
    }

    updateInfo() {
        document.getElementById('blocks-crushed').textContent = this.blocksCrushed;
        const comboElement = document.getElementById('combo-count');
        comboElement.textContent = this.comboCount;
        
        // 連擊效果
        if (this.comboCount > 1) {
            comboElement.parentElement.classList.add('combo-active');
        } else {
            comboElement.parentElement.classList.remove('combo-active');
        }
    }
}

// 全局變量和函數
let gameMaster;

// 頁面加載完成後初始化
document.addEventListener('DOMContentLoaded', () => {
    gameMaster = new GameMaster();
    gameMaster.init();
});

// 全局函數（供HTML調用）
function startGame(gameType) {
    gameMaster.startGame(gameType);
}

function backToMenu() {
    gameMaster.backToMenu();
}

function restartCurrentGame() {
    gameMaster.restartCurrentGame();
}

// 新遊戲不需要額外的全局函數，所有操作都通過點擊事件處理