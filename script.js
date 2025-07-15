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
        this.snake = new SnakeGame();
        this.sudoku = new SudokuGame();
    }

    init() {
        // DOM準備好後調用的初始化方法
        this.updateHighScoreDisplay();
    }

    loadHighScores() {
        const saved = localStorage.getItem('gameHighScores');
        return saved ? JSON.parse(saved) : {
            'whack-a-mole': 0,
            'snake': 0,
            'sudoku': 0
        };
    }

    saveHighScores() {
        localStorage.setItem('gameHighScores', JSON.stringify(this.highScores));
    }

    updateHighScoreDisplay() {
        const whackScoreElement = document.getElementById('whack-high-score');
        const snakeScoreElement = document.getElementById('snake-high-score');
        const sudokuScoreElement = document.getElementById('sudoku-high-score');
        
        if (whackScoreElement) whackScoreElement.textContent = this.highScores['whack-a-mole'];
        if (snakeScoreElement) snakeScoreElement.textContent = this.highScores['snake'];
        if (sudokuScoreElement) sudokuScoreElement.textContent = this.highScores['sudoku'];
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
            case 'snake':
                this.snake.start();
                break;
            case 'sudoku':
                this.sudoku.start();
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
            case 'snake':
                this.snake.stop();
                break;
            case 'sudoku':
                this.sudoku.stop();
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
                case 'snake':
                    this.snake.stop();
                    break;
                case 'sudoku':
                    this.sudoku.stop();
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

// 貪吃蛇遊戲
class SnakeGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.snake = [{x: 10, y: 10}];
        this.direction = 'right';
        this.food = {x: 15, y: 15};
        this.gridSize = 20;
        this.tileCount = 20;
        this.gameInterval = null;
        this.foodEaten = 0;
        this.gameSpeed = 150;
    }

    start() {
        this.canvas = document.getElementById('snake-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 初始化遊戲狀態
        this.snake = [{x: 10, y: 10}];
        this.direction = 'right';
        this.foodEaten = 0;
        this.generateFood();
        this.updateInfo();
        
        // 設置鍵盤事件監聽
        this.setupKeyboardListeners();
        
        // 開始遊戲循環
        this.gameInterval = setInterval(() => {
            this.update();
            this.draw();
        }, this.gameSpeed);
    }

    stop() {
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }
        // 移除鍵盤事件監聽
        document.removeEventListener('keydown', this.keyHandler);
    }

    setupKeyboardListeners() {
        this.keyHandler = (e) => {
            switch(e.key) {
                case 'ArrowUp':
                    if (this.direction !== 'down') this.direction = 'up';
                    break;
                case 'ArrowDown':
                    if (this.direction !== 'up') this.direction = 'down';
                    break;
                case 'ArrowLeft':
                    if (this.direction !== 'right') this.direction = 'left';
                    break;
                case 'ArrowRight':
                    if (this.direction !== 'left') this.direction = 'right';
                    break;
            }
        };
        document.addEventListener('keydown', this.keyHandler);
    }

    changeDirection(newDirection) {
        // 防止蛇往相反方向移動
        if (newDirection === 'up' && this.direction !== 'down') this.direction = 'up';
        if (newDirection === 'down' && this.direction !== 'up') this.direction = 'down';
        if (newDirection === 'left' && this.direction !== 'right') this.direction = 'left';
        if (newDirection === 'right' && this.direction !== 'left') this.direction = 'right';
    }

    update() {
        const head = {...this.snake[0]};
        
        // 根據方向移動蛇頭
        switch(this.direction) {
            case 'up':
                head.y--;
                break;
            case 'down':
                head.y++;
                break;
            case 'left':
                head.x--;
                break;
            case 'right':
                head.x++;
                break;
        }
        
        // 檢查碰撞（牆壁）
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }
        
        // 檢查碰撞（自己）
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                this.gameOver();
                return;
            }
        }
        
        this.snake.unshift(head);
        
        // 檢查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.foodEaten++;
            gameMaster.addScore(10);
            this.generateFood();
            this.updateInfo();
            
            // 隨著分數增加加快速度
            if (this.foodEaten % 3 === 0 && this.gameSpeed > 80) {
                this.gameSpeed -= 10;
                clearInterval(this.gameInterval);
                this.gameInterval = setInterval(() => {
                    this.update();
                    this.draw();
                }, this.gameSpeed);
            }
        } else {
            this.snake.pop(); // 移除尾部
        }
    }

    generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        
        this.food = newFood;
    }

    draw() {
        // 清空畫布
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 畫蛇
        this.ctx.fillStyle = '#2ecc71';
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            this.ctx.fillRect(
                segment.x * this.gridSize, 
                segment.y * this.gridSize, 
                this.gridSize - 2, 
                this.gridSize - 2
            );
            
            // 蛇頭用不同顏色
            if (i === 0) {
                this.ctx.fillStyle = '#27ae60';
                this.ctx.fillRect(
                    segment.x * this.gridSize + 2, 
                    segment.y * this.gridSize + 2, 
                    this.gridSize - 6, 
                    this.gridSize - 6
                );
                this.ctx.fillStyle = '#2ecc71';
            }
        }
        
        // 畫食物
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(
            this.food.x * this.gridSize, 
            this.food.y * this.gridSize, 
            this.gridSize - 2, 
            this.gridSize - 2
        );
    }

    updateInfo() {
        document.getElementById('snake-length').textContent = this.snake.length;
        document.getElementById('food-eaten').textContent = this.foodEaten;
    }

    gameOver() {
        this.stop();
        // 遊戲結束會在60秒到時由GameMaster處理
    }
}

// 4x4數獨遊戲
class SudokuGame {
    constructor() {
        this.grid = Array(16).fill(0);
        this.solution = Array(16).fill(0);
        this.given = Array(16).fill(false);
        this.selectedCell = null;
        this.selectedNumber = 0;
        this.completedPuzzles = 0;
        this.isInitialized = false;
    }

    setupGrid() {
        const gridElement = document.getElementById('sudoku-grid');
        gridElement.innerHTML = '';
        
        for (let i = 0; i < 16; i++) {
            const cell = document.createElement('div');
            cell.className = 'sudoku-cell';
            cell.dataset.index = i;
            cell.addEventListener('click', () => this.selectCell(i));
            gridElement.appendChild(cell);
        }
    }

    setupEventListeners() {
        document.querySelectorAll('.number-btn').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                // 取消之前的選擇
                document.querySelectorAll('.number-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                
                // 根據按鈕內容確定數字（1,2,3,4或0代表清除）
                const number = btn.textContent === '清除' ? 0 : parseInt(btn.textContent);
                this.selectNumber(number);
            });
        });
    }

    start() {
        if (!this.isInitialized) {
            this.setupGrid();
            this.setupEventListeners();
            this.isInitialized = true;
        }
        this.generatePuzzle();
        this.updateDisplay();
    }

    stop() {
        // 數獨沒有需要停止的計時器
    }

    generatePuzzle() {
        // 生成一個完整的4x4數獨解答
        this.solution = [
            1, 2, 3, 4,
            3, 4, 1, 2,
            2, 1, 4, 3,
            4, 3, 2, 1
        ];
        
        // 隨機交換行和列來創建變化
        this.shuffleSolution();
        
        // 創建謎題（隱藏一些數字）
        this.grid = [...this.solution];
        this.given.fill(false);
        
        // 隨機保留6-8個數字作為提示
        const numGiven = 6 + Math.floor(Math.random() * 3);
        const positions = Array.from({length: 16}, (_, i) => i);
        
        // 隨機打亂位置
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }
        
        // 保留前numGiven個位置的數字
        positions.slice(0, numGiven).forEach(pos => {
            this.given[pos] = true;
        });
        
        // 隱藏其他位置的數字
        for (let i = 0; i < 16; i++) {
            if (!this.given[i]) {
                this.grid[i] = 0;
            }
        }
    }

    shuffleSolution() {
        // 隨機交換同一組內的行
        if (Math.random() > 0.5) {
            this.swapRows(0, 1);
        }
        if (Math.random() > 0.5) {
            this.swapRows(2, 3);
        }
        
        // 隨機交換同一組內的列
        if (Math.random() > 0.5) {
            this.swapCols(0, 1);
        }
        if (Math.random() > 0.5) {
            this.swapCols(2, 3);
        }
        
        // 隨機交換行組
        if (Math.random() > 0.5) {
            this.swapRowGroups();
        }
        
        // 隨機交換列組
        if (Math.random() > 0.5) {
            this.swapColGroups();
        }
    }

    swapRows(row1, row2) {
        for (let col = 0; col < 4; col++) {
            const index1 = row1 * 4 + col;
            const index2 = row2 * 4 + col;
            [this.solution[index1], this.solution[index2]] = [this.solution[index2], this.solution[index1]];
        }
    }

    swapCols(col1, col2) {
        for (let row = 0; row < 4; row++) {
            const index1 = row * 4 + col1;
            const index2 = row * 4 + col2;
            [this.solution[index1], this.solution[index2]] = [this.solution[index2], this.solution[index1]];
        }
    }

    swapRowGroups() {
        for (let col = 0; col < 4; col++) {
            [this.solution[0 * 4 + col], this.solution[2 * 4 + col]] = [this.solution[2 * 4 + col], this.solution[0 * 4 + col]];
            [this.solution[1 * 4 + col], this.solution[3 * 4 + col]] = [this.solution[3 * 4 + col], this.solution[1 * 4 + col]];
        }
    }

    swapColGroups() {
        for (let row = 0; row < 4; row++) {
            [this.solution[row * 4 + 0], this.solution[row * 4 + 2]] = [this.solution[row * 4 + 2], this.solution[row * 4 + 0]];
            [this.solution[row * 4 + 1], this.solution[row * 4 + 3]] = [this.solution[row * 4 + 3], this.solution[row * 4 + 1]];
        }
    }

    selectCell(index) {
        if (this.given[index]) return; // 不能選擇給定的數字
        
        // 取消之前的選擇
        document.querySelectorAll('.sudoku-cell').forEach(cell => {
            cell.classList.remove('selected');
        });
        
        // 選擇新的格子
        this.selectedCell = index;
        document.querySelector(`[data-index="${index}"]`).classList.add('selected');
    }

    selectNumber(number) {
        this.selectedNumber = number;
        if (this.selectedCell !== null) {
            this.placeNumber();
        }
    }

    placeNumber() {
        if (this.selectedCell === null) return;
        
        const cell = document.querySelector(`[data-index="${this.selectedCell}"]`);
        
        if (this.selectedNumber === 0) {
            // 清除數字
            this.grid[this.selectedCell] = 0;
            cell.textContent = '';
            cell.classList.remove('error', 'correct');
        } else {
            // 放置數字
            this.grid[this.selectedCell] = this.selectedNumber;
            cell.textContent = this.selectedNumber;
            
            // 檢查是否正確
            if (this.selectedNumber === this.solution[this.selectedCell]) {
                cell.classList.remove('error');
                cell.classList.add('correct');
                
                // 檢查是否完成
                if (this.isPuzzleComplete()) {
                    this.completedPuzzles++;
                    gameMaster.addScore(50);
                    setTimeout(() => {
                        this.generatePuzzle();
                        this.updateDisplay();
                    }, 500);
                }
            } else {
                cell.classList.remove('correct');
                cell.classList.add('error');
            }
        }
    }

    isPuzzleComplete() {
        for (let i = 0; i < 16; i++) {
            if (this.grid[i] !== this.solution[i]) {
                return false;
            }
        }
        return true;
    }

    updateDisplay() {
        const cells = document.querySelectorAll('.sudoku-cell');
        cells.forEach((cell, index) => {
            cell.textContent = this.grid[index] || '';
            cell.classList.remove('given', 'error', 'correct', 'selected');
            
            if (this.given[index]) {
                cell.classList.add('given');
            }
        });
        
        this.selectedCell = null;
    }

    generateNewSudoku() {
        this.generatePuzzle();
        this.updateDisplay();
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

function changeDirection(direction) {
    gameMaster.snake.changeDirection(direction);
}

function selectNumber(number) {
    gameMaster.sudoku.selectNumber(number);
}

function generateNewSudoku() {
    gameMaster.sudoku.generateNewSudoku();
}