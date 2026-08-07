import { storage } from './storage.js';
import { animationManager } from '../animation/animationManager.js';
import { audioManager } from '../audio/audioManager.js';

const XP_BASE = 1000;
const XP_MULTIPLIER = 1.5;

const RANKS = [
    { name: 'Bronze', minLevel: 1 },
    { name: 'Silver', minLevel: 10 },
    { name: 'Gold', minLevel: 25 },
    { name: 'Platinum', minLevel: 40 },
    { name: 'Diamond', minLevel: 60 },
    { name: 'Master', minLevel: 80 },
    { name: 'Grandmaster', minLevel: 90 },
    { name: 'Legend', minLevel: 95 },
    { name: 'Cyber God', minLevel: 100 }
];

export class PlayerProfile {
    constructor() {
        // Singleton pattern
        if (PlayerProfile.instance) return PlayerProfile.instance;
        PlayerProfile.instance = this;
    }

    getXpForNextLevel(level) {
        return Math.floor(XP_BASE * Math.pow(XP_MULTIPLIER, level - 1));
    }

    addXP(amount) {
        if (amount <= 0) return;
        
        storage.updateState(state => {
            state.xp += amount;
            
            // Check for level up
            let nextLevelXp = this.getXpForNextLevel(state.level);
            while (state.xp >= nextLevelXp && state.level < 100) {
                state.xp -= nextLevelXp;
                state.level++;
                this.triggerLevelUp(state.level);
                nextLevelXp = this.getXpForNextLevel(state.level);
            }
            
            // Update Rank
            const currentRank = this.calculateRank(state.level);
            if (state.rank !== currentRank) {
                state.rank = currentRank;
                this.triggerRankUp(currentRank);
            }
        });
    }

    triggerLevelUp(newLevel) {
        console.log(`Level Up! You are now Level ${newLevel}`);
        if (audioManager) audioManager.playTone(800, 'sine', 0.2);
        if (animationManager) {
            // Can be hooked up to UI notification system later
            animationManager.spawnFloatingIcon('⭐', window.innerWidth/2, window.innerHeight/2, `LEVEL ${newLevel}!`);
            animationManager.spawnConfetti(window.innerWidth/2, window.innerHeight/2, 50);
        }
    }

    triggerRankUp(newRank) {
        console.log(`Rank Up! You reached ${newRank}`);
        if (audioManager) audioManager.playTone(1000, 'square', 0.3);
    }

    calculateRank(level) {
        let current = RANKS[0].name;
        for (const rank of RANKS) {
            if (level >= rank.minLevel) {
                current = rank.name;
            } else {
                break;
            }
        }
        return current;
    }

    prestige() {
        const state = storage.getState();
        if (state.level >= 100) {
            storage.updateState(s => {
                s.prestige++;
                s.level = 1;
                s.xp = 0;
                s.rank = 'Bronze';
                // Award Prestige Crate
                s.inventory.crates.mythic++; 
            });
            return true;
        }
        return false;
    }

    addPlayTime(minutes) {
        storage.updateState(state => {
            state.playTime += minutes;
        });
    }

    recordGameStats(gameId, isWin) {
        storage.updateState(state => {
            state.stats.totalPlays++;
            if (isWin) state.stats.totalWins++;
            
            if (!state.stats.gameStats[gameId]) {
                state.stats.gameStats[gameId] = { plays: 0, wins: 0, losses: 0 };
            }
            
            state.stats.gameStats[gameId].plays++;
            if (isWin) {
                state.stats.gameStats[gameId].wins++;
            } else {
                state.stats.gameStats[gameId].losses++;
            }
        });
    }
}

export const playerProfile = new PlayerProfile();
