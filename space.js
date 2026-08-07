import { BaseGame } from './core/BaseGame.js';
import { gameManager } from './core/gameManager.js';

class CosmicStrike extends BaseGame {
    constructor() {
        super("space_strike");
        
        this.canvas = document.getElementById("spaceCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.scoreEl = document.getElementById("score");
        this.livesEl = document.getElementById("lives");
        this.highScoreEl = document.getElementById("highScore");
        this.overlay = document.getElementById("overlay");
        this.overlayTitle = document.getElementById("overlayTitle");
        this.overlaySub = document.getElementById("overlaySub");

        this.highScoreEl.innerText = this.highScore;

        // Input States
        this.keys = {};
        window.addEventListener("keydown", (e) => this.keys[e.code] = true);
        window.addEventListener("keyup", (e) => this.keys[e.code] = false);

        // Mouse / Touch Drag Support
        this.isDragging = false;
        this.canvas.addEventListener("mousedown", (e) => { this.isDragging = true; this.updateMousePlayerPos(e); });
        this.canvas.addEventListener("mousemove", (e) => { if (this.isDragging) this.updateMousePlayerPos(e); });
        window.addEventListener("mouseup", () => this.isDragging = false);

        this.canvas.addEventListener("touchstart", (e) => { this.isDragging = true; this.updateTouchPlayerPos(e); }, { passive: true });
        this.canvas.addEventListener("touchmove", (e) => { if (this.isDragging) this.updateTouchPlayerPos(e); }, { passive: true });
        this.canvas.addEventListener("touchend", () => this.isDragging = false, { passive: true });

        gameManager.registerGame(this);
    }

    updateMousePlayerPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.player.x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        this.player.y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
        this.clampPlayer();
    }

    updateTouchPlayerPos(e) {
        if (!e.touches[0]) return;
        const rect = this.canvas.getBoundingClientRect();
        this.player.x = (e.touches[0].clientX - rect.left) * (this.canvas.width / rect.width);
        this.player.y = (e.touches[0].clientY - rect.top) * (this.canvas.height / rect.height) - 40;
        this.clampPlayer();
    }

    clampPlayer() {
        this.player.x = Math.max(this.player.w / 2, Math.min(this.canvas.width - this.player.w / 2, this.player.x));
        this.player.y = Math.max(this.player.h / 2, Math.min(this.canvas.height - this.player.h / 2, this.player.y));
    }

    reset() {
        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 60,
            w: 40,
            h: 40,
            speed: 7,
            color: "#06b6d4"
        };
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.stars = [];
        this.lastShootTime = 0;
        this.lives = 3;

        for (let i = 0; i < 70; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.8 + 0.2
            });
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

    spawnEnemy() {
        if (Math.random() < 0.045) {
            const size = Math.random() * 20 + 25;
            this.enemies.push({
                x: Math.random() * (this.canvas.width - size) + size / 2,
                y: -size,
                size: size,
                speed: Math.random() * 2.5 + 1.5,
                color: ["#ef4444", "#a855f7", "#ec4899", "#f97316"][Math.floor(Math.random() * 4)],
                type: Math.random() > 0.5 ? "alien" : "asteroid",
                angle: 0,
                spinSpeed: (Math.random() - 0.5) * 0.08
            });
        }
    }

    createExplosion(x, y, color) {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                size: Math.random() * 4 + 2,
                color: color,
                alpha: 1,
                life: Math.random() * 0.04 + 0.02
            });
        }
    }

    shoot() {
        this.bullets.push({
            x: this.player.x,
            y: this.player.y - this.player.h / 2,
            speed: 12,
            w: 4,
            h: 16,
            color: "#38bdf8"
        });
        if (window.ArcadeSounds) window.ArcadeSounds.playSelect();
    }

    update() {
        // Keyboard controls
        if (this.keys["ArrowLeft"] || this.keys["KeyA"]) this.player.x -= this.player.speed;
        if (this.keys["ArrowRight"] || this.keys["KeyD"]) this.player.x += this.player.speed;
        if (this.keys["ArrowUp"] || this.keys["KeyW"]) this.player.y -= this.player.speed;
        if (this.keys["ArrowDown"] || this.keys["KeyS"]) this.player.y += this.player.speed;
        this.clampPlayer();

        const now = Date.now();
        if (this.keys["Space"] || now - this.lastShootTime > 220) {
            this.shoot();
            this.lastShootTime = now;
        }

        // Stars
        this.stars.forEach(s => {
            s.y += s.speed;
            if (s.y > this.canvas.height) {
                s.y = 0;
                s.x = Math.random() * this.canvas.width;
            }
        });

        // Bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.y -= b.speed;
            if (b.y < -20) this.bullets.splice(i, 1);
        }

        // Enemies
        this.spawnEnemy();
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];
            e.y += e.speed;
            e.angle += e.spinSpeed;

            const distToPlayer = Math.hypot(e.x - this.player.x, e.y - this.player.y);
            if (distToPlayer < e.size / 2 + this.player.w / 3) {
                this.createExplosion(e.x, e.y, e.color);
                this.enemies.splice(i, 1);
                this.lives--;
                this.livesEl.innerText = "❤️".repeat(Math.max(0, this.lives));
                
                if (this.lives <= 0) {
                    this.gameOver(false);
                    return;
                } else {
                    if (window.ArcadeSounds) window.ArcadeSounds.playLose();
                }
                continue;
            }

            for (let j = this.bullets.length - 1; j >= 0; j--) {
                const b = this.bullets[j];
                const distToBullet = Math.hypot(e.x - b.x, e.y - b.y);
                if (distToBullet < e.size / 2 + b.w) {
                    this.createExplosion(e.x, e.y, e.color);
                    this.enemies.splice(i, 1);
                    this.bullets.splice(j, 1);
                    this.addScore(100);
                    break;
                }
            }

            if (e.y > this.canvas.height + 40) this.enemies.splice(i, 1);
        }

        // Particles
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

        this.stars.forEach(s => {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
            this.ctx.fillRect(s.x, s.y, s.size, s.size);
        });

        this.ctx.save();
        this.ctx.translate(this.player.x, this.player.y);
        
        this.ctx.fillStyle = "#f97316";
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = "#f97316";
        this.ctx.beginPath();
        this.ctx.moveTo(-8, 15);
        this.ctx.lineTo(0, 25 + Math.random() * 6);
        this.ctx.lineTo(8, 15);
        this.ctx.fill();

        this.ctx.fillStyle = this.player.color;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = this.player.color;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -22);
        this.ctx.lineTo(18, 18);
        this.ctx.lineTo(0, 10);
        this.ctx.lineTo(-18, 18);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.fillStyle = "#fff";
        this.ctx.beginPath();
        this.ctx.arc(0, -2, 5, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();

        this.bullets.forEach(b => {
            this.ctx.fillStyle = b.color;
            this.ctx.shadowBlur = 12;
            this.ctx.shadowColor = b.color;
            this.ctx.fillRect(b.x - b.w / 2, b.y, b.w, b.h);
        });

        this.enemies.forEach(e => {
            this.ctx.save();
            this.ctx.translate(e.x, e.y);
            this.ctx.rotate(e.angle);
            this.ctx.fillStyle = e.color;
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = e.color;

            if (e.type === "alien") {
                this.ctx.beginPath();
                this.ctx.moveTo(0, e.size / 2);
                this.ctx.lineTo(e.size / 2, -e.size / 2);
                this.ctx.lineTo(-e.size / 2, -e.size / 2);
                this.ctx.closePath();
                this.ctx.fill();
            } else {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, e.size / 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
            this.ctx.restore();
        });

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

        this.ctx.shadowBlur = 0;
    }

    onGameOver(isWin) {
        this.overlayTitle.innerText = "Mission Failed! 💥";
        this.overlaySub.innerText = `Final Score: ${this.score} points`;
        this.overlay.classList.remove("d-none");
        this.overlay.classList.add("d-flex");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const game = new CosmicStrike();
    document.getElementById("startBtn").addEventListener("click", () => game.start());
    document.getElementById("overlayStartBtn").addEventListener("click", () => game.start());
});
