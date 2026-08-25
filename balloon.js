import { BaseGame } from './core/BaseGame.js?v=2.5';
import { gameManager } from './core/gameManager.js';
import { assetLoader } from './core/assetLoader.js?v=2.5';

class AeroBurst extends BaseGame {
    constructor() {
        super("cyber_balloon");
        
        this.canvas = document.getElementById("balloonCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.scoreEl = document.getElementById("score");
        this.livesEl = document.getElementById("lives");
        this.highScoreEl = document.getElementById("highScore");
        this.overlay = document.getElementById("overlay");
        this.overlayTitle = document.getElementById("overlayTitle");
        this.overlaySub = document.getElementById("overlaySub");

        this.highScoreEl.innerText = this.highScore;

        // Load premium assets
        assetLoader.loadImages({
            balloon: 'assets/cyber_balloon.jpg',
            cloud: 'assets/cyber_cloud.jpg',
            bg: 'assets/space_bg_1786816697437.jpg' // Reuse space bg for sci-fi atmosphere
        });

        // Input handling
        this.isAscending = false;
        
        const startAscend = (e) => {
            if (e && e.type === 'keydown' && e.code !== 'Space') return;
            if (e) e.preventDefault();
            this.isAscending = true;
        };

        const stopAscend = (e) => {
            if (e && e.type === 'keyup' && e.code !== 'Space') return;
            if (e) e.preventDefault();
            this.isAscending = false;
        };

        window.addEventListener("keydown", startAscend);
        window.addEventListener("keyup", stopAscend);
        
        this.canvas.addEventListener("touchstart", startAscend, { passive: false });
        this.canvas.addEventListener("touchend", stopAscend, { passive: false });
        this.canvas.addEventListener("mousedown", startAscend);
        this.canvas.addEventListener("mouseup", stopAscend);
        this.canvas.addEventListener("mouseleave", stopAscend);

        gameManager.registerGame(this);
    }

    reset() {
        this.balloon = {
            x: 50,
            y: this.canvas.height / 2,
            w: 45,
            h: 50,
            dy: 0,
            gravity: 0.35,
            lift: -0.65,
            maxFall: 6.5,
            maxRise: -5.5
        };
        
        this.clouds = [];
        this.gameSpeed = 5.0;
        this.bgOffset = 0;
        this.spawnTimer = 0;
        
        this.score = 0;
        this.lives = 1;
        this.isAscending = false;
    }

    onStart() {
        this.reset();
        this.scoreEl.innerText = this.score;
        this.livesEl.innerText = "⚡";
        this.overlay.classList.add("d-none");
        this.overlay.classList.remove("d-flex");
    }

    onScoreUpdate(score, highScore) {
        this.scoreEl.innerText = Math.floor(score);
        this.highScoreEl.innerText = Math.floor(highScore);
    }

    update() {
        // Physics
        if (this.isAscending) {
            this.balloon.dy += this.balloon.lift;
        } else {
            this.balloon.dy += this.balloon.gravity;
        }

        // Clamp velocities
        this.balloon.dy = Math.max(this.balloon.maxRise, Math.min(this.balloon.dy, this.balloon.maxFall));
        this.balloon.y += this.balloon.dy;

        // Border collision (Game Over if hit ground or ceiling)
        if (this.balloon.y < 0 || this.balloon.y + this.balloon.h > this.canvas.height) {
            if (window.ArcadeSounds) window.ArcadeSounds.playLose();
            this.gameOver(false);
            return;
        }

        // Increase speed and score
        this.gameSpeed += 0.0005;
        this.addScore(0.1);

        // Spawn clouds
        this.spawnTimer--;
        if (this.spawnTimer <= 0) {
            const minTime = 80;
            const maxTime = 160;
            this.spawnTimer = minTime + Math.random() * (maxTime - minTime);
            
            // Random Y position
            const minY = 50;
            const maxY = this.canvas.height - 100;
            
            this.clouds.push({
                x: this.canvas.width,
                y: minY + Math.random() * (maxY - minY),
                w: 40,
                h: 40,
                pulse: Math.random() * Math.PI * 2
            });
        }

        // Update clouds & collision
        for (let i = this.clouds.length - 1; i >= 0; i--) {
            let cloud = this.clouds[i];
            cloud.x -= this.gameSpeed;
            cloud.pulse += 0.1;

            // Remove off-screen clouds
            if (cloud.x + cloud.w < 0) {
                this.clouds.splice(i, 1);
                continue;
            }

            // AABB Collision with margin
            const marginX = 8;
            const marginY = 8;
            if (this.balloon.x + marginX < cloud.x + cloud.w &&
                this.balloon.x + this.balloon.w - marginX > cloud.x &&
                this.balloon.y + marginY < cloud.y + cloud.h &&
                this.balloon.y + this.balloon.h - marginY > cloud.y) {
                
                if (window.ArcadeSounds) window.ArcadeSounds.playLose();
                this.gameOver(false);
                return;
            }
        }

        // Background scrolling
        this.bgOffset -= this.gameSpeed * 0.3; // Parallax effect
        if (this.bgOffset <= -this.canvas.width) {
            this.bgOffset = 0;
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Background
        const bgImg = assetLoader.getImage('bg');
        if (bgImg && bgImg.complete) {
            this.ctx.globalCompositeOperation = 'screen';
            // Draw twice for seamless scrolling
            this.ctx.drawImage(bgImg, this.bgOffset, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(bgImg, this.bgOffset + this.canvas.width, 0, this.canvas.width, this.canvas.height);
            this.ctx.globalCompositeOperation = 'source-over';
        }

        // Engine Thruster Effect
        if (this.isAscending) {
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'screen';
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = "var(--theme-glow)";
            this.ctx.fillStyle = "var(--theme-color)";
            this.ctx.beginPath();
            this.ctx.arc(this.balloon.x + this.balloon.w / 2, this.balloon.y + this.balloon.h + Math.random() * 10, 8, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }

        // Draw Balloon
        const balloonImg = assetLoader.getImage('balloon');
        if (balloonImg && balloonImg.complete) {
            this.ctx.globalCompositeOperation = 'screen';
            this.ctx.drawImage(balloonImg, this.balloon.x - 10, this.balloon.y - 10, this.balloon.w + 20, this.balloon.h + 20);
            this.ctx.globalCompositeOperation = 'source-over';
        } else {
            this.ctx.fillStyle = "#fff";
            this.ctx.fillRect(this.balloon.x, this.balloon.y, this.balloon.w, this.balloon.h);
        }

        // Draw Clouds
        const cloudImg = assetLoader.getImage('cloud');
        this.clouds.forEach(cloud => {
            const scaleOffset = Math.sin(cloud.pulse) * 4;
            if (cloudImg && cloudImg.complete) {
                this.ctx.globalCompositeOperation = 'screen';
                this.ctx.drawImage(cloudImg, cloud.x - 10 - scaleOffset/2, cloud.y - 10 - scaleOffset/2, cloud.w + 20 + scaleOffset, cloud.h + 20 + scaleOffset);
                this.ctx.globalCompositeOperation = 'source-over';
            } else {
                this.ctx.fillStyle = "#ef4444";
                this.ctx.fillRect(cloud.x, cloud.y, cloud.w, cloud.h);
            }
        });
    }

    onGameOver(isWin) {
        this.overlayTitle.innerText = "Crashed!";
        this.overlayTitle.className = "fw-black fs-1 mb-2 text-danger";
        this.overlaySub.innerText = `Final Altitude: ${Math.floor(this.score)}`;
        this.overlay.classList.remove("d-none");
        this.overlay.classList.add("d-flex");
    }
}

if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", () => {
        const game = new AeroBurst();
        document.getElementById("startBtn")?.addEventListener("click", () => game.start());
        document.getElementById("startBtnHeader")?.addEventListener("click", () => game.start());
        document.getElementById("restartBtn")?.addEventListener("click", () => game.start());
        document.getElementById("overlayStartBtn")?.addEventListener("click", () => game.start());
    });
} else {
    const game = new AeroBurst();
    document.getElementById("startBtn")?.addEventListener("click", () => game.start());
    document.getElementById("startBtnHeader")?.addEventListener("click", () => game.start());
    document.getElementById("restartBtn")?.addEventListener("click", () => game.start());
    document.getElementById("overlayStartBtn")?.addEventListener("click", () => game.start());
}
