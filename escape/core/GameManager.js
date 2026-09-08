// escape/core/GameManager.js
import { BaseGame } from '../../core/BaseGame.js?v=2.5';
import { EventBus } from './EventBus.js';
import { SettingsManager } from './SettingsManager.js';
import { SaveSystem } from './SaveSystem.js';
import { AchievementSystem } from './AchievementSystem.js';
import { MAP_WIDTH, MAP_HEIGHT, ROOMS, WALLS, PATROL_WAYPOINTS } from '../world/FacilityMap.js';
import { Player } from '../entities/Player.js';
import { Monster } from '../entities/Monster.js';
import { AudioEngine } from '../systems/AudioEngine.js';
import { LightingEngine } from '../systems/LightingEngine.js';
import { InteractionSystem } from '../systems/InteractionSystem.js';
import { ObjectiveSystem } from '../systems/ObjectiveSystem.js';
import { TriggerSystem } from '../systems/TriggerSystem.js';
import { DebugTools } from '../systems/DebugTools.js';
import { audioManager } from '../../audio/audioManager.js';
import { playerProfile } from '../../core/playerProfile.js';

export class GameManager extends BaseGame {
    constructor() {
        super('escapeCanvas');
        this.name = "Escape from Monster";

        // Canvas & Context setup
        this.canvas = document.getElementById('escapeCanvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.width = this.canvas ? this.canvas.width : 960;
        this.height = this.canvas ? this.canvas.height : 540;
        this.keys = {};

        // Core Subsystems
        this.eventBus = new EventBus();
        this.settings = new SettingsManager();
        this.saveSystem = new SaveSystem();
        this.achievements = new AchievementSystem();
        this.audio = new AudioEngine();
        this.lighting = new LightingEngine();
        this.interactions = new InteractionSystem();
        this.objectives = new ObjectiveSystem();
        this.triggers = new TriggerSystem();
        this.debug = new DebugTools(this);

        // Entities
        this.player = new Player(200, 800);
        this.monster = new Monster(1600, 300);

        // Game State Variables
        this.gameState = 'TITLE'; // TITLE, PLAYING, PAUSED, JUMPSCARE, ENDING
        this.difficulty = 'normal';
        this.startTime = 0;
        this.elapsedTime = 0;
        this.camera = { x: 0, y: 0 };
        this.mobileVector = { x: 0, y: 0 };
        this.aimAngle = 0;

        // Keypad modal state
        this.keypadCode = '';
        this.activeKeypadObj = null;

        this.bindEvents();
        this.startLoop();
    }

    bindEvents() {
        // Keyboard movement listener
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'KeyE') {
                this.interactions.handleInteraction(this.player, this.audio, this.eventBus);
                this.updateInventoryUI();
                this.updateHUD();
            } else if (e.code === 'KeyF') {
                this.player.flashlightOn = !this.player.flashlightOn;
                this.audio.playKeypadBeep();
            } else if (e.code === 'F3') {
                e.preventDefault();
                this.debug.toggle();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Event listeners
        this.eventBus.on('puzzleStateChanged', () => {
            this.objectives.checkProgress(this.interactions.puzzleState, this.player);
            this.updateHUD();
        });

        this.eventBus.on('itemCollected', (item) => {
            this.objectives.checkProgress(this.interactions.puzzleState, this.player);
            this.updateInventoryUI();
            this.showToast(`PICKED UP: ${item.name}`, item.desc || '');
        });

        this.eventBus.on('loreFound', (obj) => {
            this.showToast(obj.loreTitle || 'CLASSIFIED NOTE', obj.loreText || '');
            if (this.player.loreLogsFound >= 3) {
                this.achievements.unlock('lore_master');
            }
        });

        this.eventBus.on('triggerActivated', (trig) => {
            if (trig.id === 'lab_ambush') {
                this.audio.playMonsterRoar();
                this.monster.state = 'CHASE';
                this.monster.targetX = this.player.x;
                this.monster.targetY = this.player.y;
                this.showToast('⚠️ WARNING', 'High bio-threat approaching your sector!');
            } else if (trig.id === 'security_alarm') {
                this.audio.playKeypadBeep();
                this.monster.state = 'INVESTIGATE';
                this.monster.targetX = 1450;
                this.monster.targetY = 220;
            }
        });

        this.eventBus.on('openKeypad', (obj) => {
            this.activeKeypadObj = obj;
            this.keypadCode = '';
            const modal = document.getElementById('keypadModal');
            const display = document.getElementById('keypadDisplay');
            if (display) display.textContent = '____';
            if (modal) modal.classList.remove('d-none');
        });

        // UI Listeners
        const startBtn = document.getElementById('startGameBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }

        const pauseBtn = document.getElementById('pauseBtn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.togglePause());
        }

        const diffSelect = document.getElementById('difficultySelect');
        if (diffSelect) {
            diffSelect.addEventListener('change', (e) => {
                this.difficulty = e.target.value;
                this.monster.setDifficulty(this.difficulty);
            });
        }

        const restartBtn = document.getElementById('endingRestartBtn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.restartGame());
        }

        // Keypad buttons
        document.querySelectorAll('.key-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const val = e.target.getAttribute('data-val');
                this.handleKeypadInput(val);
            });
        });

        const closeKeypadBtn = document.getElementById('closeKeypadBtn');
        if (closeKeypadBtn) {
            closeKeypadBtn.addEventListener('click', () => {
                const modal = document.getElementById('keypadModal');
                if (modal) modal.classList.add('d-none');
            });
        }

        // Mouse aiming
        if (this.canvas) {
            this.canvas.addEventListener('mousemove', (e) => {
                const rect = this.canvas.getBoundingClientRect();
                const scaleX = this.canvas.width / rect.width;
                const scaleY = this.canvas.height / rect.height;
                const mouseWorldX = (e.clientX - rect.left) * scaleX + this.camera.x;
                const mouseWorldY = (e.clientY - rect.top) * scaleY + this.camera.y;
                this.aimAngle = Math.atan2(mouseWorldY - this.player.y, mouseWorldX - this.player.x);
                this.player.angle = this.aimAngle;
            });
        }

        this.setupMobileControls();
    }

    setupMobileControls() {
        const joyZone = document.getElementById('virtualJoystickZone');
        const knob = document.getElementById('joystickKnob');
        if (!joyZone || !knob) return;

        let touchId = null;
        let startX = 0, startY = 0;

        const onTouchStart = (e) => {
            const touch = e.changedTouches[0];
            touchId = touch.identifier;
            const rect = joyZone.getBoundingClientRect();
            startX = rect.left + rect.width / 2;
            startY = rect.top + rect.height / 2;
        };

        const onTouchMove = (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === touchId) {
                    const dx = touch.clientX - startX;
                    const dy = touch.clientY - startY;
                    const dist = Math.hypot(dx, dy);
                    const maxDist = 45;
                    const angle = Math.atan2(dy, dx);
                    const clampedDist = Math.min(dist, maxDist);

                    knob.style.transform = `translate(${Math.cos(angle) * clampedDist}px, ${Math.sin(angle) * clampedDist}px)`;
                    this.mobileVector = {
                        x: (Math.cos(angle) * clampedDist) / maxDist,
                        y: (Math.sin(angle) * clampedDist) / maxDist
                    };
                    this.player.angle = angle;
                }
            }
        };

        const onTouchEnd = (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === touchId) {
                    touchId = null;
                    knob.style.transform = 'translate(0px, 0px)';
                    this.mobileVector = { x: 0, y: 0 };
                }
            }
        };

        joyZone.addEventListener('touchstart', onTouchStart, { passive: false });
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('touchend', onTouchEnd, { passive: false });

        // Mobile Buttons
        const mFlash = document.getElementById('mobileFlashlightBtn');
        if (mFlash) mFlash.addEventListener('click', () => { this.player.flashlightOn = !this.player.flashlightOn; });

        const mCrouch = document.getElementById('mobileCrouchBtn');
        if (mCrouch) {
            mCrouch.addEventListener('touchstart', () => { this.keys['mobileCrouch'] = true; });
            mCrouch.addEventListener('touchend', () => { this.keys['mobileCrouch'] = false; });
        }

        const mSprint = document.getElementById('mobileSprintBtn');
        if (mSprint) {
            mSprint.addEventListener('touchstart', () => { this.keys['mobileSprint'] = true; });
            mSprint.addEventListener('touchend', () => { this.keys['mobileSprint'] = false; });
        }

        const mAction = document.getElementById('mobileActionBtn');
        if (mAction) {
            mAction.addEventListener('click', () => {
                this.interactions.handleInteraction(this.player, this.audio, this.eventBus);
                this.updateInventoryUI();
                this.updateHUD();
            });
        }
    }

    handleKeypadInput(val) {
        this.audio.playKeypadBeep();
        const display = document.getElementById('keypadDisplay');

        if (val === 'C') {
            this.keypadCode = '';
        } else if (val === 'E') {
            if (this.activeKeypadObj && (this.keypadCode === '4829' || this.keypadCode === this.activeKeypadObj.correctCode)) {
                this.interactions.puzzleState.keypadUnlocked = true;
                this.interactions.puzzleState.securityGridOff = true;
                this.audio.playItemPickup();
                this.showToast('ACCESS GRANTED', 'Security grid deactivated. Blast gate unlocked.');
                const modal = document.getElementById('keypadModal');
                if (modal) modal.classList.add('d-none');
                this.eventBus.emit('puzzleStateChanged');
            } else {
                this.audio.playMonsterRoar();
                this.showToast('ACCESS DENIED', 'Incorrect passcode! Warning alarm triggered!');
                this.monster.state = 'CHASE';
                this.monster.targetX = this.player.x;
                this.monster.targetY = this.player.y;
                this.keypadCode = '';
            }
        } else {
            if (this.keypadCode.length < 4) {
                this.keypadCode += val;
            }
        }

        if (display) {
            display.textContent = this.keypadCode.padEnd(4, '_');
        }
    }

    startGame() {
        const intro = document.getElementById('storyIntroOverlay');
        if (intro) intro.classList.add('d-none');

        this.gameState = 'PLAYING';
        this.startTime = Date.now();
        this.audio.startAmbientDrone();
        this.monster.setDifficulty(this.difficulty);
        this.updateHUD();
        this.updateInventoryUI();
    }

    togglePause() {
        if (this.gameState === 'PLAYING') {
            this.gameState = 'PAUSED';
            this.audio.stopAmbientDrone();
            const pauseBtn = document.getElementById('pauseBtn');
            if (pauseBtn) pauseBtn.textContent = '▶️ Resume';
        } else if (this.gameState === 'PAUSED') {
            this.gameState = 'PLAYING';
            this.audio.startAmbientDrone();
            const pauseBtn = document.getElementById('pauseBtn');
            if (pauseBtn) pauseBtn.textContent = '⏸️ Pause';
        }
    }

    restartGame() {
        const endingOverlay = document.getElementById('endingOverlay');
        if (endingOverlay) endingOverlay.classList.add('d-none');
        const jumpscare = document.getElementById('jumpscareOverlay');
        if (jumpscare) jumpscare.classList.add('d-none');

        this.player = new Player(200, 800);
        this.monster = new Monster(1600, 300);
        this.interactions = new InteractionSystem();
        this.objectives = new ObjectiveSystem();
        this.triggers = new TriggerSystem();
        this.debug = new DebugTools(this);

        this.gameState = 'PLAYING';
        this.startTime = Date.now();
        this.audio.startAmbientDrone();
        this.updateHUD();
        this.updateInventoryUI();
    }

    startLoop() {
        const loopFn = () => {
            this.update();
            this.render();
            requestAnimationFrame(loopFn);
        };
        requestAnimationFrame(loopFn);
    }

    update() {
        if (this.gameState !== 'PLAYING') return;

        this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);

        // Update lighting flicker/storms
        this.lighting.update();

        // Update player
        this.player.update(this.keys, this.mobileVector, this.interactions.puzzleState);

        // Update monster AI
        const monsterStatus = this.monster.update(this.player, this.audio, this.interactions.puzzleState);

        // Trigger jumpscare on catch
        if (monsterStatus === 'CATCH') {
            this.triggerJumpscare();
            return;
        }

        // Check interaction proximity
        this.interactions.getNearbyObject(this.player);

        // Check spatial triggers
        this.triggers.update(this.player);

        // Check endings
        this.checkEndingTriggers();

        // Proximity audio (Heartbeat)
        const dist = Math.hypot(this.monster.x - this.player.x, this.monster.y - this.player.y);
        const prox = Math.max(0, 1 - dist / 500);
        if (Math.random() < 0.05 + prox * 0.15) {
            this.audio.playHeartbeat(prox);
        }

        // Camera follow player smoothly
        const targetCamX = this.player.x - this.width / 2;
        const targetCamY = this.player.y - this.height / 2;
        this.camera.x += (Math.max(0, Math.min(MAP_WIDTH - this.width, targetCamX)) - this.camera.x) * 0.1;
        this.camera.y += (Math.max(0, Math.min(MAP_HEIGHT - this.height, targetCamY)) - this.camera.y) * 0.1;

        // UI Updates
        this.updateHUD();
    }

    checkEndingTriggers() {
        const p = this.player;
        const ps = this.interactions.puzzleState;

        // 1. Good Ending: Escape Pod / Main Exit after power restored and blast gate open
        if (p.x > 1800 && p.y > 450 && p.y < 650 && ps.powerRestored && ps.keypadUnlocked) {
            this.triggerEnding('good');
        }
        // 2. Secret Hacker Ending: Synthesized serum + Overridden terminal
        else if (ps.serumSynthesized && ps.securityGridOff && p.x > 1400 && p.y < 300) {
            this.triggerEnding('hacker');
        }
        // 3. True Lore Ending: Found all 4 classified logs + Reached Isolation Core
        else if (p.loreLogsFound >= 4 && p.x > 900 && p.x < 1100 && p.y > 400 && p.y < 600) {
            this.triggerEnding('lore');
        }
    }

    triggerJumpscare() {
        this.gameState = 'JUMPSCARE';
        this.audio.stopAmbientDrone();
        this.audio.playJumpscareStinger();

        const jumpscare = document.getElementById('jumpscareOverlay');
        if (jumpscare) jumpscare.classList.remove('d-none');

        setTimeout(() => {
            if (jumpscare) jumpscare.classList.add('d-none');
            this.triggerEnding('doom');
        }, 1800);
    }

    triggerEnding(type) {
        this.gameState = 'ENDING';
        this.audio.stopAmbientDrone();

        const overlay = document.getElementById('endingOverlay');
        const icon = document.getElementById('endingIcon');
        const title = document.getElementById('endingTitle');
        const badge = document.getElementById('endingBadge');
        const desc = document.getElementById('endingStoryDesc');
        const timeStat = document.getElementById('statTime');
        const coinsStat = document.getElementById('statCoins');
        const xpStat = document.getElementById('statXP');

        let coins = 50;
        let xp = 100;

        const minutes = Math.floor(this.elapsedTime / 60).toString().padStart(2, '0');
        const seconds = (this.elapsedTime % 60).toString().padStart(2, '0');
        if (timeStat) timeStat.textContent = `${minutes}:${seconds}`;

        if (type === 'good') {
            if (icon) icon.textContent = '🏆';
            if (title) { title.textContent = 'GOOD ENDING: THE SURVIVOR'; title.className = 'fw-black mb-1 text-success'; }
            if (badge) { badge.textContent = 'ENDING 1 / 4'; badge.className = 'badge bg-success px-3 py-1 mb-3'; }
            if (desc) desc.textContent = 'You activated the power grid, unlocked the blast gates, and escaped into the misty wilderness as Biolab 07 locked down forever.';
            coins = 300;
            xp = 600;
            this.achievements.unlock('first_escape');
        } else if (type === 'hacker') {
            if (icon) icon.textContent = '💻';
            if (title) { title.textContent = 'SECRET ENDING: SYSTEM OVERRIDE'; title.className = 'fw-black mb-1 text-warning'; }
            if (badge) { badge.textContent = 'ENDING 2 / 4'; badge.className = 'badge bg-warning text-dark px-3 py-1 mb-3'; }
            if (desc) desc.textContent = 'You synthesized the anti-mutagen serum and purged the facility mainframes, eradicating Subject Zero before it could infect the world.';
            coins = 500;
            xp = 1000;
            this.achievements.unlock('hacker_escape');
        } else if (type === 'lore') {
            if (icon) icon.textContent = '🧬';
            if (title) { title.textContent = 'TRUE ENDING: THE CONSPIRACY'; title.className = 'fw-black mb-1 text-info'; }
            if (badge) { badge.textContent = 'ENDING 3 / 4'; badge.className = 'badge bg-info text-dark px-3 py-1 mb-3'; }
            if (desc) desc.textContent = 'You gathered all classified files and discovered the horrific truth: Subject Zero was created from the facility director themselves.';
            coins = 600;
            xp = 1200;
            this.achievements.unlock('lore_master');
        } else { // Doom
            if (icon) icon.textContent = '💀';
            if (title) { title.textContent = 'DOOM ENDING: CONSUMED'; title.className = 'fw-black mb-1 text-danger'; }
            if (badge) { badge.textContent = 'ENDING 4 / 4'; badge.className = 'badge bg-danger px-3 py-1 mb-3'; }
            if (desc) desc.textContent = 'Subject Zero dragged you into the dark bio-vents. Your survival journey has come to a brutal end.';
            coins = 20;
            xp = 50;
        }

        if (coinsStat) coinsStat.textContent = `+${coins}`;
        if (xpStat) xpStat.textContent = `+${xp}`;

        // Reward player profile
        try {
            if (playerProfile) {
                playerProfile.addCoins(coins);
                playerProfile.addXP(xp);
            }
        } catch(e) {}

        if (overlay) overlay.classList.remove('d-none');
    }

    render() {
        if (!this.ctx) return;

        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);

        // 1. Draw Facility Rooms & Floors
        this.renderRooms();

        // 2. Draw Walls & Doors
        this.renderWalls();

        // 3. Draw Interactive Objects
        this.renderInteractives();

        // 4. Draw Player
        if (!this.player.isHiding) {
            this.player.render(this.ctx);
        }

        // 5. Draw Monster
        this.monster.render(this.ctx);

        // 6. Draw 2D Lighting / Darkness Mask
        this.ctx.restore();
        this.lighting.render(this.ctx, this.canvas, this.player, this.camera);

        // 7. Debug Overlay (F3)
        if (this.debug.visible) {
            this.debug.render(this.ctx, this.player, this.monster, this.camera);
        }
    }

    renderRooms() {
        for (const room of ROOMS) {
            this.ctx.fillStyle = room.color;
            this.ctx.fillRect(room.x, room.y, room.w, room.h);

            // Floor grid pattern
            this.ctx.strokeStyle = 'rgba(255,255,255,0.03)';
            this.ctx.lineWidth = 1;
            for (let rx = room.x; rx < room.x + room.w; rx += 40) {
                this.ctx.beginPath();
                this.ctx.moveTo(rx, room.y);
                this.ctx.lineTo(rx, room.y + room.h);
                this.ctx.stroke();
            }
            for (let ry = room.y; ry < room.y + room.h; ry += 40) {
                this.ctx.beginPath();
                this.ctx.moveTo(room.x, ry);
                this.ctx.lineTo(room.x + room.w, ry);
                this.ctx.stroke();
            }

            // Room Title Label on Floor
            this.ctx.fillStyle = 'rgba(255,255,255,0.12)';
            this.ctx.font = 'bold 16px "Rajdhani", sans-serif';
            this.ctx.fillText(room.name, room.x + 20, room.y + 30);
        }
    }

    renderWalls() {
        for (const w of WALLS) {
            if (w.type === 'blast_gate' && this.interactions.puzzleState.powerRestored) {
                this.ctx.fillStyle = 'rgba(46, 204, 113, 0.4)'; // Open gate glow
                this.ctx.fillRect(w.x, w.y, w.w, w.h);
                continue;
            }

            this.ctx.fillStyle = w.type === 'door' ? '#d35400' : (w.type === 'blast_gate' ? '#c0392b' : '#2c3e50');
            this.ctx.fillRect(w.x, w.y, w.w, w.h);

            // Wall highlight border
            this.ctx.strokeStyle = '#34495e';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(w.x, w.y, w.w, w.h);
        }
    }

    renderInteractives() {
        for (const item of this.interactions.items) {
            if (item.collected) continue;

            if (item.type === 'item') {
                this.ctx.fillStyle = '#f39c12';
                this.ctx.beginPath();
                this.ctx.arc(item.x + 15, item.y + 15, 12, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.fillStyle = '#000';
                this.ctx.font = '12px sans-serif';
                this.ctx.fillText(item.icon || '📦', item.x + 8, item.y + 20);
            } else if (item.type === 'battery') {
                this.ctx.fillStyle = '#00d2d3';
                this.ctx.fillRect(item.x, item.y, 20, 12);
            } else if (item.type === 'note') {
                this.ctx.fillStyle = '#ecf0f1';
                this.ctx.fillRect(item.x, item.y, 16, 20);
            } else if (item.type === 'locker') {
                this.ctx.fillStyle = '#7f8c8d';
                this.ctx.fillRect(item.x, item.y, item.w, item.h);
            } else if (item.type === 'fuse_box') {
                this.ctx.fillStyle = this.interactions.puzzleState.fusesInserted === 3 ? '#2ecc71' : '#e74c3c';
                this.ctx.fillRect(item.x, item.y, item.w, item.h);
            } else if (item.type === 'keypad') {
                this.ctx.fillStyle = this.interactions.puzzleState.keypadUnlocked ? '#2ecc71' : '#f39c12';
                this.ctx.fillRect(item.x, item.y, item.w, item.h);
            }
        }
    }

    updateHUD() {
        // Objective text
        const objText = document.getElementById('hudObjectiveText');
        if (objText) objText.textContent = this.objectives.getCurrentText(this.interactions.puzzleState);

        // Threat status
        const threatText = document.getElementById('hudThreatStatus');
        if (threatText) {
            if (this.monster.state === 'CHASE') {
                threatText.textContent = '🔴 PURSUIT (Monster Spotted You!)';
                threatText.className = 'fw-bold fs-6 text-danger animate-pulse';
            } else if (this.monster.state === 'INVESTIGATE') {
                threatText.textContent = '🟡 SEARCHING (Noise Heard Nearby)';
                threatText.className = 'fw-bold fs-6 text-warning';
            } else {
                threatText.textContent = '⚪ CALM (Undetected)';
                threatText.className = 'fw-bold fs-6 text-success';
            }
        }

        // Vitals
        const healthBar = document.getElementById('healthBar');
        const healthVal = document.getElementById('healthValText');
        if (healthBar) healthBar.style.width = `${this.player.health}%`;
        if (healthVal) healthVal.textContent = `${Math.round(this.player.health)}%`;

        const stamBar = document.getElementById('staminaBar');
        const stamVal = document.getElementById('staminaValText');
        if (stamBar) stamBar.style.width = `${this.player.stamina}%`;
        if (stamVal) stamVal.textContent = `${Math.round(this.player.stamina)}%`;

        const batVal = document.getElementById('batteryValText');
        if (batVal) batVal.textContent = `${Math.round(this.player.battery)}%`;

        // Noise Meter
        const noiseBars = document.querySelectorAll('.noise-bar');
        const noiseLevel = this.player.isSprinting ? 4 : (this.player.isCrouching ? 0 : (this.player.noiseRadius > 0 ? 2 : 0));
        noiseBars.forEach((bar, idx) => {
            if (idx < noiseLevel) {
                bar.classList.add('active');
            } else {
                bar.classList.remove('active');
            }
        });

        // Interaction prompt
        const promptEl = document.getElementById('interactionPrompt');
        const actionText = document.getElementById('promptActionText');
        if (this.interactions.activeObject) {
            if (promptEl) promptEl.classList.remove('d-none');
            if (actionText) actionText.textContent = this.interactions.activeObject.label || 'Interact';
        } else {
            if (promptEl) promptEl.classList.add('d-none');
        }
    }

    updateInventoryUI() {
        const slots = document.querySelectorAll('.inv-slot');
        slots.forEach((slot, idx) => {
            const item = this.player.inventory[idx];
            const iconEl = slot.querySelector('.item-icon');
            if (item && iconEl) {
                iconEl.textContent = item.icon || '📦';
                slot.title = `${item.name}: ${item.desc || ''}`;
                slot.classList.add('has-item');
            } else if (iconEl) {
                iconEl.textContent = '';
                slot.title = 'Empty Slot';
                slot.classList.remove('has-item');
            }
        });
    }

    showToast(title, desc) {
        const toast = document.getElementById('loreToast');
        const tTitle = document.getElementById('loreToastTitle');
        const tDesc = document.getElementById('loreToastDesc');
        if (!toast) return;

        if (tTitle) tTitle.textContent = title;
        if (tDesc) tDesc.textContent = desc;

        toast.classList.remove('d-none');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => {
            toast.classList.add('d-none');
        }, 4000);
    }
}
