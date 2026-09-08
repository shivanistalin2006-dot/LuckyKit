// escape/core/SettingsManager.js
export class SettingsManager {
    constructor() {
        this.settings = {
            masterVolume: 1.0,
            sfxVolume: 1.0,
            ambientVolume: 0.8,
            brightness: 1.0,
            sensitivity: 1.0,
            difficulty: 'normal',
            debugMode: false
        };
        this.load();
    }

    load() {
        try {
            const saved = localStorage.getItem('luckykit_escape_settings');
            if (saved) Object.assign(this.settings, JSON.parse(saved));
        } catch(e) {}
    }

    save() {
        try {
            localStorage.setItem('luckykit_escape_settings', JSON.stringify(this.settings));
        } catch(e) {}
    }

    get(key) {
        return this.settings[key];
    }

    set(key, val) {
        this.settings[key] = val;
        this.save();
    }
}

export const settingsManager = new SettingsManager();
