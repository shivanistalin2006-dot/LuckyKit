import { storage } from '../core/storage.js';
import { eventBus } from '../core/eventBus.js';

const ACHIEVEMENTS = [
    { id: 'first_play', name: 'First Blood', desc: 'Play your first game', target: 1, type: 'plays' },
    { id: 'play_10', name: 'Arcade Rat', desc: 'Play 10 games', target: 10, type: 'plays' },
    { id: 'first_win', name: 'Winner Winner', desc: 'Win your first game', target: 1, type: 'wins' }
];

class AchievementEngine {
    constructor() {
        eventBus.on('GAME_OVER', () => this.checkAchievements());
        eventBus.on('GAME_WIN', () => this.checkAchievements());
    }

    checkAchievements() {
        const state = storage.getState();
        const unlocked = state.achievements || [];
        
        let newlyUnlocked = false;

        ACHIEVEMENTS.forEach(ach => {
            if (unlocked.includes(ach.id)) return;

            let progress = 0;
            if (ach.type === 'plays') progress = state.stats.totalPlays;
            if (ach.type === 'wins') progress = state.stats.totalWins;

            if (progress >= ach.target) {
                storage.updateState(s => {
                    if (!s.achievements) s.achievements = [];
                    s.achievements.push(ach.id);
                });
                newlyUnlocked = true;
                
                // Reward 100 coins for every achievement
                eventBus.emit('ACHIEVEMENT_UNLOCKED', { achievement: ach });
                eventBus.emit('MISSION_COMPLETE', { coinReward: 100, xpReward: 200, bpXpReward: 0 }); 
            }
        });

        if (newlyUnlocked) {
            eventBus.emit('UI_UPDATE');
        }
    }
}

export const achievementEngine = new AchievementEngine();
