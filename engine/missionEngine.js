import { storage } from '../core/storage.js';
import { eventBus } from '../core/eventBus.js';

const MISSION_POOL = [
    { id: 'play_3', type: 'play', target: 3, desc: "Play 3 Games", coins: 50, xp: 100, bp: 200 },
    { id: 'play_5', type: 'play', target: 5, desc: "Play 5 Games", coins: 100, xp: 200, bp: 300 },
    { id: 'win_1', type: 'win', target: 1, desc: "Win 1 Game", coins: 75, xp: 150, bp: 250 },
    { id: 'score_1000', type: 'score', target: 1000, desc: "Score 1000 in a single game", coins: 150, xp: 300, bp: 500 }
];

class MissionEngine {
    constructor() {
        eventBus.on('DAY_CHANGED', (data) => this.generateDailyMissions(data.date));
        eventBus.on('GAME_OVER', (data) => this.processEvent('play', 1, data));
        eventBus.on('GAME_WIN', (data) => this.processEvent('win', 1, data));
        
        // Also process score for every game over
        eventBus.on('GAME_OVER', (data) => {
            if (data.score) {
                this.processEvent('score', data.score, data, true); // true = replace instead of add
            }
        });

        // Initialize missions if none exist
        this.init();
    }

    init() {
        const state = storage.getState();
        const todayStr = new Date().toISOString().split('T')[0];
        
        if (state.missions.lastGeneratedDaily !== todayStr || state.missions.daily.length === 0) {
            this.generateDailyMissions(todayStr);
        }
    }

    generateDailyMissions(dateStr) {
        storage.updateState(state => {
            state.missions.lastGeneratedDaily = dateStr;
            
            // Pick 3 random unique missions
            const shuffled = [...MISSION_POOL].sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, 3);
            
            state.missions.daily = selected.map(m => ({
                id: m.id,
                desc: m.desc,
                type: m.type,
                target: m.target,
                progress: 0,
                completed: false,
                rewards: { coins: m.coins, xp: m.xp, bp: m.bp }
            }));
        });
        eventBus.emit('UI_UPDATE');
    }

    processEvent(type, amount, eventData, replace = false) {
        storage.updateState(state => {
            let updated = false;
            
            state.missions.daily.forEach(mission => {
                if (!mission.completed && mission.type === type) {
                    if (replace) {
                        mission.progress = Math.max(mission.progress, amount);
                    } else {
                        mission.progress += amount;
                    }
                    
                    if (mission.progress >= mission.target) {
                        mission.progress = mission.target;
                        mission.completed = true;
                        
                        // Emit mission complete event
                        setTimeout(() => {
                            eventBus.emit('MISSION_COMPLETE', {
                                coinReward: mission.rewards.coins,
                                xpReward: mission.rewards.xp,
                                bpXpReward: mission.rewards.bp,
                                missionName: mission.desc
                            });
                        }, 0);
                    }
                    updated = true;
                }
            });
            
            if (updated) eventBus.emit('UI_UPDATE');
        });
    }
}

export const missionEngine = new MissionEngine();
