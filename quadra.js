import { BaseGame } from './core/BaseGame.js?v=2.5';
import { gameManager } from './core/gameManager.js';
import { audioManager } from './audio/audioManager.js';
import { animationManager } from './animation/animationManager.js';

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

const COLORS = [
    null,
    '#00f0ff', // I - Cyan
    '#0044ff', // J - Blue
    '#ff8800', // L - Orange
    '#ffd700', // O - Yellow
    '#00e676', // S - Green
    '#b388ff', // T - Purple
    '#ff1744'  // Z - Red
];

const SHAPES = [
    [],
    [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]], // I
    [[2,0,0], [2,2,2], [0,0,0]],                   // J
    [[0,0,3], [3,3,3], [0,0,0]],                   // L
    [[4,4], [4,4]],                                 // O
    [[0,5,5], [5,5,0], [0,0,0]],                   // S
    [[0,6,0], [6,6,6], [0,0,0]],                   // T
    [[7,7,0], [0,7,7], [0,0,0]]                    // Z
];

class QuadraLink extends BaseGame {
    constructor() {
        super("quadra");
        this.canvas = document.getElementById('tetrisCanvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        
        this.linesDisplay = document.getElementById('linesDisplay');
        this.scoreDisplay = document.getElementById('scoreDisplay');
        this.levelDisplay = document.getElementById('levelDisplay');
        this.statusText = document.getElementById('statusText');
        this.startBtn = document.getElementById('startBtn');
        
        this.grid = this.createMatrix(COLS, ROWS);
        this.piece = null;
        this.dropCounter = 0;
        this.dropInterval = 650;
        this.lastTime = 0;
        this.lines = 0;
        
        this.bindControls();
        if (gameManager?.registerGame) {
            gameManager.registerGame(this);
        }
    }

    createMatrix(w, h) {
        const matrix = [];
        while (h--) {
            matrix.push(new Array(w).fill(0));
        }
        return matrix;
    }

    bindControls() {
        if (this.startBtn) {
            this.startBtn.addEventListener('click', () => {
                this.start();
            });
        }
        
        const restartBtn = document.getElementById('restartBtn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.start();
            });
        }

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (this.isPaused || !this.isRunning) return;
            switch(e.key) {
                case 'ArrowLeft':
                case 'KeyA':
                    e.preventDefault();
                    this.move(-1);
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    e.preventDefault();
                    this.move(1);
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    e.preventDefault();
                    this.drop();
                    break;
                case 'ArrowUp':
                case 'KeyW':
                    e.preventDefault();
                    this.rotate();
                    break;
                case ' ':
                    e.preventDefault();
                    this.hardDrop();
                    break;
            }
        });

        // Mobile D-Pad (Touch & Click)
        const btnL = document.getElementById('btnLeft');
        const btnR = document.getElementById('btnRight');
        const btnD = document.getElementById('btnDown');
        const btnU = document.getElementById('btnUp');
        
        if (btnL) {
            btnL.addEventListener('touchstart', (e) => { e.preventDefault(); this.move(-1); });
            btnL.addEventListener('click', () => this.move(-1));
        }
        if (btnR) {
            btnR.addEventListener('touchstart', (e) => { e.preventDefault(); this.move(1); });
            btnR.addEventListener('click', () => this.move(1));
        }
        if (btnD) {
            btnD.addEventListener('touchstart', (e) => { e.preventDefault(); this.drop(); });
            btnD.addEventListener('click', () => this.drop());
        }
        if (btnU) {
            btnU.addEventListener('touchstart', (e) => { e.preventDefault(); this.rotate(); });
            btnU.addEventListener('click', () => this.rotate());
        }
    }

    spawnPiece() {
        const typeId = Math.floor(Math.random() * 7) + 1;
        this.piece = {
            pos: { x: Math.floor(COLS / 2) - 1, y: 0 },
            matrix: SHAPES[typeId]
        };
        if (this.collide(this.grid, this.piece)) {
            this.endGame();
        }
    }

    drawMatrix(matrix, offset, isGhost = false) {
        if (!this.ctx) return;
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.ctx.fillStyle = isGhost ? 'rgba(255,255,255,0.18)' : COLORS[value];
                    this.ctx.fillRect((x + offset.x) * BLOCK_SIZE, (y + offset.y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                    
                    if (!isGhost) {
                        this.ctx.strokeStyle = 'rgba(0,0,0,0.6)';
                        this.ctx.lineWidth = 2;
                        this.ctx.strokeRect((x + offset.x) * BLOCK_SIZE, (y + offset.y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                        
                        // Inner top-left highlight
                        this.ctx.fillStyle = 'rgba(255,255,255,0.35)';
                        this.ctx.fillRect((x + offset.x) * BLOCK_SIZE + 2, (y + offset.y) * BLOCK_SIZE + 2, BLOCK_SIZE - 4, 3);
                    } else {
                        this.ctx.strokeStyle = 'rgba(255,255,255,0.4)';
                        this.ctx.lineWidth = 1;
                        this.ctx.strokeRect((x + offset.x) * BLOCK_SIZE, (y + offset.y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                    }
                }
            });
        });
    }

    drawGhost() {
        if (!this.piece) return;
        const ghost = {
            matrix: this.piece.matrix,
            pos: { x: this.piece.pos.x, y: this.piece.pos.y }
        };
        while (!this.collide(this.grid, ghost)) {
            ghost.pos.y++;
        }
        ghost.pos.y--;
        this.drawMatrix(ghost.matrix, ghost.pos, true);
    }

    render() {
        if (!this.ctx || !this.canvas) return;

        this.ctx.fillStyle = 'rgba(10, 15, 20, 0.95)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Grid lines
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= COLS; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * BLOCK_SIZE, 0);
            this.ctx.lineTo(i * BLOCK_SIZE, this.canvas.height);
            this.ctx.stroke();
        }
        for (let i = 0; i <= ROWS; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * BLOCK_SIZE);
            this.ctx.lineTo(this.canvas.width, i * BLOCK_SIZE);
            this.ctx.stroke();
        }

        // Settled grid
        this.drawMatrix(this.grid, { x: 0, y: 0 });

        // Ghost prediction
        this.drawGhost();

        // Falling piece
        if (this.piece) {
            this.drawMatrix(this.piece.matrix, this.piece.pos);
        }
    }

    collide(grid, piece) {
        const m = piece.matrix;
        const o = piece.pos;
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 &&
                   (grid[y + o.y] && grid[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }

    merge(grid, piece) {
        piece.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    grid[y + piece.pos.y][x + piece.pos.x] = value;
                }
            });
        });
    }

    rotateMatrix(matrix) {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
            }
        }
        matrix.forEach(row => row.reverse());
    }

    rotate() {
        if (!this.piece) return;
        const pos = this.piece.pos.x;
        let offset = 1;
        this.rotateMatrix(this.piece.matrix);
        while (this.collide(this.grid, this.piece)) {
            this.piece.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > this.piece.matrix[0].length) {
                this.rotateMatrix(this.piece.matrix);
                this.rotateMatrix(this.piece.matrix);
                this.rotateMatrix(this.piece.matrix);
                this.piece.pos.x = pos;
                return;
            }
        }
        if (audioManager?.playClick) audioManager.playClick();
        this.render();
    }

    move(dir) {
        if (!this.piece) return;
        this.piece.pos.x += dir;
        if (this.collide(this.grid, this.piece)) {
            this.piece.pos.x -= dir;
        } else {
            if (audioManager?.playClick) audioManager.playClick();
            this.render();
        }
    }

    drop() {
        if (!this.piece) return;
        this.piece.pos.y++;
        if (this.collide(this.grid, this.piece)) {
            this.piece.pos.y--;
            this.merge(this.grid, this.piece);
            this.clearLines();
            this.spawnPiece();
        }
        this.dropCounter = 0;
        this.render();
    }

    hardDrop() {
        if (!this.piece) return;
        while (!this.collide(this.grid, this.piece)) {
            this.piece.pos.y++;
        }
        this.piece.pos.y--;
        this.merge(this.grid, this.piece);
        this.clearLines();
        this.spawnPiece();
        this.dropCounter = 0;
        this.render();
    }

    clearLines() {
        let linesCleared = 0;
        outer: for (let y = this.grid.length - 1; y >= 0; --y) {
            for (let x = 0; x < this.grid[y].length; ++x) {
                if (this.grid[y][x] === 0) continue outer;
            }
            
            // Line cleared
            const row = this.grid.splice(y, 1)[0].fill(0);
            this.grid.unshift(row);
            ++y;
            linesCleared++;
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            if (this.linesDisplay) this.linesDisplay.innerText = this.lines;
            const pointsEarned = linesCleared * 100 * linesCleared;
            this.addScore(pointsEarned);
            
            // Speed up
            this.dropInterval = Math.max(120, 650 - (this.lines * 20));
            
            if (audioManager?.playLevelUp) audioManager.playLevelUp();
            if (animationManager && this.canvas) {
                const rect = this.canvas.getBoundingClientRect();
                animationManager.spawnConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 40);
            }
        } else {
            if (audioManager?.playTone) audioManager.playTone(200, 'square', 0.05); // Thud
        }
    }

    onScoreUpdate(score, highScore) {
        if (this.scoreDisplay) this.scoreDisplay.innerText = score;
        if (this.levelDisplay) this.levelDisplay.innerText = Math.floor(this.lines / 5) + 1;
    }

    update() {
        const now = performance.now();
        const deltaTime = this.lastTime ? (now - this.lastTime) : 16;
        this.lastTime = now;
        this.dropCounter += deltaTime;
        
        if (this.dropCounter > this.dropInterval) {
            this.drop();
        }
    }

    resetGame() {
        this.grid = this.createMatrix(COLS, ROWS);
        this.score = 0;
        this.lines = 0;
        this.dropCounter = 0;
        this.lastTime = performance.now();
        this.dropInterval = 650;
        if (this.linesDisplay) this.linesDisplay.innerText = "0";
        if (this.scoreDisplay) this.scoreDisplay.innerText = "0";
        if (this.levelDisplay) this.levelDisplay.innerText = "1";
        this.spawnPiece();
    }

    onStart() {
        this.resetGame();
        if (this.statusText) this.statusText.innerText = "Playing... Use Arrow Keys or Space to drop!";
        if (this.startBtn) this.startBtn.classList.add('d-none');
    }

    endGame() {
        if (this.statusText) this.statusText.innerText = "Game Over! Press Play Again to retry.";
        if (this.startBtn) {
            this.startBtn.classList.remove('d-none');
            this.startBtn.innerText = "🔄 PLAY AGAIN";
        }
        this.gameOver(false);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    try {
        const game = new QuadraLink();
        game.render(); // Initial board draw
    } catch(e) {
        console.error("Failed to initialize QuadraLink:", e);
    }
});
