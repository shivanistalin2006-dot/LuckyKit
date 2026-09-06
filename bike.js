import { BaseGame } from './core/BaseGame.js?v=2.5';
import { gameManager } from './core/gameManager.js';
import { audioManager } from './audio/audioManager.js';
import { storage } from './core/storage.js';

// ========================================================
// 6 MOTORCYCLES CATALOGUE & 3D SPECS
// ========================================================
const BIKES = [
    {
        id: 'scooter',
        name: 'Urban Sprint 110cc',
        category: '🛵 Scooter (Automatic)',
        cost: 0,
        unlocked: true,
        maxSpeed: 10.0,      // ~50 km/h
        accel: 0.16,
        brakePower: 0.35,
        turnAgility: 0.055,
        maxLean: 0.28,
        weight: 95,
        color: '#06b6d4',
        isAutomatic: true,
        gearsCount: 1,
        desc: 'Nimble twist-and-go scooter. Great for quick city commuting.'
    },
    {
        id: 'street',
        name: 'Street Raven 150cc',
        category: '🏍️ Commuter (5-Speed)',
        cost: 200,
        unlocked: true,
        maxSpeed: 15.0,      // ~75 km/h
        accel: 0.22,
        brakePower: 0.40,
        turnAgility: 0.048,
        maxLean: 0.36,
        weight: 135,
        color: '#ef4444',
        isAutomatic: false,
        gearsCount: 5,
        desc: 'Reliable 150cc single-cylinder commuter with crisp 5-speed manual gearbox.'
    },
    {
        id: 'naked',
        name: 'Vortex Naked 250cc',
        category: '🏍️ Streetfighter (6-Speed)',
        cost: 500,
        unlocked: false,
        maxSpeed: 19.0,      // ~95 km/h
        accel: 0.28,
        brakePower: 0.48,
        turnAgility: 0.052,
        maxLean: 0.48,
        weight: 155,
        color: '#22c55e',
        isAutomatic: false,
        gearsCount: 6,
        desc: 'Punchy 250cc streetfighter with wide handlebars and sharp agility.'
    },
    {
        id: 'cruiser',
        name: 'Iron Thunder 350cc',
        category: '🏍️ Classic Cruiser (5-Speed)',
        cost: 800,
        unlocked: false,
        maxSpeed: 17.0,      // ~85 km/h
        accel: 0.21,
        brakePower: 0.40,
        turnAgility: 0.036,
        maxLean: 0.30,
        weight: 195,
        color: '#eab308',
        isAutomatic: false,
        gearsCount: 5,
        desc: 'Heavy long-wheelbase cruiser with thunderous exhaust thumping sound.'
    },
    {
        id: 'adventure',
        name: 'Apex Rally 450cc',
        category: '🏍️ Adventure Tourer (6-Speed)',
        cost: 1400,
        unlocked: false,
        maxSpeed: 22.0,      // ~110 km/h
        accel: 0.34,
        brakePower: 0.52,
        turnAgility: 0.046,
        maxLean: 0.44,
        weight: 175,
        color: '#f97316',
        isAutomatic: false,
        gearsCount: 6,
        desc: 'High-clearance adventure tourer with dual-sport all-weather grip.'
    },
    {
        id: 'superbike',
        name: 'Phantom RR 1000cc',
        category: '🏍️ Hyper Superbike (6-Speed)',
        cost: 2500,
        unlocked: false,
        maxSpeed: 28.0,      // ~150 km/h
        accel: 0.44,
        brakePower: 0.65,
        turnAgility: 0.058,
        maxLean: 0.65,
        weight: 185,
        color: '#a855f7',
        isAutomatic: false,
        gearsCount: 6,
        desc: 'Track-ready inline-4 hyperbike screaming up to 14,000 RPM.'
    }
];

const GEAR_RATIOS = [0, 0.28, 0.46, 0.65, 0.80, 0.92, 1.00];

// ========================================================
// 10 3D MISSIONS & OPEN-WORLD ENVIRONMENTS
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
        spawn: { x: -35, z: 25, angle: 0 },
        slot: { x: 35, z: -20, width: 3.2, length: 6.0, angle: -Math.PI / 2 },
        desc: 'Ride down Maple Street, avoid the parked sedan, and straight-park inside the driveway.',
        obstacles: [
            { type: 'car', x: 0, z: 25, angle: 0, color: '#3b82f6' },
            { type: 'cone', x: 22, z: -10 },
            { type: 'cone', x: 22, z: -30 }
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
        spawn: { x: -35, z: -35, angle: Math.PI / 2 },
        slot: { x: 30, z: 25, width: 3.2, length: 6.0, angle: Math.PI / 4 },
        desc: 'Navigate the commercial mall parking lot and angle-park at 45 degrees between safety pillars.',
        obstacles: [
            { type: 'car', x: -5, z: 15, angle: Math.PI / 2, color: '#ef4444' },
            { type: 'car', x: 15, z: 15, angle: Math.PI / 2, color: '#eab308' },
            { type: 'pillar', x: -15, z: 25 },
            { type: 'pillar', x: 45, z: 25 }
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
        spawn: { x: -35, z: 0, angle: 0 },
        slot: { x: 10, z: 0, width: 3.4, length: 6.2, angle: 0 },
        desc: 'Shift to Neutral (N) or 1st, maneuver past the luxury sedans, and reverse cleanly into the tight bay.',
        obstacles: [
            { type: 'car', x: -8, z: 0, angle: 0, color: '#64748b' },
            { type: 'car', x: 28, z: 0, angle: 0, color: '#0f172a' },
            { type: 'barrier', x: 10, z: -12, width: 18, height: 1.5 }
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
        spawn: { x: -40, z: 30, angle: 0 },
        slot: { x: 38, z: -25, width: 3.2, length: 6.0, angle: -Math.PI / 2 },
        desc: 'City street in full motion! Watch for moving AI cars and pedestrians before parking by the cafe.',
        obstacles: [
            { type: 'car', x: 20, z: -25, angle: -Math.PI / 2, color: '#22c55e' }
        ],
        traffic: [
            { type: 'car', x: -20, z: 0, vx: 0.35, vz: 0, minX: -35, maxX: 35, color: '#f97316' },
            { type: 'pedestrian', x: 5, z: 25, vx: 0, vz: -0.15, minZ: -15, maxZ: 30 }
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
        timeLimit: 30,
        spawn: { x: -35, z: -30, angle: 0 },
        slot: { x: 35, z: 25, width: 3.4, length: 6.2, angle: Math.PI / 2 },
        desc: '30-Second emergency rush! Navigate the speed bumps and park between ambulances.',
        obstacles: [
            { type: 'ambulance', x: 18, z: 25, angle: Math.PI / 2, color: '#ffffff' },
            { type: 'cone', x: -10, z: -10 },
            { type: 'cone', x: 10, z: 10 }
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
        friction: 0.60,
        timeLimit: 60,
        spawn: { x: -30, z: 30, angle: -Math.PI / 4 },
        slot: { x: 30, z: -20, width: 3.2, length: 6.0, angle: -Math.PI / 2 },
        desc: 'Heavy rain on wet asphalt! Drastically reduced tire grip. Brake early and avoid excessive lean angles.',
        obstacles: [
            { type: 'pillar', x: -5, z: 0 },
            { type: 'pillar', x: 15, z: 0 },
            { type: 'car', x: 15, z: -20, angle: -Math.PI / 2, color: '#0284c7' }
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
        spawn: { x: -40, z: -30, angle: 0 },
        slot: { x: 38, z: 30, width: 2.8, length: 5.5, angle: 0 },
        desc: 'Slalom past safety cones and park into a narrow spot between two parked motorcycles.',
        obstacles: [
            { type: 'parked_bike', x: 38, z: 24, angle: 0, color: '#ef4444' },
            { type: 'parked_bike', x: 38, z: 36, angle: 0, color: '#3b82f6' },
            { type: 'cone', x: -15, z: -10 },
            { type: 'cone', x: 10, z: 10 }
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
        spawn: { x: -35, z: 30, angle: -Math.PI / 2 },
        slot: { x: 5, z: -25, width: 3.2, length: 6.0, angle: Math.PI / 3 },
        desc: 'Delicate valet parking among exotic sports cars and fountain curbs in the sunset courtyard.',
        obstacles: [
            { type: 'car', x: -12, z: -25, angle: Math.PI / 3, color: '#e11d48' },
            { type: 'car', x: 22, z: -25, angle: Math.PI / 3, color: '#facc15' },
            { type: 'fountain', x: 0, z: 5, radius: 4.5 }
        ],
        traffic: [
            { type: 'car', x: 35, z: 30, vx: -0.28, vz: 0, minX: -25, maxX: 38, color: '#0ea5e9' }
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
        spawn: { x: -35, z: -30, angle: 0 },
        slot: { x: 35, z: 28, width: 3.4, length: 6.2, angle: Math.PI / 2 },
        desc: 'City traffic in full motion! Navigate past auto-rickshaws, buses, and neon streetlights with headlights ON.',
        obstacles: [
            { type: 'barrier', x: 0, z: 0, width: 25, height: 1.5 },
            { type: 'car', x: 18, z: 28, angle: Math.PI / 2, color: '#6366f1' }
        ],
        traffic: [
            { type: 'autorickshaw', x: -20, z: 18, vx: 0.3, vz: 0, minX: -30, maxX: 30, color: '#eab308' },
            { type: 'pedestrian', x: 10, z: -30, vx: 0, vz: 0.18, minZ: -30, maxZ: 30 }
        ]
    },
    {
        level: 10,
        title: 'Master Police License Exam',
        type: 'Master Tight Bay',
        environment: 'Driving Academy',
        weather: '🌧️ Heavy Rain / Wet Night',
        time: 'Night 00:00',
        friction: 0.58,
        timeLimit: 75,
        spawn: { x: -35, z: 30, angle: 0 },
        slot: { x: 38, z: -25, width: 3.0, length: 5.8, angle: -Math.PI / 2 },
        desc: 'The Ultimate Motorcycle Exam: Wet roads, moving traffic, zero-contact penalty, and precision reverse bay parking!',
        obstacles: [
            { type: 'car', x: 22, z: -25, angle: -Math.PI / 2, color: '#ef4444' },
            { type: 'pillar', x: 0, z: 5 },
            { type: 'pillar', x: 20, z: 18 }
        ],
        traffic: [
            { type: 'car', x: -20, z: -5, vx: 0.38, vz: 0, minX: -30, maxX: 30, color: '#f59e0b' },
            { type: 'pedestrian', x: 5, z: 30, vx: 0, vz: -0.2, minZ: -20, maxZ: 30 }
        ]
    }
];

class MotoParkRealRide extends BaseGame {
    constructor() {
        super("bike");

        this.canvas = document.getElementById('bikeCanvas');
        this.minimapCanvas = document.getElementById('minimapCanvas');
        this.mmCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;

        // Player & Career State
        this.unlockedLevels = parseInt(localStorage.getItem('luckykit_bike_unlocked') || '1');
        this.currentLevel = 1;
        this.selectedBikeId = localStorage.getItem('luckykit_bike_selected') || 'street';
        this.selectedColor = localStorage.getItem('luckykit_bike_color') || '#ef4444';
        this.isManualTransmission = localStorage.getItem('luckykit_bike_manual') !== 'false';
        this.difficulty = localStorage.getItem('luckykit_bike_diff') || 'REALISTIC';
        
        // Upgrades
        this.upgrades = JSON.parse(localStorage.getItem('luckykit_bike_upgrades') || '{"engine":1,"brakes":1,"tyres":1}');

        // Camera: 0=Chase, 1=1st Person Helmet, 2=Handlebar Cockpit, 3=Rear View, 4=Tactical Overhead
        this.cameraMode = 0;
        this.parkingAssist = true;
        this.headlightOn = true;
        this.blinkerState = 0;
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
        this.diffModeText = document.getElementById('diffModeText');
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
            rearBrake: false
        };

        // Initialize 3D Three.js Engine
        this.initThree();
        this.bindControls();
        this.setupGarageUI();
        this.setupLevelSelectorUI();
        this.loadMission(this.currentLevel);

        gameManager.registerGame(this);
    }

    // ========================================================
    // THREE.JS 3D WEBGL ENGINE INITIALIZATION
    // ========================================================
    initThree() {
        const w = this.canvas.clientWidth || 1000;
        const h = this.canvas.clientHeight || 562;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0c16);
        this.scene.fog = new THREE.FogExp2(0x0a0c16, 0.015);

        this.camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 300);
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(w, h, false);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Lighting
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
        this.scene.add(this.ambientLight);

        this.sunLight = new THREE.DirectionalLight(0xfff8e7, 1.2);
        this.sunLight.position.set(40, 60, 40);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 1024;
        this.sunLight.shadow.mapSize.height = 1024;
        this.sunLight.shadow.camera.near = 10;
        this.sunLight.shadow.camera.far = 150;
        this.sunLight.shadow.camera.left = -50;
        this.sunLight.shadow.camera.right = 50;
        this.sunLight.shadow.camera.top = 50;
        this.sunLight.shadow.camera.bottom = -50;
        this.scene.add(this.sunLight);

        // Build 3D City Environment & 3D Bike
        this.worldGroup = new THREE.Group();
        this.scene.add(this.worldGroup);

        this.trafficGroup = new THREE.Group();
        this.scene.add(this.trafficGroup);

        this.build3DBike();
        this.build3DEnvironment();

        // Handle Resize
        window.addEventListener('resize', () => {
            const nw = this.canvas.clientWidth || 1000;
            const nh = this.canvas.clientHeight || 562;
            this.camera.aspect = nw / nh;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(nw, nh, false);
        });
    }

    // ========================================================
    // BUILD REALISTIC 3D PROCEDURAL MOTORCYCLE & RIDER
    // ========================================================
    build3DBike() {
        this.bikeGroup = new THREE.Group();

        // Materials
        this.bodyMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(this.selectedColor),
            roughness: 0.2,
            metalness: 0.8
        });
        const chromeMaterial = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.1, metalness: 0.95 });
        const darkMetal = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.7 });
        const tireMaterial = new THREE.MeshStandardMaterial({ color: 0x111318, roughness: 0.85, metalness: 0.1 });
        const seatMaterial = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.9, metalness: 0.05 });
        const riderGear = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
        const helmetMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2, metalness: 0.5 });
        const visorMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, metalness: 0.9 });

        // 1. Chassis / Engine Block
        const frameGeo = new THREE.BoxGeometry(0.5, 0.45, 1.2);
        const frameMesh = new THREE.Mesh(frameGeo, darkMetal);
        frameMesh.position.y = 0.55;
        frameMesh.castShadow = true;
        this.bikeGroup.add(frameMesh);

        // 2. Fuel Tank & Fairings
        const tankGeo = new THREE.BoxGeometry(0.46, 0.35, 0.85);
        this.tankMesh = new THREE.Mesh(tankGeo, this.bodyMaterial);
        this.tankMesh.position.set(0, 0.8, -0.1);
        this.tankMesh.castShadow = true;
        this.bikeGroup.add(this.tankMesh);

        // 3. Rider Seat
        const seatGeo = new THREE.BoxGeometry(0.38, 0.15, 0.65);
        const seatMesh = new THREE.Mesh(seatGeo, seatMaterial);
        seatMesh.position.set(0, 0.75, 0.45);
        seatMesh.castShadow = true;
        this.bikeGroup.add(seatMesh);

        // 4. Exhaust Pipe
        const exhaustGeo = new THREE.CylinderGeometry(0.06, 0.08, 1.2, 12);
        const exhaustMesh = new THREE.Mesh(exhaustGeo, chromeMaterial);
        exhaustMesh.rotation.x = Math.PI / 2 - 0.1;
        exhaustMesh.position.set(0.28, 0.35, 0.4);
        exhaustMesh.castShadow = true;
        this.bikeGroup.add(exhaustMesh);

        // 5. Rear Wheel Assembly
        this.rearWheelGroup = new THREE.Group();
        this.rearWheelGroup.position.set(0, 0.36, 0.85);
        const wheelGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.2, 20);
        wheelGeo.rotateZ(Math.PI / 2);
        const rTireMesh = new THREE.Mesh(wheelGeo, tireMaterial);
        rTireMesh.castShadow = true;
        this.rearWheelGroup.add(rTireMesh);

        const rRimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.21, 16);
        rRimGeo.rotateZ(Math.PI / 2);
        const rRimMesh = new THREE.Mesh(rRimGeo, chromeMaterial);
        this.rearWheelGroup.add(rRimMesh);
        this.bikeGroup.add(this.rearWheelGroup);

        // 6. Front Fork & Handlebars (Turns with Steering)
        this.frontForkGroup = new THREE.Group();
        this.frontForkGroup.position.set(0, 0.7, -0.75);

        // Handlebars
        const barGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.75, 12);
        barGeo.rotateZ(Math.PI / 2);
        const barMesh = new THREE.Mesh(barGeo, darkMetal);
        barMesh.position.y = 0.25;
        this.frontForkGroup.add(barMesh);

        // Front Wheel inside fork
        this.frontWheelGroup = new THREE.Group();
        this.frontWheelGroup.position.set(0, -0.34, -0.2);
        const fTireMesh = new THREE.Mesh(wheelGeo, tireMaterial);
        fTireMesh.castShadow = true;
        this.frontWheelGroup.add(fTireMesh);
        const fRimMesh = new THREE.Mesh(rRimGeo, chromeMaterial);
        this.frontWheelGroup.add(fRimMesh);
        this.frontForkGroup.add(this.frontWheelGroup);

        this.bikeGroup.add(this.frontForkGroup);

        // 7. 3D Headlight Projector Beam & Tail Light
        this.headlightSpot = new THREE.SpotLight(0xfffaed, 3.5, 45, Math.PI / 6, 0.4, 1.2);
        this.headlightSpot.position.set(0, 0.75, -0.9);
        this.headlightTarget = new THREE.Object3D();
        this.headlightTarget.position.set(0, 0.2, -15);
        this.bikeGroup.add(this.headlightTarget);
        this.headlightSpot.target = this.headlightTarget;
        this.headlightSpot.castShadow = true;
        this.bikeGroup.add(this.headlightSpot);

        // Rear Brake Light Mesh
        const brakeLightGeo = new THREE.BoxGeometry(0.18, 0.08, 0.06);
        this.brakeLightMat = new THREE.MeshBasicMaterial({ color: 0x7f1d1d });
        const brakeLightMesh = new THREE.Mesh(brakeLightGeo, this.brakeLightMat);
        brakeLightMesh.position.set(0, 0.72, 0.85);
        this.bikeGroup.add(brakeLightMesh);

        // 8. 3D Rider Character
        this.riderGroup = new THREE.Group();
        this.riderGroup.position.set(0, 0.75, 0.35);

        // Torso
        const torsoGeo = new THREE.BoxGeometry(0.38, 0.5, 0.28);
        const torsoMesh = new THREE.Mesh(torsoGeo, riderGear);
        torsoMesh.position.set(0, 0.35, -0.1);
        torsoMesh.rotation.x = 0.25; // Leaning forward slightly
        torsoMesh.castShadow = true;
        this.riderGroup.add(torsoMesh);

        // Helmet & Visor
        const helmetGeo = new THREE.SphereGeometry(0.16, 16, 16);
        const helmetMesh = new THREE.Mesh(helmetGeo, helmetMat);
        helmetMesh.position.set(0, 0.72, -0.18);
        helmetMesh.castShadow = true;
        this.riderGroup.add(helmetMesh);

        const visorGeo = new THREE.BoxGeometry(0.18, 0.08, 0.1);
        const visorMesh = new THREE.Mesh(visorGeo, visorMat);
        visorMesh.position.set(0, 0.72, -0.28);
        this.riderGroup.add(visorMesh);

        this.bikeGroup.add(this.riderGroup);
        this.scene.add(this.bikeGroup);
    }

    // ========================================================
    // BUILD 3D CITY ENVIRONMENT & ROADS
    // ========================================================
    build3DEnvironment() {
        // Clear previous world
        while (this.worldGroup.children.length > 0) {
            this.worldGroup.remove(this.worldGroup.children[0]);
        }

        // Ground Plane (Asphalt)
        const groundGeo = new THREE.PlaneGeometry(160, 160);
        const groundMat = new THREE.MeshStandardMaterial({ color: 0x141622, roughness: 0.9, metalness: 0.1 });
        const groundMesh = new THREE.Mesh(groundGeo, groundMat);
        groundMesh.rotation.x = -Math.PI / 2;
        groundMesh.receiveShadow = true;
        this.worldGroup.add(groundMesh);

        // Sidewalk Curbs
        const curbMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
        const curb1 = new THREE.Mesh(new THREE.BoxGeometry(160, 0.3, 3), curbMat);
        curb1.position.set(0, 0.15, -45);
        this.worldGroup.add(curb1);

        const curb2 = new THREE.Mesh(new THREE.BoxGeometry(160, 0.3, 3), curbMat);
        curb2.position.set(0, 0.15, 45);
        this.worldGroup.add(curb2);

        // 3D City Buildings
        const buildingColors = [0x1e293b, 0x334155, 0x475569, 0x0f172a];
        for (let i = -70; i <= 70; i += 22) {
            const h1 = 12 + Math.random() * 25;
            const bMat1 = new THREE.MeshStandardMaterial({ color: buildingColors[Math.floor(Math.random() * buildingColors.length)], roughness: 0.7 });
            const bMesh1 = new THREE.Mesh(new THREE.BoxGeometry(18, h1, 16), bMat1);
            bMesh1.position.set(i, h1 / 2, -58);
            bMesh1.castShadow = true;
            bMesh1.receiveShadow = true;
            this.worldGroup.add(bMesh1);

            const h2 = 10 + Math.random() * 20;
            const bMat2 = new THREE.MeshStandardMaterial({ color: buildingColors[Math.floor(Math.random() * buildingColors.length)], roughness: 0.7 });
            const bMesh2 = new THREE.Mesh(new THREE.BoxGeometry(18, h2, 16), bMat2);
            bMesh2.position.set(i, h2 / 2, 58);
            bMesh2.castShadow = true;
            bMesh2.receiveShadow = true;
            this.worldGroup.add(bMesh2);
        }

        // 3D Parking Bay Mesh (Yellow Frame)
        const slot = this.missionData.slot;
        this.parkingSlotGroup = new THREE.Group();
        this.parkingSlotGroup.position.set(slot.x, 0.05, slot.z);
        this.parkingSlotGroup.rotation.y = slot.angle;

        const slotPlaneGeo = new THREE.PlaneGeometry(slot.width, slot.length);
        const slotPlaneMat = new THREE.MeshBasicMaterial({ color: 0xeab308, transparent: true, opacity: 0.25 });
        const slotPlane = new THREE.Mesh(slotPlaneGeo, slotPlaneMat);
        slotPlane.rotation.x = -Math.PI / 2;
        this.parkingSlotGroup.add(slotPlane);

        // Boundary Outline
        const edges = new THREE.EdgesGeometry(slotPlaneGeo);
        const lineMat = new THREE.LineBasicMaterial({ color: 0xeab308, linewidth: 3 });
        const line = new THREE.LineSegments(edges, lineMat);
        line.rotation.x = -Math.PI / 2;
        this.parkingSlotGroup.add(line);

        this.worldGroup.add(this.parkingSlotGroup);

        // 3D Obstacles
        this.obstaclesGroup = new THREE.Group();
        this.missionData.obstacles.forEach(obs => {
            if (obs.type === 'car' || obs.type === 'ambulance') {
                const carMesh = this.create3DCar(obs.color || '#3b82f6');
                carMesh.position.set(obs.x, 0, obs.z);
                carMesh.rotation.y = obs.angle || 0;
                this.obstaclesGroup.add(carMesh);
            } else if (obs.type === 'cone') {
                const coneGeo = new THREE.ConeGeometry(0.3, 0.8, 12);
                const coneMat = new THREE.MeshStandardMaterial({ color: 0xf97316 });
                const coneMesh = new THREE.Mesh(coneGeo, coneMat);
                coneMesh.position.set(obs.x, 0.4, obs.z);
                coneMesh.castShadow = true;
                this.obstaclesGroup.add(coneMesh);
            } else if (obs.type === 'pillar') {
                const pGeo = new THREE.CylinderGeometry(0.6, 0.6, 5, 16);
                const pMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
                const pMesh = new THREE.Mesh(pGeo, pMat);
                pMesh.position.set(obs.x, 2.5, obs.z);
                pMesh.castShadow = true;
                this.obstaclesGroup.add(pMesh);
            }
        });
        this.worldGroup.add(this.obstaclesGroup);
    }

    create3DCar(colorHex) {
        const carGroup = new THREE.Group();
        const carMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.3, metalness: 0.6 });
        const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 });
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827 });

        // Body
        const bodyGeo = new THREE.BoxGeometry(2.1, 0.9, 4.4);
        const bodyMesh = new THREE.Mesh(bodyGeo, carMat);
        bodyMesh.position.y = 0.65;
        bodyMesh.castShadow = true;
        carGroup.add(bodyMesh);

        // Cabin
        const cabinGeo = new THREE.BoxGeometry(1.8, 0.7, 2.3);
        const cabinMesh = new THREE.Mesh(cabinGeo, glassMat);
        cabinMesh.position.set(0, 1.4, -0.2);
        cabinMesh.castShadow = true;
        carGroup.add(cabinMesh);

        return carGroup;
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
        if (lvlNumText) lvlNumText.textContent = `Mission ${this.currentLevel}`;
        
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

        this.build3DEnvironment();
        this.resetGameVariables();
    }

    resetGameVariables() {
        const spawn = this.missionData.spawn;
        const bike = this.getBikeData();

        this.player = {
            x: spawn.x,
            z: spawn.z,
            speed: 0,
            rpm: 1200,
            currentGear: bike.isAutomatic ? 1 : 0,
            clutchEngaged: false,
            isStalled: false,
            kickstandDeployed: false,
            angle: spawn.angle,
            steerAngle: 0,
            leanAngle: 0,
            damage: 0,
            width: 0.8,
            length: 2.1,
            isGrounded: true,
            isParked: false,
            parkHoldTime: 0
        };

        this.missionTime = 0;
        this.missionCompleted = false;
        this.missionFailed = false;

        this.traffic = JSON.parse(JSON.stringify(this.missionData.traffic || []));

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
        window.addEventListener('keydown', (e) => {
            if (['KeyW', 'ArrowUp'].includes(e.code)) this.keys.forward = true;
            if (['KeyS', 'ArrowDown'].includes(e.code)) this.keys.backward = true;
            if (['KeyA', 'ArrowLeft'].includes(e.code)) this.keys.left = true;
            if (['KeyD', 'ArrowRight'].includes(e.code)) this.keys.right = true;
            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.keys.clutch = true;
            if (e.code === 'KeyE') this.shiftGear(1);
            if (e.code === 'KeyQ') this.shiftGear(-1);
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

        // Mobile Controls
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

        // Header Buttons & Mode Toggles
        document.getElementById('transmissionToggleBtn')?.addEventListener('click', () => this.toggleTransmissionMode());
        document.getElementById('difficultyToggleBtn')?.addEventListener('click', () => this.toggleDifficulty());
        document.getElementById('camToggleBtn')?.addEventListener('click', () => this.cycleCamera());
        document.getElementById('assistToggleBtn')?.addEventListener('click', () => this.toggleAssist());
        document.getElementById('headlightToggleBtn')?.addEventListener('click', () => this.toggleHeadlight());

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

    toggleDifficulty() {
        const modes = ['CASUAL', 'REALISTIC', 'HARDCORE'];
        const idx = (modes.indexOf(this.difficulty) + 1) % modes.length;
        this.difficulty = modes[idx];
        localStorage.setItem('luckykit_bike_diff', this.difficulty);
        if (this.diffModeText) this.diffModeText.textContent = this.difficulty;
        if (audioManager) audioManager.playClick?.();
    }

    toggleTransmissionMode() {
        this.isManualTransmission = !this.isManualTransmission;
        localStorage.setItem('luckykit_bike_manual', this.isManualTransmission.toString());
        if (this.transModeText) {
            this.transModeText.textContent = this.isManualTransmission ? '6-SPEED MANUAL' : 'AUTOMATIC CVT';
        }
        if (audioManager) audioManager.playClick?.();
    }

    shiftGear(direction) {
        if (!this.isRunning || this.player.isStalled) return;
        const bike = this.getBikeData();
        const p = this.player;

        if (bike.isAutomatic || !this.isManualTransmission) return;

        if (direction > 0) {
            if (p.currentGear === 0) p.currentGear = 1;
            else if (p.currentGear < bike.gearsCount) p.currentGear++;
        } else {
            if (p.currentGear === 1) p.currentGear = 0;
            else if (p.currentGear > 0) p.currentGear--;
        }

        if (audioManager) audioManager.playTone(320, 'square', 0.08, 0.3);
    }

    handleClutchRelease() {
        const p = this.player;
        const bike = this.getBikeData();

        if (bike.isAutomatic || !this.isManualTransmission) return;

        if (p.currentGear > 0 && Math.abs(p.speed) < 0.05 && !this.keys.forward) {
            p.isStalled = true;
            p.rpm = 0;
            if (this.stalledAlert) this.stalledAlert.classList.remove('d-none');
            if (audioManager) audioManager.playLose?.();
        } else if (p.isStalled && p.currentGear === 0) {
            p.isStalled = false;
            p.rpm = 1200;
            if (this.stalledAlert) this.stalledAlert.classList.add('d-none');
            if (audioManager) audioManager.playTone(400, 'sine', 0.15, 0.3);
        }
    }

    cycleCamera() {
        this.cameraMode = (this.cameraMode + 1) % 5;
        const names = ['Chase Cam 3D', 'Helmet 1st Person', 'Handlebars 3D', 'Rear View 3D', 'Tactical 3D'];
        if (this.camNameText) this.camNameText.textContent = names[this.cameraMode];
        if (audioManager) audioManager.playClick?.();
    }

    toggleHeadlight() {
        this.headlightOn = !this.headlightOn;
        if (this.headlightSpot) this.headlightSpot.intensity = this.headlightOn ? 3.5 : 0;
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
    }

    gameLoop(time) {
        if (this.isRunning && !this.isPaused) {
            const dt = Math.min(32, time - (this.lastTime || time));
            this.lastTime = time;

            this.updateBlinkers(dt);
            this.updatePhysics(dt);
            this.updateTraffic(dt);
            this.updateParkingEvaluation(dt);
            this.update3DScene(dt);
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

        if (this.hudBlinkerLeft) this.hudBlinkerLeft.classList.toggle('blinking', this.blinkerState === 1 && this.blinkerFlash);
        if (this.hudBlinkerRight) this.hudBlinkerRight.classList.toggle('blinking', this.blinkerState === 2 && this.blinkerFlash);
    }

    updatePhysics(dt) {
        const timeFactor = dt / 16.66;
        const bike = this.getBikeData();
        const p = this.player;
        const surfaceGrip = (this.missionData.friction || 1.0) * bike.gripBonus;

        this.missionTime += (dt / 1000);

        if (bike.isAutomatic || !this.isManualTransmission) {
            if (p.speed > 1.8) p.currentGear = 5;
            else if (p.speed > 1.3) p.currentGear = 4;
            else if (p.speed > 0.8) p.currentGear = 3;
            else if (p.speed > 0.4) p.currentGear = 2;
            else if (p.speed > 0.05) p.currentGear = 1;
            else p.currentGear = 0;
        }

        const currentGearRatio = GEAR_RATIOS[p.currentGear] || 0;
        const gearMaxSpeed = (bike.maxSpeed * 0.1) * (currentGearRatio || 0.1);

        const targetSteer = (this.keys.left ? 1 : 0) + (this.keys.right ? -1 : 0);
        const steerSpeed = bike.turnAgility * surfaceGrip;
        p.steerAngle += (targetSteer * 0.55 - p.steerAngle) * steerSpeed * timeFactor;

        if (p.kickstandDeployed) {
            p.speed *= Math.pow(0.80, timeFactor);
        }

        if (this.keys.forward && !p.isStalled && !p.kickstandDeployed) {
            if (p.currentGear === 0 || this.keys.clutch) {
                p.rpm += 450 * timeFactor;
                if (p.rpm > 13500) p.rpm = 13500;
            } else {
                if (p.speed < gearMaxSpeed) {
                    p.speed += (bike.accel * 0.015) * surfaceGrip * timeFactor;
                }
                p.rpm = 1500 + (p.speed / (bike.maxSpeed * 0.1)) * 10500;
            }
        } else {
            p.rpm += (1200 - p.rpm) * 0.12 * timeFactor;
            if (p.rpm < 1200) p.rpm = 1200;

            const engineBrake = p.currentGear > 0 && !this.keys.clutch ? 0.985 : 0.995;
            p.speed *= Math.pow(engineBrake, timeFactor);
            if (Math.abs(p.speed) < 0.005) p.speed = 0;
        }

        // Brakes
        if (this.keys.backward) {
            if (p.speed > 0.03) {
                p.speed -= (bike.brakePower * 0.02) * surfaceGrip * timeFactor;
                if (p.speed < 0) p.speed = 0;
            } else if (p.currentGear === 0 || this.keys.clutch) {
                // Reverse paddling
                p.speed -= 0.004 * timeFactor;
                if (p.speed < -0.06) p.speed = -0.06;
            }
        }

        if (this.keys.rearBrake) {
            p.speed *= Math.pow(0.85, timeFactor);
        }

        // Kinematics & 3D Turning
        if (Math.abs(p.speed) > 0.01) {
            const angularVel = (p.speed / 2.1) * Math.sin(p.steerAngle);
            p.angle += angularVel * timeFactor;

            const targetLean = (p.speed / (bike.maxSpeed * 0.1)) * (p.steerAngle / 0.55) * bike.maxLean;
            p.leanAngle += (targetLean - p.leanAngle) * 0.15 * timeFactor;
        } else {
            p.leanAngle *= 0.8;
        }

        // Update 3D Positions
        p.x += Math.cos(p.angle) * p.speed * timeFactor;
        p.z += -Math.sin(p.angle) * p.speed * timeFactor;

        p.x = Math.max(-65, Math.min(65, p.x));
        p.z = Math.max(-40, Math.min(40, p.z));

        this.checkCollisions();
        this.updateHUD();
    }

    updateTraffic(dt) {
        const timeFactor = dt / 16.66;
        this.traffic.forEach(t => {
            t.x += (t.vx || 0) * timeFactor;
            t.z += (t.vz || 0) * timeFactor;

            if (t.minX !== undefined && (t.x <= t.minX || t.x >= t.maxX)) t.vx *= -1;
            if (t.minZ !== undefined && (t.z <= t.minZ || t.z >= t.maxZ)) t.vz *= -1;
        });
    }

    checkCollisions() {
        const p = this.player;

        const checkHit = (obs) => {
            const dist = Math.hypot(p.x - obs.x, p.z - obs.z);
            return dist < (obs.radius || 2.2);
        };

        this.missionData.obstacles.forEach(obs => {
            if (checkHit(obs)) this.handleCrash(obs);
        });

        this.traffic.forEach(t => {
            if (checkHit(t)) this.handleCrash(t);
        });
    }

    handleCrash(obstacle) {
        const p = this.player;
        const impactForce = Math.abs(p.speed) * 40;

        p.speed = -p.speed * 0.3;
        p.damage += Math.min(35, Math.floor(impactForce * 3.5) + 8);

        if (audioManager) audioManager.playLose?.();

        if (p.damage >= 100) {
            this.handleMissionFailure("CRITICAL DAMAGE! Motorcycle wrecked. Repair required.");
        }
    }

    updateParkingEvaluation(dt) {
        if (this.missionCompleted || this.missionFailed) return;

        const p = this.player;
        const slot = this.missionData.slot;

        const dist = Math.hypot(p.x - slot.x, p.z - slot.z);
        const maxTolDist = 2.8;
        const posFit = Math.max(0, 100 - Math.floor((dist / maxTolDist) * 100));

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
            
            if (Math.abs(p.speed) < 0.015) {
                p.parkHoldTime += (dt / 1000);
                if (this.alignHoldText) this.alignHoldText.textContent = `${p.parkHoldTime.toFixed(1)}s / 1.5s`;
                if (this.parkingStatusTitle) this.parkingStatusTitle.textContent = "STOPPED • HOLD TO PARK";
                if (this.parkingStatusSubtitle) this.parkingStatusSubtitle.textContent = "Turning off ignition...";

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
            if (this.parkingStatusTitle) this.parkingStatusTitle.textContent = "APPROACH 3D BAY";
            if (this.parkingStatusSubtitle) this.parkingStatusSubtitle.textContent = "Align inside yellow 3D boundary";
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
        if (this.resultMessage) this.resultMessage.textContent = "Engine stopped • Kickstand deployed in 3D bay!";
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

    // ========================================================
    // 3D SCENE & CAMERAS UPDATE
    // ========================================================
    update3DScene(dt) {
        const p = this.player;

        // Position 3D Bike
        this.bikeGroup.position.set(p.x, 0, p.z);
        this.bikeGroup.rotation.y = p.angle + Math.PI / 2;
        this.bikeGroup.rotation.z = -p.leanAngle; // 3D Leaning

        // Steering Fork Rotation
        if (this.frontForkGroup) {
            this.frontForkGroup.rotation.y = -p.steerAngle;
        }

        // Wheel Rotations
        const wheelRotSpeed = (p.speed / 0.36) * 15;
        if (this.rearWheelGroup) this.rearWheelGroup.children[0].rotation.x += wheelRotSpeed;
        if (this.frontWheelGroup) this.frontWheelGroup.children[0].rotation.x += wheelRotSpeed;

        // Brake Light Glow
        if (this.brakeLightMat) {
            this.brakeLightMat.color.setHex((this.keys.backward || this.keys.rearBrake) ? 0xff0000 : 0x7f1d1d);
        }

        // 3D Cameras
        const isNearSlot = Math.hypot(p.x - this.missionData.slot.x, p.z - this.missionData.slot.z) < 12;
        const chaseDist = isNearSlot ? 4.5 : 7.0;
        const chaseHeight = isNearSlot ? 2.5 : 3.2;

        if (this.cameraMode === 0) {
            // Chase Cam 3D (Smooth follow)
            const camTargetX = p.x - Math.cos(p.angle) * chaseDist;
            const camTargetZ = p.z + Math.sin(p.angle) * chaseDist;
            this.camera.position.set(camTargetX, chaseHeight, camTargetZ);
            this.camera.lookAt(p.x, 1.2, p.z);
        } else if (this.cameraMode === 1) {
            // Helmet 1st Person
            this.camera.position.set(p.x, 1.7, p.z);
            const lookX = p.x + Math.cos(p.angle) * 15;
            const lookZ = p.z - Math.sin(p.angle) * 15;
            this.camera.lookAt(lookX, 1.5, lookZ);
        } else if (this.cameraMode === 2) {
            // Handlebars 3D
            this.camera.position.set(p.x + Math.cos(p.angle) * 0.4, 1.35, p.z - Math.sin(p.angle) * 0.4);
            const lookX = p.x + Math.cos(p.angle) * 15;
            const lookZ = p.z - Math.sin(p.angle) * 15;
            this.camera.lookAt(lookX, 1.2, lookZ);
        } else if (this.cameraMode === 3) {
            // Rear View 3D
            this.camera.position.set(p.x + Math.cos(p.angle) * 5.5, 2.5, p.z - Math.sin(p.angle) * 5.5);
            this.camera.lookAt(p.x, 1.0, p.z);
        } else {
            // Tactical Overhead 3D
            this.camera.position.set(p.x, 28, p.z + 10);
            this.camera.lookAt(p.x, 0, p.z);
        }

        // Render 3D Frame
        this.renderer.render(this.scene, this.camera);
    }

    updateHUD() {
        const speedKmh = Math.abs(Math.floor(this.player.speed * 60.0));
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

    renderMinimap() {
        if (!this.mmCtx) return;
        const mm = this.mmCtx;
        const mw = this.minimapCanvas.width;
        const mh = this.minimapCanvas.height;

        mm.clearRect(0, 0, mw, mh);
        mm.fillStyle = '#080a12';
        mm.fillRect(0, 0, mw, mh);

        // Scale factors: (-70..70) -> (0..mw), (-45..45) -> (0..mh)
        const toX = (x) => ((x + 70) / 140) * mw;
        const toZ = (z) => ((z + 45) / 90) * mh;

        // Road Borders
        mm.strokeStyle = 'rgba(255,255,255,0.25)';
        mm.strokeRect(toX(-65), toZ(-40), toX(65) - toX(-65), toZ(40) - toZ(-40));

        // Parking Bay (Yellow)
        const slot = this.missionData.slot;
        mm.fillStyle = '#eab308';
        mm.fillRect(toX(slot.x) - 4, toZ(slot.z) - 4, 8, 8);

        // Traffic Dots (Red)
        mm.fillStyle = '#ef4444';
        this.traffic.forEach(t => {
            mm.fillRect(toX(t.x) - 2, toZ(t.z) - 2, 4, 4);
        });

        // Player Bike Dot (Cyan) with Direction Needle
        const px = toX(this.player.x);
        const pz = toZ(this.player.z);

        mm.fillStyle = '#38bdf8';
        mm.beginPath();
        mm.arc(px, pz, 3.5, 0, Math.PI * 2);
        mm.fill();

        mm.strokeStyle = '#38bdf8';
        mm.lineWidth = 2;
        mm.beginPath();
        mm.moveTo(px, pz);
        mm.lineTo(px + Math.cos(this.player.angle) * 12, pz - Math.sin(this.player.angle) * 12);
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
                if (this.bodyMaterial) {
                    this.bodyMaterial.color.set(this.selectedColor);
                }
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

        if (this.bodyMaterial) {
            this.bodyMaterial.color.set(this.selectedColor);
        }
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
        new MotoParkRealRide();
    });
} else {
    new MotoParkRealRide();
}
