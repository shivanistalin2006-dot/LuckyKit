import { BaseGame } from './core/BaseGame.js';
import { gameManager } from './core/gameManager.js';

class NeonSerpent extends BaseGame {
    constructor() {
        super("neon_serpent");
        
        this.canvas = document.getElementById("gameBoard");
        this.ctx = this.canvas.getContext("2d");
        
        this.scoreEl = document.getElementById("score");
        this.highScoreEl = document.getElementById("highScore");
        this.statusText = document.getElementById("statusText");
        
        this.highScoreEl.innerText = this.highScore;
        this.box = 20;

        // Input Bindings
        document.addEventListener("keydown", (e) => {
            if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
                e.preventDefault();
            }
            if(e.key === "ArrowLeft" && this.direction !== "RIGHT") this.direction = "LEFT";
            if(e.key === "ArrowRight" && this.direction !== "LEFT") this.direction = "RIGHT";
            if(e.key === "ArrowUp" && this.direction !== "DOWN") this.direction = "UP";
            if(e.key === "ArrowDown" && this.direction !== "UP") this.direction = "DOWN";
        });

        // Touch Controls
        this.touchStartX = 0;
        this.touchStartY = 0;
        document.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
            this.touchStartY = e.changedTouches[0].screenY;
        }, {passive: true});

        document.addEventListener('touchend', (e) => {
            let touchEndX = e.changedTouches[0].screenX;
            let touchEndY = e.changedTouches[0].screenY;
            let dx = touchEndX - this.touchStartX;
            let dy = touchEndY - this.touchStartY;
            
            if(Math.abs(dx) > Math.abs(dy)) {
                if(dx > 30 && this.direction !== "LEFT") this.direction = "RIGHT";
                else if(dx < -30 && this.direction !== "RIGHT") this.direction = "LEFT";
            } else {
                if(dy > 30 && this.direction !== "UP") this.direction = "DOWN";
                else if(dy < -30 && this.direction !== "DOWN") this.direction = "UP";
            }
        }, {passive: true});

        gameManager.registerGame(this);
    }

    reset() {
        this.snake = [{x: 200, y: 200}];
        this.direction = "RIGHT";
        this.lastUpdate = Date.now();
        this.spawnFood();
    }

    spawnFood() {
        this.food = {
            x: Math.floor(Math.random() * 20) * this.box,
            y: Math.floor(Math.random() * 20) * this.box
        };
    }

    onStart() {
        this.reset();
        this.scoreEl.innerText = this.score;
        this.statusText.innerText = "Playing...";
    }

    onScoreUpdate(score, highScore) {
        this.scoreEl.innerText = score;
        this.highScoreEl.innerText = highScore;
    }

    update() {
        const now = Date.now();
        // Speed up as snake gets longer
        const speed = Math.max(60, 200 - (this.snake.length * 3));
        
        if (now - this.lastUpdate > speed) {
            this.tick();
            this.lastUpdate = now;
        }
    }

    tick() {
        let head = { ...this.snake[0] };

        if(this.direction === "LEFT") head.x -= this.box;
        if(this.direction === "RIGHT") head.x += this.box;
        if(this.direction === "UP") head.y -= this.box;
        if(this.direction === "DOWN") head.y += this.box;

        if(head.x < 0 || head.x >= 400 || head.y < 0 || head.y >= 400) {
            return this.gameOver(false);
        }

        for(let i = 0; i < this.snake.length; i++) {
            if(head.x === this.snake[i].x && head.y === this.snake[i].y) {
                return this.gameOver(false);
            }
        }

        this.snake.unshift(head);

        if(head.x === this.food.x && head.y === this.food.y) {
            this.addScore(1);
            if (window.ArcadeSounds) window.ArcadeSounds.playTone(800, "sine", 0.05);
            this.spawnFood();
        } else {
            this.snake.pop();
        }
    }

    render() {
        this.ctx.clearRect(0, 0, 400, 400);

        // Draw Food (Glowing Apple)
        this.ctx.save();
        this.ctx.fillStyle = "#ef4444";
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = "#ef4444";
        this.ctx.beginPath();
        this.ctx.arc(this.food.x + this.box/2, this.food.y + this.box/2, this.box/2 - 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();

        // Draw Snake (Glowing Segments)
        for(let i = 0; i < this.snake.length; i++) {
            this.ctx.save();
            const isHead = i === 0;
            this.ctx.fillStyle = isHead ? "#22c55e" : "#16a34a";
            this.ctx.shadowBlur = isHead ? 20 : 10;
            this.ctx.shadowColor = "#22c55e";
            
            // Render slightly smaller squares for segments to show grid gap
            const gap = 2;
            this.ctx.fillRect(this.snake[i].x + gap, this.snake[i].y + gap, this.box - gap*2, this.box - gap*2);
            this.ctx.restore();
        }
    }

    onGameOver(isWin) {
        this.statusText.innerText = "Game Over 💀";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const game = new NeonSerpent();
    
    // Draw initial state so canvas isn't blank
    game.reset();
    game.render();

    const startBtn = document.getElementById("startBtn");
    const restartBtn = document.getElementById("restartBtn");
    const homeBtn = document.getElementById("homeBtn");

    if (startBtn) startBtn.onclick = () => game.start();
    if (restartBtn) restartBtn.onclick = () => game.start();
    if (homeBtn) homeBtn.onclick = () => { window.location.href = "index.html"; };
});