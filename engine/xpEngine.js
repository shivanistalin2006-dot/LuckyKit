import { storage } from '../core/storage.js';
import { eventBus } from '../core/eventBus.js';

class XPEngine {
    constructor() {
        this.baseXP = 50; // Base XP for completing a game
        
        eventBus.on('GAME_OVER', (data) => this.handleGameOver(data));
        eventBus.on('MISSION_COMPLETE', (data) => this.addXP(data.xpReward || 100));
    }

    handleGameOver(data) {
        // Calculate XP based on score
        const scoreXP = Math.floor((data.score || 0) / 10);
        const totalXP = this.baseXP + scoreXP;
        this.addXP(totalXP);
    }

    addXP(amount) {
        if (amount <= 0) return;
        
        storage.updateState(state => {
            state.xp += amount;
            
            // Level up logic (simplified curve: Level * 1000 = XP required for next level)
            const requiredXP = state.level * 1000;
            if (state.xp >= requiredXP) {
                state.level += 1;
                state.xp -= requiredXP; // Carry over remainder
                eventBus.emit('LEVEL_UP', { newLevel: state.level });
            }
        });
        
        eventBus.emit('UI_UPDATE');
    }

    trackPlay(gameId) {
        storage.updateState(state => {
            state.stats.totalPlays += 1;
            if (!state.stats.gameStats[gameId]) {
                state.stats.gameStats[gameId] = { plays: 0, wins: 0, losses: 0 };
            }
            state.stats.gameStats[gameId].plays += 1;
        });
        this.addXP(15);
    }

    trackWin(gameId) {
        storage.updateState(state => {
            state.stats.totalWins += 1;
            if (!state.stats.gameStats[gameId]) {
                state.stats.gameStats[gameId] = { plays: 0, wins: 0, losses: 0 };
            }
            state.stats.gameStats[gameId].wins += 1;
        });
        this.addXP(60);
    }
}

export const xpEngine = new XPEngine();
