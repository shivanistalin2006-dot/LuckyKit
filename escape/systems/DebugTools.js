// escape/systems/DebugTools.js
import { settingsManager } from '../core/SettingsManager.js';
import { PATROL_WAYPOINTS } from '../world/FacilityMap.js';

export class DebugTools {
    constructor() {
        this.fps = 60;
        this.lastTime = performance.now();
        this.frames = 0;
        this.godMode = false;
    }

    update() {
        this.frames++;
        const now = performance.now();
        if (now - this.lastTime >= 1000) {
            this.fps = this.frames;
            this.frames = 0;
            this.lastTime = now;
        }
    }

    render(ctx, player, monster, camera) {
        if (!settingsManager.get('debugMode')) return;

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Top left debug panel
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 1;
        ctx.fillRect(10, 60, 260, 180);
        ctx.strokeRect(10, 60, 260, 180);

        ctx.fillStyle = '#22c55e';
        ctx.font = '12px monospace';
        ctx.fillText(`FPS: ${this.fps}`, 20, 80);
        ctx.fillText(`Player Pos: (${Math.round(player.x)}, ${Math.round(player.y)})`, 20, 100);
        ctx.fillText(`Player Noise: ${player.noiseRadius}px`, 20, 120);
        ctx.fillText(`Monster Pos: (${Math.round(monster.x)}, ${Math.round(monster.y)})`, 20, 140);
        ctx.fillText(`Monster State: ${monster.state}`, 20, 160);
        ctx.fillText(`God Mode: ${this.godMode ? 'ON' : 'OFF'} (Toggle: G)`, 20, 180);
        ctx.fillText(`Waypoint Node: ${monster.currentNodeIdx} / ${PATROL_WAYPOINTS.length}`, 20, 200);
        ctx.fillText(`Toggle Debug: F3`, 20, 220);

        ctx.restore();

        // In-world gizmos
        ctx.save();
        ctx.translate(-camera.x, -camera.y);

        // Monster Hearing Radius
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(monster.x, monster.y, monster.hearingRange, 0, Math.PI * 2);
        ctx.stroke();

        // Player Noise Radius
        if (player.noiseRadius > 0) {
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
            ctx.beginPath();
            ctx.arc(player.x, player.y, player.noiseRadius, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }
}

export const debugTools = new DebugTools();
