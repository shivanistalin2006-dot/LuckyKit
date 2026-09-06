import { storage } from '../core/storage.js';
import { eventBus } from '../core/eventBus.js';

export const themes = {
    emerald: { 
        name: 'Emerald & Black', 
        icon: '🌿', 
        color: '#10b981', 
        glow: 'rgba(16, 185, 129, 0.35)',
        badgeClass: 'border-success text-success'
    },
    purple: { 
        name: 'Lavender & Dark Purple', 
        icon: '🪻', 
        color: '#c084fc', 
        glow: 'rgba(192, 132, 252, 0.35)',
        badgeClass: 'border-info text-info'
    },
    gold: { 
        name: 'Black & Gold', 
        icon: '👑', 
        color: '#eab308', 
        glow: 'rgba(234, 179, 8, 0.35)',
        badgeClass: 'border-warning text-warning'
    }
};

const THEME_ORDER = ['emerald', 'purple', 'gold'];

class ThemeManager {
    constructor() {
        let saved = storage.get('activeTheme', 'emerald');
        if (!themes[saved]) saved = 'emerald';
        this.currentTheme = saved;
        this.applyTheme(this.currentTheme);
        
        eventBus.on('THEME_CHANGED', (data) => {
            if (data && data.theme) this.applyTheme(data.theme);
        });
        
        this.injectGlobalThemeUI();
    }

    applyTheme(themeKey) {
        if (!themes[themeKey]) themeKey = 'emerald';
        this.currentTheme = themeKey;
        const theme = themes[themeKey];
        
        // Save to storage
        storage.set('activeTheme', themeKey);
        storage.updateState({ activeTheme: themeKey });

        // Apply DOM attributes
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', themeKey);
            document.body.setAttribute('data-theme', themeKey);
            
            // Remove old theme classes and apply new
            document.documentElement.classList.remove('theme-emerald', 'theme-purple', 'theme-gold', 'dark-theme', 'light-theme');
            document.body.classList.remove('theme-emerald', 'theme-purple', 'theme-gold', 'dark-theme', 'light-theme');

            document.documentElement.classList.add(`theme-${themeKey}`);
            document.body.classList.add(`theme-${themeKey}`);
            
            // CSS Variables
            document.documentElement.style.setProperty('--theme-color', theme.color);
            document.documentElement.style.setProperty('--theme-glow', theme.glow);
            document.documentElement.style.setProperty('--theme-neon', theme.color);
        }

        this.updateThemeButtonUI();
    }

    toggleTheme() {
        const currentIndex = THEME_ORDER.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % THEME_ORDER.length;
        const nextTheme = THEME_ORDER[nextIndex];
        this.applyTheme(nextTheme);
        eventBus.emit('THEME_CHANGED', { theme: nextTheme });
    }

    updateThemeButtonUI() {
        if (typeof document === 'undefined') return;
        
        const theme = themes[this.currentTheme];
        
        // 1. Update Hub Sidebar Button if exists
        const hubBtn = document.getElementById('themeToggleBtn');
        if (hubBtn) {
            const textSpan = hubBtn.querySelector('span:first-child');
            if (textSpan) textSpan.innerText = theme.name;
            const iconSpan = hubBtn.querySelector('#themeIcon');
            if (iconSpan) iconSpan.innerText = theme.icon;
            hubBtn.className = `btn btn-sm btn-dark border ${theme.badgeClass} w-100 mt-2 d-flex justify-content-between align-items-center`;
        }
        
        // 2. Update Floating Game Theme Button if exists
        const floatingBtn = document.getElementById('globalFloatingThemeBtn');
        if (floatingBtn) {
            floatingBtn.innerHTML = `${theme.icon} <span class="d-none d-sm-inline ms-1">${theme.name}</span>`;
            floatingBtn.className = `btn btn-sm btn-dark border ${theme.badgeClass} fw-bold rounded-pill shadow-lg`;
        }
    }

    injectGlobalThemeUI() {
        if (typeof document === 'undefined') return;

        const setup = () => {
            // Bind Hub button
            const hubBtn = document.getElementById('themeToggleBtn');
            if (hubBtn && !hubBtn.hasAttribute('data-theme-bound')) {
                hubBtn.setAttribute('data-theme-bound', 'true');
                hubBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleTheme();
                });
            }

            // If on a game page (has #hubBtn or in game container) and no floating theme button exists, inject one!
            const isGamePage = window.location.pathname.includes('.html') && !window.location.pathname.endsWith('index.html');
            if (isGamePage && !document.getElementById('globalFloatingThemeBtn')) {
                const container = document.createElement('div');
                container.className = 'position-fixed top-0 end-0 p-3';
                container.style.zIndex = '99999';

                const theme = themes[this.currentTheme];
                const btn = document.createElement('button');
                btn.id = 'globalFloatingThemeBtn';
                btn.className = `btn btn-sm btn-dark border ${theme.badgeClass} fw-bold rounded-pill shadow-lg`;
                btn.style.backdropFilter = 'blur(10px)';
                btn.style.background = 'rgba(12, 14, 22, 0.9) !important';
                btn.innerHTML = `${theme.icon} <span class="d-none d-sm-inline ms-1">${theme.name}</span>`;
                
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleTheme();
                });

                container.appendChild(btn);
                document.body.appendChild(container);
            }

            this.updateThemeButtonUI();
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setup);
        } else {
            setup();
        }
    }
}

export const themeManager = new ThemeManager();
