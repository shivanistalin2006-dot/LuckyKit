import { BaseGame } from './core/BaseGame.js';
import { gameManager } from './core/gameManager.js';
import { audioManager } from './audio/audioManager.js';
import { animationManager } from './animation/animationManager.js';
import { storage } from './core/storage.js';

const ICONS = ['👾', '🚀', '💎', '⚔️', '🧠', '⚡', '💣', '🏆'];

class SynapseMatch extends BaseGame {
    constructor() {
        super("memory");
        
        this.boardElement = document.getElementById('memoryBoard');
        this.matchesDisplay = document.getElementById('matchesDisplay');
        this.movesDisplay = document.getElementById('movesDisplay');
        this.statusMsg = document.getElementById('statusMsg');
        this.hsMovesDisplay = document.getElementById('hsMovesDisplay');
        
        // Lower is better for moves
        this.highScore = storage.get(`highScore_memory`, 9999);
        if (this.highScore < 9999) {
            this.hsMovesDisplay.textContent = this.highScore;
        }

        this.cards = [];
        this.flippedCards = [];
        this.matches = 0;
        this.moves = 0;
        this.lockBoard = false;
        
        document.getElementById('restartBtn')?.addEventListener('click', () => this.start());
        
        gameManager.registerGame(this);
    }

    onStart() {
        this.matches = 0;
        this.moves = 0;
        this.flippedCards = [];
        this.lockBoard = false;
        
        this.updateHUD();
        this.statusMsg.textContent = "Memory Sequence Initialized.";
        this.statusMsg.className = "text-center mt-3 fs-5 text-theme";
        
        this.initBoard();
    }

    initBoard() {
        this.boardElement.innerHTML = '';
        
        // Create pairs and shuffle
        let cardData = [...ICONS, ...ICONS];
        cardData.sort(() => Math.random() - 0.5);
        
        this.cards = [];
        
        cardData.forEach((icon, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.icon = icon;
            card.dataset.index = index;
            
            const front = document.createElement('div');
            front.className = 'card-face card-front';
            
            const back = document.createElement('div');
            back.className = 'card-face card-back';
            back.textContent = icon;
            
            card.appendChild(front);
            card.appendChild(back);
            
            card.addEventListener('click', () => this.flipCard(card));
            
            this.boardElement.appendChild(card);
            this.cards.push(card);
        });
    }

    flipCard(card) {
        if (!this.isRunning || this.isPaused || this.lockBoard) return;
        if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

        card.classList.add('flipped');
        this.flippedCards.push(card);
        
        if (audioManager) audioManager.playTone(400, 'sine', 0.05);

        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateHUD();
            this.checkForMatch();
        }
    }

    checkForMatch() {
        const [card1, card2] = this.flippedCards;
        const match = card1.dataset.icon === card2.dataset.icon;

        if (match) {
            this.handleMatch(card1, card2);
        } else {
            this.handleMismatch(card1, card2);
        }
    }

    handleMatch(card1, card2) {
        this.matches++;
        this.updateHUD();
        
        // Wait slightly for flip animation to finish before applying matched styles
        setTimeout(() => {
            card1.classList.add('matched');
            card2.classList.add('matched');
            if (audioManager) audioManager.playTone(800, 'square', 0.05);
            
            if (animationManager) {
                const rect = card2.getBoundingClientRect();
                animationManager.spawnFloatingIcon(card2.dataset.icon, rect.left + rect.width/2, rect.top, 'Match!');
            }
            
            if (this.matches === ICONS.length) {
                this.endGame();
            }
        }, 300);
        
        this.flippedCards = [];
    }

    handleMismatch(card1, card2) {
        this.lockBoard = true;
        
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            if (audioManager) audioManager.playTone(200, 'sawtooth', 0.05);
            
            this.lockBoard = false;
            this.flippedCards = [];
        }, 1000);
    }

    updateHUD() {
        this.matchesDisplay.textContent = this.matches;
        this.movesDisplay.textContent = this.moves;
    }

    endGame() {
        this.statusMsg.textContent = "Protocol Complete!";
        this.statusMsg.className = "text-center mt-3 fs-5 text-success fw-bold";
        
        // Custom save logic for lower moves being better
        if (this.moves < this.highScore) {
            this.highScore = this.moves;
            storage.set(`highScore_memory`, this.highScore);
            this.hsMovesDisplay.textContent = this.highScore;
        }

        // Base XP points
        const baseXP = 500;
        // Bonus for fewer moves (Perfect is 8 moves)
        const bonus = Math.max(0, (20 - this.moves) * 50);
        this.addScore(baseXP + bonus);
        
        if (animationManager) animationManager.spawnConfetti(window.innerWidth/2, window.innerHeight/2, 100);
        if (audioManager) audioManager.playWin();
        
        this.gameOver(true);
    }
}

// Add instructions
gameManager.GAME_INSTRUCTIONS = gameManager.GAME_INSTRUCTIONS || {};
gameManager.GAME_INSTRUCTIONS["memory"] = {
    title: "Synapse Match",
    objective: "Find all matching pairs of Cyber-Arcade icons.",
    controls: "Tap a card to flip it over.",
    win: "Match all 8 pairs.",
    lose: "N/A - But try to do it in the fewest moves possible!",
    tips: "Remember card positions! Fewer moves means more XP."
};

if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", () => {
        const game = new SynapseMatch();
    });
} else {
    const game = new SynapseMatch();
}
