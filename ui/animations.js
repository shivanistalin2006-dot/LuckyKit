import { eventBus } from '../core/eventBus.js';
import { audioManager } from '../audio/audioManager.js';

class GlobalAnimations {
    constructor() {
        eventBus.on('LEVEL_UP', (data) => this.showLevelUp(data.newLevel));
        eventBus.on('MISSION_COMPLETE', (data) => this.showMissionComplete(data.missionName));
        eventBus.on('ITEM_BOUGHT', (data) => this.showUnlock(data.item.name, data.item.id));
        eventBus.on('ACHIEVEMENT_UNLOCKED', (data) => this.showUnlock(data.achievement.name, '🏆'));
    }

    createOverlay(contentHTML) {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
        overlay.style.zIndex = '9999';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s ease';
        
        overlay.innerHTML = contentHTML;
        
        document.body.appendChild(overlay);
        
        // Trigger reflow for animation
        void overlay.offsetWidth;
        overlay.style.opacity = '1';

        // Auto remove after 3 seconds
        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 300);
        }, 3000);
    }

    showLevelUp(level) {
        if (audioManager) audioManager.playLevelUp();
        
        const html = `
            <div style="font-size: 80px; margin-bottom: 20px; animation: bounce 1s infinite;">⬆️</div>
            <h1 style="color: #06b6d4; font-weight: 900; font-size: 4rem; text-shadow: 0 0 20px #06b6d4;">LEVEL UP!</h1>
            <h3 style="color: white;">You reached Level ${level}</h3>
        `;
        this.createOverlay(html);
    }

    showUnlock(itemName, icon) {
        if (audioManager) audioManager.playTone(800, 'sine', 0.1);
        
        const html = `
            <div style="font-size: 100px; margin-bottom: 20px; animation: pulse 1s infinite;">${icon}</div>
            <h1 style="color: #f59e0b; font-weight: 900; font-size: 3rem; text-shadow: 0 0 20px #f59e0b;">UNLOCKED</h1>
            <h3 style="color: white;">${itemName}</h3>
        `;
        this.createOverlay(html);
    }

    showMissionComplete(missionName) {
        if (!missionName) return;
        if (audioManager) audioManager.playWin();
        
        const html = `
            <div style="font-size: 80px; margin-bottom: 20px; color: #22c55e;">🎯</div>
            <h2 style="color: #22c55e; font-weight: 900; text-shadow: 0 0 20px #22c55e;">MISSION COMPLETE</h2>
            <h4 style="color: white;">${missionName}</h4>
        `;
        this.createOverlay(html);
    }
}

// Add basic keyframes for the animations
const style = document.createElement('style');
style.innerHTML = `
@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
}
@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
}
`;
document.head.appendChild(style);

export const globalAnimations = new GlobalAnimations();
