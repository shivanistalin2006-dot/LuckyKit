import { eventBus } from '../core/eventBus.js';

/**
 * ParticleFX - 60 FPS Canvas-based Celebration Confetti & Particle Blaster
 */
class ParticleFX {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animationFrame = null;
        this.initEventListeners();
    }

    initEventListeners() {
        eventBus.on('GAME_WIN', () => this.burst(window.innerWidth / 2, window.innerHeight / 2, 70));
        eventBus.on('ACHIEVEMENT_UNLOCKED', () => this.burst(window.innerWidth / 2, window.innerHeight * 0.3, 50));
        eventBus.on('LEVEL_UP', () => this.burst(window.innerWidth / 2, window.innerHeight * 0.4, 90));
    }

    createCanvas() {
        if (this.canvas) return;
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'luckykit-particle-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100vw';
        this.canvas.style.height = '100vh';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '999999';
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

    burst(x = window.innerWidth / 2, y = window.innerHeight / 2, count = 50) {
        if (typeof document === 'undefined') return;
        this.createCanvas();

        const colors = ['#00ffcc', '#ff007f', '#ffe600', '#7b2cbf', '#00b4d8', '#ffffff'];

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 6;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                size: 4 + Math.random() * 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1,
                decay: 0.015 + Math.random() * 0.02,
                gravity: 0.15
            });
        }

        if (!this.animationFrame) {
            this.loop();
        }
    }

    loop() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.globalAlpha = Math.max(0, p.alpha);
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
            this.ctx.restore();
        }

        if (this.particles.length > 0) {
            this.animationFrame = requestAnimationFrame(() => this.loop());
        } else {
            this.animationFrame = null;
            if (this.canvas && this.canvas.parentNode) {
                this.canvas.parentNode.removeChild(this.canvas);
                this.canvas = null;
                this.ctx = null;
            }
        }
    }
}

export const particleFX = new ParticleFX();
