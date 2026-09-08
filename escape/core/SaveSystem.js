// escape/core/SaveSystem.js
export class SaveSystem {
    constructor() {
        this.STORAGE_KEY = 'luckykit_escape_savegame';
    }

    saveCheckpoint(data) {
        try {
            const payload = {
                timestamp: Date.now(),
                player: {
                    x: data.player.x,
                    y: data.player.y,
                    health: data.player.health,
                    battery: data.player.battery,
                    inventory: data.player.inventory
                },
                objectiveId: data.objectiveId,
                puzzleFlags: data.puzzleFlags,
                difficulty: data.difficulty
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payload));
            return true;
        } catch(e) {
            return false;
        }
    }

    loadCheckpoint() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            return saved ? JSON.parse(saved) : null;
        } catch(e) {
            return null;
        }
    }

    clearSave() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
        } catch(e) {}
    }
}

export const saveSystem = new SaveSystem();
