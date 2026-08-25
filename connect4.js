import { BaseGame } from './core/BaseGame.js?v=2.5';
import { gameManager } from './core/gameManager.js';
import { audioManager } from './audio/audioManager.js';
import { animationManager } from './animation/animationManager.js';

const COLS = 7;
const ROWS = 6;
const EMPTY = 0;
const P1 = 1; // Red
const P2 = 2; // Blue / AI

class NeonConnect extends BaseGame {
    constructor() {
        super("connect4");
        
        this.boardElement = document.getElementById('c4Board');
        this.dropRowElement = document.getElementById('c4DropRow');
        this.turnIndicator = document.getElementById('turnIndicator');
        this.statusMsg = document.getElementById('statusMsg');
        this.subStatusMsg = document.getElementById('subStatusMsg');
        
        this.playerWinsDisplay = document.getElementById('playerWins');
        this.aiWinsDisplay = document.getElementById('aiWins');
        this.p1Label = document.getElementById('p1Label');
        this.p2Label = document.getElementById('p2Label');
        
        this.mode = 'ai'; // 'ai' or 'pvp'
        this.board = [];
        this.currentPlayer = P1;
        this.isGameOver = false;
        this.isDropping = false;
        
        this.p1Wins = 0;
        this.p2Wins = 0;
        
        this.bindEvents();
        this.start();
        
        gameManager.registerGame(this);
    }

    bindEvents() {
        document.getElementById('startBtn')?.addEventListener('click', () => this.start());
        document.getElementById('restartBtn')?.addEventListener('click', () => this.start());
        
        // Mode Selector Buttons
        const modeAiBtn = document.getElementById('modeAiBtn');
        const modePvpBtn = document.getElementById('modePvpBtn');
        
        modeAiBtn?.addEventListener('click', () => {
            if (this.mode === 'ai') return;
            this.mode = 'ai';
            modeAiBtn.classList.add('active', 'btn-outline-danger');
            modeAiBtn.classList.remove('btn-outline-secondary');
            modePvpBtn?.classList.remove('active', 'btn-outline-info');
            modePvpBtn?.classList.add('btn-outline-secondary');
            
            if (this.p2Label) this.p2Label.innerText = "AI Bot (Blue)";
            this.p1Wins = 0;
            this.p2Wins = 0;
            this.updateWinsUI();
            this.start();
        });
        
        modePvpBtn?.addEventListener('click', () => {
            if (this.mode === 'pvp') return;
            this.mode = 'pvp';
            modePvpBtn.classList.add('active', 'btn-outline-info');
            modePvpBtn.classList.remove('btn-outline-secondary');
            modeAiBtn?.classList.remove('active', 'btn-outline-danger');
            modeAiBtn?.classList.add('btn-outline-secondary');
            
            if (this.p2Label) this.p2Label.innerText = "Player 2 (Blue)";
            this.p1Wins = 0;
            this.p2Wins = 0;
            this.updateWinsUI();
            this.start();
        });

        // Column Drop Buttons
        const dropButtons = document.querySelectorAll('.c4-drop-btn');
        dropButtons.forEach(btn => {
            const col = parseInt(btn.dataset.col);
            btn.addEventListener('mouseenter', () => this.highlightColumn(col, true));
            btn.addEventListener('mouseleave', () => this.highlightColumn(col, false));
            btn.addEventListener('click', () => this.handleMove(col));
        });
    }

    onStart() {
        this.board = Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
        this.currentPlayer = P1;
        this.isGameOver = false;
        this.isDropping = false;
        
        this.updateTurnUI();
        this.initBoardUI();
    }

    initBoardUI() {
        if (!this.boardElement) return;
        this.boardElement.innerHTML = '';
        
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const cell = document.createElement('div');
                cell.className = 'c4-cell';
                cell.dataset.r = r;
                cell.dataset.c = c;
                
                // Hover highlights for the column
                cell.addEventListener('mouseenter', () => this.highlightColumn(c, true));
                cell.addEventListener('mouseleave', () => this.highlightColumn(c, false));
                cell.addEventListener('click', () => this.handleMove(c));
                
                this.boardElement.appendChild(cell);
            }
        }
    }

    highlightColumn(col, isHovering) {
        if (this.isGameOver || this.isDropping) return;
        if (this.mode === 'ai' && this.currentPlayer !== P1) return;
        
        const cells = this.boardElement.children;
        const availableRow = this.getAvailableRow(col);
        
        for (let r = 0; r < ROWS; r++) {
            const index = r * COLS + col;
            const cell = cells[index];
            if (!cell) continue;
            
            cell.dataset.hover = isHovering ? "true" : "false";
            
            if (isHovering && r === availableRow) {
                cell.dataset.ghost = this.currentPlayer === P1 ? "p1" : "p2";
            } else {
                delete cell.dataset.ghost;
            }
        }
    }

    getAvailableRow(col) {
        for (let r = ROWS - 1; r >= 0; r--) {
            if (this.board[r][col] === EMPTY) {
                return r;
            }
        }
        return -1;
    }

    async handleMove(col) {
        if (this.isGameOver || this.isDropping) return;
        if (this.mode === 'ai' && this.currentPlayer !== P1) return;
        
        const row = this.getAvailableRow(col);
        if (row === -1) return; // Column full
        
        const movingPlayer = this.currentPlayer;
        await this.dropToken(row, col, movingPlayer);
        
        // Clear ghost highlights
        this.highlightColumn(col, false);
        
        const winningLine = this.getWinningLine(this.board, movingPlayer);
        if (winningLine) {
            this.highlightWinningCells(winningLine);
            this.endGame(movingPlayer);
            return;
        }
        
        if (this.checkDraw(this.board)) {
            this.endGame(EMPTY);
            return;
        }
        
        if (this.mode === 'pvp') {
            // Switch to Player 2
            this.currentPlayer = this.currentPlayer === P1 ? P2 : P1;
            this.updateTurnUI();
        } else {
            // Mode is AI: Switch to AI turn
            this.currentPlayer = P2;
            this.updateTurnUI();
            setTimeout(() => this.makeAIMove(), 180);
        }
    }

    async makeAIMove() {
        if (this.isGameOver) return;
        
        const bestCol = this.getBestMove(this.board, 4);
        const row = this.getAvailableRow(bestCol);
        if (row === -1) return;
        
        await this.dropToken(row, bestCol, P2);
        
        const winningLine = this.getWinningLine(this.board, P2);
        if (winningLine) {
            this.highlightWinningCells(winningLine);
            this.endGame(P2);
            return;
        }
        
        if (this.checkDraw(this.board)) {
            this.endGame(EMPTY);
            return;
        }
        
        this.currentPlayer = P1;
        this.updateTurnUI();
    }

    dropToken(row, col, player) {
        return new Promise(resolve => {
            this.isDropping = true;
            this.board[row][col] = player;
            
            const cellIndex = row * COLS + col;
            const cell = this.boardElement.children[cellIndex];
            
            const token = document.createElement('div');
            token.className = `c4-token p${player}`;
            
            cell.appendChild(token);
            
            if (audioManager) {
                const pitch = player === P1 ? 440 : 550;
                audioManager.playTone(pitch, 'sine', 0.08, 0.25);
            }
            
            // Drop animation
            requestAnimationFrame(() => {
                token.classList.add('dropped');
            });
            
            setTimeout(() => {
                this.isDropping = false;
                resolve();
            }, 250);
        });
    }

    updateTurnUI() {
        if (!this.turnIndicator) return;
        
        if (this.isGameOver) return;
        
        if (this.currentPlayer === P1) {
            this.turnIndicator.className = "text-center p-3 rounded w-100 turn-indicator player-turn";
            if (this.statusMsg) this.statusMsg.innerText = this.mode === 'pvp' ? "Player 1's Turn (Red)" : "Your Turn (Red)";
            if (this.subStatusMsg) this.subStatusMsg.innerText = "Click a column to drop token";
        } else {
            this.turnIndicator.className = `text-center p-3 rounded w-100 turn-indicator ${this.mode === 'pvp' ? 'p2-turn' : 'ai-turn'}`;
            if (this.statusMsg) this.statusMsg.innerText = this.mode === 'pvp' ? "Player 2's Turn (Blue)" : "AI is thinking...";
            if (this.subStatusMsg) this.subStatusMsg.innerText = this.mode === 'pvp' ? "Click a column to drop token" : "Evaluating board moves...";
        }
    }

    updateWinsUI() {
        if (this.playerWinsDisplay) this.playerWinsDisplay.innerText = this.p1Wins;
        if (this.aiWinsDisplay) this.aiWinsDisplay.innerText = this.p2Wins;
    }

    endGame(winner) {
        this.isGameOver = true;
        
        if (winner === P1) {
            this.p1Wins++;
            this.turnIndicator.className = "text-center p-3 rounded w-100 turn-indicator player-turn";
            if (this.statusMsg) this.statusMsg.innerText = this.mode === 'pvp' ? "🎉 PLAYER 1 WINS!" : "🎉 YOU WIN!";
            if (this.subStatusMsg) this.subStatusMsg.innerText = "4 in a row achieved!";
            if (audioManager) audioManager.playLevelUp?.();
            if (animationManager) animationManager.spawnConfetti(window.innerWidth / 2, window.innerHeight / 2, 80);
            this.addScore(100);
        } else if (winner === P2) {
            this.p2Wins++;
            this.turnIndicator.className = "text-center p-3 rounded w-100 turn-indicator p2-turn";
            if (this.statusMsg) this.statusMsg.innerText = this.mode === 'pvp' ? "🎉 PLAYER 2 WINS!" : "💀 AI WINS!";
            if (this.subStatusMsg) this.subStatusMsg.innerText = "Better luck next round!";
            if (audioManager) audioManager.playLose?.();
        } else {
            if (this.statusMsg) this.statusMsg.innerText = "⚖️ DRAW MATCH!";
            if (this.subStatusMsg) this.subStatusMsg.innerText = "Board is completely filled!";
        }
        
        this.updateWinsUI();
        this.gameOver(winner === P1);
    }

    highlightWinningCells(coords) {
        coords.forEach(([r, c]) => {
            const index = r * COLS + c;
            const cell = this.boardElement.children[index];
            if (cell) cell.classList.add('winning');
        });
    }

    getWinningLine(b, player) {
        // Horizontal
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c <= COLS - 4; c++) {
                if (b[r][c] === player && b[r][c+1] === player && b[r][c+2] === player && b[r][c+3] === player) {
                    return [[r,c], [r,c+1], [r,c+2], [r,c+3]];
                }
            }
        }
        // Vertical
        for (let r = 0; r <= ROWS - 4; r++) {
            for (let c = 0; c < COLS; c++) {
                if (b[r][c] === player && b[r+1][c] === player && b[r+2][c] === player && b[r+3][c] === player) {
                    return [[r,c], [r+1,c], [r+2,c], [r+3,c]];
                }
            }
        }
        // Diagonal Down-Right
        for (let r = 0; r <= ROWS - 4; r++) {
            for (let c = 0; c <= COLS - 4; c++) {
                if (b[r][c] === player && b[r+1][c+1] === player && b[r+2][c+2] === player && b[r+3][c+3] === player) {
                    return [[r,c], [r+1,c+1], [r+2,c+2], [r+3,c+3]];
                }
            }
        }
        // Diagonal Up-Right
        for (let r = 3; r < ROWS; r++) {
            for (let c = 0; c <= COLS - 4; c++) {
                if (b[r][c] === player && b[r-1][c+1] === player && b[r-2][c+2] === player && b[r-3][c+3] === player) {
                    return [[r,c], [r-1,c+1], [r-2,c+2], [r-3,c+3]];
                }
            }
        }
        return null;
    }

    checkDraw(b) {
        return b[0].every(cell => cell !== EMPTY);
    }

    // Minimax AI with Alpha-Beta Pruning
    getBestMove(b, depth) {
        let bestScore = -Infinity;
        let bestCol = 3; // Center column bias
        
        const validCols = [];
        for (let c = 0; c < COLS; c++) {
            if (b[0][c] === EMPTY) validCols.push(c);
        }
        
        // Immediate win or block check
        for (const col of validCols) {
            const row = this.getAvailableRow(col);
            b[row][col] = P2;
            if (this.getWinningLine(b, P2)) {
                b[row][col] = EMPTY;
                return col;
            }
            b[row][col] = EMPTY;
        }
        
        for (const col of validCols) {
            const row = this.getAvailableRow(col);
            b[row][col] = P1;
            if (this.getWinningLine(b, P1)) {
                b[row][col] = EMPTY;
                return col; // Block player's win
            }
            b[row][col] = EMPTY;
        }
        
        for (const col of validCols) {
            const row = this.getAvailableRow(col);
            b[row][col] = P2;
            const score = this.minimax(b, depth - 1, -Infinity, Infinity, false);
            b[row][col] = EMPTY;
            
            if (score > bestScore) {
                bestScore = score;
                bestCol = col;
            }
        }
        
        return bestCol;
    }

    minimax(b, depth, alpha, beta, isMaximizing) {
        if (this.getWinningLine(b, P2)) return 1000 + depth;
        if (this.getWinningLine(b, P1)) return -1000 - depth;
        if (this.checkDraw(b) || depth === 0) return 0;
        
        const validCols = [];
        for (let c = 0; c < COLS; c++) {
            if (b[0][c] === EMPTY) validCols.push(c);
        }
        
        if (isMaximizing) {
            let maxEval = -Infinity;
            for (const col of validCols) {
                const row = this.getAvailableRow(col);
                b[row][col] = P2;
                const evaluation = this.minimax(b, depth - 1, alpha, beta, false);
                b[row][col] = EMPTY;
                maxEval = Math.max(maxEval, evaluation);
                alpha = Math.max(alpha, evaluation);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const col of validCols) {
                const row = this.getAvailableRow(col);
                b[row][col] = P1;
                const evaluation = this.minimax(b, depth - 1, alpha, beta, true);
                b[row][col] = EMPTY;
                minEval = Math.min(minEval, evaluation);
                beta = Math.min(beta, evaluation);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", () => {
        new NeonConnect();
    });
} else {
    new NeonConnect();
}
