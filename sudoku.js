import { BaseGame } from './core/BaseGame.js?v=2.5';
import { gameManager } from './core/gameManager.js';
import { audioManager } from './audio/audioManager.js';
import { animationManager } from './animation/animationManager.js';

class LogicGrid extends BaseGame {
    constructor() {
        super("sudoku");
        this.boardEl = document.getElementById('sudokuBoard');
        this.restartBtn = document.getElementById('restartBtn');
        this.mistakeCountEl = document.getElementById('mistakeCount');
        this.statusMsg = document.getElementById('statusMsg');
        
        this.cells = [];
        this.selectedCellIdx = -1;
        this.mistakes = 0;
        this.maxMistakes = 3;
        
        this.solution = [];
        this.puzzle = [];
        
        this.bindEvents();
        gameManager.registerGame(this);
    }

    bindEvents() {
        document.getElementById('startBtn')?.addEventListener('click', () => {
            if (audioManager) audioManager.playClick();
            this.start();
        });
        if (this.restartBtn) {
            this.restartBtn.addEventListener('click', () => {
                if (audioManager) audioManager.playClick();
                this.start();
            });
        }
        
        document.querySelectorAll('.num-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!this.isRunning || this.isPaused || this.selectedCellIdx === -1) return;
                
                const val = e.target.innerText;
                if (val === 'X') {
                    this.setCellValue(0); // Erase
                } else {
                    this.setCellValue(parseInt(val));
                }
            });
        });
        
        // Keyboard support for desktop
        document.addEventListener('keydown', (e) => {
            if (!this.isRunning || this.isPaused || this.selectedCellIdx === -1) return;
            if (e.key >= '1' && e.key <= '9') {
                this.setCellValue(parseInt(e.key));
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                this.setCellValue(0);
            }
        });
    }

    generateBoard() {
        // Generate a base valid board
        const base = [
            [1,2,3,4,5,6,7,8,9],
            [4,5,6,7,8,9,1,2,3],
            [7,8,9,1,2,3,4,5,6],
            [2,3,4,5,6,7,8,9,1],
            [5,6,7,8,9,1,2,3,4],
            [8,9,1,2,3,4,5,6,7],
            [3,4,5,6,7,8,9,1,2],
            [6,7,8,9,1,2,3,4,5],
            [9,1,2,3,4,5,6,7,8]
        ];

        // Shuffle numbers
        const nums = [1,2,3,4,5,6,7,8,9];
        for (let i = nums.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [nums[i], nums[j]] = [nums[j], nums[i]];
        }
        
        let shuffledBase = base.map(row => row.map(cell => nums[cell - 1]));
        
        // Flatten for 1D array
        this.solution = shuffledBase.flat();
        this.puzzle = [...this.solution];
        
        // Punch holes (Difficulty: Medium ~40 holes)
        let holes = 40;
        while (holes > 0) {
            let idx = Math.floor(Math.random() * 81);
            if (this.puzzle[idx] !== 0) {
                this.puzzle[idx] = 0;
                holes--;
            }
        }
    }

    reset() {
        this.generateBoard();
        this.mistakes = 0;
        this.selectedCellIdx = -1;
        if (this.mistakeCountEl) this.mistakeCountEl.innerText = `${this.mistakes}/${this.maxMistakes}`;
        if (this.statusMsg) this.statusMsg.classList.add('d-none');
        
        this.renderBoard();
    }

    onStart() {
        this.reset();
    }

    renderBoard() {
        if (!this.boardEl) return;
        this.boardEl.innerHTML = '';
        this.cells = [];
        
        for (let i = 0; i < 81; i++) {
            const cell = document.createElement('div');
            cell.className = 'sudoku-cell';
            
            if (this.puzzle[i] !== 0) {
                cell.innerText = this.puzzle[i];
                cell.classList.add('fixed');
            } else {
                cell.innerText = '';
                cell.addEventListener('click', () => this.selectCell(i));
            }
            
            this.boardEl.appendChild(cell);
            this.cells.push(cell);
        }
    }

    selectCell(index) {
        if (!this.isRunning || this.puzzle[index] !== 0) return;
        
        this.cells.forEach(c => c.classList.remove('selected'));
        this.selectedCellIdx = index;
        this.cells[index].classList.add('selected');
        if (audioManager) audioManager.playClick();
    }

    setCellValue(val) {
        const cell = this.cells[this.selectedCellIdx];
        
        if (val === 0) {
            cell.innerText = '';
            cell.classList.remove('error');
            return;
        }

        cell.innerText = val;
        
        if (val !== this.solution[this.selectedCellIdx]) {
            cell.classList.add('error');
            this.mistakes++;
            this.mistakeCountEl.innerText = `${this.mistakes}/${this.maxMistakes}`;
            if (audioManager) audioManager.playLose();
            
            if (this.mistakes >= this.maxMistakes) {
                this.endGame(false);
            }
        } else {
            cell.classList.remove('error');
            cell.classList.add('fixed'); // Lock it in
            this.puzzle[this.selectedCellIdx] = val; // Update puzzle array so it cannot be selected again
            this.selectedCellIdx = -1;
            cell.classList.remove('selected');
            
            this.score += 10;
            if (audioManager) audioManager.playCoin();
            
            this.checkWin();
        }
    }

    checkWin() {
        // If there are no empty cells left (i.e. puzzle matches solution)
        const isComplete = this.puzzle.every(c => c !== 0);
        if (isComplete) {
            this.score += 500; // Bonus
            this.endGame(true);
        }
    }

    endGame(win) {
        if (win) {
            if (this.statusMsg) {
                this.statusMsg.innerText = "Puzzle Complete! +XP";
                this.statusMsg.classList.remove('d-none');
            }
            if (animationManager) animationManager.spawnConfetti(window.innerWidth/2, window.innerHeight/2, 100);
            if (audioManager) audioManager.playWin();
            this.gameOver(true);
        } else {
            if (this.statusMsg) {
                this.statusMsg.innerText = "Game Over! Too many mistakes.";
                this.statusMsg.classList.remove('text-success');
                this.statusMsg.classList.add('text-danger');
                this.statusMsg.classList.remove('d-none');
            }
            this.gameOver(false);
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", () => {
    const game = new LogicGrid();
    setTimeout(() => game.start(), 100);
});
} else {
    const _init = () => {
    const game = new LogicGrid();
    setTimeout(() => game.start(), 100);
};
    _init();
}
