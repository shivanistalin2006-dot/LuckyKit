// escape/systems/LightingEngine.js
import { settingsManager } from '../core/SettingsManager.js';

export class LightingEngine {
    constructor() {
        this.lightningTimer = 0;
        this.isLightning = false;
        this.flickerAlpha = 0;
    }

    update() {
        this.lightningTimer++;
        if (this.lightningTimer > 450 && Math.random() < 0.02) {
            this.isLightning = true;
            this.lightningTimer = 0;
            setTimeout(() => { this.isLightning = false; }, 120);
        }

        // Random fluorescent light flicker
        if (Math.random() < 0.04) {
            this.flickerAlpha = Math.random() * 0.15;
        } else {
            this.flickerAlpha = 0;
        }
    }

    render(ctx, canvas, player, camera) {
        if (this.isLightning) return; // Full flash

        const darkCanvas = document.createElement('canvas');
        darkCanvas.width = canvas.width;
        darkCanvas.height = canvas.height;
        const dCtx = darkCanvas.getContext('2d');

        const darkness = Math.min(0.96, Math.max(0.7, 0.94 - (settingsManager.get('brightness') - 1) * 0.2));
        dCtx.fillStyle = `rgba(2, 4, 8, ${darkness + this.flickerAlpha})`;
        dCtx.fillRect(0, 0, darkCanvas.width, darkCanvas.height);

        const px = player.x - camera.x;
        const py = player.y - camera.y;

        dCtx.globalCompositeOperation = 'destination-out';

        // Ambient sight aura
        const ambientRadius = player.isHiding ? 40 : 90;
        const ambientGrad = dCtx.createRadialGradient(px, py, 15, px, py, ambientRadius);
        ambientGrad.addColorStop(0, 'rgba(0,0,0,1)');
        ambientGrad.addColorStop(1, 'rgba(0,0,0,0)');
        dCtx.fillStyle = ambientGrad;
        dCtx.beginPath();
        dCtx.arc(px, py, ambientRadius, 0, Math.PI * 2);
        dCtx.fill();

        // Flashlight beam
        if (player.flashlightOn && player.battery > 0 && !player.isHiding) {
            dCtx.save();
            dCtx.translate(px, py);
            dCtx.rotate(player.angle);

            const flashGrad = dCtx.createRadialGradient(0, 0, 10, 0, 0, 380);
            flashGrad.addColorStop(0, 'rgba(0,0,0,1)');
            flashGrad.addColorStop(0.8, 'rgba(0,0,0,0.85)');
            flashGrad.addColorStop(1, 'rgba(0,0,0,0)');

            dCtx.fillStyle = flashGrad;
            dCtx.beginPath();
            dCtx.moveTo(0, 0);
            dCtx.arc(0, 0, 380, -Math.PI * 0.22, Math.PI * 0.22);
            dCtx.closePath();
            dCtx.fill();

            dCtx.restore();
        }

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(darkCanvas, 0, 0);
        ctx.restore();
    }
}

export const lightingEngine = new LightingEngine();
