// escape/core/AchievementSystem.js
import { storage } from '../../core/storage.js';
import { eventBus } from './EventBus.js';

export const HORROR_ACHIEVEMENTS = [
    { id: 'first_escape', title: 'Survivor', desc: 'Escape from Sub-Level Biolab 07', icon: '🏆', xp: 500, coins: 250 },
    { id: 'stealth_ghost', title: 'Ghost in the Shadows', desc: 'Escape without being detected into chase mode', icon: '👻', xp: 800, coins: 400 },
    { id: 'true_ending', title: 'Bioweapon Truth', desc: 'Synthesize the antidote and expose Dr. Vance', icon: '👑', xp: 1200, coins: 600 },
    { id: 'lore_master', title: 'Classified Archivist', desc: 'Collect all 4 classified facility audio logs', icon: '📼', xp: 400, coins: 200 },
    { id: 'hacker_purge', title: 'System Override', desc: 'Escape via the emergency ventilation exhaust', icon: '💻', xp: 750, coins: 350 }
];

export class AchievementSystem {
    constructor() {
        this.unlocked = new Set(storage.getState()?.achievements || []);
    }

    unlock(achievementId) {
        if (this.unlocked.has(achievementId)) return;
        const ach = HORROR_ACHIEVEMENTS.find(a => a.id === achievementId);
        if (!ach) return;

        this.unlocked.add(achievementId);
        storage.updateState(s => {
            if (!s.achievements) s.achievements = [];
            if (!s.achievements.includes(achievementId)) s.achievements.push(achievementId);
            s.coins += ach.coins;
        });

        eventBus.emit('ACHIEVEMENT_UNLOCKED', ach);
    }
}

export const achievementSystem = new AchievementSystem();
