import { BaseGame } from './core/BaseGame.js';
import { gameManager } from './core/gameManager.js';
import { audioManager } from './audio/audioManager.js';
import { animationManager } from './animation/animationManager.js';
import { storage } from './core/storage.js';

class ReflexProtocol extends BaseGame {
    constructor() {
        super("react");
        
        this.tapArea = document.getElementById('tapArea');
        this.stateIcon = document.getElementById('stateIcon');
        this.mainText = document.getElementById('mainText');
        this.subText = document.getElementById('subText');
        
        this.attemptCountDisplay = document.getElementById('attemptCount');
        this.lastTimeDisplay = document.getElementById('lastTimeDisplay');
        this.avgTimeDisplay = document.getElementById('avgTimeDisplay');
        this.pbDisplay = document.getElementById('pbDisplay');
        
        this.state = 'idle'; // idle, wait, go, early, done
        this.timeoutId = null;
        this.startTime = 0;
        
        this.attempts = [];
        this.maxAttempts = 5;
        
        // Custom highScore loading (lower is better for this game)
        this.highScore = storage.get(`highScore_react`, 9999);
        if (this.highScore < 9999) {
            this.pbDisplay.textContent = `${this.highScore} ms`;
        }
        
        this.bindEvents();
        gameManager.registerGame(this);
    }

    bindEvents() {
        this.tapArea.addEventListener('mousedown', () => this.handleTap());
        this.tapArea.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleTap();
        }, { passive: false });
        
        document.getElementById('restartBtn')?.addEventListener('click', () => this.start());
    }

    onStart() {
        this.attempts = [];
        this.attemptCountDisplay.textContent = '0';
        this.lastTimeDisplay.textContent = '--- ms';
        this.avgTimeDisplay.textContent = '--- ms';
        document.getElementById('restartBtn')?.classList.add('d-none');
        
        this.startAttempt();
    }

    startAttempt() {
        if (this.attempts.length >= this.maxAttempts) {
            this.endGame();
            return;
        }
        
        this.state = 'wait';
        this.tapArea.className = 'tap-area w-100 h-100 rounded d-flex flex-column align-items-center justify-content-center state-wait';
        this.stateIcon.textContent = '⏳';
        this.mainText.textContent = 'Wait for Green...';
        this.subText.textContent = '';
        
        const delay = 2000 + Math.random() * 4000; // 2s to 6s
        
        this.timeoutId = setTimeout(() => {
            this.state = 'go';
            this.tapArea.className = 'tap-area w-100 h-100 rounded d-flex flex-column align-items-center justify-content-center state-go';
            this.stateIcon.textContent = '⚡';
            this.mainText.textContent = 'TAP!';
            this.startTime = performance.now();
            if (audioManager) audioManager.playTone(800, 'square', 0.1);
        }, delay);
    }

    handleTap() {
        if (!this.isRunning || this.isPaused) return;

        if (this.state === 'wait') {
            // Early tap
            clearTimeout(this.timeoutId);
            this.state = 'early';
            this.tapArea.className = 'tap-area w-100 h-100 rounded d-flex flex-column align-items-center justify-content-center state-early';
            this.stateIcon.textContent = '❌';
            this.mainText.textContent = 'Too Early!';
            this.subText.textContent = 'Tap to try again.';
            if (audioManager) audioManager.playTone(150, 'sawtooth', 0.1);
            
        } else if (this.state === 'go') {
            // Success tap
            const reactionTime = Math.round(performance.now() - this.startTime);
            this.attempts.push(reactionTime);
            
            this.state = 'idle';
            this.tapArea.className = 'tap-area w-100 h-100 rounded d-flex flex-column align-items-center justify-content-center state-idle';
            this.stateIcon.textContent = '⏱️';
            this.mainText.textContent = `${reactionTime} ms`;
            this.subText.textContent = 'Tap to continue...';
            
            this.attemptCountDisplay.textContent = this.attempts.length;
            this.lastTimeDisplay.textContent = `${reactionTime} ms`;
            
            const avg = Math.round(this.attempts.reduce((a, b) => a + b, 0) / this.attempts.length);
            this.avgTimeDisplay.textContent = `${avg} ms`;
            
            if (audioManager) audioManager.playTone(600, 'sine', 0.1);
            if (animationManager && reactionTime < 250) {
                animationManager.spawnFloatingIcon('🔥', window.innerWidth/2, window.innerHeight/2, 'FAST!');
            }
            
        } else if (this.state === 'early' || this.state === 'idle') {
            if (this.attempts.length < this.maxAttempts) {
                this.startAttempt();
            } else {
                this.endGame();
            }
        }
    }

    endGame() {
        this.state = 'done';
        const avg = Math.round(this.attempts.reduce((a, b) => a + b, 0) / this.attempts.length);
        
        this.tapArea.className = 'tap-area w-100 h-100 rounded d-flex flex-column align-items-center justify-content-center state-idle';
        this.stateIcon.textContent = '🏆';
        this.mainText.textContent = `Avg: ${avg} ms`;
        this.subText.textContent = 'Test Complete.';
        
        // Custom save logic because lower is better
        if (avg < this.highScore) {
            this.highScore = avg;
            storage.set(`highScore_react`, this.highScore);
            this.pbDisplay.textContent = `${this.highScore} ms`;
            if (animationManager) animationManager.spawnConfetti(window.innerWidth/2, window.innerHeight/2, 100);
        }

        // Add score based on speed (max 1000 for sub 150ms, decreasing from there)
        const points = Math.max(0, 1000 - (avg - 150) * 2);
        this.addScore(points);
        
        document.getElementById('restartBtn')?.classList.remove('d-none');
        if (audioManager) audioManager.playWin();
        
        this.gameOver(true);
    }

    onDestroy() {
        if (this.timeoutId) clearTimeout(this.timeoutId);
    }
}

// Add instructions
gameManager.GAME_INSTRUCTIONS = gameManager.GAME_INSTRUCTIONS || {};
gameManager.GAME_INSTRUCTIONS["react"] = {
    title: "Reflex Protocol",
    objective: "Test your raw reaction speed.",
    controls: "Tap the screen as soon as it turns green.",
    win: "Complete 5 attempts. A lower average time means more XP!",
    lose: "N/A - Just try not to tap too early.",
    tips: "Tapping too early forces a retry of that attempt without penalizing the average."
};

document.addEventListener("DOMContentLoaded", () => {
    const game = new ReflexProtocol();
});
