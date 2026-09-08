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

        // 1. Sidebar Navigation (Hub, World Map, All Games, Store & Crates)
        this.bindNavigation();

        // 2. Achievements Button & Modal
        document.getElementById('achievementsBtn')?.addEventListener('click', () => {
            this.showAchievementsModal();
        });
        
        // 3. Audio Toggle Button
        const muteToggleBtn = document.getElementById('muteToggleBtn');
        if (muteToggleBtn) {
            const updateBtn = (muted) => {
                muteToggleBtn.innerHTML = muted ? "🔇 <span class='d-none d-sm-inline'>Muted</span>" : "🔊 <span class='d-none d-sm-inline'>Audio</span>";
                muteToggleBtn.className = muted 
                    ? "btn btn-sm btn-outline-secondary flex-fill glow-hover" 
                    : "btn btn-sm btn-outline-info flex-fill glow-hover";
            };
            updateBtn(audioManager.isMuted);
            muteToggleBtn.addEventListener('click', () => {
                const isMuted = audioManager.toggleMute();
                updateBtn(isMuted);
            });
        }

        // 4. Theme Toggle Button
        const themeToggleBtn = document.getElementById('themeToggleBtn');
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                themeManager.openThemeModal();
            });
        }
        
        // 5. Daily Reward Button
        document.getElementById('claimLoginRewardBtn')?.addEventListener('click', () => {
            alert('🎁 Daily Reward Claimed! +50 Coins');
            storage.updateState(s => s.coins += 50);
            if (audioManager) audioManager.playCoin?.();
        });
    }

    bindNavigation() {
        const navItems = document.querySelectorAll('.v2-sidebar .nav-item');
        const setActiveNav = (activeEl) => {
            navItems.forEach(item => item.classList.remove('active'));
            activeEl?.classList.add('active');
        };

        // 🏠 Hub
        const hubBtn = document.querySelector('a.nav-item[data-view="home"]') || navItems[0];
        hubBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            setActiveNav(hubBtn);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // 🗺️ World Map
        const worldBtn = document.querySelector('a.nav-item[data-view="world"]') || navItems[1];
        worldBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            setActiveNav(worldBtn);
            this.showWorldMapModal();
        });

        // 🎲 All Games
        const libraryBtn = document.querySelector('a.nav-item[data-view="library"]') || navItems[2];
        libraryBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            setActiveNav(libraryBtn);
            const libraryEl = document.getElementById('librarySection');
            if (libraryEl) {
                libraryEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Trigger 'All' tab
                document.querySelector('.tab-btn[data-filter="all"]')?.click();
            }
        });

        // 🛒 Store & Crates
        const storeBtn = document.getElementById('storeNavBtn') || document.querySelector('a.nav-item[href="#store"]') || navItems[3];
        storeBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            setActiveNav(storeBtn);
            this.showStoreModal();
        });
    }

    showWorldMapModal() {
        let modalEl = document.getElementById('worldMapModal');
        if (!modalEl) {
            modalEl = document.createElement('div');
            modalEl.id = 'worldMapModal';
            modalEl.className = 'modal fade';
            modalEl.tabIndex = -1;
            modalEl.innerHTML = `
                <div class="modal-dialog modal-dialog-centered modal-xl">
                    <div class="modal-content text-white" style="background: rgba(15, 23, 42, 0.96); backdrop-filter: blur(20px); border: 2px solid var(--v2-primary); border-radius: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.6);">
                        <div class="modal-header border-secondary p-4">
                            <div class="d-flex align-items-center gap-3">
                                <span class="fs-2">🗺️</span>
                                <div>
                                    <h4 class="modal-title fw-bold text-theme mb-0">LuckyKit Arcade World Map</h4>
                                    <span class="text-white-50 small">Explore gaming districts and unlock territory masteries</span>
                                </div>
                            </div>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body p-4">
                            <div class="row g-4">
                                <!-- Zone 1 -->
                                <div class="col-12 col-md-6 col-lg-4">
                                    <div class="p-3 rounded-4 border border-danger h-100 d-flex flex-column justify-content-between" style="background: rgba(239, 68, 68, 0.08);">
                                        <div>
                                            <div class="d-flex justify-content-between align-items-center mb-2">
                                                <h5 class="fw-bold text-danger m-0">🏙️ Cyber Metropolis</h5>
                                                <span class="badge bg-danger">Action Runner</span>
                                            </div>
                                            <p class="small text-white-50">High adrenaline escape missions and fast reflex trials through neon skyscraper rooftops.</p>
                                        </div>
                                        <div class="d-flex flex-column gap-2 mt-3">
                                            <a href="escape.html" class="btn btn-sm btn-danger fw-bold rounded-pill">▶ Escape from Monster</a>
                                            <a href="bike.html" class="btn btn-sm btn-outline-danger fw-bold rounded-pill">▶ MotoPark: Real Ride</a>
                                        </div>
                                    </div>
                                </div>

                                <!-- Zone 2 -->
                                <div class="col-12 col-md-6 col-lg-4">
                                    <div class="p-3 rounded-4 border border-warning h-100 d-flex flex-column justify-content-between" style="background: rgba(234, 179, 8, 0.08);">
                                        <div>
                                            <div class="d-flex justify-content-between align-items-center mb-2">
                                                <h5 class="fw-bold text-warning m-0">🛣️ Gold Highway</h5>
                                                <span class="badge bg-warning text-dark">Vehicles & Drive</span>
                                            </div>
                                            <p class="small text-white-50">Endless roads, high speed traffic weaving, and cargo deliveries under neon sunsets.</p>
                                        </div>
                                        <div class="d-flex flex-column gap-2 mt-3">
                                            <a href="truck.html" class="btn btn-sm btn-warning text-dark fw-bold rounded-pill">▶ Gold Highway Truck</a>
                                            <a href="bike.html" class="btn btn-sm btn-outline-warning fw-bold rounded-pill">▶ 3D Highway Bike</a>
                                        </div>
                                    </div>
                                </div>

                                <!-- Zone 3 -->
                                <div class="col-12 col-md-6 col-lg-4">
                                    <div class="p-3 rounded-4 border border-success h-100 d-flex flex-column justify-content-between" style="background: rgba(34, 197, 94, 0.08);">
                                        <div>
                                            <div class="d-flex justify-content-between align-items-center mb-2">
                                                <h5 class="fw-bold text-success m-0">🏰 Retro Arcade</h5>
                                                <span class="badge bg-success">Pixel Classics</span>
                                            </div>
                                            <p class="small text-white-50">Classic retro nostalgic games. Nokia dot-matrix pixels and timeless arcade challenges.</p>
                                        </div>
                                        <div class="d-flex flex-column gap-2 mt-3">
                                            <a href="snake.html" class="btn btn-sm btn-success fw-bold rounded-pill">▶ Nokia 3310 Snake</a>
                                            <a href="minesweeper.html" class="btn btn-sm btn-outline-success fw-bold rounded-pill">▶ Cyber Minesweeper</a>
                                        </div>
                                    </div>
                                </div>

                                <!-- Zone 4 -->
                                <div class="col-12 col-md-6 col-lg-6">
                                    <div class="p-3 rounded-4 border border-info h-100 d-flex flex-column justify-content-between" style="background: rgba(14, 165, 233, 0.08);">
                                        <div>
                                            <div class="d-flex justify-content-between align-items-center mb-2">
                                                <h5 class="fw-bold text-info m-0">🧠 Mind Sanctuary</h5>
                                                <span class="badge bg-info text-dark">Brain & Strategy</span>
                                            </div>
                                            <p class="small text-white-50">Sharpen your cognitive skills with chess tactics, pattern puzzles, and logic board games.</p>
                                        </div>
                                        <div class="d-flex flex-wrap gap-2 mt-3">
                                            <a href="chess.html" class="btn btn-sm btn-info text-dark fw-bold rounded-pill flex-fill">♟️ Chess</a>
                                            <a href="connect4.html" class="btn btn-sm btn-outline-info fw-bold rounded-pill flex-fill">🔴 Connect 4</a>
                                            <a href="2048.html" class="btn btn-sm btn-outline-info fw-bold rounded-pill flex-fill">🔢 2048</a>
                                            <a href="tictactoe.html" class="btn btn-sm btn-outline-info fw-bold rounded-pill flex-fill">❌ Tic-Tac-Toe</a>
                                        </div>
                                    </div>
                                </div>

                                <!-- Zone 5 -->
                                <div class="col-12 col-md-6 col-lg-6">
                                    <div class="p-3 rounded-4 border border-primary h-100 d-flex flex-column justify-content-between" style="background: rgba(168, 85, 247, 0.08);">
                                        <div>
                                            <div class="d-flex justify-content-between align-items-center mb-2">
                                                <h5 class="fw-bold text-primary m-0">🌌 Cosmic Orbit</h5>
                                                <span class="badge bg-primary">Arcade Blast</span>
                                            </div>
                                            <p class="small text-white-50">Travel into orbit, pop neon anti-gravity balloons, and defeat invading galaxy fleets.</p>
                                        </div>
                                        <div class="d-flex flex-wrap gap-2 mt-3">
                                            <a href="space.html" class="btn btn-sm btn-primary fw-bold rounded-pill flex-fill">🚀 Space Invaders</a>
                                            <a href="balloon.html" class="btn btn-sm btn-outline-primary fw-bold rounded-pill flex-fill">🎈 Balloon Pop</a>
                                            <a href="flappy.html" class="btn btn-sm btn-outline-primary fw-bold rounded-pill flex-fill">🐥 Flappy Neon</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modalEl);
        }

        if (window.bootstrap && window.bootstrap.Modal) {
            const modal = new window.bootstrap.Modal(modalEl);
            modal.show();
        } else {
            modalEl.classList.add('show', 'd-block');
        }
    }

    showStoreModal() {
        let modalEl = document.getElementById('storeModal');
        if (!modalEl) {
            modalEl = document.createElement('div');
            modalEl.id = 'storeModal';
            modalEl.className = 'modal fade';
            modalEl.tabIndex = -1;
            document.body.appendChild(modalEl);
        }

        const state = storage.getState();
        modalEl.innerHTML = `
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content text-white" style="background: rgba(15, 23, 42, 0.96); backdrop-filter: blur(20px); border: 2px solid var(--v2-primary); border-radius: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.6);">
                    <div class="modal-header border-secondary p-4">
                        <div class="d-flex align-items-center justify-content-between w-100 pe-3">
                            <div class="d-flex align-items-center gap-3">
                                <span class="fs-2">🛒</span>
                                <div>
                                    <h4 class="modal-title fw-bold text-theme mb-0">Store & Mystery Crates</h4>
                                    <span class="text-white-50 small">Unlock crates, avatars, and rare rewards</span>
                                </div>
                            </div>
                            <div class="badge bg-dark border border-warning text-warning fs-6 px-3 py-2 rounded-pill">
                                🪙 <span id="storeModalCoins">${state.coins}</span> Coins
                            </div>
                        </div>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body p-4">
                        <h5 class="fw-bold mb-3 text-warning">📦 Mystery Crates (RNG Rewards)</h5>
                        <div class="row g-3 mb-4">
                            <!-- Common Crate -->
                            <div class="col-12 col-md-4">
                                <div class="p-3 rounded-4 border border-secondary text-center h-100 d-flex flex-column justify-content-between" style="background: rgba(255,255,255,0.03);">
                                    <div>
                                        <div class="fs-1 mb-2">📦</div>
                                        <div class="fw-bold text-light fs-5">Common Crate</div>
                                        <p class="small text-white-50 mt-1">Win Coins, XP, or Avatars</p>
                                    </div>
                                    <button class="btn btn-sm btn-outline-warning w-100 rounded-pill fw-bold mt-2" onclick="window.v2Dashboard.buyCrate('common', 100)">
                                        🪙 100 Coins
                                    </button>
                                </div>
                            </div>
                            <!-- Epic Crate -->
                            <div class="col-12 col-md-4">
                                <div class="p-3 rounded-4 border border-info text-center h-100 d-flex flex-column justify-content-between" style="background: rgba(14, 165, 233, 0.06);">
                                    <div>
                                        <div class="fs-1 mb-2">🎁</div>
                                        <div class="fw-bold text-info fs-5">Epic Crate</div>
                                        <p class="small text-white-50 mt-1">Up to 600 Coins & 800 XP</p>
                                    </div>
                                    <button class="btn btn-sm btn-info text-dark w-100 rounded-pill fw-bold mt-2" onclick="window.v2Dashboard.buyCrate('epic', 300)">
                                        🪙 300 Coins
                                    </button>
                                </div>
                            </div>
                            <!-- Legendary Crate -->
                            <div class="col-12 col-md-4">
                                <div class="p-3 rounded-4 border border-warning text-center h-100 d-flex flex-column justify-content-between" style="background: rgba(234, 179, 8, 0.08);">
                                    <div>
                                        <div class="fs-1 mb-2">👑</div>
                                        <div class="fw-bold text-warning fs-5">Legendary Crate</div>
                                        <p class="small text-white-50 mt-1">Huge 1500 Coins & 2000 XP</p>
                                    </div>
                                    <button class="btn btn-sm btn-warning text-dark w-100 rounded-pill fw-bold mt-2" onclick="window.v2Dashboard.buyCrate('legendary', 600)">
                                        🪙 600 Coins
                                    </button>
                                </div>
                            </div>
                        </div>

                        <h5 class="fw-bold mb-3 text-info">👾 Collectible Avatars</h5>
                        <div class="row g-2">
                            ${[
                                { icon: '👾', name: 'Alien Invader', price: 0 },
                                { icon: '🥷', name: 'Cyber Ninja', price: 150 },
                                { icon: '🤖', name: 'Mecha Cyborg', price: 300 },
                                { icon: '👑', name: 'Royal King', price: 500 },
                                { icon: '🦁', name: 'Arcade Lion', price: 800 },
                                { icon: '🚀', name: 'Astronaut', price: 1000 }
                            ].map(av => {
                                const isCurrent = state.activeAvatar === av.icon;
                                return `
                                    <div class="col-6 col-md-4">
                                        <div class="p-2 rounded-3 border ${isCurrent ? 'border-success bg-success-subtle' : 'border-secondary'} d-flex align-items-center justify-content-between" style="background: rgba(255,255,255,0.03);">
                                            <div class="d-flex align-items-center gap-2">
                                                <span class="fs-3">${av.icon}</span>
                                                <span class="small fw-bold text-light">${av.name}</span>
                                            </div>
                                            <button class="btn btn-xs btn-${isCurrent ? 'success' : 'outline-light'} px-2 py-1 rounded-pill small" onclick="window.v2Dashboard.equipAvatar('${av.icon}', ${av.price})">
                                                ${isCurrent ? 'Equipped' : (av.price === 0 ? 'Equip' : `🪙 ${av.price}`)}
                                            </button>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (window.bootstrap && window.bootstrap.Modal) {
            const modal = new window.bootstrap.Modal(modalEl);
            modal.show();
        } else {
            modalEl.classList.add('show', 'd-block');
        }
    }

    buyCrate(type, cost) {
        const state = storage.getState();
        if (state.coins < cost) {
            alert(`⚠️ Not enough coins! You need ${cost} coins.`);
            return;
        }

        storage.updateState(s => s.coins -= cost);
        if (audioManager) audioManager.playCrateOpen?.();

        const rewards = [
            { type: 'coins', amount: Math.floor(cost * (1.2 + Math.random() * 0.8)), desc: 'Coins Bonus' },
            { type: 'xp', amount: cost * 3, desc: 'XP Surge' },
            { type: 'coins', amount: Math.floor(cost * 1.5), desc: 'Jackpot Coins' }
        ];
        const reward = rewards[Math.floor(Math.random() * rewards.length)];

        if (reward.type === 'coins') {
            storage.updateState(s => s.coins += reward.amount);
        } else if (reward.type === 'xp') {
            playerProfile.addXP(reward.amount);
        }

        setTimeout(() => {
            if (audioManager) audioManager.playWin?.();
            alert(`🎉 Crate Opened! You won: +${reward.amount} ${reward.desc}!`);
            this.showStoreModal(); // refresh modal
            this.updateUI();
        }, 1000);
    }

    equipAvatar(avatar, price) {
        const state = storage.getState();
        if (state.activeAvatar === avatar) return;

        if (price > 0 && !state.inventory?.avatars?.includes(avatar)) {
            if (state.coins < price) {
                alert(`⚠️ Not enough coins! You need ${price} coins.`);
                return;
            }
            storage.updateState(s => {
                s.coins -= price;
                s.activeAvatar = avatar;
                if (!s.inventory.avatars) s.inventory.avatars = [];
                s.inventory.avatars.push(avatar);
            });
            if (audioManager) audioManager.playSelect?.();
            alert(`🎉 Avatar unlocked & equipped: ${avatar}`);
        } else {
            storage.updateState(s => s.activeAvatar = avatar);
            if (audioManager) audioManager.playSelect?.();
        }
        this.showStoreModal();
        this.updateUI();
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
        
        // Prestige Badge (if present)
        if (this.playerPrestigeBadge) {
            if (state.prestige > 0) {
                this.playerPrestigeBadge.classList.remove('d-none');
                this.playerPrestigeBadge.textContent = `★ ${state.prestige}`;
            } else {
                this.playerPrestigeBadge.classList.add('d-none');
            }
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
