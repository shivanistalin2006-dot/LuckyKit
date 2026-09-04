import { eventBus } from '../core/eventBus.js';

/**
 * GamepadEngine - HTML5 Gamepad API & Arcade Universal Shortcut Controller
 */
class GamepadEngine {
    constructor() {
        this.activeGamepadIndex = null;
        this.pollingInterval = null;
        this.buttonStates = {};
        this.initListeners();
    }

    initListeners() {
        if (typeof window === 'undefined') return;

        window.addEventListener('gamepadconnected', (e) => {
            this.activeGamepadIndex = e.gamepad.index;
            eventBus.emit('GAMEPAD_CONNECTED', { id: e.gamepad.id });
            this.startPolling();
        });

        window.addEventListener('gamepaddisconnected', (e) => {
            if (this.activeGamepadIndex === e.gamepad.index) {
                this.activeGamepadIndex = null;
                this.stopPolling();
                eventBus.emit('GAMEPAD_DISCONNECTED', { id: e.gamepad.id });
            }
        });

        // Global hotkeys
        window.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (e.key === 'm' || e.key === 'M') {
                eventBus.emit('HOTKEY_MUTE_TOGGLE');
            } else if (e.key === 'f' || e.key === 'F') {
                this.toggleFullscreen();
            } else if (e.key === 'Escape') {
                eventBus.emit('HOTKEY_ESCAPE');
            }
        });
    }

    startPolling() {
        if (this.pollingInterval) return;
        this.pollingInterval = setInterval(() => this.pollStatus(), 30);
    }

    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    pollStatus() {
        if (this.activeGamepadIndex === null) return;
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        const gp = gamepads[this.activeGamepadIndex];
        if (!gp) return;

        // Check primary action buttons
        gp.buttons.forEach((btn, idx) => {
            const wasPressed = !!this.buttonStates[idx];
            const isPressed = btn.pressed;
            if (isPressed && !wasPressed) {
                eventBus.emit('GAMEPAD_BUTTON_DOWN', { buttonIndex: idx });
            } else if (!isPressed && wasPressed) {
                eventBus.emit('GAMEPAD_BUTTON_UP', { buttonIndex: idx });
            }
            this.buttonStates[idx] = isPressed;
        });
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
            eventBus.emit('FULLSCREEN_CHANGED', { isFullscreen: true });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
                eventBus.emit('FULLSCREEN_CHANGED', { isFullscreen: false });
            }
        }
    }
}

export const gamepadEngine = new GamepadEngine();
