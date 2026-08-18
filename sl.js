import { BaseGame } from './core/BaseGame.js?v=2.5';
import { gameManager } from './core/gameManager.js';
import { eventBus } from './core/eventBus.js';
import { audioManager } from './audio/audioManager.js';
import { animationManager } from './animation/animationManager.js';
import { drawConnections } from './drawSVG.js';

const SIZE = 10;
const snakes = { 16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78 };
const ladders = { 1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100 };

const diceRotations = {
    1: 'translateZ(-50px) rotateX(0deg) rotateY(0deg)',
    6: 'translateZ(-50px) rotateX(180deg) rotateY(0deg)',
    3: 'translateZ(-50px) rotateX(0deg) rotateY(-90deg)',
    4: 'translateZ(-50px) rotateX(0deg) rotateY(90deg)',
    2: 'translateZ(-50px) rotateX(-90deg) rotateY(0deg)',
    5: 'translateZ(-50px) rotateX(90deg) rotateY(0deg)'
};

class SnakeLadderGame extends BaseGame {
    constructor() {
        super("snake_ladder");

        this.boardElement = document.getElementById('board');
        this.rollBtn = document.getElementById('roll-btn');
        this.diceElement = document.getElementById('dice');
        this.actionText = document.getElementById('action-text');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.winnerText = document.getElementById('winner-text');
        this.restartBtn = document.getElementById('restart-btn');
        this.p1Info = document.getElementById('p1-info');
        this.p2Info = document.getElementById('p2-info');

        this.p1Pos = 0;
        this.p2Pos = 0;
        this.currentPlayer = 1;

        if (this.rollBtn) {
            this.rollBtn.addEventListener('click', () => {
                if (!this.isRunning || this.isPaused || this.currentPlayer !== 1) return;
                this.rollBtn.disabled = true;
                this.performRoll(1);
            });
        }
        
        if (this.restartBtn) {
            this.restartBtn.addEventListener('click', () => this.restart());
        }

        this.initBoard();
        gameManager.registerGame(this);
    }

    initBoard() {
        if (!this.boardElement) return;
        this.boardElement.innerHTML = '';
        
        for (let r = SIZE - 1; r >= 0; r--) {
            for (let c = 0; c < SIZE; c++) {
                let actualCol = (r % 2 === 0) ? c : (SIZE - 1 - c);
                let num = r * SIZE + actualCol + 1;
                
                const cell = document.createElement('div');
                cell.classList.add('cell');
                if ((r + c) % 2 === 0) cell.classList.add('alt');
                cell.id = `cell-${num}`;
                cell.textContent = num;
                
                this.boardElement.appendChild(cell);
            }
        }
        
        // Draw the visual snakes and ladders over the board
        drawConnections(this.boardElement);
    }

    reset() {
        this.p1Pos = 0;
        this.p2Pos = 0;
        this.currentPlayer = 1;
        this.renderPawns();
        if (this.gameOverScreen) this.gameOverScreen.classList.add('hidden');
        if (this.diceElement) this.diceElement.style.transform = diceRotations[1];
        if (this.rollBtn) this.rollBtn.disabled = false;
        if (this.actionText) this.actionText.textContent = "Roll to start!";
        this.updateActivePlayerUI();
    }

    onStart() {
        this.reset();
    }

    renderPawns() {
        document.querySelectorAll('.pawn').forEach(p => p.remove());
        
        if (this.p1Pos > 0) {
            const p1Cell = document.getElementById(`cell-${this.p1Pos}`);
            if (p1Cell) {
                const pawn1 = document.createElement('div');
                pawn1.classList.add('pawn', 'p1');
                p1Cell.appendChild(pawn1);
            }
        }
        
        if (this.p2Pos > 0) {
            const p2Cell = document.getElementById(`cell-${this.p2Pos}`);
            if (p2Cell) {
                const pawn2 = document.createElement('div');
                pawn2.classList.add('pawn', 'p2');
                p2Cell.appendChild(pawn2);
            }
        }
    }

    performRoll(player) {
        if (audioManager) audioManager.playClick();
        
        this.actionText.textContent = player === 1 ? "Rolling..." : "AI is rolling...";
        this.diceElement.classList.add('rolling');
        
        setTimeout(() => {
            if (!this.isRunning) return;
            const roll = Math.floor(Math.random() * 6) + 1;
            this.diceElement.classList.remove('rolling');
            this.diceElement.style.transform = diceRotations[roll];
            
            this.actionText.textContent = `Rolled a ${roll}!`;
            
            setTimeout(() => this.movePlayer(player, roll), 800);
        }, 1000);
    }

    movePlayer(player, amount) {
        if (!this.isRunning) return;
        
        let newPos = player === 1 ? this.p1Pos + amount : this.p2Pos + amount;
        
        if (newPos > 100) {
            this.actionText.textContent = "Too high! Try again.";
            this.switchTurn();
            return;
        }
        
        if (player === 1) this.p1Pos = newPos;
        else this.p2Pos = newPos;
        
        if (player === 1) this.score = this.p1Pos * 10;
        
        this.renderPawns();
        if (audioManager) audioManager.playTone(300 + (newPos * 5), 'sine', 0.1);
        
        setTimeout(() => {
            if (!this.isRunning) return;
            
            let finalPos = newPos;
            let changed = false;
            
            if (snakes[newPos]) {
                finalPos = snakes[newPos];
                this.actionText.textContent = "Oh no, a snake!";
                if (audioManager) audioManager.playLose();
                changed = true;
            } else if (ladders[newPos]) {
                finalPos = ladders[newPos];
                this.actionText.textContent = "Yay, a ladder!";
                if (audioManager) audioManager.playLevelUp();
                
                // Spawn confetti over the board
                const boardRect = this.boardElement.getBoundingClientRect();
                if (animationManager) animationManager.spawnConfetti(boardRect.left + boardRect.width/2, boardRect.top + boardRect.height/2, 30);
                changed = true;
            }
            
            if (changed) {
                if (player === 1) this.p1Pos = finalPos;
                else this.p2Pos = finalPos;
                this.renderPawns();
            }
            
            setTimeout(() => {
                if (!this.isRunning) return;
                
                if (finalPos === 100) {
                    this.endGame(player);
                } else {
                    this.switchTurn();
                }
            }, 800);
            
        }, 500);
    }

    switchTurn() {
        if (!this.isRunning) return;
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        this.updateActivePlayerUI();
        
        if (this.currentPlayer === 2) {
            setTimeout(() => {
                if (this.isRunning) this.performRoll(2);
            }, 1000);
        } else {
            if (this.rollBtn) this.rollBtn.disabled = false;
            if (this.actionText) this.actionText.textContent = "Your turn. Roll!";
        }
    }

    updateActivePlayerUI() {
        if (!this.p1Info || !this.p2Info) return;
        if (this.currentPlayer === 1) {
            this.p1Info.classList.add('active');
            this.p2Info.classList.remove('active');
        } else {
            this.p2Info.classList.add('active');
            this.p1Info.classList.remove('active');
        }
    }

    endGame(winner) {
        if (this.gameOverScreen) this.gameOverScreen.classList.remove('hidden');
        
        if (winner === 1) {
            this.winnerText.textContent = 'YOU WIN!';
            this.winnerText.style.color = 'var(--p1-color)';
            this.gameOver(true, { score: 1000 });
        } else {
            this.winnerText.textContent = 'AI WINS!';
            this.winnerText.style.color = 'var(--p2-color)';
            this.gameOver(false, { score: this.p1Pos * 10 });
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", () => {
    const game = new SnakeLadderGame();
    // Use setTimeout to ensure BaseGame registration is processed
    setTimeout(() => game.start(), 100);
});
} else {
    const _init = () => {
    const game = new SnakeLadderGame();
    // Use setTimeout to ensure BaseGame registration is processed
    setTimeout(() => game.start(), 100);
};
    _init();
}
