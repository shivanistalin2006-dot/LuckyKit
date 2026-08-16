import { storage } from '../core/storage.js';
import { eventBus } from '../core/eventBus.js';

export const themes = {
    cyberpunk: { name: 'Cyberpunk', icon: '🦿', color: '#ec4899', glow: 'rgba(236,72,153,0.3)' },
    midnight: { name: 'Midnight', icon: '🌙', color: '#a855f7', glow: 'rgba(168,85,247,0.3)' },
    matrix: { name: 'Matrix', icon: '💻', color: '#22c55e', glow: 'rgba(34,197,94,0.3)' },
    synthwave: { name: 'Synthwave', icon: '🌇', color: '#f97316', glow: 'rgba(249,115,22,0.3)' },
    bloodmoon: { name: 'Blood Moon', icon: '🩸', color: '#ef4444', glow: 'rgba(239,68,68,0.3)' }
};

class ThemeManager {
    constructor() {
        eventBus.on('THEME_CHANGED', (data) => this.applyTheme(data.theme));
        this.init();
    }

    init() {
        const state = storage.getState();
        this.currentTheme = state.activeTheme || 'cyberpunk';
        this.applyTheme(this.currentTheme);
    }

    applyTheme(themeKey) {
        if (!themes[themeKey]) themeKey = 'cyberpunk';
        this.currentTheme = themeKey;
        
        // Save to state
        storage.updateState({ activeTheme: themeKey });

        // Apply to HTML and Body
        document.documentElement.setAttribute('data-theme', themeKey);
        document.body.setAttribute('data-theme', themeKey);
        
        // Set global CSS variables for all games to inherit
        const theme = themes[themeKey];
        document.documentElement.style.setProperty('--theme-color', theme.color);
        document.documentElement.style.setProperty('--theme-glow', theme.glow);
        document.documentElement.style.setProperty('--theme-neon', theme.color);

        // Update Theme Button if exists (in Hub)
        const themeBtn = document.getElementById('themeToggleBtn');
        if (themeBtn) {
            themeBtn.querySelector('span:first-child').innerText = theme.name;
            const iconSpan = themeBtn.querySelector('#themeIcon');
            if (iconSpan) iconSpan.innerText = theme.icon;
            themeBtn.style.borderColor = theme.color;
            themeBtn.style.color = theme.color;
            themeBtn.style.boxShadow = `0 0 10px ${theme.glow}`;
        }
    }

    cycleTheme() {
        const keys = Object.keys(themes);
        let idx = keys.indexOf(this.currentTheme);
        idx = (idx + 1) % keys.length;
        this.applyTheme(keys[idx]);
    }
}

export const themeManager = new ThemeManager();

// Bind Hub button if present
function bindThemeButton() {
    const btn = document.getElementById('themeToggleBtn');
    if (btn && !btn.hasAttribute('data-theme-bound')) {
        btn.setAttribute('data-theme-bound', 'true');
        btn.addEventListener('click', () => {
            themeManager.cycleTheme();
        });
        themeManager.applyTheme(themeManager.currentTheme); // refresh UI
    }
}

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindThemeButton);
    } else {
        bindThemeButton();
    }
}
