import { BaseGame } from './core/BaseGame.js';
import { gameManager } from './core/gameManager.js';
import { audioManager } from './audio/audioManager.js';
import { animationManager } from './animation/animationManager.js';
import { storage } from './core/storage.js';

class MidnightRunner extends BaseGame {
    constructor() {
        super("runner");
        
        this.container = document.getElementById('runnerContainer');
        this.canvas = document.getElementById('runnerCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.scoreDisplay = document.getElementById('scoreDisplay');
        this.hsDisplay = document.getElementById('hsDisplay');
        this.speedDisplay = document.getElementById('speedDisplay');
        this.statusMsg = document.getElementById('statusMsg');
        this.gameOverOverlay = document.getElementById('gameOverOverlay');
        this.finalScoreMsg = document.getElementById('finalScoreMsg');
        
        this.bgCityBack = document.getElementById('bgCityBack');
        this.bgCityFront = document.getElementById('bgCityFront');
        this.bgRoad = document.getElementById('bgRoad');
        
        this.highScore = storage.get('highScore_runner', 0);
        this.hsDisplay.textContent = this.highScore;
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.bindEvents();
        
        this.resetGameVariables();
        
        gameManager.registerGame(this);
    }

    resizeCanvas() {
        if (!this.container) return;
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
        this.groundY = this.canvas.height * 0.8; // Match the 20% road height in CSS
    }

    bindEvents() {
        document.getElementById('restartBtn')?.addEventListener('click', () => this.start());
        document.getElementById('tryAgainBtn')?.addEventListener('click', () => {
            this.gameOverOverlay.classList.add('d-none');
            this.start();
        });
        
        // Input hooks
        window.addEventListener('keydown', (e) => {
            if ((e.code === 'Space' || e.code === 'ArrowUp') && this.isRunning && !this.isPaused) {
                e.preventDefault();
                this.jump();
            }
        });
        
        this.container.addEventListener('mousedown', (e) => {
            if (this.isRunning && !this.isPaused) this.jump();
        });
        
        this.container.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.isRunning && !this.isPaused) this.jump();
        }, { passive: false });
    }

    resetGameVariables() {
        this.score = 0;
        this.baseSpeed = 5;
        this.currentSpeed = this.baseSpeed;
        this.distance = 0;
        
        this.bgOffsets = {
            cityBack: 0,
            cityFront: 0,
            road: 0
        };
        
        this.player = {
            x: 50,
            y: 0,
            width: 40,
            height: 40,
            vy: 0,
            gravity: 0.6,
            jumpPower: -12,
            isGrounded: false,
            rotation: 0
        };
        this.player.y = this.groundY - this.player.height;
        
        this.obstacles = [];
        this.frames = 0;
        this.nextObstacleFrame = 60;
    }

    onStart() {
        this.resetGameVariables();
        this.gameOverOverlay.classList.add('d-none');
        this.scoreDisplay.textContent = '0';
        this.speedDisplay.textContent = '1.0x';
        this.statusMsg.textContent = "Running...";
        this.statusMsg.className = "text-center mt-3 fs-5 text-theme";
        
        // Use the built-in game loop from BaseGame by requesting frames
        this.lastTime = performance.now();
        this.loopId = requestAnimationFrame((t) => this.gameLoop(t));
    }

    jump() {
        if (this.player.isGrounded) {
            this.player.vy = this.player.jumpPower;
            this.player.isGrounded = false;
            if (audioManager) audioManager.playTone(400, 'square', 0.1);
        }
    }

    spawnObstacle() {
        const types = [
            { width: 30, height: 40, color: '#ef4444' }, // Tall cone
            { width: 60, height: 25, color: '#f59e0b' }, // Wide barricade
            { width: 40, height: 35, color: '#ec4899' }  // Neon box
        ];
        
        const type = types[Math.floor(Math.random() * types.length)];
        
        this.obstacles.push({
            x: this.canvas.width,
            y: this.groundY - type.height,
            width: type.width,
            height: type.height,
            color: type.color
        });
        
        // Calculate next spawn based on current speed
        const minGap = 100;
        const maxGap = 300;
        const framesToWait = Math.floor((minGap + Math.random() * maxGap) / this.currentSpeed);
        this.nextObstacleFrame = this.frames + Math.max(30, framesToWait);
    }

    update(dt) {
        // Adjust speed
        this.distance += this.currentSpeed * (dt / 16.66);
        this.score = Math.floor(this.distance / 10);
        this.scoreDisplay.textContent = this.score;
        
        // Speed scaling (max out at 3x)
        const speedMultiplier = Math.min(3.0, 1 + (this.score / 1000));
        this.currentSpeed = this.baseSpeed * speedMultiplier;
        this.speedDisplay.textContent = speedMultiplier.toFixed(1) + 'x';
        
        // Physics
        this.player.vy += this.player.gravity;
        this.player.y += this.player.vy;
        
        if (this.player.y >= this.groundY - this.player.height) {
            this.player.y = this.groundY - this.player.height;
            this.player.vy = 0;
            this.player.isGrounded = true;
            this.player.rotation = 0;
        } else {
            // Spin slightly when jumping
            this.player.rotation += 0.1;
        }
        
        // Obstacles
        if (this.frames >= this.nextObstacleFrame) {
            this.spawnObstacle();
        }
        
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.x -= this.currentSpeed * (dt / 16.66);
            
            // Collision Detection (AABB)
            // Add a small forgiving hitbox margin (5px)
            const margin = 5;
            if (this.player.x + margin < obs.x + obs.width &&
                this.player.x + this.player.width - margin > obs.x &&
                this.player.y + margin < obs.y + obs.height &&
                this.player.y + this.player.height - margin > obs.y) {
                
                this.handleCrash();
                return; // Stop updating
            }
            
            if (obs.x + obs.width < 0) {
                this.obstacles.splice(i, 1);
            }
        }
        
        // Update Parallax Offsets
        this.bgOffsets.cityBack = (this.bgOffsets.cityBack - (this.currentSpeed * 0.2)) % this.container.clientWidth;
        this.bgOffsets.cityFront = (this.bgOffsets.cityFront - (this.currentSpeed * 0.5)) % this.container.clientWidth;
        this.bgOffsets.road = (this.bgOffsets.road - this.currentSpeed) % 100; // Match CSS background-size
        
        // Apply CSS Transforms for smooth background scrolling
        this.bgCityBack.style.transform = `translateX(${this.bgOffsets.cityBack}px)`;
        this.bgCityFront.style.transform = `translateX(${this.bgOffsets.cityFront}px)`;
        this.bgRoad.style.backgroundPosition = `${this.bgOffsets.road}px center`;
        
        this.frames++;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw Player (Neon Bike/Runner abstract shape)
        this.ctx.save();
        this.ctx.translate(this.player.x + this.player.width/2, this.player.y + this.player.height/2);
        if (!this.player.isGrounded) this.ctx.rotate(this.player.rotation);
        
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#0ea5e9';
        this.ctx.fillStyle = '#0284c7'; // solid blue
        
        // Draw an abstract cycle/runner shape
        this.ctx.beginPath();
        this.ctx.roundRect(-this.player.width/2, -this.player.height/2, this.player.width, this.player.height, 8);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#bae6fd'; // inner core
        this.ctx.beginPath();
        this.ctx.roundRect(-this.player.width/4, -this.player.height/4, this.player.width/2, this.player.height/2, 4);
        this.ctx.fill();
        
        this.ctx.restore();
        
        // Particle exhaust effect behind player
        if (this.player.isGrounded && this.frames % 5 === 0 && animationManager) {
            // We're using standard canvas, but we could trigger DOM particles if we want.
            // Let's just draw simple canvas particles for exhaust
        }
        
        // Draw Obstacles
        for (const obs of this.obstacles) {
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = obs.color;
            this.ctx.fillStyle = obs.color;
            this.ctx.beginPath();
            this.ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 4);
            this.ctx.fill();
            
            // Highlight
            this.ctx.fillStyle = 'rgba(255,255,255,0.3)';
            this.ctx.fillRect(obs.x, obs.y, obs.width, 4);
        }
        
        this.ctx.shadowBlur = 0; // Reset
    }

    gameLoop(time) {
        if (!this.isRunning || this.isPaused) {
            this.lastTime = time;
            this.loopId = requestAnimationFrame((t) => this.gameLoop(t));
            return;
        }
        
        const dt = time - this.lastTime;
        this.lastTime = time;
        
        this.update(dt);
        
        // If crash occurred during update, isRunning might be false
        if (this.isRunning) {
            this.draw();
            this.loopId = requestAnimationFrame((t) => this.gameLoop(t));
        }
    }

    handleCrash() {
        if (audioManager) audioManager.playTone(100, 'sawtooth', 0.5, 0.5); // Crash sound
        this.statusMsg.textContent = "CRITICAL FAILURE";
        this.statusMsg.className = "text-center mt-3 fs-5 text-danger fw-bold";
        
        this.gameOverOverlay.classList.remove('d-none');
        this.finalScoreMsg.textContent = `Distance: ${this.score}m`;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            storage.set('highScore_runner', this.highScore);
            this.hsDisplay.textContent = this.highScore;
            if (animationManager) animationManager.spawnConfetti(window.innerWidth/2, window.innerHeight/2, 100);
        }
        
        // BaseGame Economy
        this.addScore(this.score);
        
        this.gameOver(false); // Player inherently loses endless runner
    }

    onDestroy() {
        if (this.loopId) cancelAnimationFrame(this.loopId);
    }
}

// Add instructions
gameManager.GAME_INSTRUCTIONS = gameManager.GAME_INSTRUCTIONS || {};
gameManager.GAME_INSTRUCTIONS["runner"] = {
    title: "Midnight Runner",
    objective: "Survive as long as possible by dodging obstacles.",
    controls: "Tap (Mobile) or Space/Up Arrow (Desktop) to Jump.",
    win: "Get the highest distance score possible.",
    lose: "Crash into any neon obstacle.",
    tips: "The game speeds up over time. Time your jumps perfectly!"
};

if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", () => {
        const game = new MidnightRunner();
    });
} else {
    const game = new MidnightRunner();
}