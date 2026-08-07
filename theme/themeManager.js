import { storage } from '../core/storage.js';
import { eventBus } from '../core/eventBus.js';

class ThemeManager {
    constructor() {
        eventBus.on('THEME_CHANGED', (data) => this.applyTheme(data.theme));
        this.init();
    }

    init() {
        const state = storage.getState();
        this.applyTheme(state.activeTheme || 'dark');
    }

    applyTheme(themeId) {
        document.documentElement.setAttribute('data-theme', themeId);
    }
}

export const themeManager = new ThemeManager();
