import { storage } from './storage.js';

export const ITEMS = {
    THEMES: {
        dark: { id: 'dark', name: 'Cyber Neon', rarity: 'common' },
        galaxy: { id: 'galaxy', name: 'Galaxy', rarity: 'rare' },
        matrix: { id: 'matrix', name: 'Matrix', rarity: 'epic' },
        retro: { id: 'retro', name: 'Retro Arcade', rarity: 'legendary' }
    },
    AVATARS: {
        alien: { id: '👾', name: 'Alien', rarity: 'common' },
        robot: { id: '🤖', name: 'Robot', rarity: 'rare' },
        skull: { id: '💀', name: 'Skull', rarity: 'epic' },
        crown: { id: '👑', name: 'Crown', rarity: 'legendary' }
    }
};

export class InventoryManager {
    constructor() {
        if (InventoryManager.instance) return InventoryManager.instance;
        InventoryManager.instance = this;
    }

    addCrate(type, amount = 1) {
        if (!['common', 'rare', 'epic', 'legendary', 'mythic'].includes(type)) return;
        storage.updateState(state => {
            state.inventory.crates[type] += amount;
        });
    }

    openCrate(type) {
        const state = storage.getState();
        if (state.inventory.crates[type] > 0) {
            storage.updateState(s => {
                s.inventory.crates[type]--;
            });
            // Simplified RNG reward logic
            const rewards = [
                { type: 'coins', amount: 500 },
                { type: 'xp', amount: 1000 },
                { type: 'avatar', id: '🤖' }
            ];
            const reward = rewards[Math.floor(Math.random() * rewards.length)];
            
            if (reward.type === 'coins') {
                storage.updateState(s => s.coins += reward.amount);
            } else if (reward.type === 'xp') {
                // Must trigger playerProfile.addXP, but we'll do direct for now to avoid circular dependency, or better yet, just return the reward and let the caller handle it.
                return reward;
            } else if (reward.type === 'avatar') {
                this.unlockItem('avatars', reward.id);
            }
            return reward;
        }
        return null;
    }

    unlockItem(category, itemId) {
        storage.updateState(state => {
            if (state.inventory[category] && !state.inventory[category].includes(itemId)) {
                state.inventory[category].push(itemId);
            }
        });
    }

    equipItem(category, itemId) {
        const state = storage.getState();
        if (state.inventory[category] && state.inventory[category].includes(itemId)) {
            storage.updateState(s => {
                if (category === 'themes') s.activeTheme = itemId;
                else if (category === 'avatars') s.activeAvatar = itemId;
                else if (category === 'borders') s.activeBorder = itemId;
                else if (category === 'particles') s.activeParticle = itemId;
            });
            return true;
        }
        return false;
    }
}

export const inventoryManager = new InventoryManager();
