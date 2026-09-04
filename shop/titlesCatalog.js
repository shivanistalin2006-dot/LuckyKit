import { storage } from '../core/storage.js';
import { economyEngine } from '../engine/economyEngine.js';
import { eventBus } from '../core/eventBus.js';

export const TITLES_CATALOG = [
    { id: 'novice', name: '🎮 Arcade Novice', price: 0, rarity: 'common', desc: 'Starting title for every player' },
    { id: 'speed_demon', name: '⚡ Speed Demon', price: 600, rarity: 'rare', desc: 'For lightning fast reflexes' },
    { id: 'puzzle_master', name: '🧩 Puzzle Master', price: 1000, rarity: 'rare', desc: 'Master of strategic mind games' },
    { id: 'high_roller', name: '💎 High Roller', price: 2500, rarity: 'epic', desc: 'Living large in the neon arcade' },
    { id: 'cyber_master', name: '🌌 Cyber Master', price: 4000, rarity: 'epic', desc: 'Rules the virtual cyberspace grid' },
    { id: 'arcade_legend', name: '👑 Arcade Legend', price: 8000, rarity: 'legendary', desc: 'Prestige title reserved for champions' }
];

class TitlesManager {
    getAllTitles() {
        return TITLES_CATALOG;
    }

    getUnlockedTitles() {
        const state = storage.getState();
        return state.inventory?.titles || ['novice'];
    }

    getActiveTitle() {
        const state = storage.getState();
        return state.activeTitle || 'novice';
    }

    buyTitle(titleId) {
        const title = TITLES_CATALOG.find(t => t.id === titleId);
        if (!title) return { success: false, message: 'Title not found' };

        const state = storage.getState();
        const owned = state.inventory?.titles || ['novice'];

        if (owned.includes(titleId)) {
            return { success: false, message: 'Already unlocked' };
        }

        if (economyEngine.deductCoins(title.price)) {
            storage.updateState(s => {
                if (!s.inventory) s.inventory = {};
                if (!s.inventory.titles) s.inventory.titles = ['novice'];
                s.inventory.titles.push(titleId);
                s.activeTitle = titleId;
            });

            eventBus.emit('TITLE_UNLOCKED', { title });
            eventBus.emit('UI_UPDATE');
            return { success: true, message: `Unlocked and equipped: ${title.name}` };
        }

        return { success: false, message: 'Insufficient coins' };
    }

    equipTitle(titleId) {
        const state = storage.getState();
        const owned = state.inventory?.titles || ['novice'];

        if (!owned.includes(titleId)) {
            return { success: false, message: 'Title not owned' };
        }

        storage.updateState(s => {
            s.activeTitle = titleId;
        });

        eventBus.emit('TITLE_EQUIPPED', { titleId });
        eventBus.emit('UI_UPDATE');
        return { success: true, message: 'Title equipped' };
    }
}

export const titlesManager = new TitlesManager();
