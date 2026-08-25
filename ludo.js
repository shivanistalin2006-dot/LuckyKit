import { BaseGame } from './core/BaseGame.js?v=2.5';
import { gameManager } from './core/gameManager.js';
import { audioManager } from './audio/audioManager.js';
import { animationManager } from './animation/animationManager.js';

// Simplified Ludo path mapped to 15x15 grid (0-14, 0-14)
// Total outer path length = 52.
const ludoPath = [
    // Red Start path (bottom left to center left)
    {x: 6, y: 14}, {x: 6, y: 13}, {x: 6, y: 12}, {x: 6, y: 11}, {x: 6, y: 10}, {x: 6, y: 9},
    {x: 5, y: 8}, {x: 4, y: 8}, {x: 3, y: 8}, {x: 2, y: 8}, {x: 1, y: 8}, {x: 0, y: 8},
    {x: 0, y: 7}, // Turn
    // Green Start path
    {x: 0, y: 6}, {x: 1, y: 6}, {x: 2, y: 6}, {x: 3, y: 6}, {x: 4, y: 6}, {x: 5, y: 6},
    {x: 6, y: 5}, {x: 6, y: 4}, {x: 6, y: 3}, {x: 6, y: 2}, {x: 6, y: 1}, {x: 6, y: 0},
    {x: 7, y: 0}, // Turn
    // Yellow Start path
    {x: 8, y: 0}, {x: 8, y: 1}, {x: 8, y: 2}, {x: 8, y: 3}, {x: 8, y: 4}, {x: 8, y: 5},
    {x: 9, y: 6}, {x: 10, y: 6}, {x: 11, y: 6}, {x: 12, y: 6}, {x: 13, y: 6}, {x: 14, y: 6},
    {x: 14, y: 7}, // Turn
    // Blue Start path
    {x: 14, y: 8}, {x: 13, y: 8}, {x: 12, y: 8}, {x: 11, y: 8}, {x: 10, y: 8}, {x: 9, y: 8},
    {x: 8, y: 9}, {x: 8, y: 10}, {x: 8, y: 11}, {x: 8, y: 12}, {x: 8, y: 13}, {x: 8, y: 14},
    {x: 7, y: 14} // Turn
];

// Home paths for each color (5 steps to center)
const homePaths = [
    // Red (bottom to center)
    [{x: 7, y: 13}, {x: 7, y: 12}, {x: 7, y: 11}, {x: 7, y: 10}, {x: 7, y: 9}, {x: 7, y: 8}],
    // Green (left to center)
    [{x: 1, y: 7}, {x: 2, y: 7}, {x: 3, y: 7}, {x: 4, y: 7}, {x: 5, y: 7}, {x: 6, y: 7}],
    // Yellow (top to center)
    [{x: 7, y: 1}, {x: 7, y: 2}, {x: 7, y: 3}, {x: 7, y: 4}, {x: 7, y: 5}, {x: 7, y: 6}],
    // Blue (right to center)
    [{x: 13, y: 7}, {x: 12, y: 7}, {x: 11, y: 7}, {x: 10, y: 7}, {x: 9, y: 7}, {x: 8, y: 7}]
];

const startOffsets = [0, 13, 26, 39]; // Index in ludoPath where each color starts
const safeIndices = [0, 8, 13, 21, 26, 34, 39, 47]; // Safe squares on outer path

class ArcadeLudo extends BaseGame {
    constructor() {
        super("ludo");
        this.boardEl = document.getElementById('ludoBoard');
        this.rollBtn = document.getElementById('rollBtn');
        this.diceFace = document.getElementById('diceValue');
        this.diceEl = document.getElementById('ludoDice');
        this.actionText = document.getElementById('actionText');
        this.turnDisplay = document.getElementById('turnDisplay');

        this.players = [
            { id: 0, color: 'bg-red', name: 'Red', pos: -1, state: 'base', hasFinished: false },
            { id: 1, color: 'bg-green', name: 'Green', pos: -1, state: 'base', hasFinished: false, isAI: true },
            { id: 2, color: 'bg-yellow', name: 'Yellow', pos: -1, state: 'base', hasFinished: false, isAI: true },
            { id: 3, color: 'bg-blue', name: 'Blue', pos: -1, state: 'base', hasFinished: false, isAI: true }
        ];
        
        this.turn = 0;
        this.initBoard();
        
        if (this.rollBtn) {
            this.rollBtn.addEventListener('click', () => {
                if (this.isPaused || !this.isRunning || this.players[this.turn].isAI) return;
                this.rollDice();
            });
        }
        
        gameManager.registerGame(this);
    }

    initBoard() {
        if (!this.boardEl) return;
        this.boardEl.innerHTML = '';
        this.cells = new Array(15).fill(0).map(() => new Array(15).fill(null));

        for (let y = 0; y < 15; y++) {
            for (let x = 0; x < 15; x++) {
                const cell = document.createElement('div');
                cell.className = 'ludo-cell';
                
                // Color bases
                if (x <= 5 && y >= 9) cell.classList.add('bg-red');
                else if (x <= 5 && y <= 5) cell.classList.add('bg-green');
                else if (x >= 9 && y <= 5) cell.classList.add('bg-yellow');
                else if (x >= 9 && y >= 9) cell.classList.add('bg-blue');
                
                // Color Home Paths
                if (x === 7 && y >= 9 && y <= 13) cell.classList.add('bg-red');
                if (y === 7 && x >= 1 && x <= 5) cell.classList.add('bg-green');
                if (x === 7 && y >= 1 && y <= 5) cell.classList.add('bg-yellow');
                if (y === 7 && x >= 9 && x <= 13) cell.classList.add('bg-blue');
                
                // Center
                if (x >= 6 && x <= 8 && y >= 6 && y <= 8) {
                    cell.style.background = '#222';
                }

                this.boardEl.appendChild(cell);
                this.cells[y][x] = cell;
            }
        }
        
        // Add Safe zone markers
        safeIndices.forEach(idx => {
            const p = ludoPath[idx];
            if (this.cells[p.y][p.x]) {
                this.cells[p.y][p.x].classList.add('safe');
                this.cells[p.y][p.x].innerHTML = '⭐';
            }
        });
    }

    reset() {
        this.players.forEach(p => {
            p.pos = -1;
            p.state = 'base';
            p.hasFinished = false;
        });
        this.turn = 0;
        this.updateTurnUI();
        this.renderTokens();
    }

    onStart() {
        this.reset();
        this.actionText.textContent = "Your turn! Roll a 6 to start.";
    }

    updateTurnUI() {
        if (!this.turnDisplay) return;
        const p = this.players[this.turn];
        this.turnDisplay.textContent = p.name;
        this.turnDisplay.style.color = p.name === 'Red' ? '#ef4444' : p.name === 'Green' ? '#22c55e' : p.name === 'Yellow' ? '#eab308' : '#3b82f6';
        
        if (p.isAI && this.isRunning && !this.isPaused) {
            setTimeout(() => this.rollDice(), 300);
        }
    }

    renderTokens() {
        document.querySelectorAll('.ludo-token').forEach(t => t.remove());
        
        this.players.forEach(p => {
            if (p.hasFinished) return;
            
            const token = document.createElement('div');
            token.className = `ludo-token ${p.color}`;
            
            let cellX = 0, cellY = 0;
            
            if (p.state === 'base') {
                if (p.id === 0) { cellX = 2; cellY = 12; }
                else if (p.id === 1) { cellX = 2; cellY = 2; }
                else if (p.id === 2) { cellX = 12; cellY = 2; }
                else if (p.id === 3) { cellX = 12; cellY = 12; }
            } else if (p.state === 'outer') {
                const pathIdx = (startOffsets[p.id] + p.pos) % 52;
                cellX = ludoPath[pathIdx].x;
                cellY = ludoPath[pathIdx].y;
            } else if (p.state === 'home') {
                const hPath = homePaths[p.id];
                cellX = hPath[p.pos].x;
                cellY = hPath[p.pos].y;
            }
            
            const cell = this.cells[cellY][cellX];
            if (cell) cell.appendChild(token);
        });
    }

    rollDice() {
        if (this.rollBtn) this.rollBtn.disabled = true;
        if (audioManager) audioManager.playClick();
        this.diceEl.classList.add('rolling');
        this.actionText.textContent = `${this.players[this.turn].name} is rolling...`;

        setTimeout(() => {
            if (!this.isRunning) return;
            this.diceEl.classList.remove('rolling');
            
            // Arcade tweak: Make 6s slightly more common to speed up game
            let roll = Math.floor(Math.random() * 6) + 1;
            if (roll < 6 && Math.random() < 0.2) roll = 6; 
            
            this.diceFace.textContent = ['⚀','⚁','⚂','⚃','⚄','⚅'][roll-1];
            this.actionText.textContent = `${this.players[this.turn].name} rolled a ${roll}!`;
            
            setTimeout(() => this.processMove(this.players[this.turn], roll), 300);
        }, 350);
    }

    processMove(player, roll) {
        if (!this.isRunning) return;

        let canMove = false;
        
        if (player.state === 'base' && roll === 6) {
            player.state = 'outer';
            player.pos = 0;
            canMove = true;
            this.actionText.textContent = `${player.name} left base!`;
            if (audioManager) audioManager.playLevelUp();
        } else if (player.state === 'outer') {
            if (player.pos + roll <= 50) {
                player.pos += roll;
                canMove = true;
            } else if (player.pos + roll > 50) {
                player.state = 'home';
                player.pos = (player.pos + roll) - 51;
                canMove = true;
            }
        } else if (player.state === 'home') {
            if (player.pos + roll <= 5) {
                player.pos += roll;
                canMove = true;
            }
        }

        if (canMove) {
            this.renderTokens();
            if (audioManager) audioManager.playTone(400, 'sine', 0.1);
            this.checkCapture(player);
            this.checkWin(player);
            
            if (player.hasFinished) return;
        } else {
            this.actionText.textContent = "No valid moves.";
        }

        setTimeout(() => {
            if (!this.isRunning) return;
            // Roll again on 6, else next turn
            if (roll === 6 && canMove) {
                this.actionText.textContent = "Rolled a 6! Roll again!";
                if (this.players[this.turn].isAI) setTimeout(() => this.rollDice(), 300);
                else if (this.rollBtn) this.rollBtn.disabled = false;
            } else {
                this.nextTurn();
            }
        }, 350);
    }

    checkCapture(player) {
        if (player.state !== 'outer') return;
        const myAbsPos = (startOffsets[player.id] + player.pos) % 52;
        
        if (safeIndices.includes(myAbsPos)) return;

        for (let p of this.players) {
            if (p.id !== player.id && p.state === 'outer') {
                const theirAbsPos = (startOffsets[p.id] + p.pos) % 52;
                if (myAbsPos === theirAbsPos) {
                    p.state = 'base';
                    p.pos = -1;
                    this.actionText.textContent = `${player.name} captured ${p.name}!`;
                    if (audioManager) audioManager.playLose(); // Crunch sound
                    if (animationManager) {
                        const cell = this.cells[ludoPath[myAbsPos].y][ludoPath[myAbsPos].x];
                        const rect = cell.getBoundingClientRect();
                        animationManager.spawnCoinExplosion(rect.left + rect.width/2, rect.top + rect.height/2);
                    }
                    this.renderTokens();
                    if (player.id === 0) this.score += 50; // Bonus for capture
                    break;
                }
            }
        }
    }

    checkWin(player) {
        if (player.state === 'home' && player.pos === 5) {
            player.hasFinished = true;
            this.renderTokens();
            
            if (player.id === 0) {
                this.score += 500; // Big win bonus
                if (animationManager) animationManager.spawnConfetti(window.innerWidth/2, window.innerHeight/2, 100);
                this.gameOver(true);
            } else {
                this.gameOver(false); // AI wins
            }
        }
    }

    nextTurn() {
        let loopCount = 0;
        do {
            this.turn = (this.turn + 1) % 4;
            loopCount++;
        } while (this.players[this.turn].hasFinished && loopCount < 4);

        if (this.rollBtn) this.rollBtn.disabled = false;
        this.updateTurnUI();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", () => {
    const game = new ArcadeLudo();
    setTimeout(() => game.start(), 100);
});
} else {
    const _init = () => {
    const game = new ArcadeLudo();
    setTimeout(() => game.start(), 100);
};
    _init();
}
