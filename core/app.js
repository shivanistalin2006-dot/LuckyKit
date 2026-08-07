import { eventBus } from './eventBus.js';
import { storage } from './storage.js';
import { audioManager } from '../audio/audioManager.js';
import { profileManager } from '../profile/profileManager.js';
import { xpEngine } from '../engine/xpEngine.js';

// Import UI and other systems just to ensure they load
import { navbarUI } from '../ui/navbar.js';
import { sidebarUI } from '../ui/sidebar.js';
import { modalUI } from '../ui/modal.js';
import { toastUI } from '../ui/toast.js';
import { loaderUI } from '../ui/loader.js';
import { premiumEngine } from '../engine/premiumEngine.js';
import { economyEngine } from '../engine/economyEngine.js';
import { achievementEngine } from '../engine/achievementEngine.js';
import { battlePassEngine } from '../engine/battlePassEngine.js';
import { animationManager } from '../animation/animationManager.js';
import { themeManager } from '../theme/themeManager.js';
import { shopManager, SHOP_CATALOG } from '../shop/shopManager.js';
import { leaderboardManager } from '../leaderboard/leaderboardManager.js';
import { gameManager } from './gameManager.js';
import { router } from './router.js';

// Import all progression engines to initialize them
import '../engine/missionEngine.js';
import '../ui/progressionUI.js';
import '../ui/animations.js';
import '../ui/v2-dashboard.js'; // V2 Launcher UI Binder

window.LuckyKit = {
    gameManager,
    storage,
    eventBus,
    shopManager,
    profileManager,
    leaderboardManager,
    SHOP_CATALOG
};

class App {
    constructor() {
        this.initBackwardCompatibility();
        this.initEvents();
        console.log("LuckyKit Premium Arcade Architecture Initialized");
    }

    initBackwardCompatibility() {
        // Map old window.ArcadeSounds to new audioManager
        window.ArcadeSounds = audioManager;

        // Map old window.ArcadeCore to new xpEngine & profileManager
        window.ArcadeCore = {
            state: profileManager.getState(),
            addXP: (amount) => xpEngine.addXP(amount),
            trackPlay: (gameId) => xpEngine.trackPlay(gameId),
            trackWin: (gameId) => xpEngine.trackWin(gameId),
            updateProfile: (name, avatar) => profileManager.updateProfile(name, avatar),
            toggleMute: () => profileManager.toggleMute(),
            subscribe: (cb) => {
                // Initial call
                cb(profileManager.getState());
                // Subscribe to future updates
                eventBus.on("profileUpdated", cb);
            },
            getAchievementsList: () => {
                return [
                    { id: "first_game", title: "Novice Gamer", desc: "Play your first game", icon: "🥉" },
                    { id: "level_5", title: "Rising Star", desc: "Reach Level 5", icon: "🥈" },
                    { id: "level_10", title: "Arcade Legend", desc: "Reach Level 10", icon: "🥇" },
                    { id: "winner_1", title: "First Win", desc: "Win your first game match", icon: "🏆" },
                    { id: "winner_10", title: "Champion", desc: "Win 10 game matches", icon: "👑" },
                    { id: "xp_collector", title: "XP Grinder", desc: "Earn 1000 total XP", icon: "⚡" }
                ];
            }
        };

        // Sync mute state on boot
        audioManager.setMuted(profileManager.getState().muted);
    }

    initEvents() {
        eventBus.on("muteToggled", (isMuted) => {
            audioManager.setMuted(isMuted);
            if (isMuted) {
                audioManager.stopBgMusic();
            } else {
                audioManager.startBgMusic();
            }
        });
        
        eventBus.on("levelUp", (level) => {
            audioManager.playLevelUp();
            console.log("Leveled up to", level);
            // In the future, animationManager will handle the DOM overlay
        });
    }
}

export const app = new App();
