// escape/entities/Player.js
import { WALLS, MAP_WIDTH, MAP_HEIGHT } from '../world/FacilityMap.js';

export class Player {
    constructor(x = 200, y = 800) {
        this.x = x;
        this.y = y;
        this.radius = 18;
        this.angle = 0;

        // Vitals
        this.health = 100;
        this.maxHealth = 100;
        this.stamina = 100;
        this.maxStamina = 100;
        this.battery = 100;

        // States
        this.speed = 2.8;
        this.isSprinting = false;
        this.isCrouching = false;
        this.isHiding = false;
        this.hiddenSpotId = null;
        this.flashlightOn = true;
        this.noiseRadius = 0;

        this.inventory = [];
        this.loreLogsFound = 0;
    }

    update(keys, mobileVector, puzzleState) {
        if (this.isHiding) {
            this.noiseRadius = 0;
            return;
        }

        let moveX = 0;
        let moveY = 0;

        if (keys['KeyW'] || keys['ArrowUp']) moveY -= 1;
        if (keys['KeyS'] || keys['ArrowDown']) moveY += 1;
        if (keys['KeyA'] || keys['ArrowLeft']) moveX -= 1;
        if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;

        if (mobileVector && (mobileVector.x !== 0 || mobileVector.y !== 0)) {
            moveX = mobileVector.x;
            moveY = mobileVector.y;
        }

        const isMoving = moveX !== 0 || moveY !== 0;

        this.isSprinting = (keys['ShiftLeft'] || keys['ShiftRight'] || keys['mobileSprint']) && isMoving && this.stamina > 5;
        this.isCrouching = keys['KeyC'] || keys['ControlLeft'] || keys['mobileCrouch'];

        if (this.isSprinting) {
            this.speed = 5.2;
            this.stamina = Math.max(0, this.stamina - 0.35);
            this.noiseRadius = 380; // Large sound circle
        } else if (this.isCrouching) {
            this.speed = 1.6;
            this.stamina = Math.min(100, this.stamina + 0.3);
            this.noiseRadius = 0; // Silent
        } else {
            this.speed = 2.8;
            this.stamina = Math.min(100, this.stamina + 0.2);
            this.noiseRadius = isMoving ? 140 : 0;
        }

        if (isMoving) {
            const length = Math.hypot(moveX, moveY);
            const normX = (moveX / length) * this.speed;
            const normY = (moveY / length) * this.speed;

            const nextX = this.x + normX;
            const nextY = this.y + normY;

            if (!this.checkWallCollision(nextX, this.y, this.radius, puzzleState)) {
                this.x = nextX;
            }
            if (!this.checkWallCollision(this.x, nextY, this.radius, puzzleState)) {
                this.y = nextY;
            }
        }

        // Flashlight battery consumption
        if (this.flashlightOn && this.battery > 0) {
            this.battery = Math.max(0, this.battery - 0.015);
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

    damage(amount) {
        this.health = Math.max(0, this.health - amount);
        return this.health <= 0;
    }
}
