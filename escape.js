// escape.js - Main Entry Point for Escape From Monster
import { GameManager } from './escape/core/GameManager.js';

let escapeInstance = null;

window.addEventListener('DOMContentLoaded', () => {
    try {
        escapeInstance = new GameManager();
        window.escapeGame = escapeInstance;
    } catch(e) {
        console.error("Failed to initialize Escape From Monster:", e);
    }
});

export { escapeInstance };
