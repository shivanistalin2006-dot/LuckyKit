import { storage } from '../core/storage.js';
import { economyEngine } from '../engine/economyEngine.js';
import { eventBus } from '../core/eventBus.js';

export const SHOP_CATALOG = {
    themes: [
        { id: 'dark', name: 'Midnight Dark', price: 0, type: 'theme', desc: 'Default premium dark theme' },
        { id: 'light', name: 'Clean Light', price: 500, type: 'theme', desc: 'Sleek white aesthetics' },
        { id: 'cyber', name: 'Cyberpunk', price: 1500, type: 'theme', desc: 'Neon greens and purples' },
        { id: 'oled', name: 'OLED Black', price: 2000, type: 'theme', desc: 'Pitch black for OLED screens' }
    ],
    avatars: [
        { id: '👾', name: 'Space Invader', price: 0, type: 'avatar', desc: 'Default avatar' },
        { id: '🥷', name: 'Neon Ninja', price: 300, type: 'avatar', desc: 'Stealthy player' },
        { id: '🤖', name: 'Cyborg', price: 800, type: 'avatar', desc: 'Mechanized player' },
        { id: '👑', name: 'King', price: 5000, type: 'avatar', desc: 'Flex your wealth' }
    ]
};

class ShopManager {
    buyItem(itemId, itemType) {
        const catalog = SHOP_CATALOG[itemType + 's'];
        const item = catalog.find(i => i.id === itemId);
        
        if (!item) return false;

        const state = storage.getState();
        const inventoryList = state.inventory[itemType + 's'];

        if (inventoryList.includes(itemId)) {
            return false; // Already own
        }

        if (economyEngine.deductCoins(item.price)) {
            storage.updateState(s => {
                s.inventory[itemType + 's'].push(itemId);
                // Auto equip
                if (itemType === 'theme') s.activeTheme = itemId;
                if (itemType === 'avatar') s.activeAvatar = itemId;
            });
            
            eventBus.emit('ITEM_BOUGHT', { item });
            if (itemType === 'theme') eventBus.emit('THEME_CHANGED', { theme: itemId });
            
            return true;
        }
        return false;
    }
}

export const shopManager = new ShopManager();
