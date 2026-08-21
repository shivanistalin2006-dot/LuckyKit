import { storage } from './storage.js';
import { audioManager } from '../audio/audioManager.js';
import { animationManager } from '../animation/animationManager.js';
import { eventBus } from './eventBus.js';

const ACCOUNTS_KEY = 'luckykit_accounts_v1';
const CURRENT_USER_KEY = 'luckykit_current_user';

export const AVATAR_LIST = [
    '👾', '🤖', '👑', '⚡', '🐉', '🐯', '🦊', '🚀', 
    '🎮', '🐱', '💎', '🌟', '🎯', '🔥', '🥷', '🦄'
];

export class AuthManager {
    constructor() {
        if (AuthManager.instance) return AuthManager.instance;
        AuthManager.instance = this;
        
        this.init();
    }

    init() {
        const accounts = this.getAccounts();
        const currentUsername = localStorage.getItem(CURRENT_USER_KEY);

        // If an account is logged in, sync storage with account data
        if (currentUsername && accounts[currentUsername]) {
            const accData = accounts[currentUsername];
            storage.updateState(state => {
                state.playerName = accData.username;
                state.activeAvatar = accData.avatar || '👾';
                if (accData.state) {
                    Object.assign(state, accData.state);
                }
            });
        } else {
            // Ensure at least default guest exists
            const state = storage.getState();
            if (!currentUsername) {
                localStorage.setItem(CURRENT_USER_KEY, state.playerName || 'Player 1');
            }
        }
    }

    getAccounts() {
        try {
            const raw = localStorage.getItem(ACCOUNTS_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            console.error("Failed to load accounts", e);
            return {};
        }
    }

    saveAccounts(accounts) {
        try {
            localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
        } catch (e) {
            console.error("Failed to save accounts", e);
        }
    }

    getCurrentUser() {
        return localStorage.getItem(CURRENT_USER_KEY) || 'Player 1';
    }

    saveCurrentStateToAccount() {
        const currentUser = this.getCurrentUser();
        const accounts = this.getAccounts();
        const state = storage.getState();

        if (currentUser && accounts[currentUser]) {
            accounts[currentUser].state = JSON.parse(JSON.stringify(state));
            accounts[currentUser].avatar = state.activeAvatar;
            accounts[currentUser].lastActive = Date.now();
            this.saveAccounts(accounts);
        }
    }

    login(username, pin = '') {
        const cleanName = username.trim();
        if (!cleanName) return { success: false, message: 'Please enter a username.' };

        const accounts = this.getAccounts();
        const account = accounts[cleanName];

        if (!account) {
            return { success: false, message: 'Account not found. Please create one.' };
        }

        if (account.pin && account.pin !== pin) {
            return { success: false, message: 'Incorrect PIN/Password.' };
        }

        // Save current user state before switching
        this.saveCurrentStateToAccount();

        // Switch to selected account
        localStorage.setItem(CURRENT_USER_KEY, cleanName);

        if (account.state) {
            storage.updateState(state => {
                Object.assign(state, account.state);
                state.playerName = cleanName;
                state.activeAvatar = account.avatar || '👾';
            });
        } else {
            storage.updateState(state => {
                state.playerName = cleanName;
                state.activeAvatar = account.avatar || '👾';
            });
        }

        if (audioManager) audioManager.playLevelUp?.();
        eventBus.emit('USER_LOGGED_IN', { username: cleanName });
        return { success: true, message: `Welcome back, ${cleanName}!` };
    }

    register(username, pin = '', avatar = '👾') {
        const cleanName = username.trim();
        if (!cleanName) return { success: false, message: 'Please enter a valid username.' };
        if (cleanName.length < 2) return { success: false, message: 'Username must be at least 2 characters.' };

        const accounts = this.getAccounts();
        if (accounts[cleanName]) {
            return { success: false, message: 'Username already exists! Please login instead.' };
        }

        // Save current user state before creating new
        this.saveCurrentStateToAccount();

        // Create new account
        accounts[cleanName] = {
            username: cleanName,
            pin: pin.trim(),
            avatar: avatar || '👾',
            createdAt: Date.now(),
            lastActive: Date.now(),
            state: null // Will inherit fresh state
        };

        this.saveAccounts(accounts);
        localStorage.setItem(CURRENT_USER_KEY, cleanName);

        // Reset storage with starting default for the new player
        storage.updateState(state => {
            state.playerName = cleanName;
            state.activeAvatar = avatar || '👾';
            state.coins = 100;
            state.xp = 0;
            state.level = 1;
            state.rank = 'Bronze';
            state.stats = { totalPlays: 0, totalWins: 0, highScores: {}, gameStats: {} };
            state.achievements = [];
        });

        if (audioManager) audioManager.playTone(900, 'sine', 0.2);
        if (animationManager) {
            animationManager.spawnConfetti(window.innerWidth / 2, window.innerHeight / 2, 80);
        }

        eventBus.emit('USER_LOGGED_IN', { username: cleanName });
        return { success: true, message: `Account created! Welcome, ${cleanName}!` };
    }

    logout() {
        this.saveCurrentStateToAccount();
        localStorage.removeItem(CURRENT_USER_KEY);
        
        // Reset to guest
        storage.updateState(state => {
            state.playerName = 'Guest';
            state.activeAvatar = '👤';
        });

        eventBus.emit('USER_LOGGED_OUT', {});
    }

    openAuthModal(defaultTab = 'login') {
        let modalEl = document.getElementById('authModal');
        if (!modalEl) {
            modalEl = this.createModalElement();
            document.body.appendChild(modalEl);
        }

        this.populateModal(modalEl, defaultTab);

        if (window.bootstrap && window.bootstrap.Modal) {
            const modal = new window.bootstrap.Modal(modalEl);
            modal.show();
        } else {
            modalEl.classList.add('show', 'd-block');
        }
    }

    createModalElement() {
        const modalEl = document.createElement('div');
        modalEl.id = 'authModal';
        modalEl.className = 'modal fade';
        modalEl.tabIndex = -1;
        modalEl.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content text-white rounded-4 shadow-lg border border-danger" style="background: rgba(15, 20, 35, 0.96); backdrop-filter: blur(20px);">
                    <div class="modal-header border-secondary p-3">
                        <div class="d-flex align-items-center gap-2">
                            <span class="fs-3">🎮</span>
                            <h5 class="modal-title fw-bold text-theme m-0">LuckyKit Player ID</h5>
                        </div>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body p-4" id="authModalBody">
                        <!-- Injected by populateModal -->
                    </div>
                </div>
            </div>
        `;
        return modalEl;
    }

    populateModal(modalEl, defaultTab = 'login') {
        const bodyEl = modalEl.querySelector('#authModalBody');
        const currentUser = this.getCurrentUser();
        const accounts = this.getAccounts();
        const accountList = Object.values(accounts);

        bodyEl.innerHTML = `
            <!-- Current Status -->
            <div class="p-3 rounded mb-3 d-flex justify-content-between align-items-center" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);">
                <div class="d-flex align-items-center gap-3">
                    <span class="fs-2" id="modalCurrentAvatar">${storage.getState().activeAvatar || '👾'}</span>
                    <div>
                        <div class="fw-bold text-white fs-5" id="modalCurrentName">${currentUser}</div>
                        <span class="badge bg-warning text-dark">Active Player</span>
                    </div>
                </div>
                <button class="btn btn-sm btn-outline-danger" id="modalLogoutBtn">Logout</button>
            </div>

            <!-- Tab Nav -->
            <ul class="nav nav-pills nav-fill mb-3 gap-2" role="tablist">
                <li class="nav-item">
                    <button class="nav-link ${defaultTab === 'login' ? 'active btn-theme text-white' : 'btn-outline-secondary text-white-50'} fw-bold" id="tabLoginBtn" data-tab="login">
                        🔑 Login
                    </button>
                </li>
                <li class="nav-item">
                    <button class="nav-link ${defaultTab === 'register' ? 'active btn-theme text-white' : 'btn-outline-secondary text-white-50'} fw-bold" id="tabRegisterBtn" data-tab="register">
                        ✨ Create Account
                    </button>
                </li>
            </ul>

            <!-- Alert Box -->
            <div id="authAlert" class="alert d-none py-2 px-3 small rounded-3 mb-3"></div>

            <!-- Login Form -->
            <div id="loginFormSection" class="${defaultTab === 'login' ? '' : 'd-none'}">
                <div class="mb-3">
                    <label class="form-label text-white-50 small fw-bold">PLAYER USERNAME</label>
                    <input type="text" class="form-control bg-dark text-white border-secondary" id="loginUsername" placeholder="e.g. Shivani, ProGamer..." list="existingAccountsList" autocomplete="off">
                    <datalist id="existingAccountsList">
                        ${accountList.map(a => `<option value="${a.username}"></option>`).join('')}
                    </datalist>
                </div>
                <div class="mb-3">
                    <label class="form-label text-white-50 small fw-bold">PIN / PASSWORD (OPTIONAL)</label>
                    <input type="password" class="form-control bg-dark text-white border-secondary" id="loginPin" placeholder="4-digit PIN (if set)">
                </div>
                <button class="btn btn-theme w-100 py-2 fw-bold fs-5 rounded-3 shadow-lg" id="submitLoginBtn">
                    ▶ LOGIN TO LUCKYKIT
                </button>

                ${accountList.length > 0 ? `
                    <div class="mt-4">
                        <label class="form-label text-white-50 small fw-bold mb-2">QUICK SWITCH SAVED ACCOUNTS</label>
                        <div class="d-flex flex-wrap gap-2">
                            ${accountList.map(a => `
                                <button class="btn btn-sm btn-dark border border-secondary text-white d-flex align-items-center gap-1 quick-account-btn" data-username="${a.username}">
                                    <span>${a.avatar || '👾'}</span>
                                    <span>${a.username}</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>

            <!-- Register Form -->
            <div id="registerFormSection" class="${defaultTab === 'register' ? '' : 'd-none'}">
                <div class="mb-3">
                    <label class="form-label text-white-50 small fw-bold">CHOOSE USERNAME</label>
                    <input type="text" class="form-control bg-dark text-white border-secondary" id="regUsername" placeholder="Enter your player handle">
                </div>
                <div class="mb-3">
                    <label class="form-label text-white-50 small fw-bold">CHOOSE PIN / PASSWORD (OPTIONAL)</label>
                    <input type="password" class="form-control bg-dark text-white border-secondary" id="regPin" placeholder="4-digit security PIN">
                </div>
                <div class="mb-3">
                    <label class="form-label text-white-50 small fw-bold">SELECT AVATAR</label>
                    <div class="d-flex flex-wrap gap-2 justify-content-center p-2 rounded bg-dark border border-secondary" id="avatarSelectorContainer">
                        ${AVATAR_LIST.map((av, idx) => `
                            <button type="button" class="btn btn-sm btn-outline-secondary avatar-pick-btn ${idx === 0 ? 'active border-warning' : ''}" data-avatar="${av}" style="font-size: 1.4rem; padding: 4px 10px;">
                                ${av}
                            </button>
                        `).join('')}
                    </div>
                </div>
                <button class="btn btn-success w-100 py-2 fw-bold fs-5 rounded-3 shadow-lg" id="submitRegisterBtn">
                    ✨ CREATE & START PLAYING
                </button>
            </div>
        `;

        this.bindModalEvents(modalEl);
    }

    bindModalEvents(modalEl) {
        const tabLoginBtn = modalEl.querySelector('#tabLoginBtn');
        const tabRegisterBtn = modalEl.querySelector('#tabRegisterBtn');
        const loginSection = modalEl.querySelector('#loginFormSection');
        const registerSection = modalEl.querySelector('#registerFormSection');
        const authAlert = modalEl.querySelector('#authAlert');

        const showAlert = (msg, isSuccess = false) => {
            authAlert.className = `alert ${isSuccess ? 'alert-success' : 'alert-danger'} py-2 px-3 small rounded-3 mb-3`;
            authAlert.textContent = msg;
            authAlert.classList.remove('d-none');
        };

        // Tab Switching
        tabLoginBtn?.addEventListener('click', () => {
            tabLoginBtn.className = 'nav-link active btn-theme text-white fw-bold';
            tabRegisterBtn.className = 'nav-link btn-outline-secondary text-white-50 fw-bold';
            loginSection.classList.remove('d-none');
            registerSection.classList.add('d-none');
            authAlert.classList.add('d-none');
        });

        tabRegisterBtn?.addEventListener('click', () => {
            tabRegisterBtn.className = 'nav-link active btn-theme text-white fw-bold';
            tabLoginBtn.className = 'nav-link btn-outline-secondary text-white-50 fw-bold';
            registerSection.classList.remove('d-none');
            loginSection.classList.add('d-none');
            authAlert.classList.add('d-none');
        });

        // Avatar Picker
        let selectedAvatar = '👾';
        const avatarBtns = modalEl.querySelectorAll('.avatar-pick-btn');
        avatarBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                avatarBtns.forEach(b => b.classList.remove('active', 'border-warning'));
                btn.classList.add('active', 'border-warning');
                selectedAvatar = btn.dataset.avatar;
            });
        });

        // Submit Login
        modalEl.querySelector('#submitLoginBtn')?.addEventListener('click', () => {
            const username = modalEl.querySelector('#loginUsername').value;
            const pin = modalEl.querySelector('#loginPin').value;
            const res = this.login(username, pin);
            if (res.success) {
                showAlert(res.message, true);
                setTimeout(() => {
                    const bsModal = window.bootstrap?.Modal?.getInstance(modalEl);
                    if (bsModal) bsModal.hide();
                    else modalEl.classList.remove('show', 'd-block');
                }, 800);
            } else {
                showAlert(res.message, false);
            }
        });

        // Submit Register
        modalEl.querySelector('#submitRegisterBtn')?.addEventListener('click', () => {
            const username = modalEl.querySelector('#regUsername').value;
            const pin = modalEl.querySelector('#regPin').value;
            const res = this.register(username, pin, selectedAvatar);
            if (res.success) {
                showAlert(res.message, true);
                setTimeout(() => {
                    const bsModal = window.bootstrap?.Modal?.getInstance(modalEl);
                    if (bsModal) bsModal.hide();
                    else modalEl.classList.remove('show', 'd-block');
                }, 800);
            } else {
                showAlert(res.message, false);
            }
        });

        // Quick Account Switch
        modalEl.querySelectorAll('.quick-account-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const username = btn.dataset.username;
                const res = this.login(username);
                if (res.success) {
                    showAlert(res.message, true);
                    setTimeout(() => {
                        const bsModal = window.bootstrap?.Modal?.getInstance(modalEl);
                        if (bsModal) bsModal.hide();
                        else modalEl.classList.remove('show', 'd-block');
                    }, 600);
                } else {
                    showAlert(res.message, false);
                }
            });
        });

        // Logout Button
        modalEl.querySelector('#modalLogoutBtn')?.addEventListener('click', () => {
            this.logout();
            showAlert('Logged out successfully as Guest.', true);
            setTimeout(() => {
                this.populateModal(modalEl, 'login');
            }, 600);
        });
    }
}

export const authManager = new AuthManager();
