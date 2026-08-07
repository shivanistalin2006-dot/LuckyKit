import { storage } from '../core/storage.js';
import { eventBus } from '../core/eventBus.js';

class EconomyEngine {
    constructor() {
        eventBus.on('GAME_OVER', (data) => this.handleGameOver(data));
        eventBus.on('MISSION_COMPLETE', (data) => this.addCoins(data.coinReward || 50));
        eventBus.on('DAILY_LOGIN', (data) => this.addCoins(data.coinReward || 100));
        // Note: ITEM_BOUGHT deduction is usually handled in shopManager, but we can manage balance here
    }

    handleGameOver(data) {
        // Calculate coins based on score (e.g., 1 coin per 20 score)
        const scoreCoins = Math.floor((data.score || 0) / 20);
        this.addCoins(scoreCoins);
    }

    addCoins(amount) {
        if (amount <= 0) return;
        
        storage.updateState(state => {
            state.coins += amount;
        });
        
        eventBus.emit('COINS_EARNED', { amount });
        eventBus.emit('UI_UPDATE');
    }

    deductCoins(amount) {
        let success = false;
        storage.updateState(state => {
            if (state.coins >= amount) {
                state.coins -= amount;
                success = true;
            }
        });
        
        if (success) {
            eventBus.emit('UI_UPDATE');
        }
        return success;
    }
}

export const economyEngine = new EconomyEngine();
