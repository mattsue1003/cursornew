// 遊戲大補帖 - 主控制器
class GameMaster {
    constructor() {
        this.currentGame = null;
        this.score = 0;
        this.timeLeft = 60;
        this.timer = null;
        this.highScores = this.loadHighScores();
        this.updateHighScoreDisplay();
        
        // 遊戲實例
        this.whackAMole = new WhackAMoleGame();
        this.hanoi = new HanoiGame();
        this.sudoku = new SudokuGame();
    }

    loadHighScores() {
        const saved = localStorage.getItem('gameHighScores');
        return saved ? JSON.parse(saved) : {
            'whack-a-mole': 0,
            'hanoi': 0,
            'sudoku': 0
        };
    }

    saveHighScores() {
        localStorage.setItem('gameHighScores', JSON.stringify(this.highScores));
    }

    updateHighScoreDisplay() {
        document.getElementById('whack-high-score').textContent = this.highScores['whack-a-mole'];
        document.getElementById('hanoi-high-score').textContent = this.highScores['hanoi'];
        document.getElementById('sudoku-high-score').textContent = this.highScores['sudoku'];
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
            case 'hanoi':
                this.hanoi.start();
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
            case 'hanoi':
                this.hanoi.stop();
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
                case 'hanoi':
                    this.hanoi.stop();
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
        this.holes = document.querySelectorAll('.mole-hole');
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.holes.forEach(hole => {
            const mole = hole.querySelector('.mole');
            mole.addEventListener('click', (e) => {
                e.stopPropagation();
                this.hitMole(hole);
            });
        });
    }

    start() {
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
        this.holes.forEach(hole => {
            const mole = hole.querySelector('.mole');
            mole.classList.remove('active');
        });
        this.activeMoles.clear();
    }
}

// 河內塔遊戲
class HanoiGame {
    constructor() {
        this.poles = [[], [], []];
        this.selectedDisk = null;
        this.selectedPole = null;
        this.moves = 0;
        this.completedTowers = 0;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.querySelectorAll('.hanoi-pole').forEach((pole, index) => {
            pole.addEventListener('click', () => {
                this.handlePoleClick(index);
            });
        });
    }

    start() {
        this.resetGame();
    }

    stop() {
        // 河內塔沒有需要停止的計時器
    }

    resetGame() {
        this.poles = [[], [], []];
        this.selectedDisk = null;
        this.selectedPole = null;
        this.moves = 0;
        this.completedTowers = 0;
        
        // 初始化3個圓盤在第一根柱子上
        this.poles[0] = [3, 2, 1]; // 大到小
        
        this.updateDisplay();
        document.getElementById('moves').textContent = this.moves;
    }

    updateDisplay() {
        this.poles.forEach((pole, poleIndex) => {
            const poleElement = document.getElementById(`pole-${poleIndex}`);
            const disksContainer = poleElement.querySelector('.disks');
            disksContainer.innerHTML = '';
            
            pole.forEach((diskSize, diskIndex) => {
                const disk = document.createElement('div');
                disk.className = `disk size-${diskSize}`;
                disk.textContent = diskSize;
                disk.dataset.size = diskSize;
                disk.dataset.pole = poleIndex;
                
                disk.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.handleDiskClick(diskSize, poleIndex);
                });
                
                disksContainer.appendChild(disk);
            });
        });
        
        // 更新選中狀態
        if (this.selectedDisk !== null && this.selectedPole !== null) {
            const selectedDiskElement = document.querySelector(
                `[data-size="${this.selectedDisk}"][data-pole="${this.selectedPole}"]`
            );
            if (selectedDiskElement) {
                selectedDiskElement.classList.add('selected');
            }
        }
    }

    handleDiskClick(diskSize, poleIndex) {
        const pole = this.poles[poleIndex];
        if (pole.length === 0) return;
        
        const topDisk = pole[pole.length - 1];
        if (topDisk !== diskSize) return; // 只能選擇最上面的圓盤
        
        if (this.selectedDisk === diskSize && this.selectedPole === poleIndex) {
            // 取消選擇
            this.selectedDisk = null;
            this.selectedPole = null;
        } else {
            // 選擇圓盤
            this.selectedDisk = diskSize;
            this.selectedPole = poleIndex;
        }
        
        this.updateDisplay();
    }

    handlePoleClick(targetPoleIndex) {
        if (this.selectedDisk === null) return;
        
        const sourcePole = this.poles[this.selectedPole];
        const targetPole = this.poles[targetPoleIndex];
        
        // 檢查移動是否合法
        if (targetPole.length === 0 || targetPole[targetPole.length - 1] > this.selectedDisk) {
            // 移動圓盤
            const disk = sourcePole.pop();
            targetPole.push(disk);
            this.moves++;
            
            // 清除選擇
            this.selectedDisk = null;
            this.selectedPole = null;
            
            // 檢查是否完成
            if (this.poles[2].length === 3) {
                this.completedTowers++;
                gameMaster.addScore(100 + (10 - this.moves) * 5); // 獎勵更少移動次數
                this.resetGame(); // 重新開始新的挑戰
            }
            
            this.updateDisplay();
            document.getElementById('moves').textContent = this.moves;
        }
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

function resetHanoi() {
    gameMaster.hanoi.resetGame();
}

function selectNumber(number) {
    gameMaster.sudoku.selectNumber(number);
}

function generateNewSudoku() {
    gameMaster.sudoku.generateNewSudoku();
}