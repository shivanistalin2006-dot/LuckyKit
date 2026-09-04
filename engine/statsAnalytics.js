import { storage } from '../core/storage.js';
import { eventBus } from '../core/eventBus.js';

/**
 * StatsAnalytics - Deep player performance metrics and arcade efficiency calculator.
 */
class StatsAnalytics {
    constructor() {
        this.sessionStartTime = Date.now();
        this.sessionPlays = 0;
        this.sessionWins = 0;
        this.initListeners();
    }

    initListeners() {
        eventBus.on('GAME_OVER', () => {
            this.sessionPlays += 1;
        });

        eventBus.on('GAME_WIN', () => {
            this.sessionWins += 1;
        });
    }

    getWinRate() {
        const state = storage.getState();
        const plays = state.stats?.totalPlays || 0;
        const wins = state.stats?.totalWins || 0;
        if (plays === 0) return 0;
        return Math.round((wins / plays) * 100);
    }

    getSessionDurationMinutes() {
        const elapsedMs = Date.now() - this.sessionStartTime;
        return Math.max(1, Math.round(elapsedMs / 60000));
    }

    /**
     * Calculates an overall Arcade Skill Rating (0 to 1000)
     */
    getSkillRating() {
        const state = storage.getState();
        const wins = state.stats?.totalWins || 0;
        const plays = state.stats?.totalPlays || 0;
        const level = state.level || 1;
        const achievementsCount = state.achievements ? state.achievements.length : 0;

        const baseScore = level * 25;
        const winBonus = wins * 15;
        const achBonus = achievementsCount * 50;
        const ratioMultiplier = plays > 0 ? (wins / plays) : 0.5;

        const score = Math.round((baseScore + winBonus + achBonus) * (0.8 + ratioMultiplier * 0.4));
        return Math.min(9999, Math.max(100, score));
    }

    getPlayerSummary() {
        const state = storage.getState();
        return {
            level: state.level || 1,
            totalPlays: state.stats?.totalPlays || 0,
            totalWins: state.stats?.totalWins || 0,
            winRatePercent: this.getWinRate(),
            skillRating: this.getSkillRating(),
            sessionPlays: this.sessionPlays,
            sessionWins: this.sessionWins,
            sessionDurationMinutes: this.getSessionDurationMinutes()
        };
    }
}

export const statsAnalytics = new StatsAnalytics();
