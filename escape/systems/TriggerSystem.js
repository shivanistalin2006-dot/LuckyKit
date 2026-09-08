// escape/systems/TriggerSystem.js
import { eventBus } from '../core/EventBus.js';

export const TRIGGER_VOLUMES = [
    { id: 'trig_ward_reveal', x: 200, y: 200, w: 200, h: 200, triggered: false, event: 'MONSTER_FIRST_REVEAL' },
    { id: 'trig_hub_flicker', x: 800, y: 480, w: 300, h: 100, triggered: false, event: 'LIGHTS_FLICKER_JUMPSCARE' }
];

export class TriggerSystem {
    constructor() {
        this.triggers = TRIGGER_VOLUMES;
    }

    checkTriggers(player) {
        for (const t of this.triggers) {
            if (t.triggered) continue;
            if (player.x >= t.x && player.x <= t.x + t.w && player.y >= t.y && player.y <= t.y + t.h) {
                t.triggered = true;
                eventBus.emit(t.event, t);
            }
        }
    }

    reset() {
        this.triggers.forEach(t => t.triggered = false);
    }
}

export const triggerSystem = new TriggerSystem();
