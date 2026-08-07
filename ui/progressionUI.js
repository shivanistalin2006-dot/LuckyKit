import { storage } from '../core/storage.js';
import { eventBus } from '../core/eventBus.js';
import { shopManager, SHOP_CATALOG } from '../shop/shopManager.js';
import { profileManager } from '../profile/profileManager.js';
import { leaderboardManager } from '../leaderboard/leaderboardManager.js';

class ProgressionUI {
    constructor() {
        // Initialize once DOM is ready
        document.addEventListener('DOMContentLoaded', () => this.init());
    }

    init() {
        this.bindElements();
        this.bindEvents();
        this.updateAll();
        
        // Listen to event bus for updates
        eventBus.on('UI_UPDATE', () => this.updateAll());
        eventBus.on('DAY_CHANGED', () => this.renderMissions());
    }

    bindElements() {
        // Navbar/Sidebar Stats
        this.els = {
            coins: document.getElementById('navCoinsText'), // If exists
            level: document.getElementById('playerLevel'),
            xpBar: document.getElementById('playerXpBar'),
            avatar: document.getElementById('playerAvatar'),
            name: document.getElementById('playerName'),
            
            // Battle Pass
            bpTier: document.getElementById('bpTierText'),
            bpProgress: document.getElementById('bpProgressBar'),
            bpRewards: document.getElementById('bpRewardsContainer'),
            
            // Missions
            missionsContainer: document.getElementById('missionsContainer'),
            
            // Shop
            shopThemes: document.getElementById('shopThemesContainer'),
            shopAvatars: document.getElementById('shopAvatarsContainer'),
            shopCoins: document.getElementById('shopCoinsAmount'),
            
            // Leaderboard
            leaderboard: document.getElementById('leaderboardContainer')
        };

        // Bind Store Nav Item
        const storeNavBtn = document.querySelector('a.nav-item[href="#store"]');
        if (storeNavBtn) {
            storeNavBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const shopModal = new bootstrap.Modal(document.getElementById('shopModalBootstrap'));
                this.renderShop();
                shopModal.show();
            });
        }

        // Bind BP Nav Item
        const bpNavBtn = document.querySelector('a.nav-item[href="#bp"]');
        if (bpNavBtn) {
            bpNavBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const bpModal = new bootstrap.Modal(document.getElementById('bpModalBootstrap'));
                this.renderBP();
                this.renderMissions();
                bpModal.show();
            });
        }
    }

    bindEvents() {
        // Shop buttons are bound dynamically during render
    }

    updateAll() {
        const state = storage.getState();
        
        if (this.els.level) this.els.level.innerText = `LVL ${state.level}`;
        if (this.els.avatar) this.els.avatar.innerText = state.activeAvatar;
        if (this.els.name) this.els.name.innerText = state.playerName;
        
        if (this.els.xpBar) {
            const requiredXP = state.level * 1000;
            const percentage = (state.xp / requiredXP) * 100;
            this.els.xpBar.style.width = `${percentage}%`;
        }
        
        // Update any coin displays on the screen
        document.querySelectorAll('.coin-display').forEach(el => {
            el.innerText = state.coins;
        });
        
        this.renderBP();
        this.renderMissions();
        this.renderShop();
    }

    renderBP() {
        if (!this.els.bpTier) return;
        const state = storage.getState();
        
        this.els.bpTier.innerText = `Tier ${state.bpTier}`;
        const percentage = (state.bpXP / 1000) * 100;
        if (this.els.bpProgress) this.els.bpProgress.style.width = `${percentage}%`;
    }

    renderMissions() {
        if (!this.els.missionsContainer) return;
        const state = storage.getState();
        const missions = state.missions.daily || [];
        
        this.els.missionsContainer.innerHTML = missions.map(m => `
            <div class="d-flex justify-content-between align-items-center p-3 mb-2 rounded" style="background: var(--bg-base); border: 1px solid var(--border-glass);">
                <div>
                    <h6 class="mb-1 text-white">${m.desc}</h6>
                    <small class="text-muted">Reward: ${m.rewards.coins} Coins, ${m.rewards.xp} XP</small>
                </div>
                <div class="text-end">
                    ${m.completed 
                        ? `<span class="badge bg-success">Completed</span>`
                        : `<span class="badge bg-secondary">${m.progress} / ${m.target}</span>`
                    }
                </div>
            </div>
        `).join('');
    }

    renderShop() {
        if (!this.els.shopThemes || !this.els.shopAvatars) return;
        
        const state = storage.getState();
        const inventoryThemes = state.inventory.themes || [];
        const inventoryAvatars = state.inventory.avatars || [];
        
        // Render Themes
        this.els.shopThemes.innerHTML = SHOP_CATALOG.themes.map(item => {
            const owned = inventoryThemes.includes(item.id);
            const active = state.activeTheme === item.id;
            
            return `
            <div class="col-6 mb-3">
                <div class="p-3 rounded text-center" style="background: var(--bg-base); border: 1px solid ${active ? '#06b6d4' : 'var(--border-glass)'};">
                    <h6 class="text-white">${item.name}</h6>
                    <p class="small text-muted mb-2">${item.desc}</p>
                    ${owned 
                        ? (active ? `<button class="btn btn-sm btn-outline-info w-100 disabled">Equipped</button>` 
                                  : `<button class="btn btn-sm btn-outline-primary w-100" onclick="window.LuckyKit.profileManager.equipItem('${item.id}', 'theme')">Equip</button>`)
                        : `<button class="btn btn-sm btn-primary w-100" onclick="window.LuckyKit.shopManager.buyItem('${item.id}', 'theme')">Buy (${item.price} 🪙)</button>`
                    }
                </div>
            </div>`;
        }).join('');
        
        // Render Avatars
        this.els.shopAvatars.innerHTML = SHOP_CATALOG.avatars.map(item => {
            const owned = inventoryAvatars.includes(item.id);
            const active = state.activeAvatar === item.id;
            
            return `
            <div class="col-4 mb-3">
                <div class="p-3 rounded text-center" style="background: var(--bg-base); border: 1px solid ${active ? '#06b6d4' : 'var(--border-glass)'};">
                    <div class="fs-1 mb-2">${item.id}</div>
                    <h6 class="text-white small">${item.name}</h6>
                    ${owned 
                        ? (active ? `<button class="btn btn-sm btn-outline-info w-100 disabled">Equipped</button>` 
                                  : `<button class="btn btn-sm btn-outline-primary w-100" onclick="window.LuckyKit.profileManager.equipItem('${item.id}', 'avatar')">Equip</button>`)
                        : `<button class="btn btn-sm btn-primary w-100" onclick="window.LuckyKit.shopManager.buyItem('${item.id}', 'avatar')">Buy (${item.price} 🪙)</button>`
                    }
                </div>
            </div>`;
        }).join('');
    }
}

export const progressionUI = new ProgressionUI();
