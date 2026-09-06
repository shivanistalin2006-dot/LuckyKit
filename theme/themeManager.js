import { storage } from '../core/storage.js';
import { eventBus } from '../core/eventBus.js';

export const themes = {
    // ==========================================
    // 🌙 DARK THEMES
    // ==========================================
    'dark-gold': { 
        id: 'dark-gold',
        mode: 'dark',
        name: 'Black + Gold', 
        icon: '👑', 
        color: '#eab308', 
        accent: '#facc15',
        bg: '#0a0904',
        glow: 'rgba(234, 179, 8, 0.35)',
        badgeClass: 'border-warning text-warning',
        preview: { bg: '#0a0904', accent: '#eab308' },
        description: 'Obsidian black with metallic royal gold'
    },
    'dark-emerald': { 
        id: 'dark-emerald',
        mode: 'dark',
        name: 'Black + Emerald', 
        icon: '🌿', 
        color: '#10b981', 
        accent: '#34d399',
        bg: '#060b08',
        glow: 'rgba(16, 185, 129, 0.35)',
        badgeClass: 'border-success text-success',
        preview: { bg: '#060b08', accent: '#10b981' },
        description: 'Deep black with cyber emerald green'
    },
    'dark-purple': { 
        id: 'dark-purple',
        mode: 'dark',
        name: 'Dark Purple + Lavender', 
        icon: '🪻', 
        color: '#c084fc', 
        accent: '#a855f7',
        bg: '#0a0614',
        glow: 'rgba(192, 132, 252, 0.35)',
        badgeClass: 'border-info text-info',
        preview: { bg: '#0a0614', accent: '#c084fc' },
        description: 'Midnight purple with glowing lavender'
    },

    // ==========================================
    // ☀️ LIGHT THEMES — 3 UNIQUE PASTEL SETS
    // ==========================================
    'light-peach': { 
        id: 'light-peach',
        mode: 'light',
        name: 'Peach + Coral + Cream', 
        icon: '🍑', 
        color: '#E89A7A', 
        accent: '#F4C6A6',
        secondary: '#FFD9C7',
        bg: '#FFF7F0',
        textColor: '#3B2924',
        card: '#FFFFFF',
        glow: 'rgba(232, 154, 122, 0.35)',
        badgeClass: 'border-danger text-dark',
        preview: { bg: '#FFF7F0', accent: '#E89A7A' },
        description: 'Warm, cute, premium — very welcoming homepage.'
    },
    'light-blue': { 
        id: 'light-blue',
        mode: 'light',
        name: 'Powder Blue + Soft Pink', 
        icon: '🩵', 
        color: '#7FAFC4', 
        accent: '#E8AFC0',
        secondary: '#C9E2EE',
        bg: '#F4F9FC',
        textColor: '#28343B',
        card: '#FFFFFF',
        glow: 'rgba(127, 175, 196, 0.35)',
        badgeClass: 'border-info text-dark',
        preview: { bg: '#F4F9FC', accent: '#7FAFC4' },
        description: 'Playful + youthful + clean. Games website-ku semma fit.'
    },
    'light-butter': { 
        id: 'light-butter',
        mode: 'light',
        name: 'Butter Yellow + Dusty Rose', 
        icon: '🌼', 
        color: '#D8B56A', 
        accent: '#D99AA8',
        secondary: '#F1DCC0',
        bg: '#FFFBEF',
        textColor: '#39302D',
        card: '#FFFFFF',
        glow: 'rgba(216, 181, 106, 0.35)',
        badgeClass: 'border-warning text-dark',
        preview: { bg: '#FFFBEF', accent: '#D8B56A' },
        description: 'Butter Yellow + Dusty Rose + Cream'
    }
};

// Aliases for backward compatibility
const normalizeThemeKey = (key) => {
    if (!key) return 'dark-emerald';
    if (themes[key]) return key;
    if (key === 'emerald') return 'dark-emerald';
    if (key === 'purple') return 'dark-purple';
    if (key === 'gold') return 'dark-gold';
    if (key === 'dark') return 'dark-emerald';
    if (key === 'light') return 'light-peach';
    if (key === 'light-gold') return 'light-peach';
    if (key === 'light-emerald') return 'light-blue';
    if (key === 'light-purple') return 'light-butter';
    return 'dark-emerald';
};

class ThemeManager {
    constructor() {
        let saved = storage.get('activeTheme', 'dark-emerald');
        this.currentTheme = normalizeThemeKey(saved);
        this.applyTheme(this.currentTheme);
        
        eventBus.on('THEME_CHANGED', (data) => {
            if (data && data.theme) this.applyTheme(data.theme);
        });
        
        this.injectGlobalThemeUI();
    }

    applyTheme(themeKey) {
        themeKey = normalizeThemeKey(themeKey);
        this.currentTheme = themeKey;
        const theme = themes[themeKey];
        
        // Save to storage
        storage.set('activeTheme', themeKey);
        storage.updateState({ activeTheme: themeKey });

        // Apply DOM attributes
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', themeKey);
            document.body.setAttribute('data-theme', themeKey);
            document.documentElement.setAttribute('data-mode', theme.mode);
            document.body.setAttribute('data-mode', theme.mode);
            
            // Clear old theme classes
            const allThemeClasses = [
                'theme-dark-gold', 'theme-dark-emerald', 'theme-dark-purple',
                'theme-light-peach', 'theme-light-blue', 'theme-light-butter',
                'theme-light-gold', 'theme-light-emerald', 'theme-light-purple',
                'theme-emerald', 'theme-purple', 'theme-gold', 'dark-theme', 'light-theme'
            ];
            document.documentElement.classList.remove(...allThemeClasses);
            document.body.classList.remove(...allThemeClasses);

            // Add active theme class
            document.documentElement.classList.add(`theme-${themeKey}`);
            document.body.classList.add(`theme-${themeKey}`);
            document.documentElement.classList.add(`${theme.mode}-mode`);
            document.body.classList.add(`${theme.mode}-mode`);
            
            // CSS Variables
            document.documentElement.style.setProperty('--theme-color', theme.color);
            document.documentElement.style.setProperty('--theme-accent', theme.accent);
            document.documentElement.style.setProperty('--theme-glow', theme.glow);
            document.documentElement.style.setProperty('--theme-neon', theme.color);
            document.documentElement.style.setProperty('--theme-bg', theme.bg);
            if (theme.textColor) {
                document.documentElement.style.setProperty('--theme-text', theme.textColor);
            }
        }

        this.updateThemeButtonUI();
        this.updateModalActiveState();
    }

    updateThemeButtonUI() {
        if (typeof document === 'undefined') return;
        
        const theme = themes[this.currentTheme] || themes['dark-emerald'];
        
        // 1. Update Hub Sidebar Button
        const hubBtn = document.getElementById('themeToggleBtn');
        if (hubBtn) {
            const textSpan = hubBtn.querySelector('span:first-child');
            if (textSpan) textSpan.innerText = `${theme.mode === 'dark' ? '🌙' : '☀️'} ${theme.name}`;
            const iconSpan = hubBtn.querySelector('#themeIcon');
            if (iconSpan) iconSpan.innerText = theme.icon;
            hubBtn.className = `btn btn-sm btn-dark border ${theme.badgeClass} w-100 mt-2 d-flex justify-content-between align-items-center`;
        }
        
        // 2. Update Floating Game Theme Button
        const floatingBtn = document.getElementById('globalFloatingThemeBtn');
        if (floatingBtn) {
            floatingBtn.innerHTML = `${theme.icon} <span class="d-none d-sm-inline ms-1">${theme.name}</span>`;
            floatingBtn.className = `btn btn-sm btn-dark border ${theme.badgeClass} fw-bold rounded-pill shadow-lg`;
        }
    }

    openThemeModal() {
        let modalEl = document.getElementById('themePickerModal');
        if (!modalEl) {
            this.buildThemeModalDOM();
            modalEl = document.getElementById('themePickerModal');
        }
        if (modalEl) {
            this.updateModalActiveState();
            modalEl.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeThemeModal() {
        const modalEl = document.getElementById('themePickerModal');
        if (modalEl) {
            modalEl.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    updateModalActiveState() {
        const modalEl = document.getElementById('themePickerModal');
        if (!modalEl) return;
        
        const cards = modalEl.querySelectorAll('.theme-option-card');
        cards.forEach(card => {
            const key = card.getAttribute('data-theme-key');
            if (key === this.currentTheme) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
    }

    buildThemeModalDOM() {
        if (document.getElementById('themePickerModal')) return;

        const modal = document.createElement('div');
        modal.id = 'themePickerModal';
        modal.className = 'theme-modal-backdrop';

        const darkOptions = ['dark-gold', 'dark-emerald', 'dark-purple'].map(key => {
            const t = themes[key];
            const isActive = this.currentTheme === key;
            return `
                <button class="theme-option-card ${isActive ? 'active' : ''}" data-theme-key="${t.id}" type="button">
                    <div class="theme-swatch-box">
                        <span class="swatch-circle" style="background: ${t.bg}; border: 1.5px solid ${t.color};"></span>
                        <span class="swatch-circle accent" style="background: ${t.color};"></span>
                    </div>
                    <div class="theme-card-body">
                        <div class="theme-name">${t.icon} ${t.name}</div>
                        <div class="theme-desc">${t.description}</div>
                    </div>
                    <span class="theme-check-badge">✓</span>
                </button>
            `;
        }).join('');

        const lightOptions = ['light-peach', 'light-blue', 'light-butter'].map(key => {
            const t = themes[key];
            const isActive = this.currentTheme === key;
            return `
                <button class="theme-option-card ${isActive ? 'active' : ''}" data-theme-key="${t.id}" type="button">
                    <div class="theme-swatch-box">
                        <span class="swatch-circle" style="background: ${t.bg}; border: 1.5px solid ${t.color};"></span>
                        <span class="swatch-circle accent" style="background: ${t.color};"></span>
                    </div>
                    <div class="theme-card-body">
                        <div class="theme-name">${t.icon} ${t.name}</div>
                        <div class="theme-desc">${t.description}</div>
                    </div>
                    <span class="theme-check-badge">✓</span>
                </button>
            `;
        }).join('');

        modal.innerHTML = `
            <div class="theme-modal-dialog">
                <div class="theme-modal-header">
                    <div class="d-flex align-items-center gap-2">
                        <span class="fs-4">🎨</span>
                        <div>
                            <h5 class="mb-0 fw-bold theme-modal-title">Theme & Color Customizer</h5>
                            <span class="text-muted small">Choose your mode & color scheme</span>
                        </div>
                    </div>
                    <button class="theme-modal-close" id="themeModalCloseBtn" aria-label="Close">✕</button>
                </div>

                <div class="theme-modal-grid">
                    <!-- Dark Section -->
                    <div class="theme-mode-column dark-column">
                        <div class="theme-column-title">
                            <span class="badge bg-dark border border-secondary px-3 py-2 rounded-pill">🌙 Dark Mode</span>
                        </div>
                        <div class="theme-list">
                            ${darkOptions}
                        </div>
                    </div>

                    <!-- Light Section -->
                    <div class="theme-mode-column light-column">
                        <div class="theme-column-title">
                            <span class="badge bg-light text-dark border border-warning px-3 py-2 rounded-pill">☀️ Light Mode (Pastel Sets)</span>
                        </div>
                        <div class="theme-list">
                            ${lightOptions}
                        </div>
                    </div>
                </div>

                <div class="theme-modal-footer">
                    <span class="text-muted small">✨ Theme applies instantly across all games & hub</span>
                    <button class="btn btn-sm btn-outline-light px-4 py-1 rounded-pill" id="themeModalDoneBtn">Done</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners inside modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeThemeModal();
            }
        });

        document.getElementById('themeModalCloseBtn')?.addEventListener('click', () => {
            this.closeThemeModal();
        });

        document.getElementById('themeModalDoneBtn')?.addEventListener('click', () => {
            this.closeThemeModal();
        });

        // Theme card clicks
        modal.querySelectorAll('.theme-option-card').forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const key = card.getAttribute('data-theme-key');
                if (key) {
                    this.applyTheme(key);
                    eventBus.emit('THEME_CHANGED', { theme: key });
                }
            });
        });
    }

    injectGlobalThemeUI() {
        if (typeof document === 'undefined') return;

        const setup = () => {
            // Bind Hub button to open modal
            const hubBtn = document.getElementById('themeToggleBtn');
            if (hubBtn && !hubBtn.hasAttribute('data-theme-bound')) {
                hubBtn.setAttribute('data-theme-bound', 'true');
                hubBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openThemeModal();
                });
            }

            // In-game floating theme button
            const isGamePage = window.location.pathname.includes('.html') && !window.location.pathname.endsWith('index.html');
            if (isGamePage && !document.getElementById('globalFloatingThemeBtn')) {
                const container = document.createElement('div');
                container.className = 'position-fixed top-0 end-0 p-3';
                container.style.zIndex = '99999';

                const theme = themes[this.currentTheme] || themes['dark-emerald'];
                const btn = document.createElement('button');
                btn.id = 'globalFloatingThemeBtn';
                btn.className = `btn btn-sm btn-dark border ${theme.badgeClass} fw-bold rounded-pill shadow-lg`;
                btn.style.backdropFilter = 'blur(10px)';
                btn.style.background = 'rgba(12, 14, 22, 0.9) !important';
                btn.innerHTML = `${theme.icon} <span class="d-none d-sm-inline ms-1">${theme.name}</span>`;
                
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openThemeModal();
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
