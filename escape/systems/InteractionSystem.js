// escape/systems/InteractionSystem.js

export const INTERACTIVES = [
    // Hiding Spots
    { id: 'locker_rec', x: 120, y: 720, w: 50, h: 50, type: 'locker', label: 'Security Locker [Hide]' },
    { id: 'bed_ward1', x: 220, y: 210, w: 60, h: 60, type: 'bed', label: 'Under Hospital Bed [Hide]' },
    { id: 'locker_gen', x: 1120, y: 120, w: 50, h: 50, type: 'locker', label: 'Supply Locker [Hide]' },
    { id: 'locker_lab', x: 1120, y: 920, w: 50, h: 50, type: 'locker', label: 'Chemical Cabinet [Hide]' },

    // Puzzle Items: Fuses
    { id: 'fuse_red', x: 180, y: 850, w: 30, h: 30, type: 'item', item: 'fuse_red', name: 'Alpha Red Fuse', icon: '🔴', desc: 'Required for main generator power', collected: false },
    { id: 'fuse_blue', x: 440, y: 120, w: 30, h: 30, type: 'item', item: 'fuse_blue', name: 'Beta Blue Fuse', icon: '🔵', desc: 'Required for main generator power', collected: false },
    { id: 'fuse_yellow', x: 920, y: 920, w: 30, h: 30, type: 'item', item: 'fuse_yellow', name: 'Gamma Yellow Fuse', icon: '🟡', desc: 'Required for main generator power', collected: false },

    // Tools & Keycards
    { id: 'wrench', x: 1040, y: 220, w: 30, h: 30, type: 'item', item: 'wrench', name: 'Pipe Wrench', icon: '🔧', desc: 'Used to turn the steam isolation valve', collected: false },
    { id: 'keycard', x: 1720, y: 200, w: 30, h: 30, type: 'item', item: 'keycard', name: 'Master Blast Keycard', icon: '💳', desc: 'Required to initiate blast gate decompression', collected: false },
    { id: 'battery_1', x: 380, y: 880, w: 30, h: 30, type: 'battery', name: 'Flashlight Battery', desc: 'Restores 100% flashlight power', collected: false },
    { id: 'battery_2', x: 740, y: 140, w: 30, h: 30, type: 'battery', name: 'Flashlight Battery', desc: 'Restores 100% flashlight power', collected: false },

    // True Ending Antidote chemicals
    { id: 'reagent_x', x: 1140, y: 740, w: 30, h: 30, type: 'item', item: 'reagent_x', name: 'Reagent X', icon: '🧪', desc: 'Volatile biological compound', collected: false },
    { id: 'stabilizer', x: 740, y: 920, w: 30, h: 30, type: 'item', item: 'stabilizer', name: 'Stabilizer Vial', icon: '🧪', desc: 'Enzyme stabilizer for serum synthesis', collected: false },

    // Stations
    { id: 'generator_box', x: 870, y: 120, w: 80, h: 60, type: 'fuse_box', label: 'Insert 3 Power Fuses (0/3)' },
    { id: 'keypad_station', x: 1360, y: 260, w: 30, h: 60, type: 'keypad', label: 'Enter 4-Digit Security Code', correctCode: '4829' },
    { id: 'steam_valve', x: 1480, y: 720, w: 50, h: 50, type: 'valve', label: 'Use Wrench on Steam Valve' },
    { id: 'mainframe_terminal', x: 1600, y: 140, w: 60, h: 60, type: 'terminal', label: 'Hack Mainframe Terminal [Purge]' },
    { id: 'centrifuge_station', x: 880, y: 800, w: 60, h: 60, type: 'centrifuge', label: 'Synthesize Bio-Antidote' },
    { id: 'blast_door_exit', x: 1660, y: 900, w: 100, h: 60, type: 'exit_gate', label: 'Escape Via Main Blast Gate' },

    // Lore Logs
    { id: 'note_1', x: 260, y: 720, w: 30, h: 30, type: 'note', loreTitle: 'LOG 01: OUTBREAK', loreText: 'Subject Zero breached cryogenic pod at 23:14. It is hyper-sensitive to sprint noise and water footsteps. Keypad is set to 4829.' },
    { id: 'note_2', x: 120, y: 120, w: 30, h: 30, type: 'note', loreTitle: 'LOG 02: THE WEAPON', loreText: 'Dr. Vance created Subject Zero using mutant DNA. It will stop if exposed to the pure centrifuge Antidote compound.' },
    { id: 'note_3', x: 980, y: 140, w: 30, h: 30, type: 'note', loreTitle: 'LOG 03: POWER GRID', loreText: 'Main gate requires 3 colored fuses (Alpha, Beta, Gamma) and Master Keycard to trigger decompression.' },
    { id: 'note_4', x: 1720, y: 380, w: 30, h: 30, type: 'note', loreTitle: 'LOG 04: TERMINAL BYPASS', loreText: 'Mainframe can trigger emergency exhaust ventilation purging all lockdown protocols.' }
];

export class InteractionSystem {
    constructor() {
        this.items = JSON.parse(JSON.stringify(INTERACTIVES));
        this.activeObject = null;
        this.puzzleState = {
            fusesInserted: 0,
            powerRestored: false,
            valveTurned: false,
            keypadUnlocked: false,
            securityGridOff: false,
            serumSynthesized: false
        };
    }

    getNearbyObject(player) {
        this.activeObject = null;
        for (const item of this.items) {
            if (item.collected) continue;
            const centerX = item.x + item.w / 2;
            const centerY = item.y + item.h / 2;
            const dist = Math.hypot(player.x - centerX, player.y - centerY);
            if (dist < 65) {
                this.activeObject = item;
                break;
            }
        }
        return this.activeObject;
    }

    handleInteraction(player, audio, eventBus) {
        const obj = this.getNearbyObject(player);
        if (!obj) {
            if (player.isHiding) {
                player.isHiding = false;
                player.hiddenSpotId = null;
                if (audio) audio.playDoorCreak();
            }
            return;
        }

        if (obj.type === 'locker' || obj.type === 'bed') {
            player.isHiding = !player.isHiding;
            player.hiddenSpotId = player.isHiding ? obj.id : null;
            if (audio) audio.playDoorCreak();
            return;
        }

        if (obj.type === 'battery') {
            player.battery = 100;
            obj.collected = true;
            if (audio) audio.playItemPickup();
            if (eventBus) eventBus.emit('itemCollected', { name: 'Flashlight Battery', desc: 'Battery fully charged!' });
            return;
        }

        if (obj.type === 'item') {
            if (player.inventory.length < 4) {
                player.inventory.push({ id: obj.item, name: obj.name, icon: obj.icon, desc: obj.desc });
                obj.collected = true;
                if (audio) audio.playItemPickup();
                if (eventBus) eventBus.emit('itemCollected', obj);
            }
            return;
        }

        if (obj.type === 'note') {
            if (!obj.read) {
                obj.read = true;
                player.loreLogsFound++;
            }
            if (audio) audio.playItemPickup();
            if (eventBus) eventBus.emit('loreFound', obj);
            return;
        }

        if (obj.type === 'fuse_box') {
            const fuseIdxs = [];
            player.inventory.forEach((invItem, idx) => {
                if (invItem.id && invItem.id.startsWith('fuse_')) {
                    fuseIdxs.push(idx);
                }
            });

            if (fuseIdxs.length > 0) {
                fuseIdxs.reverse().forEach(idx => {
                    player.inventory.splice(idx, 1);
                    this.puzzleState.fusesInserted++;
                });

                if (audio) audio.playItemPickup();

                if (this.puzzleState.fusesInserted >= 3) {
                    this.puzzleState.powerRestored = true;
                    obj.label = '⚡ Generator Online (3/3 Fuses Active)';
                } else {
                    obj.label = `Insert 3 Power Fuses (${this.puzzleState.fusesInserted}/3)`;
                }

                if (eventBus) eventBus.emit('puzzleStateChanged');
            }
            return;
        }

        if (obj.type === 'keypad') {
            if (eventBus) eventBus.emit('openKeypad', obj);
            return;
        }

        if (obj.type === 'valve') {
            const wrenchIdx = player.inventory.findIndex(i => i.id === 'wrench');
            if (wrenchIdx !== -1) {
                this.puzzleState.valveTurned = true;
                obj.label = '✅ Steam Valve Closed';
                if (audio) audio.playDoorCreak();
                if (eventBus) eventBus.emit('puzzleStateChanged');
            }
            return;
        }

        if (obj.type === 'centrifuge') {
            const hasReagent = player.inventory.some(i => i.id === 'reagent_x');
            const hasStabilizer = player.inventory.some(i => i.id === 'stabilizer');
            if (hasReagent && hasStabilizer) {
                player.inventory = player.inventory.filter(i => i.id !== 'reagent_x' && i.id !== 'stabilizer');
                player.inventory.push({ id: 'antidote_serum', name: 'Bio-Antidote Serum', icon: '💉', desc: 'Synthesized antidote capable of stopping the mutation' });
                this.puzzleState.serumSynthesized = true;
                obj.label = '✅ Bio-Antidote Synthesized';
                if (audio) audio.playItemPickup();
                if (eventBus) eventBus.emit('puzzleStateChanged');
            }
            return;
        }
    }
}

export const interactionSystem = new InteractionSystem();
