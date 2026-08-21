import { storage } from '../core/storage.js';
import { playerProfile } from '../core/playerProfile.js';
import { missionSystem } from '../core/missionSystem.js';
import { achievementManager, ACHIEVEMENTS } from '../core/achievementManager.js';
import { audioManager } from '../audio/audioManager.js';
import { themeManager } from '../theme/themeManager.js';
import { authManager } from '../core/authManager.js';

export class V2Dashboard {
    constructor() {
        this.bindDOM();
        this.updateUI();
        
        // Listen for storage updates
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
        
        // Login & Profile Modal Buttons
        document.getElementById('quickLoginBtn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            authManager.openAuthModal('login');
        });

        document.getElementById('profileCardBtn')?.addEventListener('click', () => {
            authManager.openAuthModal('login');
        });

        // 1. Achievements Button & Modal
        document.getElementById('achievementsBtn')?.addEventListener('click', () => {
            this.showAchievementsModal();
        });
        
        // 2. Audio Toggle Button
        const muteToggleBtn = document.getElementById('muteToggleBtn');
        if (muteToggleBtn) {
            muteToggleBtn.addEventListener('click', () => {
                const isMuted = audioManager.toggleMute();
                muteToggleBtn.innerHTML = isMuted ? "🔇 <span class='d-none d-sm-inline'>Muted</span>" : "🔊 <span class='d-none d-sm-inline'>Audio</span>";
                muteToggleBtn.className = isMuted 
                    ? "btn btn-sm btn-outline-secondary flex-fill glow-hover" 
                    : "btn btn-sm btn-outline-info flex-fill glow-hover";
            });
        }

        // 3. Theme Toggle Button
        const themeToggleBtn = document.getElementById('themeToggleBtn');
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                themeManager.toggleTheme();
            });
        }
        
        // 4. Daily Reward Button
        document.getElementById('claimLoginRewardBtn')?.addEventListener('click', () => {
            alert('🎁 Daily Reward Claimed! +50 Coins');
            storage.updateState(s => s.coins += 50);
            if (audioManager) audioManager.playCoin?.();
        });
    }

    showAchievementsModal() {
        let modalEl = document.getElementById('achievementsModal');
        if (!modalEl) {
            modalEl = document.createElement('div');
            modalEl.id = 'achievementsModal';
            modalEl.className = 'modal fade';
            modalEl.tabIndex = -1;
            modalEl.innerHTML = `
                <div class="modal-dialog modal-dialog-centered modal-lg">
                    <div class="modal-content text-white" style="background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(16px); border: 1px solid var(--theme-color);">
                        <div class="modal-header border-secondary">
                            <h5 class="modal-title fw-bold text-theme">🏆 Player Achievements</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row g-3" id="achievementsList"></div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modalEl);
        }

        const listEl = modalEl.querySelector('#achievementsList');
        const state = storage.getState();
        const unlockedIds = state.achievements || [];

        listEl.innerHTML = ACHIEVEMENTS.map(ach => {
            const isUnlocked = unlockedIds.includes(ach.id);
            return `
                <div class="col-12 col-md-6">
                    <div class="p-3 rounded border ${isUnlocked ? 'border-warning' : 'border-secondary'}" style="background: ${isUnlocked ? 'rgba(234, 179, 8, 0.1)' : 'rgba(255, 255, 255, 0.03)'}">
                        <div class="d-flex align-items-center justify-content-between mb-1">
                            <span class="fw-bold ${isUnlocked ? 'text-warning' : 'text-white-50'}">${isUnlocked ? '🏆' : '🔒'} ${ach.title}</span>
                            <span class="badge ${isUnlocked ? 'bg-warning text-dark' : 'bg-secondary'}">${isUnlocked ? 'UNLOCKED' : 'LOCKED'}</span>
                        </div>
                        <p class="small text-white-50 mb-2">${ach.desc}</p>
                        <div class="d-flex gap-2">
                            <span class="badge bg-dark border border-info text-info small">+${ach.xp} XP</span>
                            <span class="badge bg-dark border border-warning text-warning small">+${ach.coins} Coins</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        if (window.bootstrap && window.bootstrap.Modal) {
            const modal = new window.bootstrap.Modal(modalEl);
            modal.show();
        } else {
            modalEl.classList.add('show', 'd-block');
        }
    }

    updateUI() {
        if (!this.playerName) return;
        
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
