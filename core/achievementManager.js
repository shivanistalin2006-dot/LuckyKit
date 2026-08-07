import { storage } from './storage.js';
import { animationManager } from '../animation/animationManager.js';
import { audioManager } from '../audio/audioManager.js';

export const ACHIEVEMENTS = [
    { id: 'first_win', title: 'First Blood', desc: 'Win your first game.', category: 'Beginner', xp: 500, coins: 100 },
    { id: 'play_10', title: 'Arcade Regular', desc: 'Play 10 games.', category: 'Explorer', xp: 1000, coins: 200 },
    { id: 'win_chess', title: 'Grandmaster', desc: 'Defeat the Chess AI.', category: 'Strategy King', xp: 2000, coins: 500 },
    { id: 'runner_1000', title: 'Speed Demon', desc: 'Score 1000 in Midnight Runner.', category: 'Speedrunner', xp: 1500, coins: 300 },
    { id: 'play_all', title: 'Completionist', desc: 'Play every game at least once.', category: 'Completionist', xp: 5000, coins: 1000, hidden: true }
];

export class AchievementManager {
    constructor() {
        if (AchievementManager.instance) return AchievementManager.instance;
        AchievementManager.instance = this;
    }

    checkAchievement(id) {
        const state = storage.getState();
        if (state.achievements.includes(id)) return; // Already unlocked

        const achievement = ACHIEVEMENTS.find(a => a.id === id);
        if (!achievement) return;

        // Unlock it
        storage.updateState(s => {
            s.achievements.push(id);
            s.xp += achievement.xp; // Direct add to avoid circular dep
            s.coins += achievement.coins;
        });

        this.showUnlockNotification(achievement);
    }

    showUnlockNotification(achievement) {
        console.log(`🏆 Achievement Unlocked: ${achievement.title}`);
        if (audioManager) audioManager.playTone(1200, 'sine', 0.5);
        if (animationManager) {
            animationManager.spawnConfetti(window.innerWidth/2, window.innerHeight/2, 100);
            // Will integrate with DOM toast later
        }
    }

    getProgress() {
        const state = storage.getState();
        return {
            unlocked: state.achievements.length,
            total: ACHIEVEMENTS.length,
            percentage: Math.floor((state.achievements.length / ACHIEVEMENTS.length) * 100)
        };
    }
}

export const achievementManager = new AchievementManager();
