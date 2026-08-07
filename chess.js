import { BaseGame } from './core/BaseGame.js';
import { gameManager } from './core/gameManager.js';
import { audioManager } from './audio/audioManager.js';
import { animationManager } from './animation/animationManager.js';

// Pieces
const EMPTY = 0;
const PAWN = 1, KNIGHT = 2, BISHOP = 3, ROOK = 4, QUEEN = 5, KING = 6;
const WHITE = 8, BLACK = 16;

const PIECE_SYMBOLS = {
    [WHITE | PAWN]: '♙', [WHITE | KNIGHT]: '♘', [WHITE | BISHOP]: '♗',
    [WHITE | ROOK]: '♖', [WHITE | QUEEN]: '♕', [WHITE | KING]: '♔',
    [BLACK | PAWN]: '♟', [BLACK | KNIGHT]: '♞', [BLACK | BISHOP]: '♝',
    [BLACK | ROOK]: '♜', [BLACK | QUEEN]: '♛', [BLACK | KING]: '♚'
};

const PIECE_VALUES = {
    [PAWN]: 10, [KNIGHT]: 30, [BISHOP]: 30, [ROOK]: 50, [QUEEN]: 90, [KING]: 900
};

class GrandmastersGambit extends BaseGame {
    constructor() {
        super("chess");
        
        this.boardElement = document.getElementById('chessBoard');
        this.turnIndicator = document.getElementById('turnIndicator');
        this.statusMsg = document.getElementById('statusMsg');
        this.subStatusMsg = document.getElementById('subStatusMsg');
        
        this.whiteCapturedContainer = document.getElementById('whiteCaptured');
        this.blackCapturedContainer = document.getElementById('blackCaptured');
        
        this.board = new Array(64).fill(EMPTY);
        this.currentTurn = WHITE;
        this.selectedSquare = -1;
        this.validMoves = [];
        this.isGameOver = false;
        
        this.whiteCaptured = [];
        this.blackCaptured = [];
        
        this.bindEvents();
        gameManager.registerGame(this);
    }

    bindEvents() {
        document.getElementById('restartBtn')?.addEventListener('click', () => this.start());
    }

    onStart() {
        this.initBoard();
        this.currentTurn = WHITE;
        this.selectedSquare = -1;
        this.validMoves = [];
        this.isGameOver = false;
        this.whiteCaptured = [];
        this.blackCaptured = [];
        
        this.updateUI();
    }

    initBoard() {
        this.board = new Array(64).fill(EMPTY);
        
        // Black pieces (Top)
        this.board[0] = BLACK | ROOK; this.board[1] = BLACK | KNIGHT; this.board[2] = BLACK | BISHOP; this.board[3] = BLACK | QUEEN;
        this.board[4] = BLACK | KING; this.board[5] = BLACK | BISHOP; this.board[6] = BLACK | KNIGHT; this.board[7] = BLACK | ROOK;
        for(let i=8; i<16; i++) this.board[i] = BLACK | PAWN;
        
        // White pieces (Bottom)
        for(let i=48; i<56; i++) this.board[i] = WHITE | PAWN;
        this.board[56] = WHITE | ROOK; this.board[57] = WHITE | KNIGHT; this.board[58] = WHITE | BISHOP; this.board[59] = WHITE | QUEEN;
        this.board[60] = WHITE | KING; this.board[61] = WHITE | BISHOP; this.board[62] = WHITE | KNIGHT; this.board[63] = WHITE | ROOK;
    }

    getColor(piece) {
        if (piece === EMPTY) return 0;
        return (piece & WHITE) ? WHITE : BLACK;
    }

    getType(piece) {
        return piece & 7; // 111 in binary
    }

    getPieceValue(piece) {
        if (piece === EMPTY) return 0;
        return PIECE_VALUES[this.getType(piece)];
    }

    // --- Move Generation Logic ---
    generatePseudoLegalMoves(board, color) {
        const moves = [];
        for (let i = 0; i < 64; i++) {
            const piece = board[i];
            if (this.getColor(piece) === color) {
                moves.push(...this.getMovesForPiece(board, i, piece));
            }
        }
        return moves;
    }

    getMovesForPiece(board, sq, piece) {
        const type = this.getType(piece);
        const color = this.getColor(piece);
        const oppColor = color === WHITE ? BLACK : WHITE;
        const moves = [];
        
        const r = Math.floor(sq / 8);
        const c = sq % 8;
        
        const addIfValid = (targetSq) => {
            if (targetSq >= 0 && targetSq < 64) {
                const targetPiece = board[targetSq];
                if (targetPiece === EMPTY) {
                    moves.push({ from: sq, to: targetSq, capture: false });
                    return true; // continue sliding
                } else if (this.getColor(targetPiece) === oppColor) {
                    moves.push({ from: sq, to: targetSq, capture: true });
                    return false; // stop sliding
                }
            }
            return false; // stop sliding
        };

        if (type === PAWN) {
            const dir = color === WHITE ? -8 : 8;
            const startRow = color === WHITE ? 6 : 1;
            
            // Forward 1
            if (board[sq + dir] === EMPTY) {
                moves.push({ from: sq, to: sq + dir, capture: false });
                // Forward 2
                if (r === startRow && board[sq + dir * 2] === EMPTY) {
                    moves.push({ from: sq, to: sq + dir * 2, capture: false });
                }
            }
            // Captures
            const captureOffsets = color === WHITE ? [-9, -7] : [7, 9];
            captureOffsets.forEach(off => {
                const target = sq + off;
                const tr = Math.floor(target / 8);
                if (target >= 0 && target < 64 && Math.abs(tr - r) === 1) {
                    if (this.getColor(board[target]) === oppColor) {
                        moves.push({ from: sq, to: target, capture: true });
                    }
                }
            });
        } 
        else if (type === KNIGHT) {
            const offsets = [-17, -15, -10, -6, 6, 10, 15, 17];
            offsets.forEach(off => {
                const target = sq + off;
                if (target >= 0 && target < 64) {
                    const tr = Math.floor(target / 8);
                    const tc = target % 8;
                    if (Math.abs(tr - r) <= 2 && Math.abs(tc - c) <= 2) {
                        if (this.getColor(board[target]) !== color) {
                            moves.push({ from: sq, to: target, capture: board[target] !== EMPTY });
                        }
                    }
                }
            });
        }
        else if (type === BISHOP || type === ROOK || type === QUEEN) {
            const dirs = [];
            if (type === BISHOP || type === QUEEN) dirs.push(-9, -7, 7, 9);
            if (type === ROOK || type === QUEEN) dirs.push(-8, 8, -1, 1);
            
            dirs.forEach(dir => {
                let target = sq;
                while (true) {
                    const prevC = target % 8;
                    target += dir;
                    const newC = target % 8;
                    // Prevent wrapping around board edges
                    if (target < 0 || target >= 64 || Math.abs(newC - prevC) > 2) break;
                    
                    if (!addIfValid(target)) break;
                }
            });
        }
        else if (type === KING) {
            const dirs = [-9, -8, -7, -1, 1, 7, 8, 9];
            dirs.forEach(dir => {
                const target = sq + dir;
                const prevC = sq % 8;
                const newC = target % 8;
                if (target >= 0 && target < 64 && Math.abs(newC - prevC) <= 1) {
                    if (this.getColor(board[target]) !== color) {
                        moves.push({ from: sq, to: target, capture: board[target] !== EMPTY });
                    }
                }
            });
        }
        
        return moves;
    }

    // Check if move leaves king in check
    generateLegalMoves(board, color) {
        const pseudoMoves = this.generatePseudoLegalMoves(board, color);
        const oppColor = color === WHITE ? BLACK : WHITE;
        const legalMoves = [];
        
        for (const move of pseudoMoves) {
            // Apply move to virtual board
            const bCopy = [...board];
            bCopy[move.to] = bCopy[move.from];
            bCopy[move.from] = EMPTY;
            
            // Check if king is safe
            const kingSq = bCopy.findIndex(p => p === (color | KING));
            const oppPseudo = this.generatePseudoLegalMoves(bCopy, oppColor);
            
            let kingInCheck = false;
            for (const oppMove of oppPseudo) {
                if (oppMove.to === kingSq) {
                    kingInCheck = true;
                    break;
                }
            }
            
            if (!kingInCheck) {
                legalMoves.push(move);
            }
        }
        return legalMoves;
    }

    isCheck(board, color) {
        const oppColor = color === WHITE ? BLACK : WHITE;
        const kingSq = board.findIndex(p => p === (color | KING));
        const oppPseudo = this.generatePseudoLegalMoves(board, oppColor);
        return oppPseudo.some(m => m.to === kingSq);
    }

    // --- Interaction ---
    handleSquareClick(sq) {
        if (!this.isRunning || this.isPaused || this.isGameOver || this.currentTurn !== WHITE) return;
        
        const piece = this.board[sq];
        const color = this.getColor(piece);
        
        // If selecting own piece
        if (color === WHITE) {
            this.selectedSquare = sq;
            this.validMoves = this.generateLegalMoves(this.board, WHITE).filter(m => m.from === sq);
            if (audioManager) audioManager.playTone(600, 'sine', 0.05);
            this.renderBoard();
        } 
        // If clicking a valid destination
        else if (this.selectedSquare !== -1) {
            const move = this.validMoves.find(m => m.to === sq);
            if (move) {
                this.executeMove(move);
            } else {
                // Invalid click, deselect
                this.selectedSquare = -1;
                this.validMoves = [];
                this.renderBoard();
            }
        }
    }

    executeMove(move) {
        const piece = this.board[move.from];
        const targetPiece = this.board[move.to];
        
        if (targetPiece !== EMPTY) {
            if (this.getColor(targetPiece) === WHITE) this.whiteCaptured.push(targetPiece);
            else this.blackCaptured.push(targetPiece);
            if (audioManager) audioManager.playTone(300, 'square', 0.1);
        } else {
            if (audioManager) audioManager.playTone(400, 'triangle', 0.05);
        }
        
        this.board[move.to] = piece;
        this.board[move.from] = EMPTY;
        
        // Pawn Promotion (Auto-Queen)
        if (this.getType(piece) === PAWN) {
            const color = this.getColor(piece);
            const row = Math.floor(move.to / 8);
            if ((color === WHITE && row === 0) || (color === BLACK && row === 7)) {
                this.board[move.to] = color | QUEEN;
                if (animationManager) animationManager.spawnFloatingIcon('♕', window.innerWidth/2, window.innerHeight/2, 'Promotion!');
            }
        }
        
        this.selectedSquare = -1;
        this.validMoves = [];
        
        this.currentTurn = this.currentTurn === WHITE ? BLACK : WHITE;
        
        this.updateUI();
        this.checkGameState();
        
        if (!this.isGameOver && this.currentTurn === BLACK) {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    checkGameState() {
        const legalMoves = this.generateLegalMoves(this.board, this.currentTurn);
        if (legalMoves.length === 0) {
            this.isGameOver = true;
            if (this.isCheck(this.board, this.currentTurn)) {
                // Checkmate
                if (this.currentTurn === BLACK) {
                    this.endGame("CHECKMATE! You Win.", true);
                } else {
                    this.endGame("CHECKMATE! AI Wins.", false);
                }
            } else {
                // Stalemate
                this.endGame("STALEMATE! Draw.", false);
            }
        } else if (this.isCheck(this.board, this.currentTurn)) {
            this.statusMsg.textContent = 'CHECK!';
            this.statusMsg.className = 'm-0 text-danger fw-bold';
            if (audioManager) audioManager.playTone(800, 'sawtooth', 0.1);
        }
    }

    // --- AI ---
    makeAIMove() {
        if (this.isGameOver) return;
        
        const legalMoves = this.generateLegalMoves(this.board, BLACK);
        if (legalMoves.length === 0) return; // Handled by checkGameState
        
        // Simple Minimax depth 3
        let bestMove = null;
        let bestValue = -Infinity;
        
        for (const move of legalMoves) {
            const bCopy = [...this.board];
            bCopy[move.to] = bCopy[move.from];
            bCopy[move.from] = EMPTY;
            
            // Auto promotion for AI
            if (this.getType(bCopy[move.to]) === PAWN && Math.floor(move.to / 8) === 7) {
                bCopy[move.to] = BLACK | QUEEN;
            }
            
            const value = this.minimax(bCopy, 2, -Infinity, Infinity, false);
            if (value > bestValue) {
                bestValue = value;
                bestMove = move;
            }
        }
        
        if (bestMove) {
            this.executeMove(bestMove);
        }
    }

    minimax(board, depth, alpha, beta, isMaximizing) {
        if (depth === 0) {
            return this.evaluateBoard(board);
        }
        
        const color = isMaximizing ? BLACK : WHITE;
        const moves = this.generateLegalMoves(board, color);
        
        if (moves.length === 0) {
            if (this.isCheck(board, color)) return isMaximizing ? -99999 : 99999;
            return 0; // Stalemate
        }
        
        if (isMaximizing) {
            let maxEval = -Infinity;
            for (const move of moves) {
                const bCopy = [...board];
                bCopy[move.to] = bCopy[move.from];
                bCopy[move.from] = EMPTY;
                if (this.getType(bCopy[move.to]) === PAWN && Math.floor(move.to / 8) === 7) bCopy[move.to] = BLACK | QUEEN;
                
                const evalVal = this.minimax(bCopy, depth - 1, alpha, beta, false);
                maxEval = Math.max(maxEval, evalVal);
                alpha = Math.max(alpha, evalVal);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of moves) {
                const bCopy = [...board];
                bCopy[move.to] = bCopy[move.from];
                bCopy[move.from] = EMPTY;
                if (this.getType(bCopy[move.to]) === PAWN && Math.floor(move.to / 8) === 0) bCopy[move.to] = WHITE | QUEEN;
                
                const evalVal = this.minimax(bCopy, depth - 1, alpha, beta, true);
                minEval = Math.min(minEval, evalVal);
                beta = Math.min(beta, evalVal);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }

    evaluateBoard(board) {
        let score = 0;
        for (let i = 0; i < 64; i++) {
            const piece = board[i];
            if (piece !== EMPTY) {
                const val = this.getPieceValue(piece);
                // Positional bonus: encourage center control
                const r = Math.floor(i/8);
                const c = i%8;
                let posBonus = 0;
                if (r >= 2 && r <= 5 && c >= 2 && c <= 5) posBonus = 1; // Center
                
                if (this.getColor(piece) === BLACK) {
                    score += val + posBonus;
                } else {
                    score -= (val + posBonus);
                }
            }
        }
        return score;
    }

    // --- Rendering UI ---
    updateUI() {
        this.renderBoard();
        
        if (this.isGameOver) return;
        
        if (this.currentTurn === WHITE) {
            this.turnIndicator.className = 'text-center p-3 rounded w-100 turn-indicator white-turn';
            this.statusMsg.textContent = 'Your Turn';
            this.statusMsg.className = 'm-0 text-white fw-bold';
            this.subStatusMsg.textContent = 'Select a piece';
        } else {
            this.turnIndicator.className = 'text-center p-3 rounded w-100 turn-indicator black-turn';
            this.statusMsg.textContent = 'AI Computing...';
            this.statusMsg.className = 'm-0 text-secondary fw-bold';
            this.subStatusMsg.textContent = 'Waiting for Black';
        }
        
        // Render captured pieces
        this.whiteCapturedContainer.innerHTML = this.blackCaptured.map(p => PIECE_SYMBOLS[p]).join('');
        this.blackCapturedContainer.innerHTML = this.whiteCaptured.map(p => PIECE_SYMBOLS[p]).join('');
    }

    renderBoard() {
        this.boardElement.innerHTML = '';
        const inCheck = this.isCheck(this.board, this.currentTurn);
        
        for (let i = 0; i < 64; i++) {
            const r = Math.floor(i / 8);
            const c = i % 8;
            const isLight = (r + c) % 2 === 0;
            
            const cell = document.createElement('div');
            cell.className = `chess-cell ${isLight ? 'light' : 'dark'}`;
            
            if (this.selectedSquare === i) cell.classList.add('selected');
            
            const move = this.validMoves.find(m => m.to === i);
            if (move) {
                cell.classList.add(move.capture ? 'valid-capture' : 'valid-move');
            }
            
            const piece = this.board[i];
            if (piece !== EMPTY) {
                const pSpan = document.createElement('span');
                pSpan.className = `chess-piece ${this.getColor(piece) === WHITE ? 'white' : 'black'}`;
                pSpan.textContent = PIECE_SYMBOLS[piece];
                cell.appendChild(pSpan);
                
                // Highlight King in check
                if (inCheck && this.getColor(piece) === this.currentTurn && this.getType(piece) === KING) {
                    cell.classList.add('in-check');
                }
            }
            
            cell.addEventListener('click', () => this.handleSquareClick(i));
            this.boardElement.appendChild(cell);
        }
    }

    endGame(msg, isWin) {
        this.isGameOver = true;
        this.turnIndicator.className = 'text-center p-3 rounded w-100 turn-indicator';
        this.statusMsg.textContent = msg;
        this.statusMsg.className = `m-0 fw-bold ${isWin ? 'text-success' : 'text-danger'}`;
        this.subStatusMsg.textContent = isWin ? '+1000 XP' : 'Match Concluded';
        
        if (isWin) {
            this.addScore(1000);
            if (animationManager) animationManager.spawnConfetti(window.innerWidth/2, window.innerHeight/2, 150);
            if (audioManager) audioManager.playWin();
        } else {
            if (audioManager) audioManager.playTone(150, 'sawtooth', 0.5, 1);
        }
        
        this.gameOver(isWin);
    }
}

// Add instructions
gameManager.GAME_INSTRUCTIONS = gameManager.GAME_INSTRUCTIONS || {};
gameManager.GAME_INSTRUCTIONS["chess"] = {
    title: "Grandmaster's Gambit",
    objective: "Checkmate the AI opponent.",
    controls: "Tap a piece to select it, then tap a valid square to move.",
    win: "Trap the AI's King in Checkmate.",
    lose: "Your King gets Checkmated.",
    tips: "The AI looks ahead 3 full moves. Guard your center!"
};

document.addEventListener("DOMContentLoaded", () => {
    const game = new GrandmastersGambit();
});