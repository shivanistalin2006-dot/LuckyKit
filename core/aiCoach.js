import { animationManager } from '../animation/animationManager.js';

export class AICoach {
    constructor() {
        if (AICoach.instance) return AICoach.instance;
        AICoach.instance = this;
    }

    analyzeGame(gameId, score, durationMinutes, isWin) {
        let message = "";
        
        if (isWin) {
            if (durationMinutes < 1) {
                message = "🤖 COACH: Flawless speed! Your APM was off the charts.";
            } else {
                message = "🤖 COACH: Solid victory. You maintained excellent control.";
            }
        } else {
            if (score === 0) {
                message = "🤖 COACH: Ouch. Next time, focus on defensive play first.";
            } else if (durationMinutes > 5) {
                message = "🤖 COACH: A long battle. Fatigue might have caused that mistake.";
            } else {
                message = "🤖 COACH: Good effort. Try predicting the enemy's next move.";
            }
        }

        // Display the coach message using animation manager
        if (animationManager && animationManager.spawnHint) {
            animationManager.spawnHint(message, 4000);
        } else {
            console.log(message);
        }
        
        return message;
    }
}

export const aiCoach = new AICoach();
