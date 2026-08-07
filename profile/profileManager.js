import { storage } from '../core/storage.js';
import { eventBus } from '../core/eventBus.js';

class ProfileManager {
    equipItem(itemId, itemType) {
        const state = storage.getState();
        const inventoryList = state.inventory[itemType + 's'];

        if (inventoryList.includes(itemId)) {
            storage.updateState(s => {
                if (itemType === 'theme') s.activeTheme = itemId;
                if (itemType === 'avatar') s.activeAvatar = itemId;
            });

            if (itemType === 'theme') eventBus.emit('THEME_CHANGED', { theme: itemId });
            eventBus.emit('UI_UPDATE');
            return true;
        }
        return false;
    }
    
    updateName(newName) {
        if (!newName || newName.length > 15) return false;
        storage.updateState(s => {
            s.playerName = newName;
        });
        eventBus.emit('UI_UPDATE');
        return true;
    }
}

export const profileManager = new ProfileManager();
