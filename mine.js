import { BaseGame } from './core/BaseGame.js';
import { gameManager } from './core/gameManager.js';
import { audioManager } from './audio/audioManager.js';
import { animationManager } from './animation/animationManager.js';

const COLS = 10;
const ROWS = 10;
const MINES = 15;

class GridSweeper extends BaseGame {
    constructor() {
        super("mine");
        this.boardElement = document.getElementById('mineBoard');
        this.flagCountDisplay = document.getElementById('flagCount');
        this.timeCountDisplay = document.getElementById('timeCount');
        this.statusMsg = document.getElementById('statusMsg');
        
        this.boardElement.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
        this.boardElement.style.gridTemplateRows = `repeat(${ROWS}, 1fr)`;
        
        this.grid = [];
        this.isFirstClick = true;
        this.flagsPlaced = 0;
        this.cellsRevealed = 0;
        this.timerInterval = null;
        this.timeElapsed = 0;
        
        document.getElementById('restartBtn')?.addEventListener('click', () => this.start());
        
        gameManager.registerGame(this);
    }

    onStart() {
        this.isFirstClick = true;
        this.flagsPlaced = 0;
        this.cellsRevealed = 0;
        this.timeElapsed = 0;
        this.updateHUD();
        this.statusMsg.textContent = "Sweep the grid. Avoid EMPs.";
        this.statusMsg.className = "text-center mt-4 fs-5 text-white";
        
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        this.initGrid();
        this.renderGrid();
    }

    initGrid() {
        this.grid = [];
        for (let r = 0; r < ROWS; r++) {
            let row = [];
            for (let c = 0; c < COLS; c++) {
                row.push({
                    r, c,
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    neighborMines: 0
                });
            }
            this.grid.push(row);
        }
    }

    plantMines(excludeR, excludeC) {
        let minesPlanted = 0;
        while (minesPlanted < MINES) {
            let r = Math.floor(Math.random() * ROWS);
            let c = Math.floor(Math.random() * COLS);
            
            // Don't place on first click, or already mined
            if (!this.grid[r][c].isMine && !(Math.abs(r - excludeR) <= 1 && Math.abs(c - excludeC) <= 1)) {
                this.grid[r][c].isMine = true;
                minesPlanted++;
            }
        }
        this.calculateNeighbors();
    }

    calculateNeighbors() {
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (this.grid[r][c].isMine) continue;
                let count = 0;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        let nr = r + dr;
                        let nc = c + dc;
                        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && this.grid[nr][nc].isMine) {
                            count++;
                        }
                    }
                }
                this.grid[r][c].neighborMines = count;
            }
        }
    }

    renderGrid() {
        this.boardElement.innerHTML = '';
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const cell = this.grid[r][c];
                const div = document.createElement('div');
                div.className = 'mine-cell';
                div.dataset.r = r;
                div.dataset.c = c;
                
                div.addEventListener('click', () => this.handleCellClick(r, c));
                div.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.handleCellRightClick(r, c);
                });
                
                // Mobile long-press for flag
                let pressTimer;
                div.addEventListener('touchstart', (e) => {
                    pressTimer = setTimeout(() => {
                        this.handleCellRightClick(r, c);
                        e.preventDefault();
                    }, 500);
                });
                div.addEventListener('touchend', () => clearTimeout(pressTimer));
                div.addEventListener('touchmove', () => clearTimeout(pressTimer));
                
                this.boardElement.appendChild(div);
            }
        }
    }

    updateCellVisuals() {
        const cells = this.boardElement.children;
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const cellData = this.grid[r][c];
                const div = cells[r * COLS + c];
                
                div.className = 'mine-cell';
                div.innerHTML = '';
                
                if (cellData.isRevealed) {
                    div.classList.add('revealed');
                    if (cellData.isMine) {
                        div.classList.add('mine');
                        div.innerHTML = '💣';
                    } else if (cellData.neighborMines > 0) {
                        div.classList.add(`cell-${cellData.neighborMines}`);
                        div.innerHTML = cellData.neighborMines;
                    }
                } else if (cellData.isFlagged) {
                    div.classList.add('flagged');
                    div.innerHTML = '🚩';
                }
            }
        }
    }

    handleCellClick(r, c) {
        if (!this.isRunning || this.isPaused) return;
        const cell = this.grid[r][c];
        
        if (cell.isRevealed || cell.isFlagged) return;

        if (this.isFirstClick) {
            this.isFirstClick = false;
            this.plantMines(r, c);
            this.timerInterval = setInterval(() => {
                this.timeElapsed++;
                this.updateHUD();
            }, 1000);
        }

        if (cell.isMine) {
            this.revealAllMines();
            this.statusMsg.textContent = "EMP Detonated! Mission Failed.";
            this.statusMsg.className = "text-center mt-4 fs-5 text-danger fw-bold";
            clearInterval(this.timerInterval);
            if (audioManager) audioManager.playTone(100, 'sawtooth', 0.5, 0.5); // Explosion
            this.endGame(false);
        } else {
            this.revealCell(r, c);
            if (audioManager) audioManager.playTone(600, 'sine', 0.05); // Click
            this.checkWin();
        }
        
        this.updateCellVisuals();
    }

    handleCellRightClick(r, c) {
        if (!this.isRunning || this.isPaused || this.isFirstClick) return;
        const cell = this.grid[r][c];
        
        if (cell.isRevealed) return;
        
        cell.isFlagged = !cell.isFlagged;
        this.flagsPlaced += cell.isFlagged ? 1 : -1;
        
        if (audioManager) audioManager.playTone(800, 'square', 0.05);
        
        this.updateHUD();
        this.updateCellVisuals();
    }

    revealCell(r, c) {
        if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
        const cell = this.grid[r][c];
        if (cell.isRevealed || cell.isFlagged) return;
        
        cell.isRevealed = true;
        this.cellsRevealed++;
        this.addScore(10);
        
        if (cell.neighborMines === 0) {
            // Flood fill
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    this.revealCell(r + dr, c + dc);
                }
            }
        }
    }

    revealAllMines() {
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (this.grid[r][c].isMine) {
                    this.grid[r][c].isRevealed = true;
                }
            }
        }
    }

    checkWin() {
        if (this.cellsRevealed === (ROWS * COLS) - MINES) {
            clearInterval(this.timerInterval);
            this.statusMsg.textContent = "Sector Cleared! Mission Accomplished.";
            this.statusMsg.className = "text-center mt-4 fs-5 text-success fw-bold";
            this.flagCountDisplay.textContent = '0';
            this.addScore(500); // Bonus
            this.endGame(true);
        }
    }

    updateHUD() {
        this.flagCountDisplay.textContent = Math.max(0, MINES - this.flagsPlaced);
        this.timeCountDisplay.textContent = this.timeElapsed.toString().padStart(3, '0');
    }

    endGame(isWin) {
        if (isWin) {
            if (animationManager) animationManager.spawnConfetti(window.innerWidth/2, window.innerHeight/2, 100);
            if (audioManager) audioManager.playWin();
        }
        this.gameOver(isWin);
    }

    onDestroy() {
        if (this.timerInterval) clearInterval(this.timerInterval);
    }
}

// Add instructions to GameManager
gameManager.GAME_INSTRUCTIONS = gameManager.GAME_INSTRUCTIONS || {};
gameManager.GAME_INSTRUCTIONS["mine"] = {
    title: "Grid Sweeper",
    objective: "Clear the grid without detonating any EMP mines.",
    controls: "Tap to reveal. Long-Press (or Right-Click) to flag.",
    win: "Reveal all safe cells.",
    lose: "Click on an EMP.",
    tips: "The first click is always safe. Use numbers to deduce mine locations!"
};

if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", () => {
        const game = new GridSweeper();
    });
} else {
    const game = new GridSweeper();
}
