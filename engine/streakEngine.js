import { storage } from '../core/storage.js';
import { eventBus } from '../core/eventBus.js';

/**
 * StreakEngine - Manages daily active play streaks and streak milestone rewards.
 */
class StreakEngine {
    constructor() {
        this.STORAGE_KEY = 'luckykit_daily_streak';
        this.initStreak();
    }

    getTodayDateString() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    getYesterdayDateString() {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    initStreak() {
        const state = storage.getState();
        if (!state.streak) {
            storage.updateState(s => {
                s.streak = {
                    current: 1,
                    longest: 1,
                    lastActiveDate: this.getTodayDateString(),
                    claimedToday: false
                };
            });
            return;
        }

        const today = this.getTodayDateString();
        const yesterday = this.getYesterdayDateString();
        const streakData = state.streak;

        if (streakData.lastActiveDate === today) {
            // Already recorded for today
            return;
        } else if (streakData.lastActiveDate === yesterday) {
            // Consecutive day!
            storage.updateState(s => {
                s.streak.current += 1;
                if (s.streak.current > s.streak.longest) {
                    s.streak.longest = s.streak.current;
                }
                s.streak.lastActiveDate = today;
                s.streak.claimedToday = false;
            });
            eventBus.emit('STREAK_INCREASED', { current: state.streak.current });
        } else {
            // Streak broken, reset to 1
            storage.updateState(s => {
                s.streak.current = 1;
                s.streak.lastActiveDate = today;
                s.streak.claimedToday = false;
            });
            eventBus.emit('STREAK_RESET', { current: 1 });
        }
    }

    getStreakInfo() {
        const state = storage.getState();
        return state.streak || { current: 1, longest: 1, lastActiveDate: this.getTodayDateString(), claimedToday: false };
    }

    claimDailyStreakReward() {
        const state = storage.getState();
        if (state.streak && state.streak.claimedToday) {
            return { success: false, message: 'Reward already claimed for today!' };
        }

        const currentStreak = state.streak?.current || 1;
        const bonusCoins = Math.min(500, 50 * currentStreak);
        const bonusXp = Math.min(1000, 100 * currentStreak);

        storage.updateState(s => {
            s.streak.claimedToday = true;
            s.coins = (s.coins || 0) + bonusCoins;
            s.xp = (s.xp || 0) + bonusXp;
        });

        eventBus.emit('MISSION_COMPLETE', { coinReward: bonusCoins, xpReward: bonusXp, bpXpReward: 50 });
        eventBus.emit('DAILY_STREAK_CLAIMED', { currentStreak, bonusCoins, bonusXp });
        eventBus.emit('UI_UPDATE');

        return {
            success: true,
            currentStreak,
            bonusCoins,
            bonusXp,
            message: `Claimed Day ${currentStreak} bonus: +${bonusCoins} Coins, +${bonusXp} XP!`
        };
    }
}

export const streakEngine = new StreakEngine();
