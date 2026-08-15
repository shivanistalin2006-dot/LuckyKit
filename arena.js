import { BaseGame } from './core/BaseGame.js?v=2.5';
import { gameManager } from './core/gameManager.js?v=2.5';
import { audioManager } from './audio/audioManager.js?v=2.5';
import { animationManager } from './animation/animationManager.js';
import { assetLoader } from './core/assetLoader.js?v=2.5';

const MAP_SIZE = 2000;
const TILE_SIZE = 50;

class NeonArena extends BaseGame {
    constructor() {
        super("arena");
        this.canvas = document.getElementById('arenaCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.minimap = document.getElementById('minimapCanvas');
        this.mctx = this.minimap.getContext('2d');
        
        this.healthBar = document.getElementById('healthBar');
        this.aliveCountDisplay = document.getElementById('aliveCount');
        this.killsDisplay = document.getElementById('killsDisplay');
        
        this.camera = { x: 0, y: 0, width: 800, height: 450 };
        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.keys = {};
        this.mouse = { x: 0, y: 0, down: false };
        this.joysticks = { move: { x: 0, y: 0 }, aim: { x: 0, y: 0, active: false } };
        
        this.bindControls();
        this.initMobileControls();
        
        this.assetsLoaded = false;
        assetLoader.loadImages({
            player: 'assets/player_ship.jpg',
            enemy: 'assets/enemy_ship.jpg',
            bg: 'assets/space_bg.jpg',
            health: 'assets/health_pack.jpg'
        }).then(() => {
            this.assetsLoaded = true;
        });

        gameManager.registerGame(this);
    }

    resize() {
        if (!this.canvas) return;
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.width * (9/16);
        this.camera.width = this.canvas.width;
        this.camera.height = this.canvas.height;
    }

    bindControls() {
        
        document.getElementById('restartBtn')?.addEventListener('click', () => {
            this.start();
        });

        window.addEventListener('keydown', e => this.keys[e.code] = true);
        window.addEventListener('keyup', e => this.keys[e.code] = false);
        
        this.canvas.addEventListener('mousemove', e => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            this.mouse.y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
        });
        this.canvas.addEventListener('mousedown', () => this.mouse.down = true);
        this.canvas.addEventListener('mouseup', () => this.mouse.down = false);
    }

    initMobileControls() {
        if (typeof nipplejs === 'undefined') return;
        
        const moveZone = document.getElementById('moveZone');
        const aimZone = document.getElementById('aimZone');
        
        if (moveZone) {
            this.moveManager = nipplejs.create({ zone: moveZone, color: 'white', size: 100 });
            this.moveManager.on('move', (e, data) => {
                this.joysticks.move.x = Math.cos(data.angle.radian);
                this.joysticks.move.y = -Math.sin(data.angle.radian);
            });
            this.moveManager.on('end', () => { this.joysticks.move.x = 0; this.joysticks.move.y = 0; });
        }
        
        if (aimZone) {
            this.aimManager = nipplejs.create({ zone: aimZone, color: '#ec4899', size: 100 });
            this.aimManager.on('move', (e, data) => {
                this.joysticks.aim.active = true;
                this.joysticks.aim.x = Math.cos(data.angle.radian);
                this.joysticks.aim.y = -Math.sin(data.angle.radian);
            });
            this.aimManager.on('end', () => { this.joysticks.aim.active = false; });
        }
    }

    reset() {
        this.entities = [];
        this.bullets = [];
        this.particles = [];
        this.pickups = [];
        
        // Safe Zone
        this.safeZone = { x: MAP_SIZE/2, y: MAP_SIZE/2, radius: MAP_SIZE * 0.7, targetRadius: MAP_SIZE * 0.2 };
        this.safeZoneShrinkRate = 0.5;
        
        this.kills = 0;
        this.aliveCount = 10;
        
        // Create Player
        this.player = this.createEntity(MAP_SIZE/2, MAP_SIZE/2, true);
        this.entities.push(this.player);
        
        // Create Bots
        for (let i = 0; i < 9; i++) {
            let bx = Math.random() * MAP_SIZE;
            let by = Math.random() * MAP_SIZE;
            this.entities.push(this.createEntity(bx, by, false));
        }
        
        // Create random health packs
        for (let i = 0; i < 20; i++) {
            this.pickups.push({
                x: Math.random() * MAP_SIZE,
                y: Math.random() * MAP_SIZE,
                type: 'health',
                radius: 15
            });
        }
        
        this.updateHUD();
        document.getElementById('restartBtn')?.classList.add('d-none');
        const hud = document.getElementById('hudOverlay');
        if (hud) hud.style.display = 'block';
    }

    createEntity(x, y, isPlayer) {
        return {
            isPlayer,
            x, y,
            radius: 20,
            health: 100,
            speed: isPlayer ? 4 : 3,
            color: isPlayer ? '#3b82f6' : '#ef4444',
            angle: 0,
            lastFire: 0,
            fireRate: 200, // ms
            targetX: Math.random() * MAP_SIZE, // AI target
            targetY: Math.random() * MAP_SIZE
        };
    }

    onStart() {
        this.reset();
    }

    update() {
        this.updateSafeZone();
        this.updatePlayer();
        this.updateBots();
        this.updateBullets();
        this.checkCollisions();
        this.updateCamera();
    }

    updateSafeZone() {
        if (this.safeZone.radius > this.safeZone.targetRadius) {
            this.safeZone.radius -= this.safeZoneShrinkRate;
        }
    }

    updatePlayer() {
        if (this.player.health <= 0) return;

        let dx = 0, dy = 0;
        
        // Keyboard
        if (this.keys['KeyW'] || this.keys['ArrowUp']) dy -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) dy += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) dx -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) dx += 1;

        // Joystick Override
        if (this.joysticks.move.x !== 0 || this.joysticks.move.y !== 0) {
            dx = this.joysticks.move.x;
            dy = this.joysticks.move.y;
        }

        // Normalize
        if (dx !== 0 && dy !== 0) {
            const length = Math.sqrt(dx*dx + dy*dy);
            dx /= length;
            dy /= length;
        }

        this.player.x += dx * this.player.speed;
        this.player.y += dy * this.player.speed;
        
        // Constrain to map
        this.player.x = Math.max(this.player.radius, Math.min(MAP_SIZE - this.player.radius, this.player.x));
        this.player.y = Math.max(this.player.radius, Math.min(MAP_SIZE - this.player.radius, this.player.y));

        // Aiming
        if (this.joysticks.aim.active) {
            this.player.angle = Math.atan2(this.joysticks.aim.y, this.joysticks.aim.x);
            this.fireBullet(this.player);
        } else {
            // Mouse aim
            const screenX = this.player.x - this.camera.x;
            const screenY = this.player.y - this.camera.y;
            this.player.angle = Math.atan2(this.mouse.y - screenY, this.mouse.x - screenX);
            
            if (this.mouse.down) {
                this.fireBullet(this.player);
            }
        }
        
        // Safe Zone damage
        const distToCenter = Math.hypot(this.player.x - this.safeZone.x, this.player.y - this.safeZone.y);
        if (distToCenter > this.safeZone.radius) {
            this.player.health -= 0.1;
            this.updateHUD();
        }
    }

    updateBots() {
        this.entities.forEach(bot => {
            if (bot.isPlayer || bot.health <= 0) return;
            
            // Safe zone check
            const distToCenter = Math.hypot(bot.x - this.safeZone.x, bot.y - this.safeZone.y);
            if (distToCenter > this.safeZone.radius) {
                bot.health -= 0.1;
            }

            // AI Logic: Find nearest target
            let target = null;
            let minDist = Infinity;
            
            this.entities.forEach(other => {
                if (other === bot || other.health <= 0) return;
                const d = Math.hypot(bot.x - other.x, bot.y - other.y);
                if (d < 500 && d < minDist) {
                    minDist = d;
                    target = other;
                }
            });

            if (target) {
                // Chase & Shoot
                bot.angle = Math.atan2(target.y - bot.y, target.x - bot.x);
                if (minDist > 150) {
                    bot.x += Math.cos(bot.angle) * bot.speed;
                    bot.y += Math.sin(bot.angle) * bot.speed;
                }
                this.fireBullet(bot);
            } else {
                // Wander
                if (Math.hypot(bot.targetX - bot.x, bot.targetY - bot.y) < 50) {
                    bot.targetX = Math.random() * MAP_SIZE;
                    bot.targetY = Math.random() * MAP_SIZE;
                }
                bot.angle = Math.atan2(bot.targetY - bot.y, bot.targetX - bot.x);
                bot.x += Math.cos(bot.angle) * (bot.speed * 0.5);
                bot.y += Math.sin(bot.angle) * (bot.speed * 0.5);
            }
        });
    }

    fireBullet(entity) {
        const now = Date.now();
        if (now - entity.lastFire > entity.fireRate) {
            entity.lastFire = now;
            
            const offset = entity.radius + 5;
            this.bullets.push({
                x: entity.x + Math.cos(entity.angle) * offset,
                y: entity.y + Math.sin(entity.angle) * offset,
                vx: Math.cos(entity.angle) * 15,
                vy: Math.sin(entity.angle) * 15,
                owner: entity,
                life: 100
            });
            
            if (entity.isPlayer && audioManager) {
                audioManager.playTone(300, 'square', 0.05); // Pew
            }
        }
    }

    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            let b = this.bullets[i];
            b.x += b.vx;
            b.y += b.vy;
            b.life--;
            
            if (b.life <= 0 || b.x < 0 || b.x > MAP_SIZE || b.y < 0 || b.y > MAP_SIZE) {
                this.bullets.splice(i, 1);
            }
        }
    }

    checkCollisions() {
        // Bullet vs Entities
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            let b = this.bullets[i];
            let hit = false;
            
            for (let j = 0; j < this.entities.length; j++) {
                let e = this.entities[j];
                if (e.health <= 0 || b.owner === e) continue;
                
                if (Math.hypot(b.x - e.x, b.y - e.y) < e.radius + 5) {
                    e.health -= 20;
                    hit = true;
                    
                    if (e.isPlayer) {
                        this.updateHUD();
                        if (audioManager) audioManager.playTone(150, 'sawtooth', 0.1);
                        if (animationManager) {
                            animationManager.triggerScreenShake(8, 200);
                            animationManager.applySpringMotion(this.healthBar.parentElement);
                        }
                    }
                    
                    if (e.health <= 0) {
                        this.aliveCount--;
                        if (b.owner.isPlayer) {
                            this.kills++;
                            this.addScore(100);
                            this.killsDisplay.textContent = this.kills;
                            if (animationManager) {
                                const screenX = e.x - this.camera.x;
                                const screenY = e.y - this.camera.y;
                                animationManager.spawnFloatingIcon('💀', window.innerWidth/2, window.innerHeight/2, 'Eliminated!');
                                audioManager.playAchievement();
                            }
                        }
                        this.updateHUD();
                        this.checkWinState();
                    }
                    break;
                }
            }
            if (hit) this.bullets.splice(i, 1);
        }
        
        // Player vs Pickups
        if (this.player.health > 0) {
            for (let i = this.pickups.length - 1; i >= 0; i--) {
                let p = this.pickups[i];
                if (Math.hypot(this.player.x - p.x, this.player.y - p.y) < this.player.radius + p.radius) {
                    if (p.type === 'health' && this.player.health < 100) {
                        this.player.health = Math.min(100, this.player.health + 30);
                        this.pickups.splice(i, 1);
                        this.updateHUD();
                        if (audioManager) audioManager.playLevelUp();
                    }
                }
            }
        }
    }

    updateHUD() {
        if (!this.healthBar || !this.aliveCountDisplay) return;
        
        const pct = Math.max(0, this.player.health);
        this.healthBar.style.width = `${pct}%`;
        
        if (pct < 30) this.healthBar.className = 'progress-bar bg-danger progress-bar-striped progress-bar-animated';
        else if (pct < 60) this.healthBar.className = 'progress-bar bg-warning';
        else this.healthBar.className = 'progress-bar bg-success';
        
        this.aliveCountDisplay.textContent = this.aliveCount;
    }

    checkWinState() {
        if (this.player.health <= 0) {
            this.endGame(false);
        } else if (this.aliveCount === 1) {
            this.endGame(true);
        }
    }

    updateCamera() {
        this.camera.x = this.player.x - this.camera.width / 2;
        this.camera.y = this.player.y - this.camera.height / 2;
        
        // Clamp camera to map bounds
        this.camera.x = Math.max(0, Math.min(MAP_SIZE - this.camera.width, this.camera.x));
        this.camera.y = Math.max(0, Math.min(MAP_SIZE - this.camera.height, this.camera.y));
    }

    render() {
        // Deep space background
        const bgImg = assetLoader.getImage('bg');
        if (bgImg && bgImg.complete) {
            // Draw tileable background
            const ptrn = this.ctx.createPattern(bgImg, 'repeat');
            this.ctx.fillStyle = ptrn;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.ctx.fillStyle = '#050b14';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);

        // Synthwave Grid (Optional now that we have a nebula, but keeping it subtle)
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.03)';
        this.ctx.lineWidth = 1;
        
        const startX = Math.floor(this.camera.x / TILE_SIZE) * TILE_SIZE;
        const startY = Math.floor(this.camera.y / TILE_SIZE) * TILE_SIZE;
        
        this.ctx.beginPath();
        for (let x = startX; x < this.camera.x + this.camera.width + TILE_SIZE; x += TILE_SIZE) {
            this.ctx.moveTo(x, this.camera.y);
            this.ctx.lineTo(x, this.camera.y + this.camera.height);
        }
        for (let y = startY; y < this.camera.y + this.camera.height + TILE_SIZE; y += TILE_SIZE) {
            this.ctx.moveTo(this.camera.x, y);
            this.ctx.lineTo(this.camera.x + this.camera.width, y);
        }
        this.ctx.stroke();

        // Draw Map Border (Cyberpunk Red)
        this.ctx.strokeStyle = '#ff003c';
        this.ctx.lineWidth = 4;
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#ff003c';
        this.ctx.strokeRect(0, 0, MAP_SIZE, MAP_SIZE);
        this.ctx.shadowBlur = 0;

        // Pulsing Safe Zone (Neon Green)
        const pulse = Math.sin(Date.now() / 300) * 0.05;
        this.ctx.fillStyle = `rgba(16, 185, 129, ${0.05 + pulse})`;
        this.ctx.strokeStyle = '#10b981';
        this.ctx.lineWidth = 3;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#10b981';
        this.ctx.beginPath();
        this.ctx.arc(this.safeZone.x, this.safeZone.y, this.safeZone.radius, 0, Math.PI*2);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;

        // Draw Pickups
        const hpImg = assetLoader.getImage('health');
        this.pickups.forEach(p => {
            if (hpImg && hpImg.complete) {
                this.ctx.save();
                this.ctx.globalCompositeOperation = 'screen';
                this.ctx.translate(p.x, p.y);
                this.ctx.drawImage(hpImg, -p.radius * 1.5, -p.radius * 1.5, p.radius * 3, p.radius * 3);
                this.ctx.restore();
            } else {
                this.ctx.fillStyle = '#0ff';
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = '#0ff';
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2);
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            }
        });

        // Draw Bullets (Laser bolts)
        this.ctx.globalCompositeOperation = 'screen';
        this.bullets.forEach(b => {
            this.ctx.strokeStyle = b.owner.isPlayer ? '#00ffff' : '#ff003c';
            this.ctx.lineWidth = 5;
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = this.ctx.strokeStyle;
            this.ctx.beginPath();
            this.ctx.moveTo(b.x - b.vx * 1.5, b.y - b.vy * 1.5);
            this.ctx.lineTo(b.x, b.y);
            this.ctx.stroke();
        });
        this.ctx.shadowBlur = 0;
        this.ctx.globalCompositeOperation = 'source-over';

        // Draw Entities (Ships)
        const playerImg = assetLoader.getImage('player');
        const enemyImg = assetLoader.getImage('enemy');

        this.entities.forEach(e => {
            if (e.health <= 0) return;
            
            this.ctx.save();
            this.ctx.translate(e.x, e.y);
            // The generated images are usually facing UP (which is -90 degrees or -Math.PI/2 in canvas terms).
            // Canvas 0 angle is facing RIGHT. So we need to rotate an extra 90 degrees (Math.PI/2) to align the image rightwards.
            this.ctx.rotate(e.angle + Math.PI/2);
            
            const isPlayer = e.isPlayer;
            const img = isPlayer ? playerImg : enemyImg;

            if (img && img.complete) {
                this.ctx.globalCompositeOperation = 'screen'; // Blends the dark background of JPG with the nebula
                const drawSize = e.radius * 3; 
                this.ctx.drawImage(img, -drawSize/2, -drawSize/2, drawSize, drawSize);
                this.ctx.globalCompositeOperation = 'source-over';
            } else {
                // Fallback rendering
                const primaryColor = isPlayer ? '#00f3ff' : '#ff003c';
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = primaryColor;
                this.ctx.beginPath();
                this.ctx.moveTo(e.radius + 10, -e.radius - 10);
                this.ctx.lineTo(e.radius + 10, e.radius + 10);
                this.ctx.lineTo(-e.radius * 0.5, 0); 
                this.ctx.closePath();
                this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
                this.ctx.fill();
                this.ctx.lineWidth = 3;
                this.ctx.strokeStyle = primaryColor;
                this.ctx.stroke();
            }

            this.ctx.restore();

            // Health bar over head
            this.ctx.fillStyle = 'rgba(0,255,255,0.2)';
            this.ctx.fillRect(e.x - 20, e.y - e.radius - 20, 40, 4);
            const primaryColor = isPlayer ? '#00f3ff' : '#ff003c';
            this.ctx.fillStyle = primaryColor;
            this.ctx.fillRect(e.x - 20, e.y - e.radius - 20, 40 * (Math.max(0, e.health)/100), 4);
        });

        this.ctx.restore();
        this.renderMinimap();
    }

    renderMinimap() {
        this.mctx.fillStyle = '#0f172a';
        this.mctx.fillRect(0, 0, this.minimap.width, this.minimap.height);
        
        const scale = this.minimap.width / MAP_SIZE;
        
        // Safe Zone
        this.mctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.mctx.strokeStyle = '#10b981';
        this.mctx.lineWidth = 1;
        this.mctx.beginPath();
        this.mctx.arc(this.safeZone.x * scale, this.safeZone.y * scale, this.safeZone.radius * scale, 0, Math.PI*2);
        this.mctx.fill();
        this.mctx.stroke();

        // Entities
        this.entities.forEach(e => {
            if (e.health <= 0) return;
            this.mctx.fillStyle = e.isPlayer ? '#3b82f6' : '#ef4444';
            this.mctx.beginPath();
            this.mctx.arc(e.x * scale, e.y * scale, 3, 0, Math.PI*2);
            this.mctx.fill();
        });
    }

    endGame(isWin) {
        if (isWin) {
            this.score += 5000;
            this.score += this.kills * 1000;
            if (audioManager) audioManager.playWin();
            if (animationManager) animationManager.spawnConfetti(window.innerWidth/2, window.innerHeight/2, 200);
            this.gameOver(true);
        } else {
            this.score += this.kills * 1000;
            this.gameOver(false);
        }
        
        document.getElementById('restartBtn')?.classList.remove('d-none');
    }
}

if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", () => {
        const game = new NeonArena();
    });
} else {
    const game = new NeonArena();
}
