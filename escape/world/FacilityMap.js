// escape/world/FacilityMap.js

export const MAP_WIDTH = 1920;
export const MAP_HEIGHT = 1080;

export const ROOMS = [
    { id: 'reception', name: 'Airlock & Reception', x: 40, y: 640, w: 500, h: 380, floorColor: '#0a0d16' },
    { id: 'ward', name: 'Medical Quarantine Ward', x: 40, y: 40, w: 500, h: 340, floorColor: '#0c101c' },
    { id: 'corridor_main', name: 'Central Transit Hub', x: 540, y: 400, w: 820, h: 260, floorColor: '#080a12' },
    { id: 'generator', name: 'Primary Electrical & Generator Room', x: 680, y: 40, w: 540, h: 380, floorColor: '#0d131a' },
    { id: 'lab', name: 'Chemical Synthesis Laboratory', x: 680, y: 640, w: 540, h: 380, floorColor: '#0c1214' },
    { id: 'security', name: 'Security Hub & Armory', x: 1360, y: 40, w: 520, h: 460, floorColor: '#100e18' },
    { id: 'helipad_corridor', name: 'Decompression & Blast Gate Extraction', x: 1360, y: 620, w: 520, h: 420, floorColor: '#0d0d18' }
];

export const WALLS = [
    // Outer perimeter
    { x: 40, y: 40, w: 1840, h: 20 },
    { x: 40, y: 1020, w: 1840, h: 20 },
    { x: 40, y: 40, w: 20, h: 1000 },
    { x: 1860, y: 40, w: 20, h: 1000 },

    // Room 1: Reception / Decontamination Airlock
    { x: 40, y: 640, w: 500, h: 20 },
    { x: 520, y: 640, w: 20, h: 380 },

    // Room 2: Medical Ward
    { x: 40, y: 360, w: 500, h: 20 },
    { x: 520, y: 40, w: 20, h: 320 },

    // Room 3: Electrical & Generator Room
    { x: 680, y: 40, w: 20, h: 380 },
    { x: 680, y: 400, w: 540, h: 20 },
    { x: 1200, y: 40, w: 20, h: 380 },

    // Room 4: Chemical Synthesis Lab
    { x: 680, y: 640, w: 540, h: 20 },
    { x: 680, y: 640, w: 20, h: 380 },
    { x: 1200, y: 640, w: 20, h: 380 },

    // Room 5: Security Hub & Armory
    { x: 1360, y: 40, w: 20, h: 460 },
    { x: 1360, y: 480, w: 520, h: 20 },

    // Room 6: Extraction Blast Door Corridor
    { x: 1360, y: 620, w: 520, h: 20 },
    { x: 1360, y: 620, w: 20, h: 420 },

    // Solid Furniture Obstacles
    { x: 180, y: 140, w: 80, h: 140, type: 'bed', name: 'Hospital Bed #1' },
    { x: 320, y: 140, w: 80, h: 140, type: 'bed', name: 'Hospital Bed #2' },
    { x: 800, y: 120, w: 140, h: 80, type: 'generator', name: 'Primary Power Generator' },
    { x: 800, y: 800, w: 160, h: 80, type: 'lab_bench', name: 'Centrifuge & Synthesis Bench' },
    { x: 1540, y: 140, w: 120, h: 80, type: 'terminal', name: 'Mainframe Console' },
    { x: 1560, y: 840, w: 200, h: 40, type: 'blast_gate', name: 'Sub-Level Blast Gate' }
];

export const PATROL_WAYPOINTS = [
    { id: 'wp_rec', x: 300, y: 800, room: 'reception' },
    { id: 'wp_cor1', x: 600, y: 520, room: 'corridor_main' },
    { id: 'wp_ward', x: 300, y: 220, room: 'ward' },
    { id: 'wp_cor2', x: 600, y: 220, room: 'corridor_main' },
    { id: 'wp_gen', x: 950, y: 220, room: 'generator' },
    { id: 'wp_center', x: 950, y: 520, room: 'corridor_main' },
    { id: 'wp_lab', x: 950, y: 800, room: 'lab' },
    { id: 'wp_hub_east', x: 1300, y: 520, room: 'corridor_main' },
    { id: 'wp_sec', x: 1600, y: 300, room: 'security' },
    { id: 'wp_heli', x: 1600, y: 750, room: 'helipad_corridor' }
];
