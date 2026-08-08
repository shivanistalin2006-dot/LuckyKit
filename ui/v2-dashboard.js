import { storage } from '../core/storage.js';
import { playerProfile } from '../core/playerProfile.js';
import { missionSystem } from '../core/missionSystem.js';
import { achievementManager } from '../core/achievementManager.js';

export class V2Dashboard {
    constructor() {
        this.bindDOM();
        this.updateUI();
        
        // Listen for storage updates (basic polling or hook for V2 demo)
        setInterval(() => this.updateUI(), 1000);
    }

    bindDOM() {
        this.playerName = document.getElementById('playerName');
        this.playerAvatar = document.getElementById('playerAvatar');
        this.playerRankBadge = document.getElementById('playerRankBadge');
        this.playerPrestigeBadge = document.getElementById('playerPrestigeBadge');
        this.playerLevelText = document.getElementById('playerLevelText');
        this.playerXpText = document.getElementById('playerXpText');
        this.playerXpBar = document.getElementById('playerXpBar');
        this.playerCoins = document.getElementById('playerCoins');
        this.playerTime = document.getElementById('playerTime');
        this.missionsContainer = document.getElementById('dailyMissionsContainer');
        
        document.getElementById('achievementsBtn')?.addEventListener('click', () => {
            // Need to open V2 achievements modal
            console.log("Open achievements");
        });
        
        document.getElementById('claimLoginRewardBtn')?.addEventListener('click', () => {
            alert('Daily Reward Claimed! +50 Coins');
            storage.updateState(s => s.coins += 50);
        });

        const themeToggleBtn = document.getElementById('themeToggleBtn');
        if (themeToggleBtn) {
            const themeIcon = document.getElementById('themeIcon');
            
            // Init icon based on current theme
            const state = storage.getState();
            const currentTheme = state.activeTheme || 'dark';
            if (themeIcon) {
                themeIcon.textContent = currentTheme === 'light' ? '☀️' : '🌙';
            }

            themeToggleBtn.addEventListener('click', () => {
                const currentState = storage.getState();
                const isDark = currentState.activeTheme !== 'light';
                const newTheme = isDark ? 'light' : 'dark';
                
                storage.updateState(s => s.activeTheme = newTheme);
                
                // Force DOM update instantly
                document.documentElement.setAttribute('data-theme', newTheme);
                console.log("Switched theme to", newTheme);
                
                // Also broadcast for other components
                import('../core/eventBus.js?v=2.1').then(module => {
                    module.eventBus.emit('THEME_CHANGED', { theme: newTheme });
                });
                
                if (themeIcon) {
                    themeIcon.textContent = newTheme === 'light' ? '☀️' : '🌙';
                }
            });
        }
    }

    updateUI() {
        if (!this.playerName) return; // Not on dashboard page
        
        const state = storage.getState();
        
        this.playerName.textContent = state.playerName;
        this.playerAvatar.textContent = state.activeAvatar;
        
        this.playerLevelText.textContent = `LVL ${state.level}`;
        const nextXp = playerProfile.getXpForNextLevel(state.level);
        this.playerXpText.textContent = `${state.xp} / ${nextXp} XP`;
        
        const xpPercent = Math.min(100, Math.floor((state.xp / nextXp) * 100));
        this.playerXpBar.style.width = `${xpPercent}%`;
        
        this.playerCoins.textContent = state.coins;
        
        const hours = Math.floor(state.playTime / 60);
        this.playerTime.textContent = `${hours}h`;
        
        // Rank Badge
        this.playerRankBadge.textContent = state.rank.toUpperCase();
        this.playerRankBadge.className = `badge bg-${state.rank.toLowerCase()}`;
        
        // Prestige Badge
        if (state.prestige > 0) {
            this.playerPrestigeBadge.classList.remove('d-none');
            this.playerPrestigeBadge.textContent = `★ ${state.prestige}`;
        }
        
        // Missions
        this.renderMissions(state.missions.daily);
    }

    renderMissions(missions) {
        if (!this.missionsContainer) return;
        
        if (!missions || missions.length === 0) {
            this.missionsContainer.innerHTML = '<div class="text-center text-muted">No missions available.</div>';
            return;
        }
        
        let html = '';
        missions.forEach(m => {
            const percent = Math.min(100, Math.floor((m.progress / m.target) * 100));
            const statusColor = m.completed ? 'success' : 'info';
            
            html += `
                <div class="mission-item">
                    <div class="d-flex justify-content-between mb-1">
                        <span class="text-white small fw-bold">${m.desc}</span>
                        <span class="text-${statusColor} small">${m.progress}/${m.target}</span>
                    </div>
                    <div class="progress" style="height: 6px; background: rgba(0,0,0,0.4);">
                        <div class="progress-bar bg-${statusColor}" style="width: ${percent}%"></div>
                    </div>
                    <div class="text-end mt-1">
                        <span class="badge bg-dark border border-secondary text-warning small">
                            Reward: ${m.reward.amount || 1} ${m.reward.type.toUpperCase()}
                        </span>
                    </div>
                </div>
            `;
        });
        
        this.missionsContainer.innerHTML = html;
    }
}

// Initialize automatically
if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", () => {
        window.v2Dashboard = new V2Dashboard();
    });
} else {
    window.v2Dashboard = new V2Dashboard();
}
