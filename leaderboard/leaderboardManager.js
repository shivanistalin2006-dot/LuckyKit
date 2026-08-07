import { storage } from '../core/storage.js';
import { eventBus } from '../core/eventBus.js';

const AI_PLAYERS = [
    { name: 'NeonNinja', avatar: '🥷' },
    { name: 'CyberSamurai', avatar: '🤖' },
    { name: 'PixelPro', avatar: '🕹️' },
    { name: 'ArcadeAce', avatar: '🎯' },
    { name: 'RetroRacer', avatar: '🏎️' }
];

class LeaderboardManager {
    constructor() {
        this.cache = {};
    }

    // Generates a local leaderboard for a specific game ID
    getLeaderboard(gameId, playerScore) {
        if (!this.cache[gameId]) {
            // Generate stable AI scores for this game based on string hashing so they don't change every load
            const hash = gameId.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
            
            this.cache[gameId] = AI_PLAYERS.map((ai, index) => {
                // Generate a pseudo-random score that looks realistic (between 1000 and 10000)
                const baseScore = Math.abs(hash * (index + 1)) % 9000 + 1000;
                return {
                    name: ai.name,
                    avatar: ai.avatar,
                    score: baseScore,
                    isPlayer: false
                };
            });
        }

        const state = storage.getState();
        const highScore = Math.max(state.stats.highScores[gameId] || 0, playerScore || 0);

        const currentLeaderboard = [...this.cache[gameId], {
            name: state.playerName || 'You',
            avatar: state.activeAvatar || '👾',
            score: highScore,
            isPlayer: true
        }];

        // Sort descending
        currentLeaderboard.sort((a, b) => b.score - a.score);
        
        return currentLeaderboard;
    }
}

export const leaderboardManager = new LeaderboardManager();
