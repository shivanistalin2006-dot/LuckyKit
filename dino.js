import { BaseGame } from './core/BaseGame.js?v=2.5';
import { gameManager } from './core/gameManager.js';
import { assetLoader } from './core/assetLoader.js?v=2.5';

class CyberDino extends BaseGame {
    constructor() {
        super("cyber_dino");
        
        this.canvas = document.getElementById("dinoCanvas");
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
            dino: 'assets/cyber_dino.jpg',
            cactus: 'assets/cyber_cactus.jpg',
            bg: 'assets/cyber_bg.jpg'
        });

        // Input handling
        this.isJumping = false;
        
        const jump = (e) => {
            if (e && e.type === 'keydown' && (e.code !== 'Space' && e.code !== 'ArrowUp')) return;
            if (e) e.preventDefault();
            
            if (this.isPlaying && !this.isJumping) {
                this.dino.dy = -15; // Jump velocity
                this.isJumping = true;
                if (window.ArcadeSounds) window.ArcadeSounds.playSelect();
            }
        };

        window.addEventListener("keydown", jump);
        this.canvas.addEventListener("touchstart", jump, { passive: false });
        this.canvas.addEventListener("mousedown", jump);

        gameManager.registerGame(this);
    }

    reset() {
        this.dino = {
            x: 50,
            y: 200, // Ground level is 200 (Dino height is 50, canvas is 300)
            w: 50,
            h: 50,
            dy: 0,
            gravity: 0.8
        };
        
        this.obstacles = [];
        this.gameSpeed = 6;
        this.bgOffset = 0;
        this.spawnTimer = 0;
        this.groundY = 250;
        
        this.score = 0;
        this.lives = 1;
        this.isJumping = false;
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
        this.dino.dy += this.dino.gravity;
        this.dino.y += this.dino.dy;

        // Ground collision
        if (this.dino.y >= this.groundY - this.dino.h) {
            this.dino.y = this.groundY - this.dino.h;
            this.dino.dy = 0;
            this.isJumping = false;
        }

        // Increase speed slightly over time
        this.gameSpeed += 0.001;

        // Score logic
        this.addScore(0.1);

        // Spawn obstacles
        this.spawnTimer--;
        if (this.spawnTimer <= 0) {
            const minTime = 60;
            const maxTime = 150;
            this.spawnTimer = minTime + Math.random() * (maxTime - minTime);
            
            // Randomize size
            const isLarge = Math.random() > 0.5;
            this.obstacles.push({
                x: this.canvas.width,
                y: this.groundY - (isLarge ? 60 : 40),
                w: isLarge ? 30 : 25,
                h: isLarge ? 60 : 40
            });
        }

        // Update obstacles & collision
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            let obs = this.obstacles[i];
            obs.x -= this.gameSpeed;

            // Remove off-screen obstacles
            if (obs.x + obs.w < 0) {
                this.obstacles.splice(i, 1);
                continue;
            }

            // AABB Collision
            // Add a small hitbox margin to make it fairer
            const marginX = 10;
            const marginY = 10;
            if (this.dino.x + marginX < obs.x + obs.w &&
                this.dino.x + this.dino.w - marginX > obs.x &&
                this.dino.y + marginY < obs.y + obs.h &&
                this.dino.y + this.dino.h - marginY > obs.y) {
                
                if (window.ArcadeSounds) window.ArcadeSounds.playLose();
                this.gameOver(false);
                return;
            }
        }

        // Background scrolling
        this.bgOffset -= this.gameSpeed * 0.5; // Parallax effect
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

        // Draw Ground Line
        this.ctx.strokeStyle = "var(--theme-color)";
        this.ctx.lineWidth = 3;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = "var(--theme-glow)";
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.groundY);
        this.ctx.lineTo(this.canvas.width, this.groundY);
        this.ctx.stroke();

        // Draw Dino
        const dinoImg = assetLoader.getImage('dino');
        if (dinoImg && dinoImg.complete) {
            this.ctx.globalCompositeOperation = 'screen';
            // Draw slightly larger than hitbox
            this.ctx.drawImage(dinoImg, this.dino.x - 10, this.dino.y - 10, this.dino.w + 20, this.dino.h + 20);
            this.ctx.globalCompositeOperation = 'source-over';
        } else {
            this.ctx.fillStyle = "#fff";
            this.ctx.fillRect(this.dino.x, this.dino.y, this.dino.w, this.dino.h);
        }

        // Draw Obstacles
        const cactusImg = assetLoader.getImage('cactus');
        this.obstacles.forEach(obs => {
            if (cactusImg && cactusImg.complete) {
                this.ctx.globalCompositeOperation = 'screen';
                this.ctx.drawImage(cactusImg, obs.x - 5, obs.y - 5, obs.w + 10, obs.h + 10);
                this.ctx.globalCompositeOperation = 'source-over';
            } else {
                this.ctx.fillStyle = "#ef4444";
                this.ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
            }
        });
    }

    onGameOver(isWin) {
        this.overlayTitle.innerText = "Extinction!";
        this.overlayTitle.className = "fw-black fs-1 mb-2 text-danger";
        this.overlaySub.innerText = `Final Score: ${Math.floor(this.score)}`;
        this.overlay.classList.remove("d-none");
        this.overlay.classList.add("d-flex");
    }
}

if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", () => {
        const game = new CyberDino();
        document.getElementById("startBtn").addEventListener("click", () => game.start());
        document.getElementById("overlayStartBtn").addEventListener("click", () => game.start());
    });
} else {
    const game = new CyberDino();
    document.getElementById("startBtn").addEventListener("click", () => game.start());
    document.getElementById("overlayStartBtn").addEventListener("click", () => game.start());
}
