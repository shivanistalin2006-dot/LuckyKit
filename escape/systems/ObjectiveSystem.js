// escape/systems/ObjectiveSystem.js
export const OBJECTIVE_STEPS = [
    { id: 'restore_power', text: 'Find & Insert 3 Colored Fuses into the Generator Room (0/3)' },
    { id: 'unlock_security', text: 'Unlock the Security Hub (Find 4-Digit Keypad Code)' },
    { id: 'clear_steam', text: 'Clear the Scalding Steam Pipe with a Pipe Wrench 🔧' },
    { id: 'escape_gate', text: 'Grab the Master Keycard 💳 & Open the Main Blast Gate' }
];

export class ObjectiveSystem {
    constructor() {
        this.currentStepIndex = 0;
    }

    getCurrentObjective(puzzleState) {
        if (!puzzleState.powerRestored) {
            return `Restore Power Grid (${puzzleState.fusesInserted}/3 Fuses)`;
        } else if (!puzzleState.keypadUnlocked) {
            return `Unlock Security Hub (Keypad Code in Log 01)`;
        } else if (!puzzleState.steamCleared) {
            return `Clear Helipad Corridor Steam with Wrench 🔧`;
        } else {
            return `Grab Master Keycard 💳 & Escape Via Blast Gate`;
        }
    }
}

export const objectiveSystem = new ObjectiveSystem();
