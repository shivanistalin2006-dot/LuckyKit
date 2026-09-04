const STORAGE_KEY = 'luckykit_profile_v2';

const DEFAULT_STATE = {
    coins: 100, // Starting coins
    xp: 0,
    level: 1,
    rank: 'Bronze', // Bronze, Silver, Gold, Platinum, Diamond, Master, Grandmaster, Legend, Cyber God
    prestige: 0,
    playTime: 0, // In minutes
    lastLogin: null,
    consecutiveLogins: 0,
    inventory: {
        themes: ['dark'], // default theme unlocked
        avatars: ['👾'], // default avatar unlocked
        borders: ['none'],
        particles: ['none'],
        crates: {
            common: 0,
            rare: 0,
            epic: 0,
            legendary: 0,
            mythic: 0
        }
    },
    activeTheme: 'dark',
    activeAvatar: '👾',
    activeBorder: 'none',
    activeParticle: 'none',
    playerName: 'Player 1',
    stats: {
        totalPlays: 0,
        totalWins: 0,
        highScores: {}, // { "space_strike": 5000 }
        gameStats: {} // { "chess": { wins: 0, losses: 0 } }
    },
    achievements: [], // array of achievement IDs completed
    missions: {
        daily: [], // [{ id, type, target, progress, reward, completed }]
        lastGeneratedDaily: null
    }
};

class StorageManager {
    constructor() {
        this.state = this.loadState();
    }

    loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                // Deep merge default state with saved state to ensure new keys are present
                return this.deepMerge(DEFAULT_STATE, JSON.parse(raw));
            }
        } catch (e) {
            console.error("Failed to load state", e);
        }
        return JSON.parse(JSON.stringify(DEFAULT_STATE)); // Return clone of default
    }

    saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        } catch (e) {
            console.error("Failed to save state", e);
        }
    }

    getState() {
        return this.state;
    }

    updateState(updater) {
        if (typeof updater === 'function') {
            updater(this.state);
        } else if (updater && typeof updater === 'object') {
            Object.assign(this.state, updater);
        }
        this.saveState();
    }

    deepMerge(target, source) {
        const output = Object.assign({}, target);
        if (isObject(target) && isObject(source)) {
            Object.keys(source).forEach(key => {
                if (isObject(source[key])) {
                    if (!(key in target))
                        Object.assign(output, { [key]: source[key] });
                    else
                        output[key] = this.deepMerge(target[key], source[key]);
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    }
    
    // For standalone high scores (legacy support)
    get(key, defaultValue = null) {
        return localStorage.getItem(key) || defaultValue;
    }
    set(key, value) {
        localStorage.setItem(key, value);
    }
}

function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

export const storage = new StorageManager();
