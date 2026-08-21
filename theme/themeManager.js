import { storage } from '../core/storage.js';
import { eventBus } from '../core/eventBus.js';

export const themes = {
    dark: { 
        name: 'Dark Theme', 
        icon: '🌙', 
        color: '#38bdf8', 
        glow: 'rgba(56, 189, 248, 0.35)', 
        isLight: false 
    },
    light: { 
        name: 'Light Pastel', 
        icon: '🌸', 
        color: '#ec4899', 
        glow: 'rgba(236, 72, 153, 0.25)', 
        isLight: true 
    }
};

class ThemeManager {
    constructor() {
        this.currentTheme = storage.get('activeTheme', 'dark');
        this.applyTheme(this.currentTheme);
        
        eventBus.on('THEME_CHANGED', (data) => {
            if (data && data.theme) this.applyTheme(data.theme);
        });
        
        this.injectGlobalThemeUI();
    }

    applyTheme(themeKey) {
        if (!themes[themeKey]) themeKey = 'dark';
        this.currentTheme = themeKey;
        const theme = themes[themeKey];
        
        // Save to storage
        storage.set('activeTheme', themeKey);
        storage.updateState({ activeTheme: themeKey });

        // Apply DOM attributes
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', themeKey);
            document.body.setAttribute('data-theme', themeKey);
            
            if (theme.isLight) {
                document.documentElement.classList.add('light-theme');
                document.documentElement.classList.remove('dark-theme');
                document.body.classList.add('light-theme');
                document.body.classList.remove('dark-theme');
            } else {
                document.documentElement.classList.add('dark-theme');
                document.documentElement.classList.remove('light-theme');
                document.body.classList.add('dark-theme');
                document.body.classList.remove('light-theme');
            }
            
            // CSS Variables
            document.documentElement.style.setProperty('--theme-color', theme.color);
            document.documentElement.style.setProperty('--theme-glow', theme.glow);
            document.documentElement.style.setProperty('--theme-neon', theme.color);
        }

        this.updateThemeButtonUI();
    }

    toggleTheme() {
        const nextTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
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
            hubBtn.className = theme.isLight 
                ? "btn btn-sm btn-outline-danger w-100 mt-2 d-flex justify-content-between align-items-center" 
                : "btn btn-sm btn-outline-info w-100 mt-2 d-flex justify-content-between align-items-center";
        }
        
        // 2. Update Floating Game Theme Button if exists
        const floatingBtn = document.getElementById('globalFloatingThemeBtn');
        if (floatingBtn) {
            floatingBtn.innerHTML = `${theme.icon} <span class="d-none d-sm-inline ms-1">${theme.name}</span>`;
            floatingBtn.className = theme.isLight
                ? "btn btn-sm btn-light border border-danger text-danger fw-bold rounded-pill shadow-lg"
                : "btn btn-sm btn-dark border border-info text-info fw-bold rounded-pill shadow-lg";
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
                btn.className = theme.isLight
                    ? "btn btn-sm btn-light border border-danger text-danger fw-bold rounded-pill shadow-lg"
                    : "btn btn-sm btn-dark border border-info text-info fw-bold rounded-pill shadow-lg";
                btn.style.backdropFilter = 'blur(10px)';
                btn.style.background = theme.isLight ? 'rgba(255, 255, 255, 0.9) !important' : 'rgba(15, 15, 25, 0.85) !important';
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
