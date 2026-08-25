import { BaseGame } from './core/BaseGame.js?v=2.5';
import { gameManager } from './core/gameManager.js';
import { audioManager } from './audio/audioManager.js';
import { animationManager } from './animation/animationManager.js';
import { storage } from './core/storage.js';

class GoldHighwayTruck extends BaseGame {
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
        if (this.hsDisplay) this.hsDisplay.textContent = `${this.highScore}m`;
        
        this.exhaustParticles = [];
        this.wheelRotation = 0;
        
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
        this.groundY = this.canvas.height * 0.75; // Road level (25% road height)
    }

    bindEvents() {
        document.getElementById('startBtn')?.addEventListener('click', () => this.start());
        document.getElementById('restartBtn')?.addEventListener('click', () => this.start());
        document.getElementById('tryAgainBtn')?.addEventListener('click', () => {
            this.gameOverOverlay.classList.add('d-none');
            this.start();
        });
        
        // Input controls
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
        this.baseSpeed = 8.5;
        this.currentSpeed = this.baseSpeed;
        this.distance = 0;
        
        this.bgOffsets = {
            cityBack: 0,
            cityFront: 0,
            road: 0
        };
        
        // Truck properties (Heavy Golden Semi-Truck)
        this.player = {
            x: 70,
            y: 0,
            width: 85,
            height: 48,
            vy: 0,
            gravity: 0.85,
            jumpPower: -14.5,
            isGrounded: false,
            bounce: 0
        };
        this.player.y = this.groundY - this.player.height;
        
        this.obstacles = [];
        this.exhaustParticles = [];
        this.frames = 0;
        this.nextObstacleFrame = 70;
    }

    onStart() {
        this.resetGameVariables();
        if (this.gameOverOverlay) this.gameOverOverlay.classList.add('d-none');
        if (this.scoreDisplay) this.scoreDisplay.textContent = '0m';
        if (this.speedDisplay) this.speedDisplay.textContent = '60 km/h';
        if (this.statusMsg) {
            this.statusMsg.textContent = "Cruising Highway...";
            this.statusMsg.className = "text-center mt-2 fs-5 fw-bold text-warning";
        }
        
        this.lastTime = performance.now();
        this.loopId = requestAnimationFrame((t) => this.gameLoop(t));
    }

    jump() {
        if (this.player.isGrounded) {
            this.player.vy = this.player.jumpPower;
            this.player.isGrounded = false;
            if (audioManager) audioManager.playTone(320, 'sine', 0.15, 0.3);
            
            // Add initial burst of exhaust smoke
            for (let i = 0; i < 6; i++) {
                this.exhaustParticles.push({
                    x: this.player.x + 10,
                    y: this.player.y + 12,
                    vx: -(2 + Math.random() * 3),
                    vy: -(1 + Math.random() * 2),
                    size: 4 + Math.random() * 4,
                    alpha: 0.8
                });
            }
        }
    }

    spawnObstacle() {
        const types = [
            { type: 'cone', width: 24, height: 36 },
            { type: 'barricade', width: 55, height: 32 },
            { type: 'barrel', width: 28, height: 40 }
        ];
        
        const selected = types[Math.floor(Math.random() * types.length)];
        
        this.obstacles.push({
            x: this.canvas.width + 10,
            y: this.groundY - selected.height,
            width: selected.width,
            height: selected.height,
            type: selected.type
        });
        
        // Spawn interval scales with speed
        const minGap = 120;
        const maxGap = 280;
        const framesToWait = Math.floor((minGap + Math.random() * maxGap) / this.currentSpeed);
        this.nextObstacleFrame = this.frames + Math.max(35, framesToWait);
    }

    update(dt) {
        const timeFactor = dt / 16.66;
        this.distance += this.currentSpeed * timeFactor;
        this.score = Math.floor(this.distance / 5);
        if (this.scoreDisplay) this.scoreDisplay.textContent = `${this.score}m`;
        
        // Speed scaling (60 km/h up to 180 km/h)
        const speedMultiplier = Math.min(3.0, 1 + (this.score / 800));
        this.currentSpeed = this.baseSpeed * speedMultiplier;
        const kmh = Math.floor(60 * speedMultiplier);
        if (this.speedDisplay) this.speedDisplay.textContent = `${kmh} km/h`;
        
        // Truck Physics
        this.player.vy += this.player.gravity * timeFactor;
        this.player.y += this.player.vy * timeFactor;
        
        if (this.player.y >= this.groundY - this.player.height) {
            if (!this.player.isGrounded && audioManager) {
                // Landing thud
                audioManager.playTone(120, 'triangle', 0.08, 0.2);
            }
            this.player.y = this.groundY - this.player.height;
            this.player.vy = 0;
            this.player.isGrounded = true;
        }
        
        // Wheel rotation
        this.wheelRotation += (this.currentSpeed * 0.12) * timeFactor;
        
        // Exhaust Smoke Particles
        if (this.frames % 3 === 0) {
            this.exhaustParticles.push({
                x: this.player.x + 12,
                y: this.player.y + 10,
                vx: -(this.currentSpeed * 0.5 + Math.random() * 2),
                vy: -(Math.random() * 1.5),
                size: 3 + Math.random() * 3,
                alpha: 0.7
            });
        }
        
        for (let i = this.exhaustParticles.length - 1; i >= 0; i--) {
            const p = this.exhaustParticles[i];
            p.x += p.vx * timeFactor;
            p.y += p.vy * timeFactor;
            p.size += 0.2 * timeFactor;
            p.alpha -= 0.02 * timeFactor;
            if (p.alpha <= 0 || p.x < 0) {
                this.exhaustParticles.splice(i, 1);
            }
        }
        
        // Obstacles
        if (this.frames >= this.nextObstacleFrame) {
            this.spawnObstacle();
        }
        
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.x -= this.currentSpeed * timeFactor;
            
            // Collision Detection with forgiving hitbox
            const marginX = 8;
            const marginY = 6;
            if (this.player.x + marginX < obs.x + obs.width &&
                this.player.x + this.player.width - marginX > obs.x &&
                this.player.y + marginY < obs.y + obs.height &&
                this.player.y + this.player.height > obs.y) {
                
                this.handleCrash();
                return;
            }
            
            if (obs.x + obs.width < -20) {
                this.obstacles.splice(i, 1);
            }
        }
        
        // Parallax background offsets
        this.bgOffsets.cityBack = (this.bgOffsets.cityBack - (this.currentSpeed * 0.2 * timeFactor)) % this.container.clientWidth;
        this.bgOffsets.cityFront = (this.bgOffsets.cityFront - (this.currentSpeed * 0.5 * timeFactor)) % this.container.clientWidth;
        this.bgOffsets.road = (this.bgOffsets.road - (this.currentSpeed * 1.2 * timeFactor)) % 120;
        
        if (this.bgCityBack) this.bgCityBack.style.transform = `translateX(${this.bgOffsets.cityBack}px)`;
        if (this.bgCityFront) this.bgCityFront.style.transform = `translateX(${this.bgOffsets.cityFront}px)`;
        if (this.bgRoad) this.bgRoad.style.backgroundPosition = `${this.bgOffsets.road}px center, 0 0`;
        
        this.frames++;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 1. Draw Headlight Beam onto highway
        const px = this.player.x;
        const py = this.player.y;
        const pw = this.player.width;
        const ph = this.player.height;
        
        const beamGrad = this.ctx.createRadialGradient(px + pw, py + ph - 18, 5, px + pw + 220, py + ph, 180);
        beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
        beamGrad.addColorStop(0.4, 'rgba(251, 191, 36, 0.2)');
        beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        this.ctx.fillStyle = beamGrad;
        this.ctx.beginPath();
        this.ctx.moveTo(px + pw - 5, py + ph - 24);
        this.ctx.lineTo(px + pw + 250, py + ph + 20);
        this.ctx.lineTo(px + pw + 180, py + ph + 45);
        this.ctx.lineTo(px + pw - 5, py + ph - 12);
        this.ctx.closePath();
        this.ctx.fill();

        // 2. Draw Exhaust Particles
        for (const p of this.exhaustParticles) {
            this.ctx.fillStyle = `rgba(200, 190, 170, ${p.alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // 3. Draw Realistic Golden Heavy Truck
        this.drawGoldenTruck(px, py, pw, ph);
        
        // 4. Draw Obstacles
        for (const obs of this.obstacles) {
            this.drawObstacle(obs);
        }
    }

    drawGoldenTruck(x, y, w, h) {
        this.ctx.save();
        
        // Suspension bounce when grounded
        const bounceOffset = this.player.isGrounded ? Math.sin(this.frames * 0.4) * 1.2 : 0;
        const ty = y + bounceOffset;
        
        // Truck Cab Main Body - Metallic Gold Gradient
        const goldGrad = this.ctx.createLinearGradient(x, ty, x, ty + h);
        goldGrad.addColorStop(0, '#fef08a'); // Bright Gold highlight
        goldGrad.addColorStop(0.3, '#f59e0b'); // Rich Gold
        goldGrad.addColorStop(0.8, '#b45309'); // Deep Gold / Bronze
        goldGrad.addColorStop(1, '#451a03'); // Dark Shadow
        
        // Main Cab Box (Sleek aerodynamic heavy-duty cab)
        this.ctx.fillStyle = goldGrad;
        this.ctx.strokeStyle = '#d97706';
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        this.ctx.moveTo(x + 5, ty + 12); // rear top
        this.ctx.lineTo(x + 48, ty + 12); // roof top
        this.ctx.lineTo(x + 72, ty + 24); // windshield slope down
        this.ctx.lineTo(x + 84, ty + 28); // hood nose
        this.ctx.lineTo(x + 84, ty + h - 10); // front bumper
        this.ctx.lineTo(x, ty + h - 10); // bottom chassis
        this.ctx.lineTo(x, ty + 18); // rear back
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // Black Aerodynamic Racing Stripe / Trim
        this.ctx.fillStyle = '#0f0f12';
        this.ctx.beginPath();
        this.ctx.moveTo(x + 5, ty + 28);
        this.ctx.lineTo(x + 84, ty + 34);
        this.ctx.lineTo(x + 84, ty + 40);
        this.ctx.lineTo(x + 5, ty + 36);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Chrome Windshield (Tinted glass with reflection)
        const glassGrad = this.ctx.createLinearGradient(x + 48, ty + 14, x + 72, ty + 28);
        glassGrad.addColorStop(0, '#1e293b');
        glassGrad.addColorStop(0.5, '#38bdf8');
        glassGrad.addColorStop(1, '#0f172a');
        
        this.ctx.fillStyle = glassGrad;
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(x + 50, ty + 14);
        this.ctx.lineTo(x + 68, ty + 24);
        this.ctx.lineTo(x + 68, ty + 28);
        this.ctx.lineTo(x + 48, ty + 28);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // Side Window
        this.ctx.fillStyle = '#0f172a';
        this.ctx.fillRect(x + 28, ty + 16, 18, 12);
        this.ctx.strokeStyle = '#b45309';
        this.ctx.strokeRect(x + 28, ty + 16, 18, 12);
        
        // Front Chrome / Gold Grille
        this.ctx.fillStyle = '#18181b';
        this.ctx.fillRect(x + 78, ty + 32, 6, 10);
        this.ctx.fillStyle = '#fbbf24';
        for (let i = 0; i < 4; i++) {
            this.ctx.fillRect(x + 79, ty + 33 + (i * 2.2), 4, 1.2);
        }
        
        // Headlights (Dual glowing amber/white lamps)
        this.ctx.fillStyle = '#fef08a';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#fbbf24';
        this.ctx.fillRect(x + 81, ty + 28, 4, 4);
        this.ctx.fillRect(x + 81, ty + 38, 4, 3);
        this.ctx.shadowBlur = 0; // reset
        
        // Vertical Chrome Exhaust Stack
        const pipeGrad = this.ctx.createLinearGradient(x + 10, ty - 6, x + 16, ty + 14);
        pipeGrad.addColorStop(0, '#fef08a');
        pipeGrad.addColorStop(0.5, '#78350f');
        pipeGrad.addColorStop(1, '#d97706');
        this.ctx.fillStyle = pipeGrad;
        this.ctx.fillRect(x + 11, ty - 5, 5, 22);
        this.ctx.fillStyle = '#18181b';
        this.ctx.fillRect(x + 11, ty - 6, 5, 2); // exhaust tip
        
        // Chrome Fuel Tank & Steps
        this.ctx.fillStyle = '#e2e8f0';
        this.ctx.fillRect(x + 24, ty + h - 14, 22, 6);
        this.ctx.strokeStyle = '#475569';
        this.ctx.strokeRect(x + 24, ty + h - 14, 22, 6);
        
        // Heavy Truck Wheels (3 rugged wheels: front + dual rear)
        const wheelY = ty + h - 6;
        const wheelRadius = 10;
        
        this.drawHeavyWheel(x + 16, wheelY, wheelRadius); // rear wheel 1
        this.drawHeavyWheel(x + 38, wheelY, wheelRadius); // rear wheel 2
        this.drawHeavyWheel(x + 72, wheelY, wheelRadius); // front steering wheel
        
        this.ctx.restore();
    }

    drawHeavyWheel(cx, cy, r) {
        this.ctx.save();
        this.ctx.translate(cx, cy);
        this.ctx.rotate(this.wheelRotation);
        
        // Black Tire Rubber
        this.ctx.fillStyle = '#18181b';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, r, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#09090b';
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();
        
        // Gold / Chrome Steel Rim
        const rimGrad = this.ctx.createRadialGradient(0, 0, 1, 0, 0, r * 0.65);
        rimGrad.addColorStop(0, '#fef08a');
        rimGrad.addColorStop(0.6, '#d97706');
        rimGrad.addColorStop(1, '#451a03');
        this.ctx.fillStyle = rimGrad;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, r * 0.62, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Rim Spokes
        this.ctx.strokeStyle = '#18181b';
        this.ctx.lineWidth = 1.5;
        for (let i = 0; i < 4; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(-r * 0.5, 0);
            this.ctx.lineTo(r * 0.5, 0);
            this.ctx.stroke();
            this.ctx.rotate(Math.PI / 4);
        }
        
        // Center Lug Cap
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }

    drawObstacle(obs) {
        this.ctx.save();
        
        if (obs.type === 'cone') {
            // Realistic Traffic Safety Cone
            this.ctx.fillStyle = '#f97316'; // High-vis Orange
            this.ctx.beginPath();
            this.ctx.moveTo(obs.x + obs.width / 2, obs.y);
            this.ctx.lineTo(obs.x + obs.width, obs.y + obs.height - 4);
            this.ctx.lineTo(obs.x, obs.y + obs.height - 4);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Reflective White Band
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.moveTo(obs.x + obs.width * 0.3, obs.y + obs.height * 0.4);
            this.ctx.lineTo(obs.x + obs.width * 0.7, obs.y + obs.height * 0.4);
            this.ctx.lineTo(obs.x + obs.width * 0.8, obs.y + obs.height * 0.65);
            this.ctx.lineTo(obs.x + obs.width * 0.2, obs.y + obs.height * 0.65);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Black Rubber Base
            this.ctx.fillStyle = '#18181b';
            this.ctx.fillRect(obs.x - 2, obs.y + obs.height - 4, obs.width + 4, 4);
        } 
        else if (obs.type === 'barricade') {
            // Road Construction Barricade with Warning Hazard Stripes
            this.ctx.fillStyle = '#475569';
            // Legs
            this.ctx.fillRect(obs.x + 4, obs.y + 10, 4, obs.height - 10);
            this.ctx.fillRect(obs.x + obs.width - 8, obs.y + 10, 4, obs.height - 10);
            
            // Horizontal Bar
            const barY = obs.y + 4;
            const barH = 16;
            this.ctx.fillStyle = '#fbbf24';
            this.ctx.fillRect(obs.x, barY, obs.width, barH);
            this.ctx.strokeStyle = '#000';
            this.ctx.strokeRect(obs.x, barY, obs.width, barH);
            
            // Hazard Diagonal Black Stripes
            this.ctx.fillStyle = '#0f0f12';
            for (let s = 0; s < obs.width; s += 12) {
                this.ctx.beginPath();
                this.ctx.moveTo(obs.x + s, barY);
                this.ctx.lineTo(obs.x + s + 6, barY);
                this.ctx.lineTo(obs.x + s, barY + barH);
                this.ctx.lineTo(obs.x + s - 6, barY + barH);
                this.ctx.closePath();
                this.ctx.fill();
            }
            
            // Red Warning Flasher Light on top
            this.ctx.fillStyle = '#ef4444';
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = '#ef4444';
            this.ctx.beginPath();
            this.ctx.arc(obs.x + obs.width / 2, obs.y + 2, 4, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        } 
        else {
            // Highway Traffic Barrel (Yellow/Black Industrial)
            const barrelGrad = this.ctx.createLinearGradient(obs.x, obs.y, obs.x + obs.width, obs.y);
            barrelGrad.addColorStop(0, '#d97706');
            barrelGrad.addColorStop(0.4, '#fbbf24');
            barrelGrad.addColorStop(1, '#92400e');
            
            this.ctx.fillStyle = barrelGrad;
            this.ctx.beginPath();
            this.ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 4);
            this.ctx.fill();
            this.ctx.strokeStyle = '#000';
            this.ctx.stroke();
            
            // Two White Reflective Bands
            this.ctx.fillStyle = '#f8fafc';
            this.ctx.fillRect(obs.x + 1, obs.y + 8, obs.width - 2, 6);
            this.ctx.fillRect(obs.x + 1, obs.y + 22, obs.width - 2, 6);
        }
        
        this.ctx.restore();
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
        
        if (this.isRunning) {
            this.draw();
            this.loopId = requestAnimationFrame((t) => this.gameLoop(t));
        }
    }

    handleCrash() {
        if (audioManager) audioManager.playTone(80, 'sawtooth', 0.6, 0.6);
        if (this.statusMsg) {
            this.statusMsg.textContent = "HIGHWAY CRASH!";
            this.statusMsg.className = "text-center mt-2 fs-5 fw-bold text-danger";
        }
        
        if (this.gameOverOverlay) this.gameOverOverlay.classList.remove('d-none');
        if (this.finalScoreMsg) this.finalScoreMsg.textContent = `Distance: ${this.score}m`;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            storage.set('highScore_runner', this.highScore);
            if (this.hsDisplay) this.hsDisplay.textContent = `${this.highScore}m`;
            if (animationManager) animationManager.spawnConfetti(window.innerWidth / 2, window.innerHeight / 2, 80);
        }
        
        this.addScore(this.score);
        this.gameOver(false);
    }

    onDestroy() {
        if (this.loopId) cancelAnimationFrame(this.loopId);
    }
}

// Instruction set
gameManager.GAME_INSTRUCTIONS = gameManager.GAME_INSTRUCTIONS || {};
gameManager.GAME_INSTRUCTIONS["runner"] = {
    title: "Gold Highway Truck",
    objective: "Drive the heavy gold truck along the highway and dodge obstacles.",
    controls: "Tap (Mobile) or Space/Up Arrow (Desktop) to Jump.",
    win: "Survive as long as possible and set a new highway distance record.",
    lose: "Crashing into road cones or construction barricades.",
    tips: "The highway speed increases over distance. Time your jumps cleanly!"
};

if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", () => {
        const game = new GoldHighwayTruck();
    });
} else {
    const game = new GoldHighwayTruck();
}