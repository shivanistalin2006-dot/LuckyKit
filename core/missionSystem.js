import { storage } from './storage.js';

const MISSION_TEMPLATES = [
    { type: 'play', target: 3, desc: 'Play 3 games.', reward: { type: 'xp', amount: 500 } },
    { type: 'win', target: 1, desc: 'Win a game.', reward: { type: 'coins', amount: 200 } },
    { type: 'score', target: 1000, desc: 'Score 1000 total points across games.', reward: { type: 'crate', id: 'common' } }
];

export class MissionSystem {
    constructor() {
        if (MissionSystem.instance) return MissionSystem.instance;
        MissionSystem.instance = this;
        this.checkDailyReset();
    }

    checkDailyReset() {
        const state = storage.getState();
        const today = new Date().toDateString();
        
        if (state.missions.lastGeneratedDaily !== today) {
            this.generateDailyMissions(today);
            this.handleLoginBonus(state, today);
        }
    }

    handleLoginBonus(state, today) {
        let logins = state.consecutiveLogins || 0;
        const lastLogin = state.lastLogin ? new Date(state.lastLogin) : null;
        
        if (lastLogin) {
            const diffTime = Math.abs(new Date(today) - lastLogin);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) logins++;
            else if (diffDays > 1) logins = 1; // reset streak
        } else {
            logins = 1;
        }
        
        storage.updateState(s => {
            s.consecutiveLogins = logins;
            s.lastLogin = today;
            // Reward logic
            if (logins % 7 === 0) s.inventory.crates.epic++;
            else s.coins += 50;
        });
    }

    generateDailyMissions(today) {
        const selected = [];
        const templates = [...MISSION_TEMPLATES];
        
        // Pick 3 random
        for (let i = 0; i < 3; i++) {
            if (templates.length === 0) break;
            const idx = Math.floor(Math.random() * templates.length);
            const t = templates.splice(idx, 1)[0];
            selected.push({
                id: `mission_${Date.now()}_${i}`,
                type: t.type,
                target: t.target,
                progress: 0,
                desc: t.desc,
                reward: t.reward,
                completed: false
            });
        }
        
        storage.updateState(s => {
            s.missions.daily = selected;
            s.missions.lastGeneratedDaily = today;
        });
    }

    updateProgress(type, amount) {
        let changed = false;
        storage.updateState(state => {
            state.missions.daily.forEach(m => {
                if (!m.completed && m.type === type) {
                    m.progress += amount;
                    if (m.progress >= m.target) {
                        m.progress = m.target;
                        m.completed = true;
                        this.grantReward(state, m.reward);
                        changed = true;
                    }
                }
            });
        });
        if (changed) {
            console.log("Mission Completed!");
        }
    }

    grantReward(state, reward) {
        if (reward.type === 'xp') state.xp += reward.amount; // Need to hook playerProfile up cleanly later
        if (reward.type === 'coins') state.coins += reward.amount;
        if (reward.type === 'crate') state.inventory.crates[reward.id]++;
    }
}

export const missionSystem = new MissionSystem();
