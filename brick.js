import { BaseGame } from './core/BaseGame.js';
import { gameManager } from './core/gameManager.js';

class NeonShatter extends BaseGame {
    constructor() {
        super("neon_shatter");
        
        this.canvas = document.getElementById("brickCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.scoreEl = document.getElementById("score");
        this.livesEl = document.getElementById("lives");
        this.highScoreEl = document.getElementById("highScore");
        this.overlay = document.getElementById("overlay");
        this.overlayTitle = document.getElementById("overlayTitle");
        this.overlaySub = document.getElementById("overlaySub");

        this.highScoreEl.innerText = this.highScore;

        this.keys = {};
        window.addEventListener("keydown", (e) => this.keys[e.code] = true);
        window.addEventListener("keyup", (e) => this.keys[e.code] = false);

        this.canvas.addEventListener("mousemove", (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.paddle.x = (e.clientX - rect.left) * (this.canvas.width / rect.width) - this.paddle.w / 2;
            this.clampPaddle();
        });

        this.canvas.addEventListener("touchmove", (e) => {
            if (!e.touches[0]) return;
            const rect = this.canvas.getBoundingClientRect();
            this.paddle.x = (e.touches[0].clientX - rect.left) * (this.canvas.width / rect.width) - this.paddle.w / 2;
            this.clampPaddle();
        }, { passive: true });

        gameManager.registerGame(this);
    }

    clampPaddle() {
        this.paddle.x = Math.max(0, Math.min(this.canvas.width - this.paddle.w, this.paddle.x));
    }

    reset() {
        this.paddle = {
            w: 110, h: 14, x: (this.canvas.width - 110) / 2, y: this.canvas.height - 30, speed: 8, color: "#0ea5e9"
        };
        this.ball = {
            x: this.canvas.width / 2, y: this.canvas.height - 50, r: 8, speed: 6, dx: 4, dy: -5, color: "#38bdf8"
        };
        this.lives = 3;
        this.particles = [];
        this.initBricks();
    }

    initBricks() {
        this.brickRows = 5;
        this.brickCols = 8;
        this.brickPadding = 10;
        this.brickOffsetTop = 40;
        this.brickOffsetLeft = 25;
        this.brickWidth = (this.canvas.width - (this.brickOffsetLeft * 2) - (this.brickPadding * (this.brickCols - 1))) / this.brickCols;
        this.brickHeight = 22;
        this.rowColors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4"];
        
        this.bricks = [];
        for (let r = 0; r < this.brickRows; r++) {
            this.bricks[r] = [];
            for (let c = 0; c < this.brickCols; c++) {
                this.bricks[r][c] = {
                    x: this.brickOffsetLeft + c * (this.brickWidth + this.brickPadding),
                    y: this.brickOffsetTop + r * (this.brickHeight + this.brickPadding),
                    status: 1,
                    color: this.rowColors[r],
                    scoreValue: (this.brickRows - r) * 20
                };
            }
        }
    }

    onStart() {
        this.reset();
        this.scoreEl.innerText = this.score;
        this.livesEl.innerText = "❤️".repeat(this.lives);
        this.overlay.classList.add("d-none");
        this.overlay.classList.remove("d-flex");
    }

    onScoreUpdate(score, highScore) {
        this.scoreEl.innerText = score;
        this.highScoreEl.innerText = highScore;
    }

    resetBallAndPaddle() {
        this.paddle.x = (this.canvas.width - this.paddle.w) / 2;
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height - 50;
        this.ball.dx = (Math.random() > 0.5 ? 1 : -1) * 4;
        this.ball.dy = -5;
    }

    createExplosion(x, y, color) {
        for (let i = 0; i < 12; i++) {
            this.particles.push({
                x: x, y: y,
                vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6,
                size: Math.random() * 3 + 2, color: color, alpha: 1, life: Math.random() * 0.04 + 0.02
            });
        }
    }

    update() {
        if (this.keys["ArrowLeft"] || this.keys["KeyA"]) this.paddle.x -= this.paddle.speed;
        if (this.keys["ArrowRight"] || this.keys["KeyD"]) this.paddle.x += this.paddle.speed;
        this.clampPaddle();

        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;

        if (this.ball.x + this.ball.r > this.canvas.width || this.ball.x - this.ball.r < 0) {
            this.ball.dx = -this.ball.dx;
            if (window.ArcadeSounds) window.ArcadeSounds.playSelect();
        }
        if (this.ball.y - this.ball.r < 0) {
            this.ball.dy = -this.ball.dy;
            if (window.ArcadeSounds) window.ArcadeSounds.playSelect();
        }

        if (this.ball.y + this.ball.r >= this.paddle.y && this.ball.y - this.ball.r <= this.paddle.y + this.paddle.h) {
            if (this.ball.x >= this.paddle.x && this.ball.x <= this.paddle.x + this.paddle.w) {
                this.ball.dy = -Math.abs(this.ball.dy);
                const hitPoint = (this.ball.x - (this.paddle.x + this.paddle.w / 2)) / (this.paddle.w / 2);
                this.ball.dx = hitPoint * 6;
                if (window.ArcadeSounds) window.ArcadeSounds.playTone(400, "sine", 0.08);
            }
        }

        if (this.ball.y + this.ball.r > this.canvas.height) {
            this.lives--;
            this.livesEl.innerText = "❤️".repeat(Math.max(0, this.lives));
            if (window.ArcadeSounds) window.ArcadeSounds.playLose();

            if (this.lives <= 0) {
                this.gameOver(false);
                return;
            } else {
                this.resetBallAndPaddle();
            }
        }

        let remainingBricks = 0;
        for (let r = 0; r < this.brickRows; r++) {
            for (let c = 0; c < this.brickCols; c++) {
                const b = this.bricks[r][c];
                if (b.status === 1) {
                    remainingBricks++;
                    if (this.ball.x + this.ball.r > b.x && this.ball.x - this.ball.r < b.x + this.brickWidth &&
                        this.ball.y + this.ball.r > b.y && this.ball.y - this.ball.r < b.y + this.brickHeight) {
                        
                        this.ball.dy = -this.ball.dy;
                        b.status = 0;
                        this.addScore(b.scoreValue);
                        this.createExplosion(b.x + this.brickWidth / 2, b.y + this.brickHeight / 2, b.color);
                        if (window.ArcadeSounds) window.ArcadeSounds.playTone(600 + r * 100, "square", 0.05);
                    }
                }
            }
        }

        if (remainingBricks === 0) {
            this.gameOver(true);
            return;
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.life;
            if (p.alpha <= 0) this.particles.splice(i, 1);
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let r = 0; r < this.brickRows; r++) {
            for (let c = 0; c < this.brickCols; c++) {
                const b = this.bricks[r][c];
                if (b.status === 1) {
                    this.ctx.save();
                    this.ctx.fillStyle = b.color;
                    this.ctx.shadowBlur = 12;
                    this.ctx.shadowColor = b.color;
                    this.ctx.beginPath();
                    this.ctx.roundRect(b.x, b.y, this.brickWidth, this.brickHeight, 6);
                    this.ctx.fill();
                    this.ctx.restore();
                }
            }
        }

        this.ctx.save();
        this.ctx.fillStyle = this.paddle.color;
        this.ctx.shadowBlur = 16;
        this.ctx.shadowColor = this.paddle.color;
        this.ctx.beginPath();
        this.ctx.roundRect(this.paddle.x, this.paddle.y, this.paddle.w, this.paddle.h, 7);
        this.ctx.fill();
        this.ctx.restore();

        this.ctx.save();
        this.ctx.fillStyle = this.ball.color;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = this.ball.color;
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.r, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();

        this.particles.forEach(p => {
            this.ctx.save();
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fillStyle = p.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    onGameOver(isWin) {
        if (isWin) {
            this.overlayTitle.innerText = "Level Cleared! 🎉";
            this.overlayTitle.className = "fw-black fs-1 mb-2 text-success";
            this.overlaySub.innerText = `Outstanding! Total Score: ${this.score}`;
        } else {
            this.overlayTitle.innerText = "Game Over!";
            this.overlayTitle.className = "fw-black fs-1 mb-2 text-danger";
            this.overlaySub.innerText = `Bricks remaining. Final Score: ${this.score}`;
        }
        this.overlay.classList.remove("d-none");
        this.overlay.classList.add("d-flex");
    }
}

if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", () => {
    const game = new NeonShatter();
    document.getElementById("startBtn").addEventListener("click", () => game.start());
    document.getElementById("overlayStartBtn").addEventListener("click", () => game.start());
});
} else {
    const _init = () => {
    const game = new NeonShatter();
    document.getElementById("startBtn").addEventListener("click", () => game.start());
    document.getElementById("overlayStartBtn").addEventListener("click", () => game.start());
};
    _init();
}
