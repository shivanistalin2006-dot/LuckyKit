import { storage } from './storage.js';
import { eventBus } from './eventBus.js';
import { audioManager } from '../audio/audioManager.js';
import { playerProfile } from './playerProfile.js';
import { missionSystem } from './missionSystem.js';
import { aiCoach } from './aiCoach.js';

export class BaseGame {
    constructor(gameId) {
        if (!gameId) throw new Error("BaseGame requires a unique gameId.");
        this.gameId = gameId;
        this.score = 0;
        this.highScore = storage.get(`highScore_${this.gameId}`, 0);
        this.isRunning = false;
        this.isPaused = false;
        this.animationFrameId = null;
        this.sessionStartTime = null;

        this.bindGlobalKeys();
    }

    bindGlobalKeys() {
        window.addEventListener("keydown", (e) => {
            if (e.code === "Escape" || e.code === "KeyP") {
                this.togglePause();
            }
        });
        
        // Wait for user to explicitly start via a start button in the UI
        document.getElementById('startBtn')?.addEventListener('click', () => {
            const overlay = document.getElementById('startOverlay');
            if (overlay) {
                overlay.classList.remove('d-flex');
                overlay.classList.add('d-none');
                overlay.style.display = 'none';
            }
            this.start();
        });

        // Exit to Hub
        document.getElementById('exitBtn')?.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    start() {
        this.score = 0;
        this.isRunning = true;
        this.isPaused = false;
        this.sessionStartTime = Date.now();
        
        eventBus.emit('PLAY_GAME', { gameId: this.gameId });
        
        // Show Instructions modal before actually starting the game loop
        import('./gameManager.js?v=2.2').then(module => {
            module.gameManager.showInstructions(this.gameId, () => {
                if (audioManager) audioManager.startBgMusic();
                this.onStart();
                if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
                this.loop();
            });
        });
    }

    pause() {
        if (!this.isRunning) return;
        this.isPaused = true;
        if (audioManager) audioManager.stopBgMusic();
        this.onPause();
    }

    resume() {
        if (!this.isRunning) return;
        this.isPaused = false;
        if (audioManager) audioManager.startBgMusic();
        this.onResume();
        this.loop();
    }

    togglePause() {
        if (this.isPaused) this.resume();
        else this.pause();
    }

    restart() {
        this.reset();
        this.start();
    }

    gameOver(isWin = false, scoreParams = {}) {
        this.isRunning = false;
        this.save();
        
        let minutes = 0;
        // V2 Integrations
        if (this.sessionStartTime) {
            minutes = Math.floor((Date.now() - this.sessionStartTime) / 60000);
            if (minutes > 0) playerProfile.addPlayTime(minutes);
        }
        
        playerProfile.recordGameStats(this.gameId, isWin);
        missionSystem.updateProgress('play', 1);
        missionSystem.updateProgress('score', this.score);
        if (isWin) missionSystem.updateProgress('win', 1);
        
        // AI Coach Feedback
        aiCoach.analyzeGame(this.gameId, this.score, minutes, isWin);
        
        eventBus.emit('GAME_OVER', { gameId: this.gameId, score: this.score, isWin });
        if (isWin) {
            eventBus.emit('GAME_WIN', { gameId: this.gameId, score: this.score });
            if (audioManager) audioManager.playWin();
        } else {
            if (audioManager) audioManager.playGameOver();
        }

        this.onGameOver(isWin, scoreParams);
    }

    save() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            storage.set(`highScore_${this.gameId}`, this.highScore);
        }
    }

    load() {
        this.highScore = storage.get(`highScore_${this.gameId}`, 0);
        return this.highScore;
    }

    addScore(points) {
        this.score += points;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            // Immediate save for critical records, though usually save() handles it at gameOver
            storage.set(`highScore_${this.gameId}`, this.highScore); 
        }
        this.onScoreUpdate(this.score, this.highScore);
    }

    destroy() {
        this.isRunning = false;
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        this.onDestroy();
    }

    loop() {
        if (!this.isRunning || this.isPaused) return;
        
        this.update();
        this.render();
        
        this.animationFrameId = requestAnimationFrame(() => this.loop());
    }

    // --- Abstract Methods to be overridden by child classes ---
    
    // Called when start() is invoked
    onStart() {}
    
    // Called every frame
    update() {}
    
    // Called every frame after update
    render() {}
    
    // Called when game ends
    onGameOver(isWin, params) {}
    
    // Called on pause
    onPause() {}
    
    // Called on resume
    onResume() {}
    
    // Called on restart before start()
    reset() {}

    // Called on destroy
    onDestroy() {}

    // Called when score updates
    onScoreUpdate(score, highScore) {}
}
