import { BaseGame } from './core/BaseGame.js?v=2.5';
import { gameManager } from './core/gameManager.js';
import { audioManager } from './audio/audioManager.js';
import { animationManager } from './animation/animationManager.js';
import { storage } from './core/storage.js';

class ClassicSnakeGame extends BaseGame {
    constructor() {
        super("snake");
        
        this.canvas = document.getElementById("gameBoard");
        this.ctx = this.canvas.getContext("2d");
        
        this.scoreEl = document.getElementById("score");
        this.highScoreEl = document.getElementById("highScore");
        this.speedDisplay = document.getElementById("speedDisplay");
        this.statusText = document.getElementById("statusText");
        this.gameOverOverlay = document.getElementById("gameOverOverlay");
        this.finalScoreMsg = document.getElementById("finalScoreMsg");
        
        this.gridCount = 20; // 20x20 grid
        this.cellSize = 25;  // 25px per cell => 500x500 canvas
        
        this.highScore = storage.get("highScore_snake", 0);
        if (this.highScoreEl) this.highScoreEl.innerText = this.highScore;
        
        this.bindEvents();
        this.resetGame();
        
        gameManager.registerGame(this);
    }

    bindEvents() {
        // Desktop Keyboard Controls
        window.addEventListener("keydown", (e) => {
            if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space", "KeyW", "KeyA", "KeyS", "KeyD"].includes(e.code)) {
                e.preventDefault();
            }
            
            if (e.code === "Space") {
                if (!this.isRunning) {
                    this.start();
                } else {
                    this.togglePause();
                }
                return;
            }
            
            if (!this.isRunning || this.isPaused) return;
            
            if ((e.code === "ArrowLeft" || e.code === "KeyA") && this.direction !== "RIGHT") {
                this.nextDirection = "LEFT";
            } else if ((e.code === "ArrowRight" || e.code === "KeyD") && this.direction !== "LEFT") {
                this.nextDirection = "RIGHT";
            } else if ((e.code === "ArrowUp" || e.code === "KeyW") && this.direction !== "DOWN") {
                this.nextDirection = "UP";
            } else if ((e.code === "ArrowDown" || e.code === "KeyS") && this.direction !== "UP") {
                this.nextDirection = "DOWN";
            }
        });

        // Touch Swipe Controls
        let touchStartX = 0;
        let touchStartY = 0;
        this.canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].clientX;
            touchStartY = e.changedTouches[0].clientY;
        }, { passive: true });

        this.canvas.addEventListener('touchend', (e) => {
            if (!this.isRunning || this.isPaused) return;
            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = e.changedTouches[0].clientY - touchStartY;
            
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 20) {
                if (dx > 0 && this.direction !== "LEFT") this.nextDirection = "RIGHT";
                else if (dx < 0 && this.direction !== "RIGHT") this.nextDirection = "LEFT";
            } else if (Math.abs(dy) > 20) {
                if (dy > 0 && this.direction !== "UP") this.nextDirection = "DOWN";
                else if (dy < 0 && this.direction !== "DOWN") this.nextDirection = "UP";
            }
        }, { passive: true });

        // Mobile D-Pad Buttons
        document.getElementById('dpadUp')?.addEventListener('click', () => {
            if (this.isRunning && !this.isPaused && this.direction !== "DOWN") this.nextDirection = "UP";
        });
        document.getElementById('dpadDown')?.addEventListener('click', () => {
            if (this.isRunning && !this.isPaused && this.direction !== "UP") this.nextDirection = "DOWN";
        });
        document.getElementById('dpadLeft')?.addEventListener('click', () => {
            if (this.isRunning && !this.isPaused && this.direction !== "RIGHT") this.nextDirection = "LEFT";
        });
        document.getElementById('dpadRight')?.addEventListener('click', () => {
            if (this.isRunning && !this.isPaused && this.direction !== "LEFT") this.nextDirection = "RIGHT";
        });

        // UI Buttons
        document.getElementById("startBtn")?.addEventListener("click", () => this.start());
        document.getElementById("restartBtn")?.addEventListener("click", () => this.start());
        document.getElementById("modalRestartBtn")?.addEventListener("click", () => {
            if (this.gameOverOverlay) this.gameOverOverlay.classList.add("d-none");
            this.start();
        });
    }

    resetGame() {
        this.snake = [
            { x: 8, y: 10 },
            { x: 7, y: 10 },
            { x: 6, y: 10 }
        ];
        this.direction = "RIGHT";
        this.nextDirection = "RIGHT";
        this.score = 0;
        this.baseSpeed = 130; // ms per tick
        this.currentSpeed = this.baseSpeed;
        this.lastTickTime = performance.now();
        this.frames = 0;
        
        this.spawnFood();
        this.render();
    }

    spawnFood() {
        let valid = false;
        while (!valid) {
            this.food = {
                x: Math.floor(Math.random() * this.gridCount),
                y: Math.floor(Math.random() * this.gridCount)
            };
            valid = !this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y);
        }
    }

    onStart() {
        this.resetGame();
        if (this.gameOverOverlay) this.gameOverOverlay.classList.add("d-none");
        if (this.scoreEl) this.scoreEl.innerText = "0";
        if (this.speedDisplay) this.speedDisplay.innerText = "1.0x";
        if (this.statusText) this.statusText.innerText = "Slithering...";
        
        this.lastTime = performance.now();
        this.loopId = requestAnimationFrame((t) => this.gameLoop(t));
    }

    onPause() {
        if (this.statusText) this.statusText.innerText = "Paused (Press Space)";
    }

    onResume() {
        if (this.statusText) this.statusText.innerText = "Slithering...";
        this.lastTime = performance.now();
    }

    gameLoop(time) {
        if (!this.isRunning) return;
        
        if (!this.isPaused) {
            // Check if it's time to tick
            if (time - this.lastTickTime >= this.currentSpeed) {
                this.lastTickTime = time;
                this.tick();
            }
            this.frames++;
            this.render();
        }
        
        if (this.isRunning) {
            this.loopId = requestAnimationFrame((t) => this.gameLoop(t));
        }
    }

    tick() {
        this.direction = this.nextDirection;
        const head = { ...this.snake[0] };
        
        if (this.direction === "LEFT") head.x -= 1;
        else if (this.direction === "RIGHT") head.x += 1;
        else if (this.direction === "UP") head.y -= 1;
        else if (this.direction === "DOWN") head.y += 1;
        
        // Wall Collision
        if (head.x < 0 || head.x >= this.gridCount || head.y < 0 || head.y >= this.gridCount) {
            return this.handleGameOver();
        }
        
        // Self Collision
        for (let i = 0; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                return this.handleGameOver();
            }
        }
        
        this.snake.unshift(head);
        
        // Eat Food
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            if (this.scoreEl) this.scoreEl.innerText = this.score;
            
            // Speed up slightly as snake grows
            this.currentSpeed = Math.max(65, this.baseSpeed - Math.floor(this.snake.length * 1.8));
            const speedMultiplier = (this.baseSpeed / this.currentSpeed).toFixed(1);
            if (this.speedDisplay) this.speedDisplay.innerText = `${speedMultiplier}x`;
            
            if (audioManager) audioManager.playTone(580 + (this.snake.length * 15), "sine", 0.08, 0.3);
            this.spawnFood();
        } else {
            this.snake.pop();
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 1. Draw Food (Realistic Glowing Apple)
        this.drawApple(this.food.x, this.food.y);
        
        // 2. Draw Snake
        for (let i = this.snake.length - 1; i >= 0; i--) {
            const seg = this.snake[i];
            const isHead = i === 0;
            
            if (isHead) {
                this.drawSnakeHead(seg.x, seg.y, this.direction);
            } else {
                const prev = this.snake[i - 1];
                this.drawSnakeBody(seg.x, seg.y, prev, i);
            }
        }
    }

    drawApple(gx, gy) {
        const cx = gx * this.cellSize + this.cellSize / 2;
        const cy = gy * this.cellSize + this.cellSize / 2;
        const r = this.cellSize / 2 - 2;
        
        this.ctx.save();
        
        // Glow effect
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#ef4444';
        
        // Apple Body Gradient
        const appleGrad = this.ctx.createRadialGradient(cx - 2, cy - 2, 2, cx, cy, r);
        appleGrad.addColorStop(0, '#f87171');
        appleGrad.addColorStop(0.5, '#ef4444');
        appleGrad.addColorStop(1, '#991b1b');
        
        this.ctx.fillStyle = appleGrad;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.shadowBlur = 0; // reset shadow
        
        // Specular highlight dot
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.beginPath();
        this.ctx.arc(cx - r * 0.35, cy - r * 0.35, r * 0.25, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Little green stem / leaf
        this.ctx.fillStyle = '#22c55e';
        this.ctx.beginPath();
        this.ctx.ellipse(cx + 2, cy - r + 1, 4, 2, Math.PI / 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }

    drawSnakeHead(gx, gy, dir) {
        const cx = gx * this.cellSize + this.cellSize / 2;
        const cy = gy * this.cellSize + this.cellSize / 2;
        const r = this.cellSize / 2 - 1;
        
        this.ctx.save();
        this.ctx.translate(cx, cy);
        
        let angle = 0;
        if (dir === "RIGHT") angle = 0;
        else if (dir === "DOWN") angle = Math.PI / 2;
        else if (dir === "LEFT") angle = Math.PI;
        else if (dir === "UP") angle = -Math.PI / 2;
        
        this.ctx.rotate(angle);
        
        // Flickering Forked Tongue
        if (Math.sin(this.frames * 0.3) > 0.2) {
            this.ctx.strokeStyle = '#ef4444';
            this.ctx.lineWidth = 1.5;
            this.ctx.beginPath();
            this.ctx.moveTo(r, 0);
            this.ctx.lineTo(r + 6, 0);
            this.ctx.lineTo(r + 9, -2.5);
            this.ctx.moveTo(r + 6, 0);
            this.ctx.lineTo(r + 9, 2.5);
            this.ctx.stroke();
        }
        
        // Head Gradient
        const headGrad = this.ctx.createRadialGradient(-2, -2, 2, 0, 0, r);
        headGrad.addColorStop(0, '#86efac');
        headGrad.addColorStop(0.5, '#22c55e');
        headGrad.addColorStop(1, '#15803d');
        
        this.ctx.fillStyle = headGrad;
        this.ctx.strokeStyle = '#14532d';
        this.ctx.lineWidth = 1.5;
        
        this.ctx.beginPath();
        this.ctx.roundRect(-r, -r, r * 2, r * 2, [6, 10, 10, 6]);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Snake Eyes
        const eyeOffsetX = 2;
        const eyeOffsetY = 5;
        
        // White sclera
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(eyeOffsetX, -eyeOffsetY, 3, 0, Math.PI * 2);
        this.ctx.arc(eyeOffsetX, eyeOffsetY, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Black pupils looking forward
        this.ctx.fillStyle = '#0f172a';
        this.ctx.beginPath();
        this.ctx.arc(eyeOffsetX + 1, -eyeOffsetY, 1.6, 0, Math.PI * 2);
        this.ctx.arc(eyeOffsetX + 1, eyeOffsetY, 1.6, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }

    drawSnakeBody(gx, gy, prev, index) {
        const x = gx * this.cellSize + 1.5;
        const y = gy * this.cellSize + 1.5;
        const size = this.cellSize - 3;
        
        this.ctx.save();
        
        // Alternating scale pattern
        const isAlt = index % 2 === 0;
        const bodyGrad = this.ctx.createLinearGradient(x, y, x + size, y + size);
        if (isAlt) {
            bodyGrad.addColorStop(0, '#4ade80');
            bodyGrad.addColorStop(1, '#16a34a');
        } else {
            bodyGrad.addColorStop(0, '#22c55e');
            bodyGrad.addColorStop(1, '#15803d');
        }
        
        this.ctx.fillStyle = bodyGrad;
        this.ctx.strokeStyle = '#14532d';
        this.ctx.lineWidth = 1;
        
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, size, size, 5);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Scale inner dot accent
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        this.ctx.beginPath();
        this.ctx.arc(x + size / 2, y + size / 2, size * 0.2, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }

    handleGameOver() {
        this.isRunning = false;
        if (audioManager) audioManager.playTone(110, "sawtooth", 0.5, 0.5);
        
        if (this.statusText) this.statusText.innerText = "Game Over 💀";
        if (this.gameOverOverlay) this.gameOverOverlay.classList.remove("d-none");
        if (this.finalScoreMsg) this.finalScoreMsg.innerText = `Score: ${this.score}`;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            storage.set("highScore_snake", this.highScore);
            if (this.highScoreEl) this.highScoreEl.innerText = this.highScore;
            if (animationManager) animationManager.spawnConfetti(window.innerWidth / 2, window.innerHeight / 2, 80);
        }
        
        this.addScore(this.score);
        this.gameOver(false);
    }

    onDestroy() {
        if (this.loopId) cancelAnimationFrame(this.loopId);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", () => {
        new ClassicSnakeGame();
    });
} else {
    new ClassicSnakeGame();
}