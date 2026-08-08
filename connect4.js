import { BaseGame } from './core/BaseGame.js';
import { gameManager } from './core/gameManager.js';
import { audioManager } from './audio/audioManager.js';
import { animationManager } from './animation/animationManager.js';

const COLS = 7;
const ROWS = 6;
const EMPTY = 0;
const PLAYER = 1;
const AI = 2;

class NeonConnect extends BaseGame {
    constructor() {
        super("connect4");
        
        this.boardElement = document.getElementById('c4Board');
        this.turnIndicator = document.getElementById('turnIndicator');
        this.statusMsg = document.getElementById('statusMsg');
        this.subStatusMsg = document.getElementById('subStatusMsg');
        
        this.playerWinsDisplay = document.getElementById('playerWins');
        this.aiWinsDisplay = document.getElementById('aiWins');
        
        this.board = [];
        this.currentPlayer = PLAYER;
        this.isGameOver = false;
        this.isDropping = false;
        
        this.playerWins = 0;
        this.aiWins = 0;
        
        document.getElementById('restartBtn')?.addEventListener('click', () => this.start());
        
        gameManager.registerGame(this);
    }

    onStart() {
        this.board = Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
        this.currentPlayer = PLAYER;
        this.isGameOver = false;
        this.isDropping = false;
        
        this.updateTurnUI();
        this.initBoardUI();
    }

    initBoardUI() {
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
                
                cell.addEventListener('click', () => this.handlePlayerMove(c));
                
                this.boardElement.appendChild(cell);
            }
        }
    }

    highlightColumn(col, isHovering) {
        if (this.isGameOver || this.currentPlayer !== PLAYER) return;
        const cells = this.boardElement.children;
        for (let r = 0; r < ROWS; r++) {
            const index = r * COLS + col;
            cells[index].dataset.hover = isHovering ? "true" : "false";
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

    async handlePlayerMove(col) {
        if (!this.isRunning || this.isPaused || this.isGameOver || this.currentPlayer !== PLAYER || this.isDropping) return;
        
        const row = this.getAvailableRow(col);
        if (row === -1) return; // Column full
        
        await this.dropToken(row, col, PLAYER);
        
        if (this.checkWin(this.board, PLAYER)) {
            this.endGame(PLAYER);
            return;
        }
        
        if (this.checkDraw(this.board)) {
            this.endGame(EMPTY);
            return;
        }
        
        this.currentPlayer = AI;
        this.updateTurnUI();
        
        // AI Turn
        setTimeout(() => this.makeAIMove(), 500);
    }

    async makeAIMove() {
        if (this.isGameOver) return;
        
        // Use Web Worker or chunked calculation if depth is high, but Depth 5 in JS is usually < 100ms
        const bestCol = this.getBestMove(this.board, 5);
        
        const row = this.getAvailableRow(bestCol);
        
        await this.dropToken(row, bestCol, AI);
        
        if (this.checkWin(this.board, AI)) {
            this.endGame(AI);
            return;
        }
        
        if (this.checkDraw(this.board)) {
            this.endGame(EMPTY);
            return;
        }
        
        this.currentPlayer = PLAYER;
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
            
            // Trigger animation
            requestAnimationFrame(() => {
                token.classList.add('dropped');
                if (audioManager) audioManager.playTone(200 + (row * 50), 'sine', 0.1);
            });
            
            setTimeout(() => {
                if (audioManager) audioManager.playTone(150, 'square', 0.05); // Thud
                this.isDropping = false;
                resolve();
            }, 500);
        });
    }

    updateTurnUI() {
        if (this.currentPlayer === PLAYER) {
            this.turnIndicator.className = 'text-center p-3 rounded w-100 turn-indicator player-turn';
            this.statusMsg.textContent = 'Your Turn';
            this.subStatusMsg.textContent = 'Drop a Red token';
        } else {
            this.turnIndicator.className = 'text-center p-3 rounded w-100 turn-indicator ai-turn';
            this.statusMsg.textContent = 'AI Computing...';
            this.subStatusMsg.textContent = 'Waiting for Blue';
        }
    }

    checkWin(board, player) {
        // Horizontal
        for (let c = 0; c < COLS - 3; c++) {
            for (let r = 0; r < ROWS; r++) {
                if (board[r][c] == player && board[r][c+1] == player && board[r][c+2] == player && board[r][c+3] == player) return [[r,c], [r,c+1], [r,c+2], [r,c+3]];
            }
        }
        // Vertical
        for (let c = 0; c < COLS; c++) {
            for (let r = 0; r < ROWS - 3; r++) {
                if (board[r][c] == player && board[r+1][c] == player && board[r+2][c] == player && board[r+3][c] == player) return [[r,c], [r+1,c], [r+2,c], [r+3,c]];
            }
        }
        // Positive Diagonal
        for (let c = 0; c < COLS - 3; c++) {
            for (let r = 0; r < ROWS - 3; r++) {
                if (board[r][c] == player && board[r+1][c+1] == player && board[r+2][c+2] == player && board[r+3][c+3] == player) return [[r,c], [r+1,c+1], [r+2,c+2], [r+3,c+3]];
            }
        }
        // Negative Diagonal
        for (let c = 0; c < COLS - 3; c++) {
            for (let r = 3; r < ROWS; r++) {
                if (board[r][c] == player && board[r-1][c+1] == player && board[r-2][c+2] == player && board[r-3][c+3] == player) return [[r,c], [r-1,c+1], [r-2,c+2], [r-3,c+3]];
            }
        }
        return null;
    }

    checkDraw(board) {
        for (let c = 0; c < COLS; c++) {
            if (board[0][c] === EMPTY) return false;
        }
        return true;
    }

    endGame(winner) {
        this.isGameOver = true;
        this.turnIndicator.className = 'text-center p-3 rounded w-100 turn-indicator';
        
        if (winner === PLAYER) {
            this.statusMsg.textContent = 'YOU WIN!';
            this.statusMsg.className = 'm-0 text-success fw-bold';
            this.subStatusMsg.textContent = '+500 XP';
            this.playerWins++;
            this.playerWinsDisplay.textContent = this.playerWins;
            this.addScore(500);
            if (audioManager) audioManager.playWin();
            if (animationManager) animationManager.spawnConfetti(window.innerWidth/2, window.innerHeight/2, 100);
            
            const winCells = this.checkWin(this.board, PLAYER);
            if (winCells) this.highlightWin(winCells);
            
        } else if (winner === AI) {
            this.statusMsg.textContent = 'AI WINS!';
            this.statusMsg.className = 'm-0 text-danger fw-bold';
            this.subStatusMsg.textContent = 'Better luck next time.';
            this.aiWins++;
            this.aiWinsDisplay.textContent = this.aiWins;
            if (audioManager) audioManager.playTone(150, 'sawtooth', 0.5, 0.5);
            
            const winCells = this.checkWin(this.board, AI);
            if (winCells) this.highlightWin(winCells);
            
        } else {
            this.statusMsg.textContent = 'DRAW';
            this.statusMsg.className = 'm-0 text-warning fw-bold';
            this.subStatusMsg.textContent = 'No moves left.';
        }
        
        this.gameOver(winner === PLAYER);
    }

    highlightWin(cells) {
        cells.forEach(([r, c]) => {
            const index = r * COLS + c;
            const cell = this.boardElement.children[index];
            cell.classList.add('winning');
        });
    }

    // --- AI Minimax Logic ---
    evaluateWindow(window, piece) {
        let score = 0;
        const oppPiece = piece === AI ? PLAYER : AI;
        
        let pieceCount = 0;
        let emptyCount = 0;
        let oppCount = 0;
        
        for (let i = 0; i < 4; i++) {
            if (window[i] === piece) pieceCount++;
            else if (window[i] === EMPTY) emptyCount++;
            else if (window[i] === oppPiece) oppCount++;
        }
        
        if (pieceCount === 4) score += 100;
        else if (pieceCount === 3 && emptyCount === 1) score += 5;
        else if (pieceCount === 2 && emptyCount === 2) score += 2;
        
        if (oppCount === 3 && emptyCount === 1) score -= 4; // Block opponent
        
        return score;
    }

    scorePosition(board, piece) {
        let score = 0;
        
        // Center column preference
        const centerCol = [];
        for (let r = 0; r < ROWS; r++) centerCol.push(board[r][Math.floor(COLS/2)]);
        const centerCount = centerCol.filter(c => c === piece).length;
        score += centerCount * 3;
        
        // Horizontal
        for (let r = 0; r < ROWS; r++) {
            const rowArray = board[r];
            for (let c = 0; c < COLS - 3; c++) {
                const window = rowArray.slice(c, c + 4);
                score += this.evaluateWindow(window, piece);
            }
        }
        
        // Vertical
        for (let c = 0; c < COLS; c++) {
            const colArray = [];
            for (let r = 0; r < ROWS; r++) colArray.push(board[r][c]);
            for (let r = 0; r < ROWS - 3; r++) {
                const window = colArray.slice(r, r + 4);
                score += this.evaluateWindow(window, piece);
            }
        }
        
        // Positive Diagonal
        for (let r = 0; r < ROWS - 3; r++) {
            for (let c = 0; c < COLS - 3; c++) {
                const window = [board[r][c], board[r+1][c+1], board[r+2][c+2], board[r+3][c+3]];
                score += this.evaluateWindow(window, piece);
            }
        }
        
        // Negative Diagonal
        for (let r = 0; r < ROWS - 3; r++) {
            for (let c = 0; c < COLS - 3; c++) {
                const window = [board[r+3][c], board[r+2][c+1], board[r+1][c+2], board[r][c+3]];
                score += this.evaluateWindow(window, piece);
            }
        }
        
        return score;
    }

    isTerminalNode(board) {
        return this.checkWin(board, PLAYER) || this.checkWin(board, AI) || this.checkDraw(board);
    }

    getValidLocations(board) {
        const validLocations = [];
        for (let c = 0; c < COLS; c++) {
            if (board[0][c] === EMPTY) validLocations.push(c);
        }
        return validLocations;
    }

    minimax(board, depth, alpha, beta, maximizingPlayer) {
        const validLocations = this.getValidLocations(board);
        const isTerminal = this.isTerminalNode(board);
        
        if (depth === 0 || isTerminal) {
            if (isTerminal) {
                if (this.checkWin(board, AI)) return { score: 100000000000000, column: null };
                else if (this.checkWin(board, PLAYER)) return { score: -10000000000000, column: null };
                else return { score: 0, column: null }; // Draw
            } else {
                return { score: this.scorePosition(board, AI), column: null };
            }
        }
        
        // Sort valid locations to search center first (alpha-beta optimization)
        const center = Math.floor(COLS/2);
        validLocations.sort((a, b) => Math.abs(center - a) - Math.abs(center - b));
        
        if (maximizingPlayer) {
            let value = -Infinity;
            let bestCol = validLocations[Math.floor(Math.random() * validLocations.length)];
            
            for (const col of validLocations) {
                const row = this.getAvailableRowFromBoard(board, col);
                const bCopy = board.map(r => [...r]);
                bCopy[row][col] = AI;
                
                const newScore = this.minimax(bCopy, depth - 1, alpha, beta, false).score;
                if (newScore > value) {
                    value = newScore;
                    bestCol = col;
                }
                alpha = Math.max(alpha, value);
                if (alpha >= beta) break;
            }
            return { score: value, column: bestCol };
        } else {
            let value = Infinity;
            let bestCol = validLocations[Math.floor(Math.random() * validLocations.length)];
            
            for (const col of validLocations) {
                const row = this.getAvailableRowFromBoard(board, col);
                const bCopy = board.map(r => [...r]);
                bCopy[row][col] = PLAYER;
                
                const newScore = this.minimax(bCopy, depth - 1, alpha, beta, true).score;
                if (newScore < value) {
                    value = newScore;
                    bestCol = col;
                }
                beta = Math.min(beta, value);
                if (alpha >= beta) break;
            }
            return { score: value, column: bestCol };
        }
    }

    getAvailableRowFromBoard(board, col) {
        for (let r = ROWS - 1; r >= 0; r--) {
            if (board[r][col] === EMPTY) return r;
        }
        return -1;
    }

    getBestMove(board, depth) {
        return this.minimax(board, depth, -Infinity, Infinity, true).column;
    }
}

// Add instructions
gameManager.GAME_INSTRUCTIONS = gameManager.GAME_INSTRUCTIONS || {};
gameManager.GAME_INSTRUCTIONS["connect4"] = {
    title: "Neon Connect",
    objective: "Be the first to form a horizontal, vertical, or diagonal line of four tokens.",
    controls: "Tap or click a column to drop your Red token.",
    win: "Connect 4 tokens before the AI.",
    lose: "The AI connects 4 tokens first.",
    tips: "Always watch out for the AI setting up multiple threats!"
};

if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", () => {
        const game = new NeonConnect();
    });
} else {
    const game = new NeonConnect();
}
