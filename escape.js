import { BaseGame } from './core/BaseGame.js?v=2.5';
import { gameManager } from './core/gameManager.js';
import { audioManager } from './audio/audioManager.js';
import { animationManager } from './animation/animationManager.js';
import { storage } from './core/storage.js';

class EscapeFromMonster extends BaseGame {
    constructor() {
        super("escape");
        
        this.canvas = document.getElementById('escapeCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // HUD Elements
        this.coinDisplay = document.getElementById('coinCount');
        this.distanceDisplay = document.getElementById('distanceCount');
        this.monsterDistText = document.getElementById('monsterDistText');
        this.dangerProgressBar = document.getElementById('dangerProgressBar');
        this.highScoreText = document.getElementById('highScoreText');
        this.badgeContainer = document.getElementById('powerupBadgeContainer');
        
        // Overlays
        this.gameOverOverlay = document.getElementById('gameOverOverlay');
        this.overlayScore = document.getElementById('overlayScore');
        this.overlayCoins = document.getElementById('overlayCoins');
        this.overlayBest = document.getElementById('overlayBest');
        
        this.groundY = 370;
        this.highScore = parseInt(localStorage.getItem('luckykit_escape_best') || '0');
        if (this.highScoreText) this.highScoreText.textContent = `${this.highScore}m`;
        
        this.bindControls();
        this.resetGameVariables();
        
        gameManager.registerGame(this);
    }

    bindControls() {
        // Keyboard Controls
        window.addEventListener('keydown', (e) => {
            if (['Space', 'ArrowUp', 'KeyW', 'ArrowDown', 'KeyS'].includes(e.code)) {
                e.preventDefault();
            }
            
            if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
                if (!this.isRunning) {
                    this.start();
                } else {
                    this.jump();
                }
            } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
                if (this.isRunning) this.startSlide();
            }
        });

        window.addEventListener('keyup', (e) => {
            if (['ArrowDown', 'KeyS'].includes(e.code)) {
                this.stopSlide();
            }
        });

        // Canvas Click/Touch
        let touchStartY = 0;
        this.canvas.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            if (!this.isRunning) this.start();
        }, { passive: true });

        this.canvas.addEventListener('touchend', (e) => {
            const touchEndY = e.changedTouches[0].clientY;
            const diffY = touchEndY - touchStartY;
            if (diffY < -30) this.jump();
            else if (diffY > 30) this.startSlide();
            else this.jump();
        }, { passive: true });

        // Mobile On-Screen Buttons
        const mobileJump = document.getElementById('mobileJumpBtn');
        const mobileSlide = document.getElementById('mobileSlideBtn');

        if (mobileJump) {
            mobileJump.addEventListener('touchstart', (e) => { e.preventDefault(); this.jump(); });
            mobileJump.addEventListener('click', () => this.jump());
        }

        if (mobileSlide) {
            mobileSlide.addEventListener('touchstart', (e) => { e.preventDefault(); this.startSlide(); });
            mobileSlide.addEventListener('touchend', (e) => { e.preventDefault(); this.stopSlide(); });
            mobileSlide.addEventListener('mousedown', () => this.startSlide());
            mobileSlide.addEventListener('mouseup', () => this.stopSlide());
        }

        // Start & Restart UI Buttons
        document.getElementById('startBtn')?.addEventListener('click', () => this.start());
        document.getElementById('sidebarStartBtn')?.addEventListener('click', () => this.start());
        document.getElementById('restartBtn')?.addEventListener('click', () => this.start());
        document.getElementById('modalRestartBtn')?.addEventListener('click', () => {
            if (this.gameOverOverlay) this.gameOverOverlay.classList.add('d-none');
            this.start();
        });
    }

    resetGameVariables() {
        this.distance = 0;
        this.sessionCoins = 0;
        this.baseSpeed = 8.0;
        this.currentSpeed = this.baseSpeed;
        
        // Runner Character (Man)
        this.runner = {
            x: 260,
            y: 0,
            width: 32,
            height: 60,
            vy: 0,
            gravity: 0.85,
            jumpPower: -14.5,
            isGrounded: true,
            jumpsLeft: 2,
            isSliding: false,
            slideTimer: 0,
            animFrame: 0,
            shieldActive: false,
            magnetActive: false,
            boostActive: false,
            invulnerableTime: 0
        };
        this.runner.y = this.groundY - this.runner.height;

        // Pursuing Monster
        this.monster = {
            gap: 55, // Distance behind player (meters: 0 to 70)
            animFrame: 0,
            stompTimer: 0,
            roarIntensity: 0
        };

        // Game World Entities
        this.obstacles = [];
        this.coins = [];
        this.powerups = [];
        this.particles = [];
        this.backgroundLayers = [
            { x: 0, speed: 0.8 },  // Distant ruins & blood moon
            { x: 0, speed: 2.2 },  // Midground fiery spires
            { x: 0, speed: 8.0 }   // Foreground stone highway
        ];

        this.frames = 0;
        this.nextObstacleFrame = 60;
        this.nextItemFrame = 90;
        this.heartbeatTimer = 0;
    }

    onStart() {
        this.resetGameVariables();
        if (this.gameOverOverlay) this.gameOverOverlay.classList.add('d-none');
        this.updateHUD();
        
        this.lastTime = performance.now();
        if (this.loopId) cancelAnimationFrame(this.loopId);
        this.loopId = requestAnimationFrame((t) => this.gameLoop(t));
    }

    jump() {
        if (!this.isRunning || this.isPaused) return;

        if (this.runner.isSliding) {
            this.stopSlide();
        }

        if (this.runner.jumpsLeft > 0) {
            this.runner.vy = this.runner.jumpPower;
            this.runner.isGrounded = false;
            this.runner.jumpsLeft--;

            if (audioManager) {
                const pitch = this.runner.jumpsLeft === 1 ? 400 : 580;
                audioManager.playTone(pitch, 'sine', 0.1, 0.25);
            }

            // Spawn jump dust particles
            for (let i = 0; i < 6; i++) {
                this.particles.push({
                    x: this.runner.x + 10,
                    y: this.groundY,
                    vx: -(2 + Math.random() * 4),
                    vy: -(1 + Math.random() * 2),
                    size: 3 + Math.random() * 3,
                    color: 'rgba(255, 255, 255, 0.6)',
                    alpha: 1,
                    decay: 0.05
                });
            }
        }
    }

    startSlide() {
        if (!this.isRunning || this.isPaused) return;
        if (this.runner.isGrounded && !this.runner.isSliding) {
            this.runner.isSliding = true;
            this.runner.slideTimer = 45; // ~0.75s slide duration
            this.runner.height = 30;
            this.runner.y = this.groundY - this.runner.height;

            if (audioManager) audioManager.playTone(180, 'triangle', 0.12, 0.2);

            // Spawn slide sparks
            for (let i = 0; i < 8; i++) {
                this.particles.push({
                    x: this.runner.x + 15,
                    y: this.groundY - 2,
                    vx: -(4 + Math.random() * 5),
                    vy: -(Math.random() * 2),
                    size: 2 + Math.random() * 2,
                    color: '#f59e0b',
                    alpha: 1,
                    decay: 0.08
                });
            }
        }
    }

    stopSlide() {
        if (this.runner.isSliding) {
            this.runner.isSliding = false;
            this.runner.slideTimer = 0;
            this.runner.height = 60;
            this.runner.y = this.groundY - this.runner.height;
        }
    }

    gameLoop(time) {
        if (this.isRunning && !this.isPaused) {
            const dt = Math.min(32, time - (this.lastTime || time));
            this.lastTime = time;
            
            this.update(dt);
            this.render();
            this.frames++;
        }
        
        if (this.isRunning) {
            this.loopId = requestAnimationFrame((t) => this.gameLoop(t));
        }
    }

    update(dt) {
        const timeFactor = dt / 16.66;
        
        // Speed scaling as distance increases
        const speedBoost = this.runner.boostActive ? 5.0 : 0;
        this.currentSpeed = (this.baseSpeed + (this.distance / 400)) + speedBoost;
        this.distance += Math.floor(this.currentSpeed * 0.15 * timeFactor);
        this.score = this.distance;

        // Gap mechanics: Slowly widen when running clean, narrow down if stalled
        if (this.runner.boostActive) {
            this.monster.gap = Math.min(70, this.monster.gap + 0.15 * timeFactor);
        } else {
            // Natural closing rate that scales with run duration
            const decayRate = 0.015 + (this.distance / 25000);
            this.monster.gap = Math.max(0, this.monster.gap - decayRate * timeFactor);
        }

        // Heartbeat pulse sound when monster is dangerously close
        if (this.monster.gap < 25) {
            this.heartbeatTimer += timeFactor;
            if (this.heartbeatTimer >= Math.max(15, this.monster.gap * 1.5)) {
                this.heartbeatTimer = 0;
                if (audioManager) audioManager.playTone(85, 'sine', 0.08, 0.4);
            }
        }

        // Check if monster caught runner
        if (this.monster.gap <= 0) {
            return this.handleCaughtByMonster();
        }

        // Runner Physics
        this.runner.vy += this.runner.gravity * timeFactor;
        this.runner.y += this.runner.vy * timeFactor;

        if (this.runner.y >= this.groundY - this.runner.height) {
            this.runner.y = this.groundY - this.runner.height;
            this.runner.vy = 0;
            this.runner.isGrounded = true;
            this.runner.jumpsLeft = 2;
        }

        // Slide Timer
        if (this.runner.isSliding) {
            this.runner.slideTimer -= timeFactor;
            if (this.runner.slideTimer <= 0) {
                this.stopSlide();
            }
        }

        // Runner Animation frame
        if (this.frames % 5 === 0) {
            this.runner.animFrame = (this.runner.animFrame + 1) % 6;
        }
        if (this.frames % 6 === 0) {
            this.monster.animFrame = (this.monster.animFrame + 1) % 4;
        }

        // Invulnerability countdown
        if (this.runner.invulnerableTime > 0) {
            this.runner.invulnerableTime -= timeFactor;
        }

        // Parallax background updates
        this.backgroundLayers[0].x = (this.backgroundLayers[0].x - 0.5 * timeFactor) % this.canvas.width;
        this.backgroundLayers[1].x = (this.backgroundLayers[1].x - 2.0 * timeFactor) % this.canvas.width;
        this.backgroundLayers[2].x = (this.backgroundLayers[2].x - this.currentSpeed * timeFactor) % this.canvas.width;

        // Spawn Spikes / Obstacles
        if (this.frames >= this.nextObstacleFrame) {
            this.spawnObstacle();
        }

        // Spawn Collectibles & Powerups
        if (this.frames >= this.nextItemFrame) {
            this.spawnCollectibles();
        }

        // Update Obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.x -= this.currentSpeed * timeFactor;

            // AABB Collision with Runner
            if (this.checkCollision(this.runner, obs)) {
                if (this.runner.shieldActive) {
                    // Shield breaks obstacle safely
                    this.runner.shieldActive = false;
                    this.createExplosion(obs.x + obs.width / 2, obs.y + obs.height / 2, '#38bdf8');
                    if (audioManager) audioManager.playLevelUp?.();
                    this.obstacles.splice(i, 1);
                    continue;
                } else if (this.runner.invulnerableTime <= 0) {
                    // Stumble! Monster closes in by 18m!
                    this.monster.gap = Math.max(0, this.monster.gap - 18);
                    this.runner.invulnerableTime = 60; // 1 second invulnerability flash
                    if (audioManager) audioManager.playLose?.();
                    this.createExplosion(this.runner.x, this.runner.y + 20, '#ef4444');
                }
            }

            if (obs.x + obs.width < -50) {
                this.obstacles.splice(i, 1);
            }
        }

        // Update Coins & Magnet Pull
        for (let i = this.coins.length - 1; i >= 0; i--) {
            const coin = this.coins[i];
            
            if (this.runner.magnetActive) {
                const dx = this.runner.x - coin.x;
                const dy = (this.runner.y + 20) - coin.y;
                const dist = Math.hypot(dx, dy);
                if (dist < 220) {
                    coin.x += (dx / dist) * 12 * timeFactor;
                    coin.y += (dy / dist) * 12 * timeFactor;
                }
            }

            coin.x -= this.currentSpeed * timeFactor;

            // Collect Coin
            if (this.checkCollision(this.runner, coin)) {
                this.sessionCoins++;
                if (audioManager) audioManager.playCoin?.();
                this.createExplosion(coin.x, coin.y, '#fbbf24', 6);
                this.coins.splice(i, 1);
                continue;
            }

            if (coin.x < -30) {
                this.coins.splice(i, 1);
            }
        }

        // Update Powerups
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const p = this.powerups[i];
            p.x -= this.currentSpeed * timeFactor;

            if (this.checkCollision(this.runner, p)) {
                this.activatePowerup(p.type);
                this.powerups.splice(i, 1);
                continue;
            }

            if (p.x < -30) {
                this.powerups.splice(i, 1);
            }
        }

        // Update Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * timeFactor;
            p.y += p.vy * timeFactor;
            p.alpha -= p.decay * timeFactor;
            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }

        this.updateHUD();
    }

    spawnObstacle() {
        const types = [
            { type: 'spike', width: 34, height: 35, y: this.groundY - 35 },
            { type: 'high_laser', width: 45, height: 38, y: this.groundY - 95 }, // Requires slide!
            { type: 'boulder', width: 40, height: 40, y: this.groundY - 40 }
        ];

        const selected = types[Math.floor(Math.random() * types.length)];
        this.obstacles.push({
            type: selected.type,
            x: this.canvas.width + 50,
            y: selected.y,
            width: selected.width,
            height: selected.height
        });

        const minGap = 130;
        const maxGap = 260;
        this.nextObstacleFrame = this.frames + Math.floor((minGap + Math.random() * maxGap) / (this.currentSpeed * 0.12));
    }

    spawnCollectibles() {
        const spawnY = Math.random() > 0.5 ? this.groundY - 40 : this.groundY - 110;
        
        // Spawn line of 3 to 5 coins
        const coinCount = Math.floor(Math.random() * 3) + 3;
        for (let i = 0; i < coinCount; i++) {
            this.coins.push({
                x: this.canvas.width + 50 + (i * 35),
                y: spawnY,
                width: 22,
                height: 22
            });
        }

        // 20% Chance for Powerup
        if (Math.random() < 0.25) {
            const pTypes = ['boost', 'shield', 'magnet'];
            const type = pTypes[Math.floor(Math.random() * pTypes.length)];
            this.powerups.push({
                type,
                x: this.canvas.width + 50 + (coinCount * 35) + 60,
                y: this.groundY - 70,
                width: 28,
                height: 28
            });
        }

        this.nextItemFrame = this.frames + Math.floor((200 + Math.random() * 250) / (this.currentSpeed * 0.12));
    }

    activatePowerup(type) {
        if (audioManager) audioManager.playLevelUp?.();
        
        if (type === 'shield') {
            this.runner.shieldActive = true;
            this.showBadge('🛡️ Shield Active', '#38bdf8');
        } else if (type === 'magnet') {
            this.runner.magnetActive = true;
            this.showBadge('🧲 Magnet Active', '#22c55e');
            setTimeout(() => { this.runner.magnetActive = false; }, 7000);
        } else if (type === 'boost') {
            this.runner.boostActive = true;
            this.showBadge('⚡ Super Boost!', '#f59e0b');
            setTimeout(() => { this.runner.boostActive = false; }, 4000);
        }
    }

    showBadge(text, color) {
        if (!this.badgeContainer) return;
        const badge = document.createElement('span');
        badge.className = 'badge px-3 py-2 fw-bold shadow-lg';
        badge.style.background = 'rgba(0, 0, 0, 0.85)';
        badge.style.border = `1px solid ${color}`;
        badge.style.color = color;
        badge.textContent = text;
        this.badgeContainer.appendChild(badge);

        setTimeout(() => {
            badge.remove();
        }, 3000);
    }

    checkCollision(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }

    createExplosion(x, y, color, count = 15) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                size: 3 + Math.random() * 4,
                color,
                alpha: 1,
                decay: 0.04
            });
        }
    }

    updateHUD() {
        if (this.coinDisplay) this.coinDisplay.textContent = this.sessionCoins;
        if (this.distanceDisplay) this.distanceDisplay.textContent = this.distance;
        
        const gapMeters = Math.floor(this.monster.gap);
        if (this.monsterDistText) {
            this.monsterDistText.textContent = `Gap: ${gapMeters}m`;
            this.monsterDistText.className = gapMeters < 20 ? 'text-danger fw-black animate-pulse' : gapMeters < 35 ? 'text-warning fw-bold' : 'text-success';
        }

        if (this.dangerProgressBar) {
            const percent = Math.min(100, Math.max(0, (gapMeters / 70) * 100));
            this.dangerProgressBar.style.width = `${percent}%`;
            this.dangerProgressBar.className = percent < 30 ? 'progress-bar bg-danger progress-bar-striped progress-bar-animated' : percent < 60 ? 'progress-bar bg-warning' : 'progress-bar bg-success';
        }
    }

    handleCaughtByMonster() {
        this.isRunning = false;
        if (this.loopId) cancelAnimationFrame(this.loopId);

        // Update High Score & Coins
        if (this.distance > this.highScore) {
            this.highScore = this.distance;
            localStorage.setItem('luckykit_escape_best', this.highScore.toString());
        }

        // Award Coins & XP to Profile
        if (this.sessionCoins > 0) {
            storage.updateState(s => {
                s.coins += this.sessionCoins;
                s.xp += Math.floor(this.distance * 0.5);
            });
        }

        // Render Caught Overlay
        if (this.overlayScore) this.overlayScore.textContent = `Distance Survived: ${this.distance}m`;
        if (this.overlayCoins) this.overlayCoins.textContent = `+${this.sessionCoins}`;
        if (this.overlayBest) this.overlayBest.textContent = `${this.highScore}m`;
        if (this.gameOverOverlay) {
            this.gameOverOverlay.classList.remove('d-none');
            this.gameOverOverlay.classList.add('d-flex');
        }

        if (audioManager) audioManager.playGameOver?.();
        this.gameOver(false);
    }

    render() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.clearRect(0, 0, w, h);

        // 1. Render Layered Atmospheric Background
        this.drawBackground(ctx, w, h);

        // 2. Draw Obstacles
        this.drawObstacles(ctx);

        // 3. Draw Collectibles & Powerups
        this.drawCollectibles(ctx);

        // 4. Draw The Pursuing Monster
        this.drawMonster(ctx);

        // 5. Draw Runner (The Man)
        this.drawRunner(ctx);

        // 6. Draw Particle Effects
        this.drawParticles(ctx);
    }

    drawBackground(ctx, w, h) {
        // Dark Sky Gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, this.groundY);
        skyGrad.addColorStop(0, '#11071f');
        skyGrad.addColorStop(0.6, '#260b2b');
        skyGrad.addColorStop(1, '#4a0e17');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, this.groundY);

        // Distant Blood Moon
        ctx.save();
        ctx.fillStyle = '#ef4444';
        ctx.shadowBlur = 40;
        ctx.shadowColor = 'rgba(239, 68, 68, 0.8)';
        ctx.beginPath();
        ctx.arc(w * 0.75, 90, 45, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Mountains / Castle Silhouette
        ctx.fillStyle = 'rgba(20, 8, 30, 0.85)';
        ctx.beginPath();
        ctx.moveTo(0, this.groundY);
        for (let x = 0; x <= w; x += 60) {
            const peak = 180 + Math.sin((x + this.backgroundLayers[0].x) * 0.015) * 45;
            ctx.lineTo(x, peak);
        }
        ctx.lineTo(w, this.groundY);
        ctx.fill();

        // Stone Ground & Speed Highway
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(0, this.groundY, w, h - this.groundY);

        // Glowing Road Surface Line
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(0, this.groundY);
        ctx.lineTo(w, this.groundY);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Ground Tiles Speed Grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 2;
        const gridOffset = (this.backgroundLayers[2].x) % 40;
        for (let x = gridOffset; x < w; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, this.groundY);
            ctx.lineTo(x - 30, h);
            ctx.stroke();
        }
    }

    drawRunner(ctx) {
        const r = this.runner;
        ctx.save();

        // Invulnerability blink
        if (r.invulnerableTime > 0 && Math.floor(this.frames / 4) % 2 === 0) {
            ctx.globalAlpha = 0.4;
        }

        const rx = r.x;
        const ry = r.y;

        // Energy Shield Sphere
        if (r.shieldActive) {
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 3;
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#38bdf8';
            ctx.beginPath();
            ctx.arc(rx + r.width / 2, ry + r.height / 2, 40, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
            ctx.fill();
        }

        if (r.isSliding) {
            // Sliding Runner Body (Low Profile)
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(rx, ry + 10, 48, 20); // Torso sliding

            // Head
            ctx.fillStyle = '#fde047';
            ctx.beginPath();
            ctx.arc(rx + 42, ry + 12, 10, 0, Math.PI * 2);
            ctx.fill();

            // Cyber Headband Trail
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(rx + 36, ry + 8);
            ctx.lineTo(rx - 15, ry + 4 + Math.sin(this.frames * 0.4) * 3);
            ctx.stroke();
        } else {
            // Standing / Running / Jumping Man
            const legCycle = Math.sin(this.frames * 0.35);

            // Legs
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 6;
            ctx.lineCap = 'round';

            // Left Leg
            ctx.beginPath();
            ctx.moveTo(rx + 12, ry + 36);
            ctx.lineTo(rx + 12 - legCycle * 14, ry + 60);
            ctx.stroke();

            // Right Leg
            ctx.beginPath();
            ctx.moveTo(rx + 20, ry + 36);
            ctx.lineTo(rx + 20 + legCycle * 14, ry + 60);
            ctx.stroke();

            // Torso (Cyan Cyber Armor)
            ctx.fillStyle = '#0284c7';
            ctx.fillRect(rx + 6, ry + 16, 20, 22);

            // Arms (Pumping)
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(rx + 16, ry + 20);
            ctx.lineTo(rx + 16 + legCycle * 12, ry + 32);
            ctx.stroke();

            // Head
            ctx.fillStyle = '#fde047';
            ctx.beginPath();
            ctx.arc(rx + 16, ry + 10, 10, 0, Math.PI * 2);
            ctx.fill();

            // Flapping Red Scarf / Headband
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(rx + 10, ry + 8);
            ctx.lineTo(rx - 18, ry + 6 + Math.sin(this.frames * 0.4) * 6);
            ctx.stroke();
        }

        ctx.restore();
    }

    drawMonster(ctx) {
        // Monster Position calculated from gap (0m = caught, 70m = far left)
        const mx = Math.max(-80, this.runner.x - (this.monster.gap * 4.8));
        const my = this.groundY - 115;
        const breath = Math.sin(this.frames * 0.2) * 5;

        ctx.save();
        
        // Shadowy Beast Body
        ctx.fillStyle = '#09050e';
        ctx.shadowBlur = 25;
        ctx.shadowColor = 'rgba(239, 68, 68, 0.7)';

        // Monster Torso & Claws
        ctx.beginPath();
        ctx.arc(mx + 45, my + 65 + breath, 50, 0, Math.PI * 2);
        ctx.fill();

        // Monster Head & Horns
        ctx.beginPath();
        ctx.arc(mx + 75, my + 35, 38, 0, Math.PI * 2);
        ctx.fill();

        // Horns
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(mx + 60, my + 15);
        ctx.lineTo(mx + 40, my - 25);
        ctx.lineTo(mx + 75, my + 5);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(mx + 80, my + 15);
        ctx.lineTo(mx + 100, my - 25);
        ctx.lineTo(mx + 95, my + 10);
        ctx.fill();

        // Demonic Glowing Red Eyes
        ctx.fillStyle = '#ef4444';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff0000';
        ctx.beginPath();
        ctx.arc(mx + 88, my + 30, 7, 0, Math.PI * 2);
        ctx.arc(mx + 98, my + 33, 6, 0, Math.PI * 2);
        ctx.fill();

        // Jaws & Glowing Teeth
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 5;
        const jawOpen = Math.abs(Math.sin(this.frames * 0.3)) * 12;
        ctx.beginPath();
        ctx.moveTo(mx + 85, my + 48);
        ctx.lineTo(mx + 110, my + 48 + jawOpen);
        ctx.lineTo(mx + 95, my + 60 + jawOpen);
        ctx.fill();

        // Trailing Dark Shadow Smoke
        ctx.fillStyle = 'rgba(15, 5, 20, 0.4)';
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.arc(mx - (i * 25), my + 50 + Math.sin(this.frames * 0.2 + i) * 15, 30 + (i * 5), 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    drawObstacles(ctx) {
        this.obstacles.forEach(obs => {
            ctx.save();
            if (obs.type === 'spike') {
                ctx.fillStyle = '#dc2626';
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#ef4444';
                ctx.beginPath();
                ctx.moveTo(obs.x, obs.y + obs.height);
                ctx.lineTo(obs.x + obs.width / 2, obs.y);
                ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
                ctx.fill();
            } else if (obs.type === 'high_laser') {
                // High Laser Gate (Slide Under!)
                ctx.fillStyle = '#f59e0b';
                ctx.fillRect(obs.x, obs.y, 8, obs.height);
                ctx.fillRect(obs.x + obs.width - 8, obs.y, 8, obs.height);

                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 6;
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#ef4444';
                ctx.beginPath();
                ctx.moveTo(obs.x, obs.y + 10);
                ctx.lineTo(obs.x + obs.width, obs.y + 10);
                ctx.stroke();
            } else if (obs.type === 'boulder') {
                ctx.fillStyle = '#78716c';
                ctx.beginPath();
                ctx.arc(obs.x + obs.width / 2, obs.y + obs.height / 2, obs.width / 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        });
    }

    drawCollectibles(ctx) {
        // Coins
        this.coins.forEach(coin => {
            ctx.save();
            ctx.fillStyle = '#fbbf24';
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#f59e0b';
            ctx.beginPath();
            ctx.arc(coin.x + coin.width / 2, coin.y + coin.height / 2, coin.width / 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#d97706';
            ctx.font = 'bold 12px Rajdhani, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('$', coin.x + coin.width / 2, coin.y + coin.height / 2);
            ctx.restore();
        });

        // Powerups
        this.powerups.forEach(p => {
            ctx.save();
            const px = p.x + p.width / 2;
            const py = p.y + p.height / 2 + Math.sin(this.frames * 0.15) * 4;

            ctx.fillStyle = p.type === 'shield' ? '#38bdf8' : p.type === 'boost' ? '#f59e0b' : '#22c55e';
            ctx.shadowBlur = 15;
            ctx.shadowColor = ctx.fillStyle;

            ctx.beginPath();
            ctx.arc(px, py, 14, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.font = '14px Outfit, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const icon = p.type === 'shield' ? '🛡️' : p.type === 'boost' ? '⚡' : '🧲';
            ctx.fillText(icon, px, py);
            ctx.restore();
        });
    }

    drawParticles(ctx) {
        this.particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", () => {
        new EscapeFromMonster();
    });
} else {
    new EscapeFromMonster();
}
