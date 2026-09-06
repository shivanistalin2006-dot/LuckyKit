import { BaseGame } from './core/BaseGame.js?v=2.5';
import { gameManager } from './core/gameManager.js';
import { audioManager } from './audio/audioManager.js';
import { storage } from './core/storage.js';

// ========================================================
// 6 MOTORCYCLES CATALOGUE & KINEMATICS
// ========================================================
const BIKES = [
    {
        id: 'scooter',
        name: 'Cyber Scooter 110cc',
        category: '🛵 Scooter (Automatic)',
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
        isAutomatic: true,
        gearsCount: 1,
        desc: 'Twist-and-go automatic scooter. Perfect for city beginners.'
    },
    {
        id: 'street',
        name: 'Street Commuter 150cc',
        category: '🏍️ Commuter (5-Speed)',
        cost: 200,
        unlocked: true,
        maxSpeed: 15.0,      // ~75 km/h
        accel: 0.22,
        brakePower: 0.40,
        turnAgility: 0.048,
        maxLean: 0.36,
        weight: 135,
        width: 20,
        length: 50,
        color: '#ef4444',
        isAutomatic: false,
        gearsCount: 5,
        desc: 'Reliable 150cc single-cylinder commuter with crisp 5-speed manual gearbox.'
    },
    {
        id: 'naked',
        name: 'Streetfighter 250cc',
        category: '🏍️ Naked (6-Speed)',
        cost: 500,
        unlocked: false,
        maxSpeed: 19.0,      // ~95 km/h
        accel: 0.28,
        brakePower: 0.48,
        turnAgility: 0.052,
        maxLean: 0.48,
        weight: 155,
        width: 21,
        length: 52,
        color: '#22c55e',
        isAutomatic: false,
        gearsCount: 6,
        desc: 'Aggressive naked bike with wide handlebars and punchy mid-range torque.'
    },
    {
        id: 'cruiser',
        name: 'Royal Cruiser 350cc',
        category: '🏍️ Cruiser (5-Speed)',
        cost: 800,
        unlocked: false,
        maxSpeed: 17.0,      // ~85 km/h
        accel: 0.21,
        brakePower: 0.40,
        turnAgility: 0.036,
        maxLean: 0.30,
        weight: 195,
        width: 22,
        length: 56,
        color: '#eab308',
        isAutomatic: false,
        gearsCount: 5,
        desc: 'Heavy long-wheelbase cruiser with thunderous exhaust thumping sound.'
    },
    {
        id: 'adventure',
        name: 'Rally Adventure 450cc',
        category: '🏍️ Adventure (6-Speed)',
        cost: 1400,
        unlocked: false,
        maxSpeed: 22.0,      // ~110 km/h
        accel: 0.34,
        brakePower: 0.52,
        turnAgility: 0.046,
        maxLean: 0.44,
        weight: 175,
        width: 22,
        length: 54,
        color: '#f97316',
        isAutomatic: false,
        gearsCount: 6,
        desc: 'Dual-sport adventure machine with long suspension travel and all-terrain grip.'
    },
    {
        id: 'superbike',
        name: 'Hyper Superbike 1000cc',
        category: '🏍️ Hyper (6-Speed)',
        cost: 2500,
        unlocked: false,
        maxSpeed: 28.0,      // ~150 km/h
        accel: 0.44,
        brakePower: 0.65,
        turnAgility: 0.058,
        maxLean: 0.65,
        weight: 185,
        width: 22,
        length: 54,
        color: '#a855f7',
        isAutomatic: false,
        gearsCount: 6,
        desc: 'Track-ready inline-4 hyperbike screaming up to 14,000 RPM.'
    }
];

// Gear transmission ratios (relative top speeds per gear)
const GEAR_RATIOS = [
    0,      // Neutral
    0.28,   // 1st Gear (~30 km/h)
    0.46,   // 2nd Gear (~60 km/h)
    0.65,   // 3rd Gear (~90 km/h)
    0.80,   // 4th Gear (~115 km/h)
    0.92,   // 5th Gear (~135 km/h)
    1.00    // 6th Gear (~150 km/h)
];

// ========================================================
// 10 OPEN-CITY PARKING MISSIONS & ENVIRONMENTS
// ========================================================
const MISSIONS = [
    {
        level: 1,
        title: 'Residential Driveway',
        type: 'Straight Bay',
        environment: 'Residential',
        weather: '☀️ Dry Asphalt',
        time: 'Day 10:00',
        friction: 1.0,
        timeLimit: 50,
        spawn: { x: 100, y: 440, angle: 0 },
        slot: { x: 800, y: 140, width: 52, length: 90, angle: -Math.PI / 2, type: 'straight' },
        desc: 'Ride down Maple Street, avoid the parked sedan and garbage bins, and straight-park inside the driveway.',
        obstacles: [
            { type: 'building', x: 250, y: 80, width: 220, height: 100, color: '#334155' },
            { type: 'building', x: 550, y: 80, width: 200, height: 100, color: '#475569' },
            { type: 'car', x: 420, y: 440, width: 55, length: 105, angle: 0, color: '#3b82f6' },
            { type: 'cone', x: 680, y: 220, radius: 10 },
            { type: 'cone', x: 680, y: 100, radius: 10 }
        ],
        traffic: []
    },
    {
        level: 2,
        title: 'Shopping Mall 45° Slanted Bay',
        type: 'Angle 45° Bay',
        environment: 'Shopping Mall',
        weather: '☀️ Dry Concrete',
        time: 'Day 14:00',
        friction: 0.95,
        timeLimit: 45,
        spawn: { x: 100, y: 100, angle: Math.PI / 2 },
        slot: { x: 760, y: 420, width: 52, length: 90, angle: Math.PI / 4, type: 'angle' },
        desc: 'Navigate the busy mall parking lot and angle-park at 45 degrees between safety pillars.',
        obstacles: [
            { type: 'building', x: 300, y: 180, width: 260, height: 80, color: '#1e293b' },
            { type: 'car', x: 380, y: 340, width: 55, length: 105, angle: Math.PI / 2, color: '#ef4444' },
            { type: 'car', x: 550, y: 340, width: 55, length: 105, angle: Math.PI / 2, color: '#eab308' },
            { type: 'pillar', x: 260, y: 420, radius: 18 },
            { type: 'pillar', x: 660, y: 420, radius: 18 }
        ],
        traffic: []
    },
    {
        level: 3,
        title: 'Office Basement Reverse Bay',
        type: 'Reverse Parallel',
        environment: 'Office Basement',
        weather: '💡 Indoor Concrete',
        time: 'Night 19:00',
        friction: 0.9,
        timeLimit: 50,
        spawn: { x: 100, y: 280, angle: 0 },
        slot: { x: 560, y: 280, width: 55, length: 95, angle: 0, type: 'reverse' },
        desc: 'Shift to Neutral (N) or 1st, maneuver past the luxury sedans, and reverse cleanly into the tight bay.',
        obstacles: [
            { type: 'car', x: 380, y: 280, width: 55, length: 105, angle: 0, color: '#64748b' },
            { type: 'car', x: 740, y: 280, width: 55, length: 105, angle: 0, color: '#0f172a' },
            { type: 'barrier', x: 560, y: 160, width: 260, height: 18 }
        ],
        traffic: []
    },
    {
        level: 4,
        title: 'City Street with Traffic & Pedestrians',
        type: 'Straight Curb',
        environment: 'City Center',
        weather: '☀️ Urban Pavement',
        time: 'Day 16:30',
        friction: 1.0,
        timeLimit: 60,
        spawn: { x: 80, y: 460, angle: 0 },
        slot: { x: 840, y: 120, width: 52, length: 90, angle: -Math.PI / 2, type: 'straight' },
        desc: 'City street in full motion! Watch for moving cars and pedestrians before parking by the cafe.',
        obstacles: [
            { type: 'building', x: 320, y: 80, width: 340, height: 90, color: '#1e293b' },
            { type: 'car', x: 680, y: 120, width: 55, length: 100, angle: -Math.PI / 2, color: '#22c55e' }
        ],
        traffic: [
            { type: 'car', x: 150, y: 280, vx: 2.2, vy: 0, width: 55, length: 105, minX: 100, maxX: 850, color: '#f97316' },
            { type: 'pedestrian', x: 480, y: 440, vx: 0, vy: -1.0, radius: 10, minY: 160, maxY: 480 }
        ]
    },
    {
        level: 5,
        title: 'Hospital Emergency Rush',
        type: 'Emergency Slot',
        environment: 'Hospital',
        weather: '☀️ High-Speed Zone',
        time: 'Day 11:00',
        friction: 1.0,
        timeLimit: 30, // Fast rush!
        spawn: { x: 100, y: 120, angle: 0 },
        slot: { x: 820, y: 420, width: 55, length: 95, angle: Math.PI / 2, type: 'straight' },
        desc: '30-Second emergency rush! Navigate the speed bumps and park between ambulances.',
        obstacles: [
            { type: 'ambulance', x: 660, y: 420, width: 64, length: 120, angle: Math.PI / 2, color: '#ffffff' },
            { type: 'speedbreaker', x: 420, y: 270, width: 30, height: 180 },
            { type: 'cone', x: 280, y: 150, radius: 10 },
            { type: 'cone', x: 520, y: 360, radius: 10 }
        ],
        traffic: []
    },
    {
        level: 6,
        title: 'Rainy Mall Underground (Wet Grip)',
        type: 'Wet Bay',
        environment: 'Multi-Floor Mall',
        weather: '🌧️ Heavy Rain / Wet',
        time: 'Night 21:00',
        friction: 0.60, // Slippery!
        timeLimit: 60,
        spawn: { x: 120, y: 440, angle: -Math.PI / 4 },
        slot: { x: 760, y: 140, width: 52, length: 90, angle: -Math.PI / 2, type: 'straight' },
        desc: 'Heavy rain on wet asphalt! Drastically reduced tire grip. Brake early and avoid excessive lean angles.',
        obstacles: [
            { type: 'pillar', x: 380, y: 240, radius: 22 },
            { type: 'pillar', x: 580, y: 240, radius: 22 },
            { type: 'car', x: 580, y: 140, width: 55, length: 100, angle: -Math.PI / 2, color: '#0284c7' },
            { type: 'puddle', x: 320, y: 360, width: 100, height: 70 }
        ],
        traffic: []
    },
    {
        level: 7,
        title: 'College Campus Multi-Bike Slot',
        type: 'Multi-Bike Bay',
        environment: 'College Campus',
        weather: '☀️ Dry Asphalt',
        time: 'Day 13:00',
        friction: 1.0,
        timeLimit: 50,
        spawn: { x: 80, y: 100, angle: 0 },
        slot: { x: 840, y: 460, width: 44, length: 80, angle: 0, type: 'tight' },
        desc: 'Slalom past speed breakers and park into a narrow spot between two parked motorcycles.',
        obstacles: [
            { type: 'parked_bike', x: 840, y: 380, width: 20, length: 50, angle: 0, color: '#ef4444' },
            { type: 'parked_bike', x: 840, y: 530, width: 20, length: 50, angle: 0, color: '#3b82f6' },
            { type: 'speedbreaker', x: 280, y: 200, width: 25, height: 140 },
            { type: 'speedbreaker', x: 580, y: 320, width: 25, height: 140 },
            { type: 'cone', x: 420, y: 260, radius: 10 }
        ],
        traffic: []
    },
    {
        level: 8,
        title: 'Hotel Valet Multi-Vehicle Courtyard',
        type: 'Angle 60° Bay',
        environment: 'Luxury Hotel',
        weather: '🌅 Sunset Glow',
        time: 'Evening 18:00',
        friction: 0.95,
        timeLimit: 55,
        spawn: { x: 100, y: 460, angle: -Math.PI / 2 },
        slot: { x: 520, y: 120, width: 54, length: 90, angle: Math.PI / 3, type: 'angle' },
        desc: 'Delicate valet parking among exotic sports cars and fountain curbs in the sunset courtyard.',
        obstacles: [
            { type: 'car', x: 360, y: 120, width: 55, length: 105, angle: Math.PI / 3, color: '#e11d48' },
            { type: 'car', x: 680, y: 120, width: 55, length: 105, angle: Math.PI / 3, color: '#facc15' },
            { type: 'fountain', x: 500, y: 330, radius: 48 }
        ],
        traffic: [
            { type: 'car', x: 820, y: 460, vx: -1.8, vy: 0, width: 55, length: 105, minX: 200, maxX: 880, color: '#0ea5e9' }
        ]
    },
    {
        level: 9,
        title: 'Night Neon Highway Strip',
        type: 'Night Bay',
        environment: 'City Center',
        weather: '🌙 Night Lights',
        time: 'Night 23:00',
        friction: 0.9,
        timeLimit: 60,
        spawn: { x: 100, y: 120, angle: 0 },
        slot: { x: 840, y: 440, width: 55, length: 95, angle: Math.PI / 2, type: 'straight' },
        desc: 'City traffic in full motion! Navigate past auto-rickshaws, buses, and neon streetlights with headlights ON.',
        obstacles: [
            { type: 'barrier', x: 460, y: 280, width: 380, height: 18 },
            { type: 'car', x: 700, y: 440, width: 55, length: 100, angle: Math.PI / 2, color: '#6366f1' }
        ],
        traffic: [
            { type: 'autorickshaw', x: 200, y: 400, vx: 2.0, vy: 0, width: 45, length: 75, minX: 100, maxX: 720, color: '#eab308' },
            { type: 'pedestrian', x: 560, y: 100, vx: 0, vy: 1.2, radius: 10, minY: 80, maxY: 460 }
        ]
    },
    {
        level: 10,
        title: 'Master Police License Exam',
        type: 'Master Tight Bay',
        environment: 'Driving Academy',
        weather: '🌧️ Heavy Rain / Wet Night',
        time: 'Night 00:00',
        friction: 0.58, // Extreme wet!
        timeLimit: 75,
        spawn: { x: 100, y: 460, angle: 0 },
        slot: { x: 860, y: 120, width: 48, length: 85, angle: -Math.PI / 2, type: 'reverse' },
        desc: 'The Ultimate Motorcycle Exam: Wet roads, moving traffic, zero-contact penalty, and precision reverse bay parking!',
        obstacles: [
            { type: 'car', x: 720, y: 120, width: 55, length: 100, angle: -Math.PI / 2, color: '#ef4444' },
            { type: 'speedbreaker', x: 360, y: 370, width: 25, height: 140 },
            { type: 'pillar', x: 500, y: 240, radius: 20 },
            { type: 'pillar', x: 660, y: 350, radius: 20 }
        ],
        traffic: [
            { type: 'car', x: 200, y: 220, vx: 2.4, vy: 0, width: 55, length: 105, minX: 100, maxX: 820, color: '#f59e0b' },
            { type: 'pedestrian', x: 440, y: 460, vx: 0, vy: -1.2, radius: 10, minY: 120, maxY: 480 }
        ]
    }
];

class MotoParkPro extends BaseGame {
    constructor() {
        super("bike");

        this.canvas = document.getElementById('bikeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.minimapCanvas = document.getElementById('minimapCanvas');
        this.mmCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;

        // Player & Career State
        this.unlockedLevels = parseInt(localStorage.getItem('luckykit_bike_unlocked') || '1');
        this.currentLevel = 1;
        this.selectedBikeId = localStorage.getItem('luckykit_bike_selected') || 'street';
        this.selectedColor = localStorage.getItem('luckykit_bike_color') || '#ef4444';
        this.isManualTransmission = localStorage.getItem('luckykit_bike_manual') !== 'false';
        
        // Upgrades
        this.upgrades = JSON.parse(localStorage.getItem('luckykit_bike_upgrades') || '{"engine":1,"brakes":1,"tyres":1}');

        // Camera mode: 0=Chase, 1=1st Person Cockpit, 2=Helmet Cam, 3=Rear View, 4=Top Tactical
        this.cameraMode = 0;
        this.parkingAssist = true;
        this.headlightOn = true;
        this.blinkerState = 0; // 0=Off, 1=Left, 2=Right
        this.blinkerFlash = false;
        this.blinkerTimer = 0;

        // HUD Elements
        this.hudSpeed = document.getElementById('hudSpeed');
        this.hudGear = document.getElementById('hudGear');
        this.hudGearBox = document.getElementById('hudGearBox');
        this.hudRpmText = document.getElementById('hudRpmText');
        this.hudRpmBar = document.getElementById('hudRpmBar');
        this.hudClutchText = document.getElementById('hudClutchText');
        this.hudStandBadge = document.getElementById('hudStandBadge');
        this.hudBlinkerLeft = document.getElementById('hudBlinkerLeft');
        this.hudBlinkerRight = document.getElementById('hudBlinkerRight');
        this.hudHeadlightIcon = document.getElementById('hudHeadlightIcon');
        this.missionTimerEl = document.getElementById('missionTimer');
        this.damageProgressBar = document.getElementById('damageProgressBar');
        this.damageText = document.getElementById('damageText');
        this.camNameText = document.getElementById('camNameText');
        this.assistText = document.getElementById('assistText');
        this.lightStatusText = document.getElementById('lightStatusText');
        this.transModeText = document.getElementById('transModeText');
        this.stalledAlert = document.getElementById('stalledAlert');
        this.envBadge = document.getElementById('envBadge');
        this.timeBadge = document.getElementById('timeBadge');

        // Parking Radar HUD
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

        // Input States
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            clutch: false,
            rearBrake: false,
            gearUp: false,
            gearDown: false
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

        // Update Headers & Sidebar UI
        const curLvlHeader = document.getElementById('currentLevelHeader');
        if (curLvlHeader) curLvlHeader.textContent = `${this.currentLevel}/${MISSIONS.length}`;
        
        const lvlNumText = document.getElementById('levelNumberText');
        if (lvlNumText) lvlNumText.textContent = `Level ${this.currentLevel}`;
        
        const lvlTitleText = document.getElementById('levelTitleText');
        if (lvlTitleText) lvlTitleText.textContent = this.missionData.title;

        const sbBadge = document.getElementById('sidebarLevelBadge');
        if (sbBadge) sbBadge.textContent = `LEVEL ${this.currentLevel}`;

        const sbType = document.getElementById('sidebarTypeBadge');
        if (sbType) sbType.textContent = this.missionData.type.toUpperCase();
        
        const sbTitle = document.getElementById('sidebarMissionTitle');
        if (sbTitle) sbTitle.textContent = this.missionData.title;
        
        const sbDesc = document.getElementById('sidebarMissionDesc');
        if (sbDesc) sbDesc.textContent = this.missionData.desc;

        const sbTech = document.getElementById('sidebarTech');
        if (sbTech) sbTech.textContent = this.missionData.type;
        
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
            rpm: 1200,
            currentGear: bike.isAutomatic ? 1 : 0, // 0 = Neutral, 1..6
            clutchEngaged: false,
            isStalled: false,
            kickstandDeployed: false,
            angle: spawn.angle,
            steerAngle: 0,
            leanAngle: 0,
            damage: 0,
            width: bike.width,
            length: bike.length,
            isGrounded: true,
            isParked: false,
            parkHoldTime: 0
        };

        this.missionTime = 0;
        this.missionCompleted = false;
        this.missionFailed = false;

        this.traffic = JSON.parse(JSON.stringify(this.missionData.traffic || []));
        this.obstacles = JSON.parse(JSON.stringify(this.missionData.obstacles || []));

        this.skidmarks = [];
        this.particles = [];

        if (this.resultOverlay) this.resultOverlay.classList.add('d-none');
        if (this.stalledAlert) this.stalledAlert.classList.add('d-none');
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
            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                this.keys.clutch = true;
            }
            if (e.code === 'KeyE') this.shiftGear(1);  // Gear Up
            if (e.code === 'KeyQ') this.shiftGear(-1); // Gear Down
            if (e.code === 'Space') { e.preventDefault(); this.keys.rearBrake = true; }
            if (e.code === 'KeyC') this.cycleCamera();
            if (e.code === 'KeyP') this.toggleAssist();
            if (e.code === 'KeyL') this.toggleHeadlight();
            if (e.code === 'KeyI') this.toggleBlinker();
            if (e.code === 'KeyK') this.toggleKickstand();
            if (e.code === 'KeyH') this.honkHorn();
            if (e.code === 'KeyR') this.loadMission(this.currentLevel);
        });

        window.addEventListener('keyup', (e) => {
            if (['KeyW', 'ArrowUp'].includes(e.code)) this.keys.forward = false;
            if (['KeyS', 'ArrowDown'].includes(e.code)) this.keys.backward = false;
            if (['KeyA', 'ArrowLeft'].includes(e.code)) this.keys.left = false;
            if (['KeyD', 'ArrowRight'].includes(e.code)) this.keys.right = false;
            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                this.keys.clutch = false;
                this.handleClutchRelease();
            }
            if (e.code === 'Space') this.keys.rearBrake = false;
        });

        // Mobile Buttons
        const bindTouch = (id, key, onRelease) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            const press = (e) => { e.preventDefault(); this.keys[key] = true; };
            const release = (e) => {
                e.preventDefault();
                this.keys[key] = false;
                if (onRelease) onRelease();
            };
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
        bindTouch('btnClutch', 'clutch', () => this.handleClutchRelease());

        document.getElementById('btnGearUp')?.addEventListener('click', () => this.shiftGear(1));
        document.getElementById('btnGearDown')?.addEventListener('click', () => this.shiftGear(-1));
        document.getElementById('btnKickstand')?.addEventListener('click', () => this.toggleKickstand());
        document.getElementById('btnBlinkerLeft')?.addEventListener('click', () => this.setBlinker(1));
        document.getElementById('btnBlinkerRight')?.addEventListener('click', () => this.setBlinker(2));

        // Mode and HUD Toggles
        document.getElementById('transmissionToggleBtn')?.addEventListener('click', () => this.toggleTransmissionMode());
        document.getElementById('camToggleBtn')?.addEventListener('click', () => this.cycleCamera());
        document.getElementById('assistToggleBtn')?.addEventListener('click', () => this.toggleAssist());
        document.getElementById('headlightToggleBtn')?.addEventListener('click', () => this.toggleHeadlight());

        // Header & Modal Actions
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

        document.getElementById('garageBtn')?.addEventListener('click', () => this.openGarage());
        document.getElementById('sidebarGarageBtn')?.addEventListener('click', () => this.openGarage());
        document.getElementById('levelSelectBtn')?.addEventListener('click', () => this.openLevelSelector());
    }

    toggleTransmissionMode() {
        this.isManualTransmission = !this.isManualTransmission;
        localStorage.setItem('luckykit_bike_manual', this.isManualTransmission.toString());
        if (this.transModeText) {
            this.transModeText.textContent = this.isManualTransmission ? 'MANUAL' : 'AUTOMATIC';
            this.transModeText.className = this.isManualTransmission ? 'text-warning' : 'text-info';
        }
        if (audioManager) audioManager.playClick?.();
    }

    shiftGear(direction) {
        if (!this.isRunning || this.player.isStalled) return;
        const bike = this.getBikeData();
        const p = this.player;

        if (bike.isAutomatic || !this.isManualTransmission) {
            // Automatic mode shifts automatically
            return;
        }

        // Motorcycle Sequential Gearbox: 0 (N), 1, 2, 3, 4, 5, 6
        if (direction > 0) {
            // Shift Up
            if (p.currentGear === 0) p.currentGear = 1;
            else if (p.currentGear < bike.gearsCount) p.currentGear++;
        } else {
            // Shift Down
            if (p.currentGear === 1) p.currentGear = 0; // Down to Neutral
            else if (p.currentGear > 0) p.currentGear--;
        }

        if (audioManager) audioManager.playTone(320, 'square', 0.08, 0.3); // Gear click
    }

    handleClutchRelease() {
        const p = this.player;
        const bike = this.getBikeData();

        if (bike.isAutomatic || !this.isManualTransmission) return;

        // Stalling condition: In Gear 1/2, speed = 0, no throttle, and clutch released abruptly
        if (p.currentGear > 0 && Math.abs(p.speed) < 0.5 && !this.keys.forward) {
            p.isStalled = true;
            p.rpm = 0;
            if (this.stalledAlert) this.stalledAlert.classList.remove('d-none');
            if (audioManager) audioManager.playLose?.();
        } else if (p.isStalled && p.currentGear === 0) {
            // Restarted engine in Neutral
            p.isStalled = false;
            p.rpm = 1200;
            if (this.stalledAlert) this.stalledAlert.classList.add('d-none');
            if (audioManager) audioManager.playTone(400, 'sine', 0.15, 0.3);
        }
    }

    cycleCamera() {
        this.cameraMode = (this.cameraMode + 1) % 5;
        const names = ['Chase Cam', 'Cockpit 1st', 'Helmet Cam', 'Rear Cam', 'Tactical Cam'];
        if (this.camNameText) this.camNameText.textContent = names[this.cameraMode];
        if (audioManager) audioManager.playClick?.();
    }

    toggleHeadlight() {
        this.headlightOn = !this.headlightOn;
        if (this.lightStatusText) this.lightStatusText.textContent = this.headlightOn ? 'ON' : 'OFF';
        if (this.hudHeadlightIcon) this.hudHeadlightIcon.style.opacity = this.headlightOn ? '1' : '0.2';
        if (audioManager) audioManager.playClick?.();
    }

    toggleBlinker() {
        this.blinkerState = (this.blinkerState + 1) % 3;
        if (audioManager) audioManager.playClick?.();
    }

    setBlinker(state) {
        this.blinkerState = this.blinkerState === state ? 0 : state;
        if (audioManager) audioManager.playClick?.();
    }

    toggleKickstand() {
        this.player.kickstandDeployed = !this.player.kickstandDeployed;
        if (this.player.kickstandDeployed && Math.abs(this.player.speed) > 2) {
            // Dropping stand at speed causes instant scraping brake & crash!
            this.handleCrash({ type: 'stand_drop' });
        }
        if (this.hudStandBadge) {
            this.hudStandBadge.textContent = this.player.kickstandDeployed ? '🦵 STAND DOWN' : '🦵 STAND UP';
            this.hudStandBadge.className = this.player.kickstandDeployed ? 'badge bg-warning text-dark' : 'badge bg-secondary text-white';
        }
        if (audioManager) audioManager.playTone(200, 'triangle', 0.1, 0.4);
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
        this.particles.push({
            x: this.player.x + Math.cos(this.player.angle) * 30,
            y: this.player.y + Math.sin(this.player.angle) * 30,
            radius: 10,
            alpha: 1,
            color: '#eab308'
        });
    }

    gameLoop(time) {
        if (this.isRunning && !this.isPaused) {
            const dt = Math.min(32, time - (this.lastTime || time));
            this.lastTime = time;

            this.updateBlinkers(dt);
            this.updatePhysics(dt);
            this.updateTraffic(dt);
            this.updateParkingEvaluation(dt);
            this.render();
            this.renderMinimap();
        }

        if (this.isRunning) {
            this.loopId = requestAnimationFrame((t) => this.gameLoop(t));
        }
    }

    updateBlinkers(dt) {
        if (this.blinkerState > 0) {
            this.blinkerTimer += dt;
            if (this.blinkerTimer >= 400) {
                this.blinkerTimer = 0;
                this.blinkerFlash = !this.blinkerFlash;
            }
        } else {
            this.blinkerFlash = false;
        }

        if (this.hudBlinkerLeft) {
            this.hudBlinkerLeft.classList.toggle('blinking', this.blinkerState === 1 && this.blinkerFlash);
        }
        if (this.hudBlinkerRight) {
            this.hudBlinkerRight.classList.toggle('blinking', this.blinkerState === 2 && this.blinkerFlash);
        }
    }

    updatePhysics(dt) {
        const timeFactor = dt / 16.66;
        const bike = this.getBikeData();
        const p = this.player;
        const surfaceGrip = (this.missionData.friction || 1.0) * bike.gripBonus;

        this.missionTime += (dt / 1000);

        // Handle Automatic Gear Shifting
        if (bike.isAutomatic || !this.isManualTransmission) {
            if (p.speed > 18) p.currentGear = 5;
            else if (p.speed > 13) p.currentGear = 4;
            else if (p.speed > 8) p.currentGear = 3;
            else if (p.speed > 4) p.currentGear = 2;
            else if (p.speed > 0.5) p.currentGear = 1;
            else p.currentGear = 0;
        }

        // Calculate Target RPM & Max Speed for current gear
        const currentGearRatio = GEAR_RATIOS[p.currentGear] || 0;
        const gearMaxSpeed = bike.maxSpeed * (currentGearRatio || 0.1);

        // Steering dynamics
        const targetSteer = (this.keys.left ? -1 : 0) + (this.keys.right ? 1 : 0);
        const steerSpeed = bike.turnAgility * surfaceGrip;
        p.steerAngle += (targetSteer * 0.65 - p.steerAngle) * steerSpeed * timeFactor;

        // Kickstand Drag
        if (p.kickstandDeployed) {
            p.speed *= Math.pow(0.80, timeFactor);
        }

        // Throttle, Acceleration & RPM
        if (this.keys.forward && !p.isStalled && !p.kickstandDeployed) {
            if (p.currentGear === 0 || this.keys.clutch) {
                // Neutral or Clutch In: Free Engine Revving up to 13,000 RPM!
                p.rpm += 450 * timeFactor;
                if (p.rpm > 13500) p.rpm = 13500;
            } else {
                // In Gear: Acceleration applied
                if (p.speed < gearMaxSpeed) {
                    p.speed += bike.accel * surfaceGrip * timeFactor;
                }
                p.rpm = 1500 + (p.speed / bike.maxSpeed) * 10500;
            }
        } else {
            // Throttle released: RPM drops to idle
            p.rpm += (1200 - p.rpm) * 0.12 * timeFactor;
            if (p.rpm < 1200) p.rpm = 1200;

            // Rolling friction & engine braking
            const engineBrake = p.currentGear > 0 && !this.keys.clutch ? 0.985 : 0.995;
            p.speed *= Math.pow(engineBrake, timeFactor);
            if (Math.abs(p.speed) < 0.05) p.speed = 0;
        }

        // Front Brake (`S` / `Down`)
        if (this.keys.backward) {
            if (p.speed > 0.3) {
                p.speed -= bike.brakePower * surfaceGrip * timeFactor;
                if (p.speed < 0) p.speed = 0;
            } else if (p.currentGear === 0 || this.keys.clutch) {
                // In Neutral / Clutch In: Push motorcycle backward with feet (slow reverse ~2.5 km/h)
                p.speed -= 0.06 * timeFactor;
                if (p.speed < -0.6) p.speed = -0.6;
            }
        }

        // Rear / Emergency Brake (`Space`)
        if (this.keys.rearBrake) {
            p.speed *= Math.pow(0.82, timeFactor);
            if (Math.abs(p.speed) > 2) {
                this.skidmarks.push({
                    x: p.x - Math.cos(p.angle) * (p.length / 2),
                    y: p.y - Math.sin(p.angle) * (p.length / 2),
                    alpha: 0.65
                });
            }
        }

        // Kinematic Turning & Physics-Based Lean Angle
        if (Math.abs(p.speed) > 0.1) {
            const angularVel = (p.speed / (p.length * 0.85)) * Math.sin(p.steerAngle);
            p.angle += angularVel * timeFactor;

            // Lean Angle: proportional to (v^2 / R)
            const targetLean = (p.speed / bike.maxSpeed) * (p.steerAngle / 0.65) * bike.maxLean;
            p.leanAngle += (targetLean - p.leanAngle) * 0.15 * timeFactor;

            // Low-Side Crash Check: If lean exceeds limit on wet surface -> crash!
            if (Math.abs(p.leanAngle) > bike.maxLean * 1.15 && surfaceGrip < 0.75) {
                this.handleCrash({ type: 'low_side_slide' });
            }
        } else {
            p.leanAngle *= 0.8;
        }

        // Position Updates
        p.x += Math.cos(p.angle) * p.speed * timeFactor;
        p.y += Math.sin(p.angle) * p.speed * timeFactor;

        // Boundaries
        p.x = Math.max(30, Math.min(970, p.x));
        p.y = Math.max(30, Math.min(530, p.y));

        // Collisions
        this.checkCollisions();

        // Skidmark decay
        for (let i = this.skidmarks.length - 1; i >= 0; i--) {
            this.skidmarks[i].alpha -= 0.0006 * timeFactor;
            if (this.skidmarks[i].alpha <= 0) this.skidmarks.splice(i, 1);
        }

        // Particle decay
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const pt = this.particles[i];
            pt.radius += 1.2 * timeFactor;
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

            if (t.minX !== undefined && (t.x <= t.minX || t.x >= t.maxX)) t.vx *= -1;
            if (t.minY !== undefined && (t.y <= t.minY || t.y >= t.maxY)) t.vy *= -1;
        });
    }

    checkCollisions() {
        const p = this.player;

        const checkHit = (obs) => {
            if (obs.radius) {
                const dist = Math.hypot(p.x - obs.x, p.y - obs.y);
                return dist < (obs.radius + p.width / 2);
            } else {
                const dist = Math.hypot(p.x - obs.x, p.y - obs.y);
                return dist < ((obs.width || 50) / 2 + p.width / 2 + 10);
            }
        };

        this.obstacles.forEach(obs => {
            if (obs.type === 'speedbreaker' || obs.type === 'puddle') {
                if (Math.abs(p.x - obs.x) < 30 && Math.abs(p.y - obs.y) < 70) {
                    if (obs.type === 'speedbreaker' && Math.abs(p.speed) > 6) {
                        p.speed *= 0.82;
                    }
                }
                return;
            }
            if (checkHit(obs)) this.handleCrash(obs);
        });

        this.traffic.forEach(t => {
            if (checkHit(t)) this.handleCrash(t);
        });
    }

    handleCrash(obstacle) {
        const p = this.player;
        const impactForce = Math.abs(p.speed);

        p.speed = -p.speed * 0.35;
        p.damage += Math.min(40, Math.floor(impactForce * 5.0) + 8);

        if (audioManager) audioManager.playLose?.();

        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: p.x,
                y: p.y,
                radius: 4,
                alpha: 1,
                color: '#ef4444'
            });
        }

        if (p.damage >= 100) {
            this.handleMissionFailure("CRITICAL DAMAGE! Motorcycle destroyed. Repair required.");
        }
    }

    updateParkingEvaluation(dt) {
        if (this.missionCompleted || this.missionFailed) return;

        const p = this.player;
        const slot = this.missionData.slot;

        // Position Fit %
        const dist = Math.hypot(p.x - slot.x, p.y - slot.y);
        const maxTolDist = 36;
        const posFit = Math.max(0, 100 - Math.floor((dist / maxTolDist) * 100));

        // Angle Fit %
        let angleDiff = Math.abs(p.angle - slot.angle) % (Math.PI * 2);
        if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;
        const minAngleDiff = Math.min(angleDiff, Math.abs(angleDiff - Math.PI));
        const angleFit = Math.max(0, 100 - Math.floor((minAngleDiff / 0.32) * 100));

        const accuracy = Math.floor((posFit * 0.6) + (angleFit * 0.4));

        if (this.alignFitText) this.alignFitText.textContent = `${posFit}%`;
        if (this.alignAngleText) this.alignAngleText.textContent = `${(minAngleDiff * 57.3).toFixed(1)}°`;

        const isInsideBay = dist <= maxTolDist && minAngleDiff <= 0.28;

        if (isInsideBay) {
            if (this.parkingStatusCard) this.parkingStatusCard.classList.add('active-zone');
            
            if (Math.abs(p.speed) < 0.15) {
                p.parkHoldTime += (dt / 1000);
                if (this.alignHoldText) this.alignHoldText.textContent = `${p.parkHoldTime.toFixed(1)}s / 1.5s`;
                if (this.parkingStatusTitle) this.parkingStatusTitle.textContent = "STOPPED • DEPLOY STAND";
                if (this.parkingStatusSubtitle) this.parkingStatusSubtitle.textContent = "Hold still to turn off ignition";

                if (p.parkHoldTime >= 1.5) {
                    this.handleMissionSuccess(accuracy);
                }
            } else {
                p.parkHoldTime = 0;
                if (this.alignHoldText) this.alignHoldText.textContent = `0.0s`;
                if (this.parkingStatusTitle) this.parkingStatusTitle.textContent = "ALIGNED • BRAKE TO STOP";
                if (this.parkingStatusSubtitle) this.parkingStatusSubtitle.textContent = "Come to full stop inside bay";
            }
        } else {
            p.parkHoldTime = 0;
            if (this.parkingStatusCard) this.parkingStatusCard.classList.remove('active-zone');
            if (this.alignHoldText) this.alignHoldText.textContent = `0.0s`;
            if (this.parkingStatusTitle) this.parkingStatusTitle.textContent = "APPROACH SLOT";
            if (this.parkingStatusSubtitle) this.parkingStatusSubtitle.textContent = "Align inside yellow bay lines";
        }

        if (this.missionTime >= this.missionData.timeLimit) {
            this.handleMissionFailure("TIME EXPIRED! Parking challenge failed.");
        }
    }

    handleMissionSuccess(accuracy) {
        this.missionCompleted = true;
        this.isRunning = false;

        const timeTaken = this.missionTime.toFixed(1);
        const damageTaken = this.player.damage;

        let stars = '⭐⭐⭐';
        if (accuracy >= 92 && damageTaken === 0 && this.missionTime <= this.missionData.timeLimit * 0.7) {
            stars = '⭐⭐⭐⭐⭐';
        } else if (accuracy >= 80 && damageTaken < 20) {
            stars = '⭐⭐⭐⭐';
        }

        const coinsEarned = 150 + (accuracy * 1.5) + (damageTaken === 0 ? 50 : 0);
        storage.updateState(s => {
            s.coins += Math.floor(coinsEarned);
            s.xp += 200;
        });

        if (this.currentLevel >= this.unlockedLevels && this.currentLevel < MISSIONS.length) {
            this.unlockedLevels = this.currentLevel + 1;
            localStorage.setItem('luckykit_bike_unlocked', this.unlockedLevels.toString());
        }

        if (this.resultTitle) this.resultTitle.textContent = "PERFECT PARKING!";
        if (this.resultStars) this.resultStars.textContent = stars;
        if (this.resultMessage) this.resultMessage.textContent = "Engine stopped • Kickstand deployed with precision alignment!";
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

        const gearLabel = this.player.currentGear === 0 ? 'N' : this.player.currentGear.toString();
        if (this.hudGear) {
            this.hudGear.textContent = gearLabel;
            this.hudGear.className = this.player.currentGear === 0 ? 'gear-indicator fw-black text-success' : 'gear-indicator fw-black text-warning';
        }

        if (this.hudRpmText) this.hudRpmText.textContent = Math.floor(this.player.rpm);
        if (this.hudRpmBar) {
            const rpmPct = Math.min(100, (this.player.rpm / 13500) * 100);
            this.hudRpmBar.style.width = `${rpmPct}%`;
            this.hudRpmBar.className = rpmPct > 80 ? 'progress-bar bg-danger' : 'progress-bar bg-info';
        }

        if (this.hudClutchText) {
            this.hudClutchText.textContent = this.keys.clutch ? 'IN (100%)' : 'OUT (0%)';
            this.hudClutchText.className = this.keys.clutch ? 'text-warning' : 'text-info';
        }

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

        // Dynamic Cameras
        if (this.cameraMode === 0) {
            // Chase Cam: Damped following with Auto-Zoom when parking!
            const isNearSlot = Math.hypot(p.x - this.missionData.slot.x, p.y - this.missionData.slot.y) < 140;
            const zoom = isNearSlot ? 1.45 : 1.15;

            ctx.translate(w / 2, h / 2);
            ctx.scale(zoom, zoom);
            ctx.translate(-p.x, -p.y);
        } else if (this.cameraMode === 1) {
            // Cockpit 1st Person
            ctx.translate(w / 2, h / 2 + 120);
            ctx.rotate(-p.angle - Math.PI / 2);
            ctx.translate(-p.x, -p.y);
        } else if (this.cameraMode === 2) {
            // Helmet Cam
            ctx.translate(w / 2, h / 2 + 100);
            ctx.rotate(-p.angle - Math.PI / 2 - (p.leanAngle * 0.3));
            ctx.translate(-p.x, -p.y);
        } else if (this.cameraMode === 3) {
            // Rear View
            ctx.translate(w / 2, h / 2);
            ctx.rotate(-p.angle + Math.PI / 2);
            ctx.translate(-p.x, -p.y);
        }

        // 1. Draw World & Roads
        this.drawEnvironment(ctx);

        // 2. Skidmarks
        this.skidmarks.forEach(sm => {
            ctx.fillStyle = `rgba(15, 15, 20, ${sm.alpha})`;
            ctx.beginPath();
            ctx.arc(sm.x, sm.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // 3. Parking Slot
        this.drawParkingSlot(ctx);

        // 4. Obstacles & Moving Traffic
        this.drawObstacles(ctx);
        this.drawTraffic(ctx);

        // 5. Headlight Projector Beam
        if (this.headlightOn) {
            this.drawHeadlightBeam(ctx);
        }

        // 6. Motorcycle & Rider Model
        this.drawBike(ctx);

        // 7. Soundwave / Crash Particles
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

        // 8. 1st-Person Handlebar Overlay
        if (this.cameraMode === 1 || this.cameraMode === 2) {
            this.drawHandlebarCockpit(ctx, w, h);
        }
    }

    drawEnvironment(ctx) {
        // Road surface
        ctx.fillStyle = '#141622';
        ctx.fillRect(-300, -300, 1600, 1100);

        // Kerbs
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 16;
        ctx.strokeRect(10, 10, 980, 542);

        // Road divider lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
        ctx.lineWidth = 3;
        ctx.setLineDash([25, 25]);
        ctx.beginPath();
        ctx.moveTo(100, 281);
        ctx.lineTo(900, 281);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    drawParkingSlot(ctx) {
        const slot = this.missionData.slot;
        ctx.save();
        ctx.translate(slot.x, slot.y);
        ctx.rotate(slot.angle);

        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#eab308';
        ctx.strokeRect(-slot.width / 2, -slot.length / 2, slot.width, slot.length);

        ctx.fillStyle = 'rgba(234, 179, 8, 0.14)';
        ctx.fillRect(-slot.width / 2, -slot.length / 2, slot.width, slot.length);

        // Target Arrow
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.moveTo(0, -slot.length / 2 + 15);
        ctx.lineTo(12, -slot.length / 2 + 35);
        ctx.lineTo(-12, -slot.length / 2 + 35);
        ctx.fill();

        ctx.font = 'bold 24px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🅿️', 0, 8);

        ctx.restore();

        // Guide Line
        if (this.parkingAssist && !this.missionCompleted) {
            ctx.save();
            ctx.strokeStyle = 'rgba(234, 179, 8, 0.45)';
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 8]);
            ctx.beginPath();
            ctx.moveTo(this.player.x, this.player.y);
            ctx.lineTo(slot.x, slot.y);
            ctx.stroke();
            ctx.restore();
        }
    }

    drawHeadlightBeam(ctx) {
        const p = this.player;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);

        const grad = ctx.createRadialGradient(p.length / 2, 0, 5, p.length / 2 + 140, 0, 90);
        grad.addColorStop(0, 'rgba(254, 240, 138, 0.55)');
        grad.addColorStop(1, 'rgba(254, 240, 138, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(p.length / 2, 0);
        ctx.lineTo(p.length / 2 + 150, -45);
        ctx.lineTo(p.length / 2 + 150, 45);
        ctx.fill();

        ctx.restore();
    }

    drawBike(ctx) {
        const p = this.player;
        const bike = this.getBikeData();

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);

        // Ground shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(2, 4, p.length / 2 + 4, p.width / 2 + 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dynamic Lean Shift
        const leanShift = Math.sin(p.leanAngle) * 9;
        ctx.translate(0, leanShift);

        // Rear Tyre
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-p.length / 2 + 4, -4, 14, 8);

        // Front Tyre with Steering Angle
        ctx.save();
        ctx.translate(p.length / 2 - 6, 0);
        ctx.rotate(p.steerAngle);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-6, -4, 12, 8);
        ctx.restore();

        // Chassis / Body
        ctx.fillStyle = bike.color;
        ctx.beginPath();
        ctx.roundRect(-p.length / 2 + 10, -p.width / 2 + 3, p.length - 18, p.width - 6, 6);
        ctx.fill();

        // Engine block & Fuel Tank
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-8, -p.width / 2 + 5, 20, p.width - 10);

        // Rider on top
        ctx.fillStyle = '#09090b';
        ctx.fillRect(-18, -p.width / 2 + 6, 14, p.width - 12); // Seat

        // Rider Torso & Helmet (leans with bike)
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.arc(-4, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ef4444'; // Helmet
        ctx.beginPath();
        ctx.arc(4, 0, 8, 0, Math.PI * 2);
        ctx.fill();

        // Handlebars
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(p.length / 2 - 12, -p.width / 2 - 5);
        ctx.lineTo(p.length / 2 - 12, p.width / 2 + 5);
        ctx.stroke();

        // Brake Light (Glows bright red when braking)
        if (this.keys.backward || this.keys.rearBrake) {
            ctx.fillStyle = '#ef4444';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#ef4444';
            ctx.fillRect(-p.length / 2 + 2, -4, 4, 8);
        }

        // Kickstand
        if (p.kickstandDeployed) {
            ctx.strokeStyle = '#eab308';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-10, -p.width / 2);
            ctx.lineTo(-14, -p.width / 2 - 12);
            ctx.stroke();
        }

        ctx.restore();
    }

    drawObstacles(ctx) {
        this.obstacles.forEach(obs => {
            ctx.save();
            if (obs.type === 'building') {
                ctx.fillStyle = obs.color || '#334155';
                ctx.fillRect(obs.x - obs.width / 2, obs.y - obs.height / 2, obs.width, obs.height);
                ctx.strokeStyle = 'rgba(255,255,255,0.1)';
                ctx.strokeRect(obs.x - obs.width / 2, obs.y - obs.height / 2, obs.width, obs.height);
            } else if (obs.type === 'car' || obs.type === 'ambulance') {
                ctx.translate(obs.x, obs.y);
                ctx.rotate(obs.angle || 0);

                ctx.fillStyle = obs.color || '#3b82f6';
                ctx.beginPath();
                ctx.roundRect(-obs.length / 2, -obs.width / 2, obs.length, obs.width, 8);
                ctx.fill();

                ctx.fillStyle = '#0f172a';
                ctx.fillRect(-obs.length / 4, -obs.width / 2 + 6, obs.length / 2, obs.width - 12);
            } else if (obs.type === 'parked_bike') {
                ctx.translate(obs.x, obs.y);
                ctx.rotate(obs.angle || 0);
                ctx.fillStyle = obs.color;
                ctx.fillRect(-obs.length / 2, -obs.width / 2, obs.length, obs.width);
            } else if (obs.type === 'pillar') {
                ctx.fillStyle = '#475569';
                ctx.beginPath();
                ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
                ctx.fill();
            } else if (obs.type === 'cone') {
                ctx.fillStyle = '#f97316';
                ctx.beginPath();
                ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
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
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(w / 2 - 180, h - 80, 360, 40);

        ctx.fillStyle = '#334155';
        ctx.fillRect(w / 2 - 220, h - 90, 45, 25);
        ctx.fillRect(w / 2 + 175, h - 90, 45, 25);

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(w / 2 - 260, h - 140, 50, 35);
        ctx.fillRect(w / 2 + 210, h - 140, 50, 35);
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(w / 2 - 258, h - 138, 46, 31);
        ctx.strokeRect(w / 2 + 212, h - 138, 46, 31);

        ctx.restore();
    }

    renderMinimap() {
        if (!this.mmCtx) return;
        const mm = this.mmCtx;
        const mw = this.minimapCanvas.width;
        const mh = this.minimapCanvas.height;

        mm.clearRect(0, 0, mw, mh);
        mm.fillStyle = '#080a12';
        mm.fillRect(0, 0, mw, mh);

        // Scale factors: 1000x562 -> 120x90
        const sx = mw / 1000;
        const sy = mh / 562;

        // Draw Road Outline
        mm.strokeStyle = 'rgba(255,255,255,0.2)';
        mm.lineWidth = 1;
        mm.strokeRect(10 * sx, 10 * sy, 980 * sx, 542 * sy);

        // Target Parking Slot (Flashing Yellow Box)
        const slot = this.missionData.slot;
        mm.fillStyle = '#eab308';
        mm.fillRect((slot.x - 20) * sx, (slot.y - 20) * sy, 40 * sx, 40 * sy);

        // Traffic Dots
        mm.fillStyle = '#ef4444';
        this.traffic.forEach(t => {
            mm.fillRect(t.x * sx - 2, t.y * sy - 2, 4, 4);
        });

        // Player Bike Dot with Heading Needle
        mm.fillStyle = '#38bdf8';
        mm.beginPath();
        mm.arc(this.player.x * sx, this.player.y * sy, 3.5, 0, Math.PI * 2);
        mm.fill();

        mm.strokeStyle = '#38bdf8';
        mm.lineWidth = 2;
        mm.beginPath();
        mm.moveTo(this.player.x * sx, this.player.y * sy);
        mm.lineTo(
            (this.player.x + Math.cos(this.player.angle) * 16) * sx,
            (this.player.y + Math.sin(this.player.angle) * 16) * sy
        );
        mm.stroke();
    }

    setupGarageUI() {
        const grid = document.getElementById('garageBikesGrid');
        if (!grid) return;

        grid.innerHTML = BIKES.map(bike => {
            const isSelected = bike.id === this.selectedBikeId;
            return `
                <div class="col-6 col-md-4">
                    <div class="bike-select-card ${isSelected ? 'selected' : ''}" data-bike="${bike.id}">
                        <div class="fs-1 mb-1">${bike.category.split(' ')[0]}</div>
                        <h6 class="fw-bold text-white mb-0 text-truncate">${bike.name}</h6>
                        <span class="badge bg-dark border border-secondary text-warning very-small my-1">${bike.category.split('(')[0]}</span>
                        <div class="very-small text-white-50">Top: ${Math.floor(bike.maxSpeed * 5)} km/h</div>
                    </div>
                </div>
            `;
        }).join('');

        grid.querySelectorAll('.bike-select-card').forEach(card => {
            card.addEventListener('click', () => {
                this.selectedBikeId = card.getAttribute('data-bike');
                localStorage.setItem('luckykit_bike_selected', this.selectedBikeId);
                this.setupGarageUI();
                this.updateGarageStats();
            });
        });

        document.querySelectorAll('.color-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
                dot.classList.add('active');
                this.selectedColor = dot.getAttribute('data-color');
                localStorage.setItem('luckykit_bike_color', this.selectedColor);
            });
        });

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
                        <div class="very-small text-info">${m.type}</div>
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
