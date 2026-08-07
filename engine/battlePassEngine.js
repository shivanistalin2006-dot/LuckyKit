import { storage } from '../core/storage.js';
import { eventBus } from '../core/eventBus.js';

class BattlePassEngine {
    constructor() {
        this.tierRequirements = 1000; // 1000 BP XP per tier
        this.maxTier = 50;

        eventBus.on('GAME_OVER', (data) => this.addBPXP(50 + Math.floor((data.score || 0) / 10)));
        eventBus.on('MISSION_COMPLETE', (data) => this.addBPXP(data.bpXpReward || 200));

        this.checkDailyLogin();
    }

    checkDailyLogin() {
        const state = storage.getState();
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0]; // "YYYY-MM-DD"

        if (state.lastLogin !== todayStr) {
            // New day login!
            storage.updateState(s => {
                s.lastLogin = todayStr;
            });
            
            // Award daily login bonus
            eventBus.emit('DAILY_LOGIN', { coinReward: 100, bpXpReward: 200 });
            this.addBPXP(200);
            
            // Trigger mission regeneration check
            eventBus.emit('DAY_CHANGED', { date: todayStr });
        }
    }

    addBPXP(amount) {
        if (amount <= 0) return;
        
        storage.updateState(state => {
            if (state.bpTier >= this.maxTier) return; // Max tier reached

            state.bpXP += amount;
            
            while (state.bpXP >= this.tierRequirements && state.bpTier < this.maxTier) {
                state.bpTier += 1;
                state.bpXP -= this.tierRequirements;
                eventBus.emit('BP_TIER_UP', { newTier: state.bpTier });
                
                // Award tier rewards
                this.awardTierReward(state.bpTier);
            }
        });
        
        eventBus.emit('UI_UPDATE');
    }

    awardTierReward(tier) {
        // Simple logic: every 5 tiers = theme/avatar, otherwise coins
        if (tier % 5 === 0) {
            // This will be picked up by the inventory/profile manager later,
            // but for now we emit a generic reward event.
            eventBus.emit('REWARD_UNLOCKED', { type: 'milestone', tier });
        } else {
            // 50 coins per normal tier
            eventBus.emit('MISSION_COMPLETE', { coinReward: 50, xpReward: 0, bpXpReward: 0 }); // reuse the coin grant
        }
    }
}

export const battlePassEngine = new BattlePassEngine();
