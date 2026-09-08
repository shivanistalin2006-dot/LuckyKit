// escape/entities/Monster.js
import { PATROL_WAYPOINTS, WALLS } from '../world/FacilityMap.js';

export class Monster {
    constructor(x = 1600, y = 300) {
        this.x = x;
        this.y = y;
        this.radius = 24;
        this.angle = Math.PI;

        // Speeds
        this.baseSpeed = 2.2;
        this.chaseSpeed = 4.6;

        // State Machine: PATROL, INVESTIGATE, DETECT, CHASE, SEARCH, ATTACK
        this.state = 'PATROL';
        this.targetX = x;
        this.targetY = y;
        this.lastKnownPlayerPos = null;

        this.currentNodeIdx = 8;
        this.searchTimer = 0;
        this.growlCooldown = 0;

        // Sensory Parameters
        this.visionAngle = Math.PI * 0.45;
        this.visionRange = 340;
        this.hearingRange = 380;
    }

    setDifficulty(diff) {
        if (diff === 'casual') {
            this.baseSpeed = 1.8;
            this.chaseSpeed = 3.8;
            this.visionRange = 260;
            this.hearingRange = 240;
        } else if (diff === 'nightmare') {
            this.baseSpeed = 2.6;
            this.chaseSpeed = 5.4;
            this.visionRange = 440;
            this.hearingRange = 520;
        } else {
            this.baseSpeed = 2.2;
            this.chaseSpeed = 4.6;
            this.visionRange = 340;
            this.hearingRange = 380;
        }
    }

    update(player, audio, puzzleState) {
        const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);
        const hasLineOfSight = !player.isHiding && !this.checkRayWallOcclusion(this.x, this.y, player.x, player.y);

        // Vision cone check
        const angleToPlayer = Math.atan2(player.y - this.y, player.x - this.x);
        let angleDiff = Math.abs(this.angle - angleToPlayer);
        if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;

        const inVisionCone = angleDiff < this.visionAngle / 2 && distToPlayer < this.visionRange;

        // Hearing Check
        if (player.noiseRadius > 0 && distToPlayer < player.noiseRadius && this.state !== 'CHASE') {
            this.state = 'INVESTIGATE';
            this.targetX = player.x + (Math.random() * 40 - 20);
            this.targetY = player.y + (Math.random() * 40 - 20);
        }

        // Direct Sight Detection -> Chase
        if (inVisionCone && hasLineOfSight) {
            if (this.state !== 'CHASE') {
                audio.playMonsterRoar();
            }
            this.state = 'CHASE';
            this.targetX = player.x;
            this.targetY = player.y;
            this.lastKnownPlayerPos = { x: player.x, y: player.y };
            this.searchTimer = 240;
        }

        // State Execution
        if (this.state === 'CHASE') {
            if (hasLineOfSight) {
                this.targetX = player.x;
                this.targetY = player.y;
                this.lastKnownPlayerPos = { x: player.x, y: player.y };
                this.searchTimer = 240;
            } else {
                this.searchTimer--;
                if (this.searchTimer <= 0) {
                    this.state = 'SEARCH';
                    this.searchTimer = 200;
                }
            }

            this.moveTowards(this.targetX, this.targetY, this.chaseSpeed, puzzleState);

            // Catch test
            if (distToPlayer < this.radius + player.radius && !player.isHiding) {
                return 'CATCH';
            }
        } else if (this.state === 'INVESTIGATE') {
            this.moveTowards(this.targetX, this.targetY, this.baseSpeed * 1.3, puzzleState);
            if (Math.hypot(this.x - this.targetX, this.y - this.targetY) < 30) {
                this.state = 'SEARCH';
                this.searchTimer = 180;
            }
        } else if (this.state === 'SEARCH') {
            this.searchTimer--;
            this.angle += 0.035; // Look around
            if (this.searchTimer <= 0) {
                this.state = 'PATROL';
            }
        } else { // PATROL
            const targetNode = PATROL_WAYPOINTS[this.currentNodeIdx];
            this.moveTowards(targetNode.x, targetNode.y, this.baseSpeed, puzzleState);

            if (Math.hypot(this.x - targetNode.x, this.y - targetNode.y) < 40) {
                this.currentNodeIdx = (this.currentNodeIdx + 1) % PATROL_WAYPOINTS.length;
            }
        }

        return null;
    }

    moveTowards(tx, ty, speed, puzzleState) {
        const dx = tx - this.x;
        const dy = ty - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 5) {
            const targetAngle = Math.atan2(dy, dx);
            this.angle = targetAngle;

            const nextX = this.x + Math.cos(targetAngle) * speed;
            const nextY = this.y + Math.sin(targetAngle) * speed;

            if (!this.checkWallCollision(nextX, this.y, this.radius, puzzleState)) {
                this.x = nextX;
            }
            if (!this.checkWallCollision(this.x, nextY, this.radius, puzzleState)) {
                this.y = nextY;
            }
        }
    }

    checkWallCollision(x, y, r, puzzleState) {
        for (const w of WALLS) {
            if (x + r > w.x && x - r < w.x + w.w && y + r > w.y && y - r < w.y + w.h) {
                if (w.type === 'blast_gate' && puzzleState?.powerRestored) continue;
                return true;
            }
        }
        return false;
    }

    checkRayWallOcclusion(x1, y1, x2, y2) {
        const steps = 15;
        for (let i = 1; i < steps; i++) {
            const rx = x1 + (x2 - x1) * (i / steps);
            const ry = y1 + (y2 - y1) * (i / steps);
            if (this.checkWallCollision(rx, ry, 4, null)) return true;
        }
        return false;
    }
}
