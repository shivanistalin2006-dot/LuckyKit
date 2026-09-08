import { BaseGame } from './core/BaseGame.js?v=2.5';
import { gameManager } from './core/gameManager.js';
import { audioManager } from './audio/audioManager.js';
import { storage } from './core/storage.js';
import { playerProfile } from './core/playerProfile.js';

// ========================================================
// PROCEDURAL SURVIVAL HORROR AUDIO SYNTHESIZER
// ========================================================
class HorrorAudio {
    constructor() {
        this.ctx = null;
        this.heartbeatTimer = null;
        this.droneOsc = null;
        this.droneGain = null;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
    }

    isMuted() {
        try {
            return audioManager?.isMuted || localStorage.getItem('luckykit_muted') === 'true';
        } catch(e) {
            return false;
        }
    }

    startAmbientDrone() {
        if (this.isMuted()) return;
        this.init();
        if (!this.ctx || this.droneOsc) return;

        try {
            this.droneOsc = this.ctx.createOscillator();
            this.droneGain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            this.droneOsc.type = 'sawtooth';
            this.droneOsc.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 sub-bass

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(120, this.ctx.currentTime);

            this.droneGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

            this.droneOsc.connect(filter);
            filter.connect(this.droneGain);
            this.droneGain.connect(this.ctx.destination);

            this.droneOsc.start();
        } catch(e) {}
    }

    stopAmbientDrone() {
        if (this.droneOsc) {
            try {
                this.droneOsc.stop();
                this.droneOsc.disconnect();
            } catch(e) {}
            this.droneOsc = null;
        }
    }

    playFootstep(surface = 'tile', isSneak = false) {
        if (this.isMuted()) return;
        this.init();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(surface === 'metal' ? 180 : 80, now);
            osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);

            const vol = isSneak ? 0.015 : 0.05;
            gain.gain.setValueAtTime(vol, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.08);
        } catch(e) {}
    }

    playHeartbeat(proximityFactor) {
        if (this.isMuted() || proximityFactor <= 0.05) return;
        this.init();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(55, now);
            osc.frequency.exponentialRampToValueAtTime(35, now + 0.12);

            const vol = Math.min(0.25, 0.04 + proximityFactor * 0.2);
            gain.gain.setValueAtTime(vol, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.12);
        } catch(e) {}
    }

    playMonsterRoar() {
        if (this.isMuted()) return;
        this.init();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc1.type = 'sawtooth';
            osc2.type = 'square';
            osc1.frequency.setValueAtTime(140, now);
            osc1.frequency.linearRampToValueAtTime(60, now + 0.7);
            osc2.frequency.setValueAtTime(145, now);
            osc2.frequency.linearRampToValueAtTime(55, now + 0.7);

            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(400, now);
            filter.Q.setValueAtTime(3, now);

            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

            osc1.connect(filter);
            osc2.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + 0.7);
            osc2.stop(now + 0.7);
        } catch(e) {}
    }

    playJumpscareStinger() {
        if (this.isMuted()) return;
        this.init();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            [220, 311.13, 440, 622.25, 880].forEach(freq => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq, now);
                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 1.2);
            });
        } catch(e) {}
    }

    playItemPickup() {
        if (this.isMuted()) return;
        this.init();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.15);
        } catch(e) {}
    }

    playDoorCreak() {
        if (this.isMuted()) return;
        this.init();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(240, now);
            osc.frequency.linearRampToValueAtTime(320, now + 0.25);
            gain.gain.setValueAtTime(0.04, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.25);
        } catch(e) {}
    }

    playKeypadBeep() {
        if (this.isMuted()) return;
        this.init();
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, now);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.05);
        } catch(e) {}
    }
}

// ========================================================
// MAP LAYOUT & INTERACTIVE OBJECTS (BIOLAB 07)
// ========================================================
const MAP_WIDTH = 1920;
const MAP_HEIGHT = 1080;

const WALLS = [
    { x: 40, y: 40, w: 1840, h: 20 },
    { x: 40, y: 1020, w: 1840, h: 20 },
    { x: 40, y: 40, w: 20, h: 1000 },
    { x: 1860, y: 40, w: 20, h: 1000 },
    { x: 40, y: 640, w: 500, h: 20 },
    { x: 520, y: 640, w: 20, h: 380 },
    { x: 40, y: 360, w: 500, h: 20 },
    { x: 520, y: 40, w: 20, h: 320 },
    { x: 680, y: 40, w: 20, h: 380 },
    { x: 680, y: 400, w: 540, h: 20 },
    { x: 1200, y: 40, w: 20, h: 380 },
    { x: 680, y: 640, w: 540, h: 20 },
    { x: 680, y: 640, w: 20, h: 380 },
    { x: 1200, y: 640, w: 20, h: 380 },
    { x: 1360, y: 40, w: 20, h: 460 },
    { x: 1360, y: 480, w: 520, h: 20 },
    { x: 1360, y: 620, w: 520, h: 20 },
    { x: 1360, y: 620, w: 20, h: 420 },
    { x: 180, y: 140, w: 80, h: 140, type: 'bed', name: 'Hospital Bed #1' },
    { x: 320, y: 140, w: 80, h: 140, type: 'bed', name: 'Hospital Bed #2' },
    { x: 800, y: 120, w: 140, h: 80, type: 'generator', name: 'Primary Power Generator' },
    { x: 800, y: 800, w: 160, h: 80, type: 'lab_bench', name: 'Centrifuge & Synthesis Bench' },
    { x: 1540, y: 140, w: 120, h: 80, type: 'terminal', name: 'Mainframe Console' },
    { x: 1560, y: 840, w: 200, h: 40, type: 'blast_gate', name: 'Sub-Level Blast Gate' }
];

const INTERACTIVES = [
    { id: 'locker_rec', x: 120, y: 720, w: 50, h: 50, type: 'locker', label: 'Security Locker [Hide]' },
    { id: 'bed_ward1', x: 220, y: 210, w: 60, h: 60, type: 'bed', label: 'Under Hospital Bed [Hide]' },
    { id: 'locker_gen', x: 1120, y: 120, w: 50, h: 50, type: 'locker', label: 'Supply Locker [Hide]' },
    { id: 'locker_lab', x: 1120, y: 920, w: 50, h: 50, type: 'locker', label: 'Chemical Cabinet [Hide]' },
    { id: 'fuse_red', x: 180, y: 850, w: 30, h: 30, type: 'item', item: 'fuse_red', name: 'Alpha Red Fuse', icon: '🔴', collected: false },
    { id: 'fuse_blue', x: 440, y: 120, w: 30, h: 30, type: 'item', item: 'fuse_blue', name: 'Beta Blue Fuse', icon: '🔵', collected: false },
    { id: 'fuse_yellow', x: 920, y: 920, w: 30, h: 30, type: 'item', item: 'fuse_yellow', name: 'Gamma Yellow Fuse', icon: '🟡', collected: false },
    { id: 'wrench', x: 1040, y: 220, w: 30, h: 30, type: 'item', item: 'wrench', name: 'Pipe Wrench', icon: '🔧', collected: false },
    { id: 'keycard', x: 1720, y: 200, w: 30, h: 30, type: 'item', item: 'keycard', name: 'Master Blast Keycard', icon: '💳', collected: false },
    { id: 'battery_1', x: 380, y: 880, w: 30, h: 30, type: 'battery', name: 'Flashlight Battery', collected: false },
    { id: 'battery_2', x: 740, y: 140, w: 30, h: 30, type: 'battery', name: 'Flashlight Battery', collected: false },
    { id: 'reagent_x', x: 1140, y: 740, w: 30, h: 30, type: 'item', item: 'reagent_x', name: 'Reagent X', icon: '🧪', collected: false },
    { id: 'stabilizer', x: 740, y: 920, w: 30, h: 30, type: 'item', item: 'stabilizer', name: 'Stabilizer Vial', icon: '🧪', collected: false },
    { id: 'generator_box', x: 870, y: 120, w: 80, h: 60, type: 'fuse_box', label: 'Insert 3 Power Fuses (0/3)' },
    { id: 'keypad_station', x: 1360, y: 260, w: 30, h: 60, type: 'keypad', label: 'Enter 4-Digit Security Code' },
    { id: 'steam_valve', x: 1480, y: 720, w: 50, h: 50, type: 'valve', label: 'Use Wrench on Steam Valve' },
    { id: 'mainframe_terminal', x: 1600, y: 140, w: 60, h: 60, type: 'terminal', label: 'Hack Mainframe Terminal [Purge]' },
    { id: 'centrifuge_station', x: 880, y: 800, w: 60, h: 60, type: 'centrifuge', label: 'Synthesize Bio-Antidote' },
    { id: 'blast_door_exit', x: 1660, y: 900, w: 100, h: 60, type: 'exit_gate', label: 'Escape Via Main Blast Gate' },
    { id: 'note_1', x: 260, y: 720, w: 30, h: 30, type: 'note', title: 'LOG 01: OUTBREAK', text: 'Subject Zero breached cryogenic pod at 23:14. It is hyper-sensitive to sprint noise and water footsteps. Keypad is set to 4829.' },
    { id: 'note_2', x: 120, y: 120, w: 30, h: 30, type: 'note', title: 'LOG 02: THE WEAPON', text: 'Dr. Vance created Subject Zero using mutant DNA. It will stop if exposed to the pure centrifuge Antidote compound.' },
    { id: 'note_3', x: 980, y: 140, w: 30, h: 30, type: 'note', title: 'LOG 03: POWER GRID', text: 'Main gate requires 3 colored fuses (Alpha, Beta, Gamma) and Master Keycard to trigger decompression.' },
    { id: 'note_4', x: 1720, y: 380, w: 30, h: 30, type: 'note', title: 'LOG 04: TERMINAL BYPASS', text: 'Mainframe can trigger emergency exhaust ventilation purging all lockdown protocols.' }
];

const PATROL_NODES = [
    { x: 300, y: 800 },
    { x: 600, y: 520 },
    { x: 300, y: 220 },
    { x: 600, y: 220 },
    { x: 950, y: 220 },
    { x: 950, y: 520 },
    { x: 950, y: 800 },
    { x: 1300, y: 520 },
    { x: 1600, y: 300 },
    { x: 1600, y: 750 }
];

// ========================================================
// MAIN GAME ENGINE CLASS
// ========================================================
export class EscapeFromMonster extends BaseGame {
    constructor() {
        super("escape");

        this.canvas = document.getElementById('escapeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.audio = new HorrorAudio();

        this.hudObjective = document.getElementById('hudObjectiveText');
        this.hudThreat = document.getElementById('hudThreatStatus');
        this.healthBar = document.getElementById('healthBar');
        this.healthValText = document.getElementById('healthValText');
        this.staminaBar = document.getElementById('staminaBar');
        this.staminaValText = document.getElementById('staminaValText');
        this.batteryValText = document.getElementById('batteryValText');
        this.noiseMeter = document.getElementById('noiseMeter');
        this.interactionPrompt = document.getElementById('interactionPrompt');
        this.promptActionText = document.getElementById('promptActionText');
        this.loreToast = document.getElementById('loreToast');
        this.loreToastTitle = document.getElementById('loreToastTitle');
        this.loreToastDesc = document.getElementById('loreToastDesc');
        this.inventorySlots = document.querySelectorAll('.inv-slot');
        this.difficultySelect = document.getElementById('difficultySelect');
        this.storyOverlay = document.getElementById('storyIntroOverlay');
        this.endingOverlay = document.getElementById('endingOverlay');
        this.jumpscareOverlay = document.getElementById('jumpscareOverlay');
        this.keypadModal = document.getElementById('keypadModal');
        this.keypadDisplay = document.getElementById('keypadDisplay');

        this.initControls();
        this.resetGame();

        gameManager.registerGame(this);
    }

    resetGame() {
        this.difficulty = this.difficultySelect ? this.difficultySelect.value : 'normal';
        this.speedMult = this.difficulty === 'casual' ? 0.8 : (this.difficulty === 'nightmare' ? 1.25 : 1.0);

        this.player = {
            x: 200,
            y: 800,
            radius: 18,
            angle: 0,
            speed: 2.8,
            health: 100,
            stamina: 100,
            battery: 100,
            flashlightOn: true,
            isSprinting: false,
            isCrouching: false,
            isHiding: false,
            hiddenSpotId: null,
            noiseRadius: 0,
            inventory: [],
            loreLogsFound: 0
        };

        this.monster = {
            x: 1600,
            y: 300,
            radius: 24,
            angle: Math.PI,
            speed: 2.2 * this.speedMult,
            chaseSpeed: 4.6 * this.speedMult,
            state: 'PATROL',
            targetX: 1600,
            targetY: 300,
            currentNodeIdx: 8,
            searchTimer: 0,
            alertLevel: 0,
            visionAngle: Math.PI * 0.45,
            visionRange: this.difficulty === 'nightmare' ? 420 : 320,
            hearingRange: this.difficulty === 'casual' ? 240 : (this.difficulty === 'nightmare' ? 520 : 360),
            growlCooldown: 0
        };

        this.puzzleState = {
            fusesInserted: 0,
            powerRestored: false,
            keypadUnlocked: false,
            steamCleared: false,
            antidoteSynthesized: false,
            mainframeHacked: false,
            keypadInput: ''
        };

        INTERACTIVES.forEach(i => {
            if (i.collected !== undefined) i.collected = false;
        });

        this.startTime = Date.now();
        this.lightningTimer = 0;
        this.isLightning = false;
        this.camera = { x: 0, y: 0 };
        this.activeNearbyInteractable = null;

        this.updateObjectiveUI();
        this.updateInventoryUI();
    }

    initControls() {
        this.keys = {};

        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;

            if (e.code === 'KeyF') {
                this.player.flashlightOn = !this.player.flashlightOn;
                this.audio.playFootstep('metal', true);
            }
            if (e.code === 'KeyE') {
                this.handleInteraction();
            }
            if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const mouseCanvasX = (e.clientX - rect.left) * scaleX;
            const mouseCanvasY = (e.clientY - rect.top) * scaleY;

            const playerScreenX = this.player.x - this.camera.x;
            const playerScreenY = this.player.y - this.camera.y;

            this.player.angle = Math.atan2(mouseCanvasY - playerScreenY, mouseCanvasX - playerScreenX);
        });

        const joyZone = document.getElementById('virtualJoystickZone');
        const knob = document.getElementById('joystickKnob');
        if (joyZone && knob) {
            let dragging = false;

            const handleTouch = (e) => {
                const touch = e.touches[0];
                const rect = joyZone.getBoundingClientRect();
                const dx = touch.clientX - (rect.left + rect.width / 2);
                const dy = touch.clientY - (rect.top + rect.height / 2);
                const dist = Math.min(40, Math.hypot(dx, dy));
                const angle = Math.atan2(dy, dx);

                knob.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`;
                this.player.angle = angle;
                this.mobileMoveVector = { x: Math.cos(angle) * (dist / 40), y: Math.sin(angle) * (dist / 40) };
            };

            joyZone.addEventListener('touchstart', (e) => { dragging = true; handleTouch(e); }, { passive: true });
            joyZone.addEventListener('touchmove', (e) => { if (dragging) handleTouch(e); }, { passive: true });
            joyZone.addEventListener('touchend', () => {
                dragging = false;
                knob.style.transform = 'translate(0px, 0px)';
                this.mobileMoveVector = { x: 0, y: 0 };
            });
        }

        document.getElementById('mobileFlashlightBtn')?.addEventListener('click', () => {
            this.player.flashlightOn = !this.player.flashlightOn;
        });
        document.getElementById('mobileCrouchBtn')?.addEventListener('click', () => {
            this.player.isCrouching = !this.player.isCrouching;
        });
        document.getElementById('mobileActionBtn')?.addEventListener('click', () => {
            this.handleInteraction();
        });

        document.getElementById('startGameBtn')?.addEventListener('click', () => {
            if (this.storyOverlay) this.storyOverlay.classList.add('d-none');
            this.audio.startAmbientDrone();
            this.start();
        });

        document.getElementById('endingRestartBtn')?.addEventListener('click', () => {
            if (this.endingOverlay) this.endingOverlay.classList.add('d-none');
            this.resetGame();
            this.audio.startAmbientDrone();
            this.start();
        });

        document.querySelectorAll('.key-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const val = btn.getAttribute('data-val');
                this.handleKeypadInput(val);
            });
        });

        document.getElementById('closeKeypadBtn')?.addEventListener('click', () => {
            if (this.keypadModal) this.keypadModal.classList.add('d-none');
        });
    }

    start() {
        super.start();
        this.isRunning = true;
        this.gameLoop();
    }

    gameLoop() {
        if (!this.isRunning) return;

        this.update();
        this.render();

        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        this.updatePlayer();
        this.updateMonsterAI();
        this.updateInteractions();
        this.updateLightingEffects();
        this.updateHUD();
    }

    updatePlayer() {
        if (this.player.isHiding) {
            this.player.noiseRadius = 0;
            return;
        }

        let moveX = 0;
        let moveY = 0;

        if (this.keys['KeyW'] || this.keys['ArrowUp']) moveY -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) moveY += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveX -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) moveX += 1;

        if (this.mobileMoveVector && (this.mobileMoveVector.x !== 0 || this.mobileMoveVector.y !== 0)) {
            moveX = this.mobileMoveVector.x;
            moveY = this.mobileMoveVector.y;
        }

        const isMoving = moveX !== 0 || moveY !== 0;

        this.player.isSprinting = (this.keys['ShiftLeft'] || this.keys['ShiftRight']) && isMoving && this.player.stamina > 5;
        this.player.isCrouching = this.keys['KeyC'] || this.keys['ControlLeft'];

        if (this.player.isSprinting) {
            this.player.speed = 5.2;
            this.player.stamina = Math.max(0, this.player.stamina - 0.4);
            this.player.noiseRadius = 380;
        } else if (this.player.isCrouching) {
            this.player.speed = 1.6;
            this.player.stamina = Math.min(100, this.player.stamina + 0.3);
            this.player.noiseRadius = 0;
        } else {
            this.player.speed = 2.8;
            this.player.stamina = Math.min(100, this.player.stamina + 0.2);
            this.player.noiseRadius = isMoving ? 140 : 0;
        }

        if (isMoving) {
            const length = Math.hypot(moveX, moveY);
            const normX = (moveX / length) * this.player.speed;
            const normY = (moveY / length) * this.player.speed;

            const nextX = this.player.x + normX;
            const nextY = this.player.y + normY;

            if (!this.checkWallCollision(nextX, this.player.y, this.player.radius)) {
                this.player.x = nextX;
            }
            if (!this.checkWallCollision(this.player.x, nextY, this.player.radius)) {
                this.player.y = nextY;
            }

            if (Math.random() < (this.player.isSprinting ? 0.08 : 0.03)) {
                this.audio.playFootstep('tile', this.player.isCrouching);
            }
        }

        if (this.player.flashlightOn && this.player.battery > 0) {
            this.player.battery = Math.max(0, this.player.battery - (this.difficulty === 'casual' ? 0.005 : 0.02));
        }

        this.camera.x = this.player.x - this.canvas.width / 2;
        this.camera.y = this.player.y - this.canvas.height / 2;
        this.camera.x = Math.max(0, Math.min(MAP_WIDTH - this.canvas.width, this.camera.x));
        this.camera.y = Math.max(0, Math.min(MAP_HEIGHT - this.canvas.height, this.camera.y));
    }

    updateMonsterAI() {
        const distToPlayer = Math.hypot(this.player.x - this.monster.x, this.player.y - this.monster.y);
        const hasLineOfSight = !this.player.isHiding && !this.checkRayWallOcclusion(this.monster.x, this.monster.y, this.player.x, this.player.y);

        const angleToPlayer = Math.atan2(this.player.y - this.monster.y, this.player.x - this.monster.x);
        let angleDiff = Math.abs(this.monster.angle - angleToPlayer);
        if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;

        const inVisionCone = angleDiff < this.monster.visionAngle / 2 && distToPlayer < this.monster.visionRange;

        const proximityFactor = Math.max(0, 1 - (distToPlayer / 600));
        if (Math.random() < 0.05 + proximityFactor * 0.2) {
            this.audio.playHeartbeat(proximityFactor);
        }

        if (this.player.noiseRadius > 0 && distToPlayer < this.player.noiseRadius && this.monster.state !== 'CHASE') {
            this.monster.state = 'ALERT';
            this.monster.targetX = this.player.x + (Math.random() * 40 - 20);
            this.monster.targetY = this.player.y + (Math.random() * 40 - 20);
        }

        if (inVisionCone && hasLineOfSight) {
            if (this.monster.state !== 'CHASE') {
                this.audio.playMonsterRoar();
            }
            this.monster.state = 'CHASE';
            this.monster.targetX = this.player.x;
            this.monster.targetY = this.player.y;
            this.monster.searchTimer = 240;
        }

        if (this.monster.state === 'CHASE') {
            if (hasLineOfSight) {
                this.monster.targetX = this.player.x;
                this.monster.targetY = this.player.y;
                this.monster.searchTimer = 240;
            } else {
                this.monster.searchTimer--;
                if (this.monster.searchTimer <= 0) {
                    this.monster.state = 'SEARCH';
                    this.monster.searchTimer = 180;
                }
            }

            this.moveMonsterTowards(this.monster.targetX, this.monster.targetY, this.monster.chaseSpeed);

            if (distToPlayer < this.monster.radius + this.player.radius && !this.player.isHiding) {
                this.triggerGameOverCatch();
                return;
            }
        } else if (this.monster.state === 'ALERT') {
            this.moveMonsterTowards(this.monster.targetX, this.monster.targetY, this.monster.speed * 1.2);
            if (Math.hypot(this.monster.x - this.monster.targetX, this.monster.y - this.monster.targetY) < 30) {
                this.monster.state = 'SEARCH';
                this.monster.searchTimer = 180;
            }
        } else if (this.monster.state === 'SEARCH') {
            this.monster.searchTimer--;
            this.monster.angle += 0.03;
            if (this.monster.searchTimer <= 0) {
                this.monster.state = 'PATROL';
            }
        } else {
            const targetNode = PATROL_NODES[this.monster.currentNodeIdx];
            this.moveMonsterTowards(targetNode.x, targetNode.y, this.monster.speed);

            if (Math.hypot(this.monster.x - targetNode.x, this.monster.y - targetNode.y) < 40) {
                this.monster.currentNodeIdx = (this.monster.currentNodeIdx + 1) % PATROL_NODES.length;
            }
        }
    }

    moveMonsterTowards(tx, ty, speed) {
        const dx = tx - this.monster.x;
        const dy = ty - this.monster.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 5) {
            const targetAngle = Math.atan2(dy, dx);
            this.monster.angle = targetAngle;

            const nextX = this.monster.x + Math.cos(targetAngle) * speed;
            const nextY = this.monster.y + Math.sin(targetAngle) * speed;

            if (!this.checkWallCollision(nextX, this.monster.y, this.monster.radius)) {
                this.monster.x = nextX;
            }
            if (!this.checkWallCollision(this.monster.x, nextY, this.monster.radius)) {
                this.monster.y = nextY;
            }
        }
    }

    checkWallCollision(x, y, r) {
        for (const w of WALLS) {
            if (x + r > w.x && x - r < w.x + w.w && y + r > w.y && y - r < w.y + w.h) {
                if (w.type === 'blast_gate' && this.puzzleState.powerRestored) continue;
                return true;
            }
        }
        return false;
    }

    checkRayWallOcclusion(x1, y1, x2, y2) {
        const steps = 15;
        for (let i = 1; i < steps; i++) {
            const rx = x1 + (x2 - x1) * (i / steps);
            const ry = y1 + (y2 - y1) * (i / steps);
            if (this.checkWallCollision(rx, ry, 4)) return true;
        }
        return false;
    }

    updateInteractions() {
        this.activeNearbyInteractable = null;

        for (const item of INTERACTIVES) {
            if (item.collected) continue;
            const dist = Math.hypot(this.player.x - (item.x + item.w / 2), this.player.y - (item.y + item.h / 2));
            if (dist < 60) {
                this.activeNearbyInteractable = item;
                break;
            }
        }

        if (this.activeNearbyInteractable && this.interactionPrompt && this.promptActionText) {
            this.interactionPrompt.classList.remove('d-none');
            this.promptActionText.textContent = this.activeNearbyInteractable.label || `Pick up ${this.activeNearbyInteractable.name}`;
        } else if (this.interactionPrompt) {
            this.interactionPrompt.classList.add('d-none');
        }
    }

    handleInteraction() {
        if (this.player.isHiding) {
            this.player.isHiding = false;
            this.player.hiddenSpotId = null;
            this.audio.playDoorCreak();
            return;
        }

        if (!this.activeNearbyInteractable) return;
        const obj = this.activeNearbyInteractable;

        if (obj.type === 'locker' || obj.type === 'bed') {
            this.player.isHiding = true;
            this.player.hiddenSpotId = obj.id;
            this.player.x = obj.x + obj.w / 2;
            this.player.y = obj.y + obj.h / 2;
            this.audio.playDoorCreak();
            return;
        }

        if (obj.type === 'item') {
            if (this.player.inventory.length >= 4) {
                alert('⚠️ Inventory full (Max 4 items)! Use or place items.');
                return;
            }
            obj.collected = true;
            this.player.inventory.push({ id: obj.item, name: obj.name, icon: obj.icon });
            this.audio.playItemPickup();
            this.updateInventoryUI();
            this.updateObjectiveUI();
            return;
        }

        if (obj.type === 'battery') {
            obj.collected = true;
            this.player.battery = Math.min(100, this.player.battery + 60);
            this.audio.playItemPickup();
            return;
        }

        if (obj.type === 'note') {
            this.player.loreLogsFound++;
            this.showLoreToast(obj.title, obj.text);
            this.audio.playItemPickup();
            return;
        }

        if (obj.type === 'fuse_box') {
            const red = this.player.inventory.findIndex(i => i.id === 'fuse_red');
            const blue = this.player.inventory.findIndex(i => i.id === 'fuse_blue');
            const yellow = this.player.inventory.findIndex(i => i.id === 'fuse_yellow');

            let added = false;
            if (red !== -1) { this.player.inventory.splice(red, 1); this.puzzleState.fusesInserted++; added = true; }
            if (blue !== -1) { this.player.inventory.splice(blue, 1); this.puzzleState.fusesInserted++; added = true; }
            if (yellow !== -1) { this.player.inventory.splice(yellow, 1); this.puzzleState.fusesInserted++; added = true; }

            if (added) {
                this.audio.playKeypadBeep();
                obj.label = `Insert 3 Power Fuses (${this.puzzleState.fusesInserted}/3)`;
                if (this.puzzleState.fusesInserted >= 3) {
                    this.puzzleState.powerRestored = true;
                    this.audio.playMonsterRoar();
                    alert('⚡ POWER FULLY RESTORED! Blast doors are now energized.');
                }
                this.updateInventoryUI();
                this.updateObjectiveUI();
            } else {
                alert(`⚠️ Fuse Box requires 3 colored fuses (Alpha 🔴, Beta 🔵, Gamma 🟡). Currently: ${this.puzzleState.fusesInserted}/3`);
            }
            return;
        }

        if (obj.type === 'keypad') {
            if (this.puzzleState.keypadUnlocked) {
                alert('🔓 Security Hub is already unlocked!');
            } else {
                this.puzzleState.keypadInput = '';
                if (this.keypadDisplay) this.keypadDisplay.textContent = '____';
                if (this.keypadModal) this.keypadModal.classList.remove('d-none');
            }
            return;
        }

        if (obj.type === 'valve') {
            const hasWrench = this.player.inventory.some(i => i.id === 'wrench');
            if (hasWrench) {
                this.puzzleState.steamCleared = true;
                this.audio.playDoorCreak();
                alert('💨 Steam valve turned! Corridor passage is cleared.');
            } else {
                alert('⚠️ Scalding steam blocks the corridor! Find a Pipe Wrench 🔧 to shut it off.');
            }
            return;
        }

        if (obj.type === 'terminal') {
            if (confirm('💻 Mainframe Override: Purge Facility Lockdown and unlock Emergency Exhaust Ventilation?')) {
                this.triggerEnding('secret');
            }
            return;
        }

        if (obj.type === 'centrifuge') {
            const hasReagent = this.player.inventory.some(i => i.id === 'reagent_x');
            const hasStabilizer = this.player.inventory.some(i => i.id === 'stabilizer');

            if (hasReagent && hasStabilizer) {
                this.puzzleState.antidoteSynthesized = true;
                this.audio.playItemPickup();
                alert('🧪 ANTIDOTE COMPOUND SYNTHESIZED! Bioweapon neutralization ready.');
                this.triggerEnding('true');
            } else {
                alert('⚠️ Centrifuge requires both Reagent X 🧪 and Stabilizer Vial 🧪 to synthesize the cure.');
            }
            return;
        }

        if (obj.type === 'exit_gate') {
            const hasKeycard = this.player.inventory.some(i => i.id === 'keycard');
            if (this.puzzleState.powerRestored && hasKeycard && this.puzzleState.steamCleared) {
                this.triggerEnding('good');
            } else {
                alert('⚠️ Blast Gate Locked! Requires: 1) Power Restored (3 Fuses) 2) Master Keycard 💳 3) Steam Valve Cleared.');
            }
            return;
        }
    }

    handleKeypadInput(val) {
        this.audio.playKeypadBeep();

        if (val === 'C') {
            this.puzzleState.keypadInput = '';
        } else if (val === 'E') {
            if (this.puzzleState.keypadInput === '4829') {
                this.puzzleState.keypadUnlocked = true;
                if (this.keypadDisplay) this.keypadDisplay.textContent = 'OPEN';
                this.audio.playDoorCreak();
                setTimeout(() => {
                    if (this.keypadModal) this.keypadModal.classList.add('d-none');
                    alert('🔓 Security Door Unlocked!');
                    this.updateObjectiveUI();
                }, 400);
            } else {
                if (this.keypadDisplay) this.keypadDisplay.textContent = 'ERR';
                setTimeout(() => {
                    this.puzzleState.keypadInput = '';
                    if (this.keypadDisplay) this.keypadDisplay.textContent = '____';
                }, 600);
            }
            return;
        } else if (this.puzzleState.keypadInput.length < 4) {
            this.puzzleState.keypadInput += val;
        }

        if (this.keypadDisplay) {
            this.keypadDisplay.textContent = this.puzzleState.keypadInput.padEnd(4, '_');
        }
    }

    updateLightingEffects() {
        this.lightningTimer++;
        if (this.lightningTimer > 400 && Math.random() < 0.02) {
            this.isLightning = true;
            this.lightningTimer = 0;
            setTimeout(() => { this.isLightning = false; }, 120);
        }
    }

    updateHUD() {
        if (this.healthBar) this.healthBar.style.width = `${this.player.health}%`;
        if (this.healthValText) this.healthValText.textContent = `${Math.round(this.player.health)}%`;

        if (this.staminaBar) this.staminaBar.style.width = `${this.player.stamina}%`;
        if (this.staminaValText) this.staminaValText.textContent = `${Math.round(this.player.stamina)}%`;

        if (this.batteryValText) this.batteryValText.textContent = `${Math.round(this.player.battery)}%`;

        const bars = this.noiseMeter?.querySelectorAll('.noise-bar');
        if (bars) {
            const activeCount = this.player.isSprinting ? 4 : (this.player.noiseRadius > 0 ? 2 : 0);
            bars.forEach((b, i) => {
                if (i < activeCount) b.classList.add('active');
                else b.classList.remove('active');
            });
        }

        if (this.hudThreat) {
            if (this.monster.state === 'CHASE') {
                this.hudThreat.textContent = '🔴 HUNTING! (RUN & HIDE)';
                this.hudThreat.className = 'fw-bold fs-6 text-danger';
            } else if (this.monster.state === 'ALERT') {
                this.hudThreat.textContent = '🟡 SUSPICIOUS (Heard Noise)';
                this.hudThreat.className = 'fw-bold fs-6 text-warning';
            } else {
                this.hudThreat.textContent = '🟢 CALM (Patrolling)';
                this.hudThreat.className = 'fw-bold fs-6 text-success';
            }
        }
    }

    updateObjectiveUI() {
        if (!this.hudObjective) return;
        if (!this.puzzleState.powerRestored) {
            this.hudObjective.textContent = `Restore Power Grid (${this.puzzleState.fusesInserted}/3 Fuses)`;
        } else if (!this.puzzleState.keypadUnlocked) {
            this.hudObjective.textContent = `Unlock Security Hub (Keypad Code in Log 01)`;
        } else if (!this.puzzleState.steamCleared) {
            this.hudObjective.textContent = `Clear Helipad Corridor Steam with Wrench 🔧`;
        } else {
            this.hudObjective.textContent = `Grab Master Keycard 💳 & Escape Via Blast Gate`;
        }
    }

    updateInventoryUI() {
        if (!this.inventorySlots) return;
        this.inventorySlots.forEach((slot, idx) => {
            const iconSpan = slot.querySelector('.item-icon');
            if (this.player.inventory[idx]) {
                iconSpan.textContent = this.player.inventory[idx].icon;
                slot.classList.add('active');
            } else {
                iconSpan.textContent = '';
                slot.classList.remove('active');
            }
        });
    }

    showLoreToast(title, desc) {
        if (!this.loreToast) return;
        this.loreToastTitle.textContent = title;
        this.loreToastDesc.textContent = `"${desc}"`;
        this.loreToast.classList.remove('d-none');
        setTimeout(() => {
            if (this.loreToast) this.loreToast.classList.add('d-none');
        }, 5000);
    }

    triggerGameOverCatch() {
        this.isRunning = false;
        this.audio.playJumpscareStinger();
        this.audio.stopAmbientDrone();

        if (this.jumpscareOverlay) {
            this.jumpscareOverlay.classList.remove('d-none');
            this.jumpscareOverlay.classList.add('d-flex');
        }

        setTimeout(() => {
            if (this.jumpscareOverlay) {
                this.jumpscareOverlay.classList.add('d-none');
                this.jumpscareOverlay.classList.remove('d-flex');
            }
            this.triggerEnding('caught');
        }, 1200);
    }

    triggerEnding(type) {
        this.isRunning = false;
        this.audio.stopAmbientDrone();

        const timeSurvived = Math.floor((Date.now() - this.startTime) / 1000);
        const mins = Math.floor(timeSurvived / 60).toString().padStart(2, '0');
        const secs = (timeSurvived % 60).toString().padStart(2, '0');

        let title = '';
        let desc = '';
        let icon = '';
        let badge = '';
        let coins = 100;
        let xp = 250;

        if (type === 'good') {
            title = '🟢 GOOD ENDING: THE SURVIVOR';
            desc = 'You energized the blast doors, evaded Subject Zero, and escaped into the stormy wilderness as the facility sealed forever.';
            icon = '🏆';
            badge = 'ENDING 1 / 4 (ESCAPE)';
            coins = 300;
            xp = 600;
        } else if (type === 'caught') {
            title = '🔴 DOOM ENDING: SPECIMEN CLAIMED';
            desc = 'Subject Zero caught you in the dark. Your biometric vital signals flatlined beneath the cold concrete corridors.';
            icon = '💀';
            badge = 'ENDING 2 / 4 (DEATH)';
            coins = 50;
            xp = 100;
        } else if (type === 'secret') {
            title = '🟡 SECRET ENDING: SYSTEM PURGE';
            desc = 'You bypassed the quarantine lock via the Mainframe, vented the containment gases, and escaped through the ventilation conduits undetected!';
            icon = '💻';
            badge = 'ENDING 3 / 4 (HACKER)';
            coins = 450;
            xp = 850;
        } else if (type === 'true') {
            title = '🟣 TRUE ENDING: THE CURE & TRUTH';
            desc = 'You synthesized the chemical antidote, neutralized Subject Zero, and recovered all classified files proving Dr. Vance’s bioweapon conspiracy!';
            icon = '👑';
            badge = 'ENDING 4 / 4 (TRUE LORE)';
            coins = 600;
            xp = 1200;
        }

        storage.updateState(s => s.coins += coins);
        playerProfile.addXP(xp);

        document.getElementById('endingIcon').textContent = icon;
        document.getElementById('endingTitle').textContent = title;
        document.getElementById('endingStoryDesc').textContent = desc;
        document.getElementById('endingBadge').textContent = badge;
        document.getElementById('statTime').textContent = `${mins}:${secs}`;
        document.getElementById('statCoins').textContent = `+${coins}`;
        document.getElementById('statXP').textContent = `+${xp}`;

        if (this.endingOverlay) {
            this.endingOverlay.classList.remove('d-none');
            this.endingOverlay.classList.add('d-flex');
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);

        this.renderFloor();
        this.renderWorldObjects();
        this.renderPlayer();
        this.renderMonster();
        this.renderWalls();
        this.renderDarknessMask();

        this.ctx.restore();
    }

    renderFloor() {
        this.ctx.fillStyle = '#0a0d14';
        this.ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        this.ctx.lineWidth = 1;
        for (let x = 0; x < MAP_WIDTH; x += 60) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, MAP_HEIGHT);
            this.ctx.stroke();
        }
        for (let y = 0; y < MAP_HEIGHT; y += 60) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(MAP_WIDTH, y);
            this.ctx.stroke();
        }

        this.ctx.fillStyle = 'rgba(180, 20, 20, 0.25)';
        this.ctx.beginPath();
        this.ctx.arc(620, 480, 35, 0, Math.PI * 2);
        this.ctx.arc(640, 490, 20, 0, Math.PI * 2);
        this.ctx.fill();
    }

    renderWorldObjects() {
        INTERACTIVES.forEach(obj => {
            if (obj.collected) return;

            if (obj.type === 'locker') {
                this.ctx.fillStyle = '#1e293b';
                this.ctx.strokeStyle = '#475569';
                this.ctx.lineWidth = 2;
                this.ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
                this.ctx.strokeRect(obj.x, obj.y, obj.w, obj.h);
                this.ctx.fillStyle = '#94a3b8';
                this.ctx.font = '20px sans-serif';
                this.ctx.fillText('🚪', obj.x + 12, obj.y + 32);
            } else if (obj.type === 'bed') {
                this.ctx.fillStyle = '#334155';
                this.ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
                this.ctx.fillStyle = '#94a3b8';
                this.ctx.font = '22px sans-serif';
                this.ctx.fillText('🛏️', obj.x + 15, obj.y + 38);
            } else if (obj.type === 'item') {
                this.ctx.font = '22px sans-serif';
                this.ctx.fillText(obj.icon || '📦', obj.x, obj.y + 24);
            } else if (obj.type === 'battery') {
                this.ctx.font = '20px sans-serif';
                this.ctx.fillText('🔋', obj.x, obj.y + 22);
            } else if (obj.type === 'note') {
                this.ctx.font = '20px sans-serif';
                this.ctx.fillText('📄', obj.x, obj.y + 22);
            }
        });
    }

    renderWalls() {
        WALLS.forEach(w => {
            this.ctx.fillStyle = '#0f172a';
            this.ctx.fillRect(w.x, w.y, w.w, w.h);

            this.ctx.strokeStyle = '#334155';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(w.x, w.y, w.w, w.h);
        });
    }

    renderPlayer() {
        if (this.player.isHiding) return;

        this.ctx.save();
        this.ctx.translate(this.player.x, this.player.y);
        this.ctx.rotate(this.player.angle);

        this.ctx.fillStyle = this.player.isCrouching ? '#38bdf8' : '#0284c7';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.player.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        this.ctx.fillStyle = '#64748b';
        this.ctx.fillRect(10, -6, 12, 12);

        this.ctx.restore();
    }

    renderMonster() {
        this.ctx.save();
        this.ctx.translate(this.monster.x, this.monster.y);
        this.ctx.rotate(this.monster.angle);

        if (this.monster.state === 'CHASE' || this.monster.state === 'ALERT') {
            this.ctx.fillStyle = this.monster.state === 'CHASE' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(234, 179, 8, 0.15)';
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.arc(0, 0, this.monster.visionRange, -this.monster.visionAngle / 2, this.monster.visionAngle / 2);
            this.ctx.closePath();
            this.ctx.fill();
        }

        this.ctx.fillStyle = '#7f1d1d';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.monster.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#ef4444';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        this.ctx.fillStyle = '#ff0000';
        this.ctx.shadowColor = '#ff0000';
        this.ctx.shadowBlur = 10;
        this.ctx.beginPath();
        this.ctx.arc(12, -8, 4, 0, Math.PI * 2);
        this.ctx.arc(12, 8, 4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        this.ctx.restore();
    }

    renderDarknessMask() {
        if (this.isLightning) return;

        const darkCanvas = document.createElement('canvas');
        darkCanvas.width = this.canvas.width;
        darkCanvas.height = this.canvas.height;
        const dCtx = darkCanvas.getContext('2d');

        dCtx.fillStyle = 'rgba(2, 4, 8, 0.94)';
        dCtx.fillRect(0, 0, darkCanvas.width, darkCanvas.height);

        const px = this.player.x - this.camera.x;
        const py = this.player.y - this.camera.y;

        dCtx.globalCompositeOperation = 'destination-out';

        const ambientGrad = dCtx.createRadialGradient(px, py, 20, px, py, 90);
        ambientGrad.addColorStop(0, 'rgba(0,0,0,1)');
        ambientGrad.addColorStop(1, 'rgba(0,0,0,0)');
        dCtx.fillStyle = ambientGrad;
        dCtx.beginPath();
        dCtx.arc(px, py, 90, 0, Math.PI * 2);
        dCtx.fill();

        if (this.player.flashlightOn && this.player.battery > 0 && !this.player.isHiding) {
            dCtx.save();
            dCtx.translate(px, py);
            dCtx.rotate(this.player.angle);

            const flashGrad = dCtx.createRadialGradient(0, 0, 10, 0, 0, 360);
            flashGrad.addColorStop(0, 'rgba(0,0,0,1)');
            flashGrad.addColorStop(0.8, 'rgba(0,0,0,0.85)');
            flashGrad.addColorStop(1, 'rgba(0,0,0,0)');

            dCtx.fillStyle = flashGrad;
            dCtx.beginPath();
            dCtx.moveTo(0, 0);
            dCtx.arc(0, 0, 360, -Math.PI * 0.22, Math.PI * 0.22);
            dCtx.closePath();
            dCtx.fill();

            dCtx.restore();
        }

        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.drawImage(darkCanvas, 0, 0);
        this.ctx.restore();
    }
}

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.escapeGame = new EscapeFromMonster();
        });
    } else {
        window.escapeGame = new EscapeFromMonster();
    }
}
