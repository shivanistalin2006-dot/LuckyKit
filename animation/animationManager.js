import { eventBus } from '../core/eventBus.js';

export class AnimationManager {
    constructor() {
        this.particles = [];
        this.ctx = null;
        this.canvas = null;
        this.isActive = false;

        this.initCanvas();
        this.bindEvents();
    }

    initCanvas() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.createCanvas());
        } else {
            this.createCanvas();
        }
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'globalParticleCanvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100vw';
        this.canvas.style.height = '100vh';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '9998'; // Just below UI overlays
        document.body.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');
        this.resize();

        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    bindEvents() {
        eventBus.on('LEVEL_UP', () => this.spawnConfetti(window.innerWidth / 2, window.innerHeight / 2, 100));
        eventBus.on('MISSION_COMPLETE', () => this.spawnConfetti(window.innerWidth / 2, window.innerHeight * 0.2, 50));
        eventBus.on('COINS_EARNED', (data) => this.spawnFloatingIcon('🪙', window.innerWidth / 2, window.innerHeight / 2, `+${data.amount}`));
        eventBus.on('ITEM_BOUGHT', () => this.spawnCoinExplosion(window.innerWidth / 2, window.innerHeight / 2));
    }

    startLoop() {
        if (this.isActive) return;
        this.isActive = true;
        this.loop();
    }

    loop() {
        if (!this.isActive || !this.ctx) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        let aliveParticles = [];
        
        for (let i = 0; i < this.particles.length; i++) {
            let p = this.particles[i];
            
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity || 0;
            p.life -= p.decay;
            
            if (p.type === 'confetti') {
                p.angle += p.va;
                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate(p.angle);
                this.ctx.fillStyle = p.color;
                this.ctx.globalAlpha = Math.max(0, p.life);
                this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                this.ctx.restore();
            } else if (p.type === 'coin') {
                this.ctx.save();
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(255, 215, 0, ${Math.max(0, p.life)})`; // Gold
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = 'gold';
                this.ctx.fill();
                this.ctx.restore();
            } else if (p.type === 'text') {
                this.ctx.save();
                this.ctx.font = `${p.size}px Outfit, sans-serif`;
                this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, p.life)})`;
                this.ctx.shadowBlur = 5;
                this.ctx.shadowColor = 'black';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(p.text, p.x, p.y);
                this.ctx.restore();
            }

            if (p.life > 0) {
                aliveParticles.push(p);
            }
        }
        
        this.particles = aliveParticles;
        
        if (this.particles.length > 0) {
            requestAnimationFrame(() => this.loop());
        } else {
            this.isActive = false;
        }
    }

    spawnConfetti(x, y, amount) {
        const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
        for (let i = 0; i < amount; i++) {
            this.particles.push({
                type: 'confetti',
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 1) * 15,
                gravity: 0.3,
                life: 1,
                decay: Math.random() * 0.02 + 0.01,
                size: Math.random() * 10 + 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                angle: Math.random() * Math.PI * 2,
                va: (Math.random() - 0.5) * 0.2
            });
        }
        this.startLoop();
    }

    spawnCoinExplosion(x, y) {
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                type: 'coin',
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20,
                gravity: 0.5,
                life: 1,
                decay: Math.random() * 0.03 + 0.02,
                size: Math.random() * 5 + 3
            });
        }
        this.startLoop();
    }

    spawnFloatingIcon(icon, x, y, text) {
        this.particles.push({
            type: 'text',
            text: `${icon} ${text}`,
            x: x,
            y: y,
            vx: 0,
            vy: -2,
            gravity: 0,
            life: 1,
            decay: 0.01,
            size: 24
        });
        this.startLoop();
    }

    spawnHint(text, duration = 2000) {
        if (typeof document === 'undefined') return;
        const hint = document.createElement('div');
        hint.textContent = text;
        hint.style.position = 'fixed';
        hint.style.top = '20%';
        hint.style.left = '50%';
        hint.style.transform = 'translate(-50%, -50%)';
        hint.style.background = 'rgba(0, 0, 0, 0.8)';
        hint.style.color = '#fff';
        hint.style.padding = '10px 20px';
        hint.style.borderRadius = '30px';
        hint.style.border = '1px solid var(--theme-color, #fff)';
        hint.style.boxShadow = '0 5px 15px rgba(0,0,0,0.5)';
        hint.style.zIndex = '9999';
        hint.style.fontSize = '1.2rem';
        hint.style.fontWeight = 'bold';
        hint.style.pointerEvents = 'none';
        hint.style.opacity = '0';
        hint.style.transition = 'opacity 0.3s ease, top 0.3s ease';
        
        document.body.appendChild(hint);
        
        // Trigger reflow
        void hint.offsetWidth;
        
        hint.style.opacity = '1';
        hint.style.top = '15%'; // Float up slightly
        
        setTimeout(() => {
            hint.style.opacity = '0';
            setTimeout(() => {
                if (hint.parentNode) hint.remove();
            }, 300);
        }, duration);
    }

    // V2: Screen Shake Effect
    triggerScreenShake(intensity = 5, duration = 500) {
        const root = document.querySelector('.dashboard-layout') || document.body;
        if (!root) return;
        
        root.style.transition = 'none';
        
        const startTime = Date.now();
        const shake = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed < duration) {
                const progress = elapsed / duration;
                const dampening = 1 - progress;
                const offsetX = (Math.random() - 0.5) * intensity * 2 * dampening;
                const offsetY = (Math.random() - 0.5) * intensity * 2 * dampening;
                
                root.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
                requestAnimationFrame(shake);
            } else {
                root.style.transform = '';
                root.style.transition = 'transform 0.3s ease';
            }
        };
        
        shake();
    }

    // V2: Spring Motion applied to an element
    applySpringMotion(element) {
        if (!element) return;
        element.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        element.style.transform = 'scale(0.9)';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 50);
    }
}

export const animationManager = new AnimationManager();
