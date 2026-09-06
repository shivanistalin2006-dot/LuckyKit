import { BaseGame } from './core/BaseGame.js?v=2.5';
import { gameManager } from './core/gameManager.js';
import { audioManager } from './audio/audioManager.js';
import { storage } from './core/storage.js';

// ========================================================
// BIKES CATALOGUE & TUNING
// ========================================================
const BIKES = [
    {
        id: 'scooter',
        name: 'Cyber Scooter 110cc',
        category: '🛵 Scooter',
        cost: 0,
        unlocked: true,
        maxSpeed: 10.0,      // ~50 km/h
        accel: 0.16,
        brakePower: 0.35,
        turnAgility: 0.055,
        maxLean: 0.28,
        weight: 95,
        width: 18,
        length: 44,
        color: '#06b6d4',
        desc: 'Nimble automatic scooter with quick handlebar steering.'
    },
    {
        id: 'street',
        name: 'Street Commuter 150cc',
        category: '🏍️ Commuter',
        cost: 250,
        unlocked: true,
        maxSpeed: 14.0,      // ~70 km/h
        accel: 0.22,
        brakePower: 0.40,
        turnAgility: 0.048,
        maxLean: 0.38,
        weight: 140,
        width: 20,
        length: 50,
        color: '#ef4444',
        desc: 'Reliable everyday bike with balanced weight and responsive brakes.'
    },
    {
        id: 'cruiser',
        name: 'Royal Cruiser 350cc',
        category: '🏍️ Cruiser',
        cost: 600,
        unlocked: false,
        maxSpeed: 16.0,      // ~80 km/h
        accel: 0.20,
        brakePower: 0.38,
        turnAgility: 0.038,
        maxLean: 0.32,
        weight: 195,
        width: 22,
        length: 56,
        color: '#eab308',
        desc: 'Heavy long-wheelbase cruiser with deep engine rumble.'
    },
    {
        id: 'sport',
        name: 'Ninja Sportbike 600cc',
        category: '🏍️ Sport',
        cost: 1200,
        unlocked: false,
        maxSpeed: 21.0,      // ~110 km/h
        accel: 0.32,
        brakePower: 0.50,
        turnAgility: 0.052,
        maxLean: 0.55,
        weight: 175,
        width: 21,
        length: 52,
        color: '#22c55e',
        desc: 'High-revving racing machine with aggressive lean angle.'
    },
    {
        id: 'superbike',
        name: 'Hyper Superbike 1000cc',
        category: '🏍️ Hyper',
        cost: 2500,
        unlocked: false,
        maxSpeed: 26.0,      // ~140 km/h
        accel: 0.42,
        brakePower: 0.60,
        turnAgility: 0.058,
        maxLean: 0.65,
        weight: 190,
        width: 22,
        length: 54,
        color: '#a855f7',
        desc: 'Ultimate hyperbike with blistering acceleration and precision brakes.'
    }
];

// ========================================================
// 10 HANDCRAFTED MISSIONS / ENVIRONMENTS
// ========================================================
const MISSIONS = [
    {
        level: 1,
        title: 'Residential Driveway',
        environment: 'Residential',
        weather: '☀️ Dry Asphalt',
        time: 'Day 10:00',
        friction: 1.0,
        timeLimit: 50,
        spawn: { x: 120, y: 380, angle: 0 },
        slot: { x: 720, y: 160, width: 55, length: 90, angle: -Math.PI / 2 },
        desc: 'Drive along the neighborhood street, avoid the parked sedan, and park in the driveway bay.',
        obstacles: [
            { type: 'car', x: 420, y: 360, width: 55, length: 100, angle: 0, color: '#3b82f6' },
            { type: 'cone', x: 620, y: 240, radius: 10 },
            { type: 'cone', x: 620, y: 120, radius: 10 }
        ],
        traffic: []
    },
    {
        level: 2,
        title: 'Shopping Mall Ground Slot',
        environment: 'Shopping Mall',
        weather: '☀️ Dry Concrete',
        time: 'Day 14:00',
        friction: 0.95,
        timeLimit: 45,
        spawn: { x: 100, y: 100, angle: Math.PI / 2 },
        slot: { x: 750, y: 420, width: 50, length: 85, angle: 0 },
        desc: 'Navigate the commercial parking lot around light poles and cars.',
        obstacles: [
            { type: 'car', x: 350, y: 220, width: 55, length: 105, angle: Math.PI / 2, color: '#ef4444' },
            { type: 'car', x: 500, y: 220, width: 55, length: 105, angle: Math.PI / 2, color: '#eab308' },
            { type: 'pillar', x: 300, y: 380, radius: 18 },
            { type: 'pillar', x: 600, y: 380, radius: 18 }
        ],
        traffic: []
    },
    {
        level: 3,
        title: 'Office Basement Parallel Bay',
        environment: 'Office Basement',
        weather: '💡 Indoor Concrete',
        time: 'Night 19:00',
        friction: 0.9,
        timeLimit: 45,
        spawn: { x: 100, y: 260, angle: 0 },
        slot: { x: 550, y: 260, width: 55, length: 95, angle: 0 },
        desc: 'Tight parallel slot between two parked luxury cars. Control your speed smoothly.',
        obstacles: [
            { type: 'car', x: 400, y: 260, width: 55, length: 105, angle: 0, color: '#64748b' },
            { type: 'car', x: 700, y: 260, width: 55, length: 105, angle: 0, color: '#1e293b' },
            { type: 'barrier', x: 550, y: 160, width: 220, height: 16 }
        ],
        traffic: []
    },
    {
        level: 4,
        title: 'City Street with Traffic',
        environment: 'City Street',
        weather: '☀️ Urban Pavement',
        time: 'Day 16:30',
        friction: 1.0,
        timeLimit: 55,
        spawn: { x: 80, y: 440, angle: 0 },
        slot: { x: 820, y: 100, width: 52, length: 90, angle: -Math.PI / 2 },
        desc: 'Watch out for moving traffic vehicles and pedestrians before pulling into the roadside bay.',
        obstacles: [
            { type: 'car', x: 350, y: 100, width: 55, length: 100, angle: -Math.PI / 2, color: '#22c55e' },
            { type: 'car', x: 580, y: 100, width: 55, length: 100, angle: -Math.PI / 2, color: '#a855f7' }
        ],
        traffic: [
            { type: 'car', x: 150, y: 260, vx: 2.2, vy: 0, width: 55, length: 105, minX: 100, maxX: 850, color: '#f97316' },
            { type: 'pedestrian', x: 480, y: 400, vx: 0, vy: -1.0, radius: 10, minY: 150, maxY: 460 }
        ]
    },
    {
        level: 5,
        title: 'Hospital Emergency Zone',
        environment: 'Hospital',
        weather: '☀️ Speed Zone',
        time: 'Day 11:00',
        friction: 1.0,
        timeLimit: 30, // Fast rush!
        spawn: { x: 100, y: 120, angle: 0 },
        slot: { x: 800, y: 400, width: 55, length: 95, angle: Math.PI / 2 },
        desc: 'Fast rush challenge! Park within 30 seconds between ambulances without bumping obstacles.',
        obstacles: [
            { type: 'ambulance', x: 650, y: 400, width: 62, length: 120, angle: Math.PI / 2, color: '#ffffff' },
            { type: 'speedbreaker', x: 420, y: 250, width: 30, height: 180 },
            { type: 'cone', x: 300, y: 150, radius: 10 },
            { type: 'cone', x: 500, y: 350, radius: 10 }
        ],
        traffic: []
    },
    {
        level: 6,
        title: 'Rainy Mall Basement',
        environment: 'Multi-Floor Mall',
        weather: '🌧️ Wet / Rainy Grip',
        time: 'Night 21:00',
        friction: 0.65, // Slippery!
        timeLimit: 60,
        spawn: { x: 120, y: 420, angle: -Math.PI / 4 },
        slot: { x: 740, y: 140, width: 52, length: 90, angle: -Math.PI / 2 },
        desc: 'Rainy wet surface! Drastically reduced grip. Brake early to avoid skidding into pillars.',
        obstacles: [
            { type: 'pillar', x: 380, y: 220, radius: 22 },
            { type: 'pillar', x: 580, y: 220, radius: 22 },
            { type: 'car', x: 580, y: 140, width: 55, length: 100, angle: -Math.PI / 2, color: '#0284c7' },
            { type: 'puddle', x: 320, y: 340, width: 90, height: 60 }
        ],
        traffic: []
    },
    {
        level: 7,
        title: 'College Campus Zigzag',
        environment: 'College Campus',
        weather: '☀️ Dry Asphalt',
        time: 'Day 13:00',
        friction: 1.0,
        timeLimit: 50,
        spawn: { x: 80, y: 100, angle: 0 },
        slot: { x: 840, y: 440, width: 50, length: 85, angle: 0 },
        desc: 'Navigate through a slalom course of speed breakers and cones without taking damage.',
        obstacles: [
            { type: 'speedbreaker', x: 280, y: 180, width: 25, height: 140 },
            { type: 'speedbreaker', x: 580, y: 300, width: 25, height: 140 },
            { type: 'cone', x: 200, y: 100, radius: 10 },
            { type: 'cone', x: 420, y: 260, radius: 10 },
            { type: 'cone', x: 680, y: 400, radius: 10 }
        ],
        traffic: []
    },
    {
        level: 8,
        title: 'Hotel Valet Multi-Vehicle Bay',
        environment: 'Luxury Hotel',
        weather: '🌅 Sunset Glow',
        time: 'Evening 18:00',
        friction: 0.95,
        timeLimit: 55,
        spawn: { x: 100, y: 440, angle: -Math.PI / 2 },
        slot: { x: 500, y: 120, width: 54, length: 90, angle: Math.PI / 2 },
        desc: 'Delicate valet parking among exotic sports cars and fountain barriers.',
        obstacles: [
            { type: 'car', x: 360, y: 120, width: 55, length: 105, angle: Math.PI / 2, color: '#e11d48' },
            { type: 'car', x: 640, y: 120, width: 55, length: 105, angle: Math.PI / 2, color: '#facc15' },
            { type: 'fountain', x: 500, y: 320, radius: 45 }
        ],
        traffic: [
            { type: 'car', x: 800, y: 440, vx: -1.8, vy: 0, width: 55, length: 105, minX: 200, maxX: 850, color: '#0ea5e9' }
        ]
    },
    {
        level: 9,
        title: 'Night Neon City Highway Strip',
        environment: 'City Center',
        weather: '🌙 Night Lights',
        time: 'Night 23:00',
        friction: 0.9,
        timeLimit: 60,
        spawn: { x: 100, y: 120, angle: 0 },
        slot: { x: 820, y: 420, width: 55, length: 95, angle: Math.PI / 2 },
        desc: 'City traffic in full motion! Navigate past auto-rickshaws and buses under neon streetlights.',
        obstacles: [
            { type: 'barrier', x: 450, y: 260, width: 350, height: 18 },
            { type: 'car', x: 680, y: 420, width: 55, length: 100, angle: Math.PI / 2, color: '#6366f1' }
        ],
        traffic: [
            { type: 'autorickshaw', x: 200, y: 380, vx: 2.0, vy: 0, width: 45, length: 75, minX: 100, maxX: 700, color: '#eab308' },
            { type: 'pedestrian', x: 550, y: 100, vx: 0, vy: 1.2, radius: 10, minY: 80, maxY: 450 }
        ]
    },
    {
        level: 10,
        title: 'Master Parking License Exam',
        environment: 'Police Driving Academy',
        weather: '🌧️ Heavy Rain / Wet',
        time: 'Night 00:00',
        friction: 0.65,
        timeLimit: 75,
        spawn: { x: 100, y: 440, angle: 0 },
        slot: { x: 840, y: 120, width: 52, length: 90, angle: -Math.PI / 2 },
        desc: 'The Ultimate Parking Test: Wet surface, moving traffic, zero-contact penalty, and tight reverse entry!',
        obstacles: [
            { type: 'car', x: 700, y: 120, width: 55, length: 100, angle: -Math.PI / 2, color: '#ef4444' },
            { type: 'speedbreaker', x: 350, y: 350, width: 25, height: 140 },
            { type: 'pillar', x: 500, y: 220, radius: 20 },
            { type: 'pillar', x: 650, y: 340, radius: 20 }
        ],
        traffic: [
            { type: 'car', x: 200, y: 200, vx: 2.4, vy: 0, width: 55, length: 105, minX: 100, maxX: 800, color: '#f59e0b' },
            { type: 'pedestrian', x: 420, y: 440, vx: 0, vy: -1.2, radius: 10, minY: 120, maxY: 460 }
        ]
    }
];

class MotoParkPro extends BaseGame {
    constructor() {
        super("bike");

        this.canvas = document.getElementById('bikeCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Storage & Profile
        this.unlockedLevels = parseInt(localStorage.getItem('luckykit_bike_unlocked') || '1');
        this.currentLevel = 1;
        this.selectedBikeId = localStorage.getItem('luckykit_bike_selected') || 'street';
        this.selectedColor = localStorage.getItem('luckykit_bike_color') || '#ef4444';
        
        // Upgrades (from storage)
        this.upgrades = JSON.parse(localStorage.getItem('luckykit_bike_upgrades') || '{"engine":1,"brakes":1,"tyres":1}');

        // Camera mode: 0 = Chase, 1 = Handlebar/Cockpit, 2 = Top-down Tactical
        this.cameraMode = 0;
        this.parkingAssist = true;

        // HUD Elements
        this.hudSpeed = document.getElementById('hudSpeed');
        this.hudGear = document.getElementById('hudGear');
        this.missionTimerEl = document.getElementById('missionTimer');
        this.damageProgressBar = document.getElementById('damageProgressBar');
        this.damageText = document.getElementById('damageText');
        this.camNameText = document.getElementById('camNameText');
        this.assistText = document.getElementById('assistText');
        this.envBadge = document.getElementById('envBadge');
        this.timeBadge = document.getElementById('timeBadge');

        // Parking Status HUD
        this.parkingStatusCard = document.getElementById('parkingStatusCard');
        this.parkingStatusTitle = document.getElementById('parkingStatusTitle');
        this.parkingStatusSubtitle = document.getElementById('parkingStatusSubtitle');
        this.alignFitText = document.getElementById('alignFitText');
        this.alignAngleText = document.getElementById('alignAngleText');
        this.alignHoldText = document.getElementById('alignHoldText');

        // Result Overlay
        this.resultOverlay = document.getElementById('resultOverlay');
        this.resultTitle = document.getElementById('resultTitle');
        this.resultStars = document.getElementById('resultStars');
        this.resultMessage = document.getElementById('resultMessage');
        this.scoreAccuracy = document.getElementById('scoreAccuracy');
        this.scoreTime = document.getElementById('scoreTime');
        this.scoreDamage = document.getElementById('scoreDamage');
        this.scoreCoins = document.getElementById('scoreCoins');

        // State & Controls
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            handbrake: false
        };

        this.particles = [];
        this.skidmarks = [];

        this.bindControls();
        this.setupGarageUI();
        this.setupLevelSelectorUI();
        this.loadMission(this.currentLevel);

        gameManager.registerGame(this);
    }

    getBikeData() {
        const bike = BIKES.find(b => b.id === this.selectedBikeId) || BIKES[1];
        // Apply Upgrades:
        const engineMult = 1 + (this.upgrades.engine - 1) * 0.12;
        const brakeMult = 1 + (this.upgrades.brakes - 1) * 0.15;
        const tyreMult = 1 + (this.upgrades.tyres - 1) * 0.15;

        return {
            ...bike,
            maxSpeed: bike.maxSpeed * engineMult,
            accel: bike.accel * engineMult,
            brakePower: bike.brakePower * brakeMult,
            gripBonus: tyreMult,
            color: this.selectedColor
        };
    }

    loadMission(lvlNumber) {
        this.currentLevel = Math.max(1, Math.min(MISSIONS.length, lvlNumber));
        this.missionData = MISSIONS[this.currentLevel - 1];

        // Update Headers
        const curLvlHeader = document.getElementById('currentLevelHeader');
        if (curLvlHeader) curLvlHeader.textContent = `${this.currentLevel}/${MISSIONS.length}`;
        
        const lvlNumText = document.getElementById('levelNumberText');
        if (lvlNumText) lvlNumText.textContent = this.currentLevel;
        
        const lvlTitleText = document.getElementById('levelTitleText');
        if (lvlTitleText) lvlTitleText.textContent = this.missionData.title;

        const sbBadge = document.getElementById('sidebarLevelBadge');
        if (sbBadge) sbBadge.textContent = `LEVEL ${this.currentLevel}`;
        
        const sbTitle = document.getElementById('sidebarMissionTitle');
        if (sbTitle) sbTitle.textContent = this.missionData.title;
        
        const sbDesc = document.getElementById('sidebarMissionDesc');
        if (sbDesc) sbDesc.textContent = this.missionData.desc;
        
        const sbTime = document.getElementById('sidebarTimeLimit');
        if (sbTime) sbTime.textContent = `${this.missionData.timeLimit}s`;

        if (this.envBadge) this.envBadge.textContent = this.missionData.weather;
        if (this.timeBadge) this.timeBadge.textContent = this.missionData.time;

        this.resetGameVariables();
    }

    resetGameVariables() {
        const spawn = this.missionData.spawn;
        const bike = this.getBikeData();

        this.player = {
            x: spawn.x,
            y: spawn.y,
            speed: 0,
            angle: spawn.angle,
            steerAngle: 0,
            leanAngle: 0,
            damage: 0,
            width: bike.width,
            length: bike.length,
            isGrounded: true,
            isParked: false,
            parkHoldTime: 0,
            gear: 'N'
        };

        this.missionTime = 0;
        this.missionCompleted = false;
        this.missionFailed = false;

        // Clone dynamic traffic
        this.traffic = JSON.parse(JSON.stringify(this.missionData.traffic || []));
        this.obstacles = JSON.parse(JSON.stringify(this.missionData.obstacles || []));

        this.skidmarks = [];
        this.particles = [];

        if (this.resultOverlay) this.resultOverlay.classList.add('d-none');
        this.updateHUD();
    }

    onStart() {
        this.resetGameVariables();
        this.lastTime = performance.now();
        if (this.loopId) cancelAnimationFrame(this.loopId);
        this.loopId = requestAnimationFrame((t) => this.gameLoop(t));
    }

    bindControls() {
        // Desktop Keyboard
        window.addEventListener('keydown', (e) => {
            if (['KeyW', 'ArrowUp'].includes(e.code)) this.keys.forward = true;
            if (['KeyS', 'ArrowDown'].includes(e.code)) this.keys.backward = true;
            if (['KeyA', 'ArrowLeft'].includes(e.code)) this.keys.left = true;
            if (['KeyD', 'ArrowRight'].includes(e.code)) this.keys.right = true;
            if (e.code === 'Space') { e.preventDefault(); this.keys.handbrake = true; }
            if (e.code === 'KeyC') this.cycleCamera();
            if (e.code === 'KeyP') this.toggleAssist();
            if (e.code === 'KeyH') this.honkHorn();
            if (e.code === 'KeyR') this.loadMission(this.currentLevel);
        });

        window.addEventListener('keyup', (e) => {
            if (['KeyW', 'ArrowUp'].includes(e.code)) this.keys.forward = false;
            if (['KeyS', 'ArrowDown'].includes(e.code)) this.keys.backward = false;
            if (['KeyA', 'ArrowLeft'].includes(e.code)) this.keys.left = false;
            if (['KeyD', 'ArrowRight'].includes(e.code)) this.keys.right = false;
            if (e.code === 'Space') this.keys.handbrake = false;
        });

        // Mobile Buttons
        const bindTouch = (id, key) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            const press = (e) => { e.preventDefault(); this.keys[key] = true; };
            const release = (e) => { e.preventDefault(); this.keys[key] = false; };
            btn.addEventListener('touchstart', press, { passive: false });
            btn.addEventListener('touchend', release, { passive: false });
            btn.addEventListener('mousedown', press);
            btn.addEventListener('mouseup', release);
            btn.addEventListener('mouseleave', release);
        };

        bindTouch('btnThrottle', 'forward');
        bindTouch('btnBrake', 'backward');
        bindTouch('btnSteerLeft', 'left');
        bindTouch('btnSteerRight', 'right');
        bindTouch('btnHandbrake', 'handbrake');

        document.getElementById('btnHorn')?.addEventListener('click', () => this.honkHorn());
        document.getElementById('btnMobileCam')?.addEventListener('click', () => this.cycleCamera());
        document.getElementById('camToggleBtn')?.addEventListener('click', () => this.cycleCamera());
        document.getElementById('assistToggleBtn')?.addEventListener('click', () => this.toggleAssist());

        // Header Buttons
        document.getElementById('startBtn')?.addEventListener('click', () => this.start());
        document.getElementById('sidebarStartBtn')?.addEventListener('click', () => this.start());
        document.getElementById('restartBtn')?.addEventListener('click', () => this.start());
        document.getElementById('retryBtn')?.addEventListener('click', () => this.start());
        
        document.getElementById('nextLevelBtn')?.addEventListener('click', () => {
            if (this.currentLevel < MISSIONS.length) {
                this.loadMission(this.currentLevel + 1);
                this.start();
            } else {
                this.loadMission(1);
                this.start();
            }
        });

        // Modals Triggers
        document.getElementById('garageBtn')?.addEventListener('click', () => this.openGarage());
        document.getElementById('sidebarGarageBtn')?.addEventListener('click', () => this.openGarage());
        document.getElementById('levelSelectBtn')?.addEventListener('click', () => this.openLevelSelector());
    }

    cycleCamera() {
        this.cameraMode = (this.cameraMode + 1) % 3;
        const names = ['Chase Cam', 'Handlebar 1st', 'Top Tactical'];
        if (this.camNameText) this.camNameText.textContent = names[this.cameraMode];
        if (audioManager) audioManager.playClick?.();
    }

    toggleAssist() {
        this.parkingAssist = !this.parkingAssist;
        if (this.assistText) this.assistText.textContent = this.parkingAssist ? 'ON' : 'OFF';
        if (audioManager) audioManager.playClick?.();
    }

    honkHorn() {
        if (audioManager) {
            audioManager.playTone(480, 'sine', 0.15, 0.4);
            setTimeout(() => audioManager.playTone(480, 'sine', 0.15, 0.4), 100);
        }
        // Spawn horn soundwave particle
        this.particles.push({
            x: this.player.x + Math.cos(this.player.angle) * 30,
            y: this.player.y + Math.sin(this.player.angle) * 30,
            radius: 10,
            maxRadius: 60,
            alpha: 1,
            color: '#eab308'
        });
    }

    gameLoop(time) {
        if (this.isRunning && !this.isPaused) {
            const dt = Math.min(32, time - (this.lastTime || time));
            this.lastTime = time;

            this.updatePhysics(dt);
            this.updateTraffic(dt);
            this.updateParkingEvaluation(dt);
            this.render();
        }

        if (this.isRunning) {
            this.loopId = requestAnimationFrame((t) => this.gameLoop(t));
        }
    }

    updatePhysics(dt) {
        const timeFactor = dt / 16.66;
        const bike = this.getBikeData();
        const p = this.player;
        const surfaceGrip = (this.missionData.friction || 1.0) * bike.gripBonus;

        this.missionTime += (dt / 1000);

        // Steering input with smooth interpolation
        const targetSteer = (this.keys.left ? -1 : 0) + (this.keys.right ? 1 : 0);
        const steerSpeed = bike.turnAgility * surfaceGrip;
        p.steerAngle += (targetSteer * 0.65 - p.steerAngle) * steerSpeed * timeFactor;

        // Acceleration & Braking
        if (this.keys.forward) {
            if (p.speed < 0) {
                // Braking while reversing
                p.speed += bike.brakePower * surfaceGrip * timeFactor;
            } else {
                p.speed += bike.accel * surfaceGrip * timeFactor;
                if (p.speed > bike.maxSpeed) p.speed = bike.maxSpeed;
            }
            p.gear = p.speed > 12 ? '4' : p.speed > 8 ? '3' : p.speed > 4 ? '2' : '1';
        } else if (this.keys.backward) {
            if (p.speed > 0.5) {
                // Foot Brake
                p.speed -= bike.brakePower * surfaceGrip * timeFactor;
                if (p.speed < 0) p.speed = 0;
            } else {
                // Reverse
                p.speed -= (bike.accel * 0.45) * surfaceGrip * timeFactor;
                if (p.speed < -3.5) p.speed = -3.5;
                p.gear = 'R';
            }
        } else {
            // Natural Coasting Rolling Friction
            p.speed *= Math.pow(0.975, timeFactor);
            if (Math.abs(p.speed) < 0.05) {
                p.speed = 0;
                p.gear = 'N';
            }
        }

        // Handbrake (Instant rear-wheel lock and skid)
        if (this.keys.handbrake) {
            p.speed *= Math.pow(0.85, timeFactor);
            // Spawn skidmark
            if (Math.abs(p.speed) > 2) {
                this.skidmarks.push({
                    x: p.x - Math.cos(p.angle) * (p.length / 2),
                    y: p.y - Math.sin(p.angle) * (p.length / 2),
                    alpha: 0.6
                });
            }
        }

        // Turning dynamics & Bicycle Kinematics Model
        if (Math.abs(p.speed) > 0.1) {
            const angularVel = (p.speed / (p.length * 0.85)) * Math.sin(p.steerAngle);
            p.angle += angularVel * timeFactor;

            // Dynamic Leaning angle based on turn curvature & speed
            const targetLean = (p.speed / bike.maxSpeed) * (p.steerAngle / 0.65) * bike.maxLean;
            p.leanAngle += (targetLean - p.leanAngle) * 0.15 * timeFactor;
        } else {
            p.leanAngle *= 0.8;
        }

        // Low-speed wobble effect if crawling under 2 km/h
        if (Math.abs(p.speed) > 0.2 && Math.abs(p.speed) < 1.5) {
            p.leanAngle += Math.sin(Date.now() * 0.01) * 0.03;
        }

        // Update Position
        p.x += Math.cos(p.angle) * p.speed * timeFactor;
        p.y += Math.sin(p.angle) * p.speed * timeFactor;

        // Boundary Clamping inside canvas area (1000 x 540)
        p.x = Math.max(25, Math.min(935, p.x));
        p.y = Math.max(25, Math.min(515, p.y));

        // Check Obstacle Collisions
        this.checkCollisions();

        // Update Skidmark decay
        for (let i = this.skidmarks.length - 1; i >= 0; i--) {
            this.skidmarks[i].alpha -= 0.0008 * timeFactor;
            if (this.skidmarks[i].alpha <= 0) this.skidmarks.splice(i, 1);
        }

        // Update Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const pt = this.particles[i];
            pt.radius += 1.5 * timeFactor;
            pt.alpha -= 0.03 * timeFactor;
            if (pt.alpha <= 0) this.particles.splice(i, 1);
        }

        this.updateHUD();
    }

    updateTraffic(dt) {
        const timeFactor = dt / 16.66;
        this.traffic.forEach(t => {
            t.x += (t.vx || 0) * timeFactor;
            t.y += (t.vy || 0) * timeFactor;

            // Patrol bounce back & forth
            if (t.minX !== undefined && (t.x <= t.minX || t.x >= t.maxX)) t.vx *= -1;
            if (t.minY !== undefined && (t.y <= t.minY || t.y >= t.maxY)) t.vy *= -1;
        });
    }

    checkCollisions() {
        const p = this.player;

        // Helper: Circle vs Circle or Rotated Box
        const checkHit = (obs) => {
            if (obs.radius) {
                // Circular obstacle (cone, pillar, pedestrian)
                const dist = Math.hypot(p.x - obs.x, p.y - obs.y);
                return dist < (obs.radius + p.width / 2);
            } else {
                // Box obstacle (car, ambulance, barrier)
                const dist = Math.hypot(p.x - obs.x, p.y - obs.y);
                return dist < ((obs.width || 50) / 2 + p.width / 2 + 10);
            }
        };

        // Static obstacles
        this.obstacles.forEach(obs => {
            if (obs.type === 'speedbreaker' || obs.type === 'puddle') {
                // Non-damaging surface hazards (causes bump or slide)
                if (Math.abs(p.x - obs.x) < 30 && Math.abs(p.y - obs.y) < 60) {
                    if (obs.type === 'speedbreaker' && Math.abs(p.speed) > 6) {
                        p.speed *= 0.85; // Speed bump slow
                    }
                }
                return;
            }

            if (checkHit(obs)) {
                this.handleCrash(obs);
            }
        });

        // Moving traffic
        this.traffic.forEach(t => {
            if (checkHit(t)) {
                this.handleCrash(t);
            }
        });
    }

    handleCrash(obstacle) {
        const p = this.player;
        const impactForce = Math.abs(p.speed);

        // Recoil bounce
        p.speed = -p.speed * 0.4;
        p.damage += Math.min(35, Math.floor(impactForce * 4.5) + 5);

        if (audioManager) audioManager.playLose?.();

        // Screen shake or spark particles
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: p.x,
                y: p.y,
                radius: 4,
                alpha: 1,
                color: '#ef4444'
            });
        }

        // Damage limit failure check
        if (p.damage >= 100) {
            this.handleMissionFailure("CRITICAL DAMAGE! Motorcycle wrecked.");
        }
    }

    updateParkingEvaluation(dt) {
        if (this.missionCompleted || this.missionFailed) return;

        const p = this.player;
        const slot = this.missionData.slot;

        // 1. Position Distance to Slot Center
        const dist = Math.hypot(p.x - slot.x, p.y - slot.y);
        const maxTolDist = 38;
        const posFit = Math.max(0, 100 - Math.floor((dist / maxTolDist) * 100));

        // 2. Angle Alignment (Normalized Difference to Slot Angle)
        let angleDiff = Math.abs(p.angle - slot.angle) % (Math.PI * 2);
        if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;
        // Accept either forward or reverse orientation (0 or PI)
        const minAngleDiff = Math.min(angleDiff, Math.abs(angleDiff - Math.PI));
        const angleFit = Math.max(0, 100 - Math.floor((minAngleDiff / 0.35) * 100));

        // 3. Total Accuracy %
        const accuracy = Math.floor((posFit * 0.6) + (angleFit * 0.4));

        // UI Updates
        if (this.alignFitText) this.alignFitText.textContent = `${posFit}%`;
        if (this.alignAngleText) this.alignAngleText.textContent = `${(minAngleDiff * 57.3).toFixed(1)}°`;

        const isInsideBay = dist <= maxTolDist && minAngleDiff <= 0.30;

        if (isInsideBay) {
            if (this.parkingStatusCard) this.parkingStatusCard.classList.add('active-zone');
            
            if (Math.abs(p.speed) < 0.2) {
                // Bike is holding still inside slot!
                p.parkHoldTime += (dt / 1000);
                if (this.alignHoldText) this.alignHoldText.textContent = `${p.parkHoldTime.toFixed(1)}s / 1.5s`;
                if (this.parkingStatusTitle) this.parkingStatusTitle.textContent = "STOPPED • HOLDING STILL";
                if (this.parkingStatusSubtitle) this.parkingStatusSubtitle.textContent = "Turning off ignition...";

                if (p.parkHoldTime >= 1.5) {
                    // Successfully Parked!
                    this.handleMissionSuccess(accuracy);
                }
            } else {
                p.parkHoldTime = 0;
                if (this.alignHoldText) this.alignHoldText.textContent = `0.0s`;
                if (this.parkingStatusTitle) this.parkingStatusTitle.textContent = "ALIGNED • BRAKE TO STOP";
                if (this.parkingStatusSubtitle) this.parkingStatusSubtitle.textContent = "Hold still to finish";
            }
        } else {
            p.parkHoldTime = 0;
            if (this.parkingStatusCard) this.parkingStatusCard.classList.remove('active-zone');
            if (this.alignHoldText) this.alignHoldText.textContent = `0.0s`;
            if (this.parkingStatusTitle) this.parkingStatusTitle.textContent = "APPROACH SLOT";
            if (this.parkingStatusSubtitle) this.parkingStatusSubtitle.textContent = "Align inside yellow box";
        }

        // Time Limit Failure Check
        if (this.missionTime >= this.missionData.timeLimit) {
            this.handleMissionFailure("TIME EXPIRED! Parking challenge failed.");
        }
    }

    handleMissionSuccess(accuracy) {
        this.missionCompleted = true;
        this.isRunning = false;

        const timeTaken = this.missionTime.toFixed(1);
        const damageTaken = this.player.damage;

        // Star Rating Calculation
        let stars = '⭐⭐⭐';
        if (accuracy >= 92 && damageTaken === 0 && this.missionTime <= this.missionData.timeLimit * 0.7) {
            stars = '⭐⭐⭐⭐⭐';
        } else if (accuracy >= 80 && damageTaken < 20) {
            stars = '⭐⭐⭐⭐';
        }

        // Reward Coins
        const coinsEarned = 100 + (accuracy * 1.5) + (damageTaken === 0 ? 50 : 0);
        storage.updateState(s => {
            s.coins += Math.floor(coinsEarned);
            s.xp += 150;
        });

        // Unlock next level
        if (this.currentLevel >= this.unlockedLevels && this.currentLevel < MISSIONS.length) {
            this.unlockedLevels = this.currentLevel + 1;
            localStorage.setItem('luckykit_bike_unlocked', this.unlockedLevels.toString());
        }

        // Render Result UI
        if (this.resultTitle) this.resultTitle.textContent = "PERFECT PARKING!";
        if (this.resultStars) this.resultStars.textContent = stars;
        if (this.resultMessage) this.resultMessage.textContent = "Ignition OFF • Motorcycle parked with precision alignment!";
        if (this.scoreAccuracy) this.scoreAccuracy.textContent = `${accuracy}%`;
        if (this.scoreTime) this.scoreTime.textContent = `${timeTaken}s`;
        if (this.scoreDamage) this.scoreDamage.textContent = `${damageTaken}%`;
        if (this.scoreCoins) this.scoreCoins.textContent = `+${Math.floor(coinsEarned)} 🪙`;

        if (this.resultOverlay) {
            this.resultOverlay.classList.remove('d-none');
            this.resultOverlay.classList.add('d-flex');
        }

        if (audioManager) audioManager.playWin?.();
    }

    handleMissionFailure(reason) {
        this.missionFailed = true;
        this.isRunning = false;

        if (this.resultTitle) this.resultTitle.textContent = "PARKING FAILED!";
        if (this.resultStars) this.resultStars.textContent = "❌";
        if (this.resultMessage) this.resultMessage.textContent = reason;
        if (this.scoreAccuracy) this.scoreAccuracy.textContent = `0%`;
        if (this.scoreTime) this.scoreTime.textContent = `${this.missionTime.toFixed(1)}s`;
        if (this.scoreDamage) this.scoreDamage.textContent = `${this.player.damage}%`;
        if (this.scoreCoins) this.scoreCoins.textContent = `+0 🪙`;

        if (this.resultOverlay) {
            this.resultOverlay.classList.remove('d-none');
            this.resultOverlay.classList.add('d-flex');
        }

        if (audioManager) audioManager.playLose?.();
    }

    updateHUD() {
        const speedKmh = Math.abs(Math.floor(this.player.speed * 5.0));
        if (this.hudSpeed) this.hudSpeed.textContent = speedKmh;
        if (this.hudGear) this.hudGear.textContent = this.player.gear;

        if (this.missionTimerEl) {
            const rem = Math.max(0, this.missionData.timeLimit - this.missionTime);
            this.missionTimerEl.textContent = `${rem.toFixed(1)}s`;
        }

        if (this.damageText) this.damageText.textContent = `${this.player.damage}%`;
        if (this.damageProgressBar) {
            const hp = Math.max(0, 100 - this.player.damage);
            this.damageProgressBar.style.width = `${hp}%`;
            this.damageProgressBar.className = hp > 60 ? 'progress-bar bg-success' : hp > 30 ? 'progress-bar bg-warning' : 'progress-bar bg-danger';
        }
    }

    render() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const p = this.player;

        ctx.clearRect(0, 0, w, h);

        ctx.save();

        // Dynamic Camera Transformations
        if (this.cameraMode === 0) {
            // Chase Cam: Follow smoothly behind bike
            const camX = w / 2 - p.x;
            const camY = h / 2 - p.y;
            ctx.translate(w / 2, h / 2);
            ctx.scale(1.15, 1.15);
            ctx.translate(-p.x, -p.y);
        } else if (this.cameraMode === 1) {
            // Handlebar / 1st Person Cockpit Cam: Rotates with bike heading!
            ctx.translate(w / 2, h / 2 + 100);
            ctx.rotate(-p.angle - Math.PI / 2);
            ctx.translate(-p.x, -p.y);
        } else {
            // Top-down Tactical Cam (Full map overview)
            ctx.translate(0, 0);
        }

        // 1. Draw Asphalt Ground & Lane Markings
        this.drawEnvironment(ctx);

        // 2. Draw Skidmarks
        this.skidmarks.forEach(sm => {
            ctx.fillStyle = `rgba(15, 15, 20, ${sm.alpha})`;
            ctx.beginPath();
            ctx.arc(sm.x, sm.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // 3. Draw Parking Slot Target Bay
        this.drawParkingSlot(ctx);

        // 4. Draw Obstacles & Moving Traffic
        this.drawObstacles(ctx);
        this.drawTraffic(ctx);

        // 5. Draw The Motorcycle
        this.drawBike(ctx);

        // 6. Draw Sound / Particles
        this.particles.forEach(pt => {
            ctx.strokeStyle = pt.color;
            ctx.globalAlpha = Math.max(0, pt.alpha);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        });

        ctx.restore();

        // 7. Draw Handlebar Overlay if in 1st Person Mode
        if (this.cameraMode === 1) {
            this.drawHandlebarCockpit(ctx, w, h);
        }
    }

    drawEnvironment(ctx) {
        // Base Ground Color
        const env = this.missionData.environment;
        ctx.fillStyle = env === 'Office Basement' ? '#181a24' : env === 'Shopping Mall' ? '#202433' : '#141620';
        ctx.fillRect(-200, -200, 1400, 940);

        // Road Border Kerb Stones
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 14;
        ctx.strokeRect(10, 10, 940, 520);

        // Road Surface Lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 3;
        ctx.setLineDash([20, 20]);
        ctx.beginPath();
        ctx.moveTo(100, 270);
        ctx.lineTo(860, 270);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    drawParkingSlot(ctx) {
        const slot = this.missionData.slot;
        ctx.save();
        ctx.translate(slot.x, slot.y);
        ctx.rotate(slot.angle);

        // Glowing Yellow Target Box
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#eab308';
        ctx.strokeRect(-slot.width / 2, -slot.length / 2, slot.width, slot.length);

        ctx.fillStyle = 'rgba(234, 179, 8, 0.12)';
        ctx.fillRect(-slot.width / 2, -slot.length / 2, slot.width, slot.length);

        // Orientation Direction Arrow
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.moveTo(0, -slot.length / 2 + 15);
        ctx.lineTo(12, -slot.length / 2 + 35);
        ctx.lineTo(-12, -slot.length / 2 + 35);
        ctx.fill();

        // Letter P
        ctx.font = 'bold 22px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('P', 0, 5);

        ctx.restore();

        // Parking Assist Guideline
        if (this.parkingAssist && !this.missionCompleted) {
            ctx.save();
            ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)';
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 8]);
            ctx.beginPath();
            ctx.moveTo(this.player.x, this.player.y);
            ctx.lineTo(slot.x, slot.y);
            ctx.stroke();
            ctx.restore();
        }
    }

    drawBike(ctx) {
        const p = this.player;
        const bike = this.getBikeData();

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);

        // Realistic Drop Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(3, 4, p.length / 2 + 4, p.width / 2 + 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Leaning Offset Rendering
        const leanShift = Math.sin(p.leanAngle) * 8;
        ctx.translate(0, leanShift);

        // Rear Tyre
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-p.length / 2 + 4, -4, 14, 8);

        // Front Tyre & Steering Angle
        ctx.save();
        ctx.translate(p.length / 2 - 6, 0);
        ctx.rotate(p.steerAngle);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-6, -4, 12, 8);
        ctx.restore();

        // Motorcycle Main Body Chassis
        ctx.fillStyle = bike.color;
        ctx.beginPath();
        ctx.roundRect(-p.length / 2 + 10, -p.width / 2 + 3, p.length - 18, p.width - 6, 6);
        ctx.fill();

        // Fuel Tank & Engine Block
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-8, -p.width / 2 + 5, 20, p.width - 10);

        // Rider Seat
        ctx.fillStyle = '#09090b';
        ctx.fillRect(-18, -p.width / 2 + 6, 14, p.width - 12);

        // Handlebars
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p.length / 2 - 12, -p.width / 2 - 4);
        ctx.lineTo(p.length / 2 - 12, p.width / 2 + 4);
        ctx.stroke();

        // Headlight Beam
        ctx.fillStyle = 'rgba(254, 240, 138, 0.35)';
        ctx.beginPath();
        ctx.moveTo(p.length / 2, 0);
        ctx.lineTo(p.length / 2 + 75, -25);
        ctx.lineTo(p.length / 2 + 75, 25);
        ctx.fill();

        ctx.restore();
    }

    drawObstacles(ctx) {
        this.obstacles.forEach(obs => {
            ctx.save();
            if (obs.type === 'car' || obs.type === 'ambulance') {
                ctx.translate(obs.x, obs.y);
                ctx.rotate(obs.angle || 0);

                // Car Shadow
                ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                ctx.fillRect(-obs.length / 2 + 3, -obs.width / 2 + 3, obs.length, obs.width);

                // Car Body
                ctx.fillStyle = obs.color || '#3b82f6';
                ctx.beginPath();
                ctx.roundRect(-obs.length / 2, -obs.width / 2, obs.length, obs.width, 8);
                ctx.fill();

                // Windshield
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(-obs.length / 4, -obs.width / 2 + 6, obs.length / 2, obs.width - 12);
            } else if (obs.type === 'pillar') {
                ctx.fillStyle = '#475569';
                ctx.beginPath();
                ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#e2e8f0';
                ctx.lineWidth = 3;
                ctx.stroke();
            } else if (obs.type === 'cone') {
                ctx.fillStyle = '#f97316';
                ctx.beginPath();
                ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(obs.x, obs.y, obs.radius * 0.45, 0, Math.PI * 2);
                ctx.fill();
            } else if (obs.type === 'speedbreaker') {
                ctx.fillStyle = '#eab308';
                ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            } else if (obs.type === 'barrier') {
                ctx.fillStyle = '#dc2626';
                ctx.fillRect(obs.x - obs.width / 2, obs.y - obs.height / 2, obs.width, obs.height);
            }
            ctx.restore();
        });
    }

    drawTraffic(ctx) {
        this.traffic.forEach(t => {
            ctx.save();
            ctx.translate(t.x, t.y);

            if (t.type === 'pedestrian') {
                ctx.fillStyle = '#f87171';
                ctx.beginPath();
                ctx.arc(0, 0, t.radius, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = t.color || '#f59e0b';
                ctx.beginPath();
                ctx.roundRect(-t.length / 2, -t.width / 2, t.length, t.width, 6);
                ctx.fill();
            }
            ctx.restore();
        });
    }

    drawHandlebarCockpit(ctx, w, h) {
        ctx.save();
        const p = this.player;

        // Render 1st-person Handlebar Horizon
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(w / 2 - 180, h - 80, 360, 40);

        // Grips
        ctx.fillStyle = '#334155';
        ctx.fillRect(w / 2 - 220, h - 90, 45, 25);
        ctx.fillRect(w / 2 + 175, h - 90, 45, 25);

        // Side Mirrors
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(w / 2 - 260, h - 140, 50, 35);
        ctx.fillRect(w / 2 + 210, h - 140, 50, 35);
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(w / 2 - 258, h - 138, 46, 31);
        ctx.strokeRect(w / 2 + 212, h - 138, 46, 31);

        ctx.restore();
    }

    setupGarageUI() {
        const grid = document.getElementById('garageBikesGrid');
        if (!grid) return;

        grid.innerHTML = BIKES.map(bike => {
            const isSelected = bike.id === this.selectedBikeId;
            return `
                <div class="col-6">
                    <div class="bike-select-card ${isSelected ? 'selected' : ''}" data-bike="${bike.id}">
                        <div class="fs-1 mb-1">${bike.category.split(' ')[0]}</div>
                        <h6 class="fw-bold text-white mb-0">${bike.name}</h6>
                        <span class="badge bg-dark border border-secondary text-warning very-small my-1">${bike.category}</span>
                        <div class="very-small text-white-50">Top: ${Math.floor(bike.maxSpeed * 5)} km/h</div>
                    </div>
                </div>
            `;
        }).join('');

        // Bike selection click
        grid.querySelectorAll('.bike-select-card').forEach(card => {
            card.addEventListener('click', () => {
                this.selectedBikeId = card.getAttribute('data-bike');
                localStorage.setItem('luckykit_bike_selected', this.selectedBikeId);
                this.setupGarageUI();
                this.updateGarageStats();
            });
        });

        // Color Dots
        document.querySelectorAll('.color-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
                dot.classList.add('active');
                this.selectedColor = dot.getAttribute('data-color');
                localStorage.setItem('luckykit_bike_color', this.selectedColor);
            });
        });

        // Upgrade Buttons
        document.querySelectorAll('.upgrade-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.getAttribute('data-upgrade');
                const cost = 150;
                const coins = storage.getState().coins;

                if (coins >= cost) {
                    storage.updateState(s => { s.coins -= cost; });
                    this.upgrades[type] = (this.upgrades[type] || 1) + 1;
                    localStorage.setItem('luckykit_bike_upgrades', JSON.stringify(this.upgrades));
                    this.updateGarageStats();
                    if (audioManager) audioManager.playLevelUp?.();
                } else {
                    alert("Not enough coins! Complete more parking missions to earn coins.");
                }
            });
        });

        this.updateGarageStats();
    }

    updateGarageStats() {
        const bike = this.getBikeData();
        const curBikeName = document.getElementById('currentBikeName');
        if (curBikeName) curBikeName.textContent = bike.name;

        const custTitle = document.getElementById('customizerBikeTitle');
        if (custTitle) custTitle.textContent = bike.name;

        const custDesc = document.getElementById('customizerBikeDesc');
        if (custDesc) custDesc.textContent = bike.desc;

        const gCoins = document.getElementById('garageCoins');
        if (gCoins) gCoins.textContent = storage.getState().coins;

        // Upgrade Levels Display
        const lvlEng = document.getElementById('lvlEngine');
        if (lvlEng) lvlEng.textContent = this.upgrades.engine;
        const lvlBrk = document.getElementById('lvlBrakes');
        if (lvlBrk) lvlBrk.textContent = this.upgrades.brakes;
        const lvlTyr = document.getElementById('lvlTyres');
        if (lvlTyr) lvlTyr.textContent = this.upgrades.tyres;
    }

    setupLevelSelectorUI() {
        const container = document.getElementById('levelGridContainer');
        if (!container) return;

        container.innerHTML = MISSIONS.map(m => {
            const isUnlocked = m.level <= this.unlockedLevels;
            const isActive = m.level === this.currentLevel;

            return `
                <div class="col-6 col-md-4">
                    <div class="level-badge-card ${isUnlocked ? 'unlocked' : 'opacity-50'} ${isActive ? 'active-level' : ''}" data-lvl="${m.level}">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <strong class="text-warning">LEVEL ${m.level}</strong>
                            <span>${isUnlocked ? '🔓' : '🔒'}</span>
                        </div>
                        <div class="fw-bold small text-white text-truncate">${m.title}</div>
                        <div class="very-small text-white-50">${m.weather}</div>
                    </div>
                </div>
            `;
        }).join('');

        container.querySelectorAll('.level-badge-card').forEach(card => {
            card.addEventListener('click', () => {
                const lvl = parseInt(card.getAttribute('data-lvl'));
                if (lvl <= this.unlockedLevels) {
                    this.loadMission(lvl);
                    const modalEl = document.getElementById('levelModal');
                    const modal = bootstrap.Modal.getInstance(modalEl);
                    if (modal) modal.hide();
                    this.start();
                }
            });
        });
    }

    openGarage() {
        this.updateGarageStats();
        const modal = new bootstrap.Modal(document.getElementById('garageModal'));
        modal.show();
    }

    openLevelSelector() {
        this.setupLevelSelectorUI();
        const modal = new bootstrap.Modal(document.getElementById('levelModal'));
        modal.show();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", () => {
        new MotoParkPro();
    });
} else {
    new MotoParkPro();
}
