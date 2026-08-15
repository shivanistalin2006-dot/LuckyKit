import { BaseGame } from './core/BaseGame.js?v=2.5';
import { gameManager } from './core/gameManager.js';

// =========================
// CASINO ANIMATED BACKGROUND (Standalone)
// =========================
const bgCanvas = document.getElementById('bgCanvas');
const bgCtx = bgCanvas.getContext('2d');
bgCanvas.width = window.innerWidth;
bgCanvas.height = window.innerHeight;

let coins = [];
let casinoLights = [];
let goldenParticles = [];
let floatingTexts = [];
const goldColors = ['#ffd700', '#ffcc00', '#ffb84d', '#ffeb3b', '#ffd97d'];
const neonColors = ['#ff00ff', '#00ffff', '#ffff00', '#ff0066', '#00ff00'];

// Background classes (Coin, CasinoLight, GoldenParticle, FloatingText) are preserved
class Coin {
    constructor() {
        this.x = Math.random() * bgCanvas.width;
        this.y = Math.random() * bgCanvas.height;
        this.size = Math.random() * 15 + 10;
        this.speedY = Math.random() * 1 + 0.5;
        this.rotation = Math.random() * Math.PI;
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;
        this.color = goldColors[Math.floor(Math.random() * goldColors.length)];
        this.opacity = Math.random() * 0.6 + 0.4;
    }
    update() {
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
        if (this.y > bgCanvas.height + 20) { this.y = -20; this.x = Math.random() * bgCanvas.width; }
    }
    draw() {
        bgCtx.save();
        bgCtx.globalAlpha = this.opacity;
        bgCtx.translate(this.x, this.y);
        bgCtx.rotate(this.rotation);
        bgCtx.beginPath();
        bgCtx.arc(0, 0, this.size, 0, Math.PI * 2);
        bgCtx.fillStyle = this.color;
        bgCtx.shadowBlur = 15;
        bgCtx.shadowColor = '#ffd700';
        bgCtx.fill();
        bgCtx.beginPath();
        bgCtx.arc(0, 0, this.size * 0.7, 0, Math.PI * 2);
        bgCtx.fillStyle = '#ffeb3b';
        bgCtx.fill();
        bgCtx.font = `${this.size}px Arial`;
        bgCtx.textAlign = 'center';
        bgCtx.textBaseline = 'middle';
        bgCtx.fillStyle = '#b8860b';
        bgCtx.fillText('$', 0, 0);
        bgCtx.restore();
    }
}
class CasinoLight {
    constructor() {
        this.x = Math.random() * bgCanvas.width;
        this.y = Math.random() * bgCanvas.height;
        this.size = Math.random() * 30 + 20;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.color = neonColors[Math.floor(Math.random() * neonColors.length)];
        this.pulse = 0;
        this.rotation = Math.random() * Math.PI;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.pulse += 0.05;
        this.rotation += this.rotationSpeed;
        if (this.x > bgCanvas.width + this.size) this.x = -this.size;
        if (this.x < -this.size) this.x = bgCanvas.width + this.size;
        if (this.y > bgCanvas.height + this.size) this.y = -this.size;
        if (this.y < -this.size) this.y = bgCanvas.height + this.size;
    }
    draw() {
        bgCtx.save();
        bgCtx.translate(this.x, this.y);
        bgCtx.rotate(this.rotation);
        const pulseSize = this.size + Math.sin(this.pulse) * 10;
        const gradient = bgCtx.createRadialGradient(0, 0, 0, 0, 0, pulseSize * 2);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.5, this.color + '88');
        gradient.addColorStop(1, 'transparent');
        bgCtx.beginPath();
        bgCtx.arc(0, 0, pulseSize * 2, 0, Math.PI * 2);
        bgCtx.fillStyle = gradient;
        bgCtx.fill();
        bgCtx.fillStyle = this.color;
        bgCtx.shadowBlur = 20;
        bgCtx.shadowColor = this.color;
        bgCtx.fillRect(-pulseSize, -2, pulseSize * 2, 4);
        bgCtx.restore();
    }
}
class GoldenParticle {
    constructor() {
        this.x = Math.random() * bgCanvas.width;
        this.y = bgCanvas.height + 10;
        this.size = Math.random() * 4 + 1;
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = -Math.random() * 8 - 3;
        this.color = goldColors[Math.floor(Math.random() * goldColors.length)];
        this.alpha = 1;
        this.gravity = 0.15;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.alpha -= 0.015;
        if (this.y > bgCanvas.height && this.vy > 0) {
            this.vy = -this.vy * 0.5;
            this.y = bgCanvas.height;
        }
    }
    draw() {
        bgCtx.save();
        bgCtx.globalAlpha = this.alpha;
        bgCtx.beginPath();
        bgCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        bgCtx.fillStyle = this.color;
        bgCtx.shadowBlur = 10;
        bgCtx.shadowColor = this.color;
        bgCtx.fill();
        bgCtx.restore();
    }
}
class FloatingText {
    constructor() {
        this.x = Math.random() * bgCanvas.width;
        this.y = -30;
        this.text = ['🎁', '💰', '💎', '⭐', '🎰', '🏆'][Math.floor(Math.random() * 6)];
        this.size = Math.random() * 20 + 15;
        this.speedY = Math.random() * 1 + 0.5;
        this.opacity = 0;
        this.fadeIn = true;
    }
    update() {
        this.y += this.speedY;
        if (this.fadeIn) {
            this.opacity += 0.02;
            if (this.opacity >= 0.6) this.fadeIn = false;
        } else {
            this.opacity -= 0.005;
        }
        if (this.y > bgCanvas.height + 30 || this.opacity <= 0) {
            this.y = -30;
            this.x = Math.random() * bgCanvas.width;
            this.opacity = 0;
            this.fadeIn = true;
        }
    }
    draw() {
        bgCtx.save();
        bgCtx.globalAlpha = Math.max(0, this.opacity);
        bgCtx.font = `${this.size}px Arial`;
        bgCtx.textAlign = 'center';
        bgCtx.textBaseline = 'middle';
        bgCtx.fillStyle = '#ffd700';
        bgCtx.shadowBlur = 15;
        bgCtx.shadowColor = '#ffd700';
        bgCtx.fillText(this.text, this.x, this.y);
        bgCtx.restore();
    }
}
function initBackground() {
    for (let i = 0; i < 30; i++) coins.push(new Coin());
    for (let i = 0; i < 15; i++) casinoLights.push(new CasinoLight());
    for (let i = 0; i < 20; i++) floatingTexts.push(new FloatingText());
}
function animateBackground() {
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    const gradient = bgCtx.createLinearGradient(0, 0, 0, bgCanvas.height);
    gradient.addColorStop(0, '#1a0a00');
    gradient.addColorStop(0.3, '#2d1a00');
    gradient.addColorStop(0.6, '#1a1a00');
    gradient.addColorStop(1, '#0d0d00');
    bgCtx.fillStyle = gradient;
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
    
    casinoLights.forEach(light => { light.update(); light.draw(); });
    coins.forEach(coin => { coin.update(); coin.draw(); });
    floatingTexts.forEach(text => { text.update(); text.draw(); });
    
    if (goldenParticles.length < 50) goldenParticles.push(new GoldenParticle());
    goldenParticles.forEach((particle, i) => {
        particle.update();
        particle.draw();
        if (particle.alpha <= 0) goldenParticles.splice(i, 1);
    });
    
    for (let i = 0; i < 7; i++) {
        const x = (Date.now() * 0.08 + i * 150) % bgCanvas.width;
        const beamGradient = bgCtx.createLinearGradient(x, 0, x + 150, bgCanvas.height);
        beamGradient.addColorStop(0, 'transparent');
        beamGradient.addColorStop(0.3, '#ffd70033');
        beamGradient.addColorStop(0.7, '#ffd70066');
        beamGradient.addColorStop(1, 'transparent');
        bgCtx.fillStyle = beamGradient;
        bgCtx.globalAlpha = 0.15;
        bgCtx.fillRect(x - 75, 0, 150, bgCanvas.height);
        bgCtx.globalAlpha = 1;
    }
    requestAnimationFrame(animateBackground);
}
window.addEventListener('resize', () => { bgCanvas.width = window.innerWidth; bgCanvas.height = window.innerHeight; initBackground(); });
initBackground();
animateBackground();

// =========================
// LUCK BOX GAME (Using BaseGame)
// =========================
class MysteryVault extends BaseGame {
    constructor() {
        super("mystery_vault");

        this.container = document.getElementById("boxContainer");
        this.scoreEl = document.getElementById("score");
        this.lifeEl = document.getElementById("lives");
        this.multiEl = document.getElementById("multi");
        this.highScoreEl = document.getElementById("highScore");
        this.cashOutBtn = document.getElementById("cashOutBtn");
        this.overlay = document.getElementById("gameOverlay");
        this.overlayBtn = document.getElementById("overlayBtn");
        this.overlayTitle = document.getElementById("overlayTitle");
        this.overlayMessage = document.getElementById("overlayMessage");

        this.highScoreEl.innerText = this.highScore;

        this.clickSound = new Audio("https://www.soundjay.com/buttons/sounds/button-16.mp3");
        this.bombSound = new Audio("https://www.soundjay.com/explosion/sounds/explosion-01.mp3");
        this.jackpotSound = new Audio("https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3");

        this.timerEl = document.createElement("div");
        this.timerEl.style.marginBottom = "15px";
        this.timerEl.style.fontSize = "22px";
        this.timerEl.style.fontWeight = "700";
        this.timerEl.style.color = "#ffd700";
        document.querySelector(".game").prepend(this.timerEl);

        this.cashOutBtn.addEventListener("click", () => {
            if (!this.isRunning) return;
            this.showBurst("🏆 CASHED OUT!", "win");
            this.gameOver(true);
        });

        gameManager.registerGame(this);
    }

    onStart() {
        this.lives = 3;
        this.multiplier = 1;
        this.timeLeft = 30;
        this.timerEl.innerText = "⏱ Time Left: 30s";
        this.updateUI();
        this.createBoxes();
        
        clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            if (this.isPaused) return;
            this.timeLeft--;
            this.timerEl.innerText = "⏱ Time Left: " + this.timeLeft + "s";
            if (this.timeLeft <= 0) this.gameOver(false);
        }, 1000);

        this.showBurst("🎮 GAME START!", "win");
        this.overlay.classList.add("hidden");
    }

    updateUI() {
        this.scoreEl.innerText = this.score;
        this.lifeEl.innerText = this.lives;
        this.multiEl.innerText = "x" + this.multiplier;
        this.highScoreEl.innerText = this.highScore;
        this.scoreEl.style.transform = "scale(1.3)";
        setTimeout(() => { this.scoreEl.style.transform = "scale(1)"; }, 200);
    }

    onScoreUpdate(score, highScore) {
        this.updateUI();
    }

    createBoxes() {
        this.container.innerHTML = "";
        const totalBoxes = 12;
        const bombPositions = new Set();
        while (bombPositions.size < 3) {
            bombPositions.add(Math.floor(Math.random() * totalBoxes));
        }

        for (let i = 0; i < totalBoxes; i++) {
            const box = document.createElement("div");
            box.classList.add("box");
            box.innerText = "🎁";
            box.dataset.type = bombPositions.has(i) ? "bomb" : this.randomType();
            box.addEventListener("click", () => this.openBox(box));
            this.container.appendChild(box);
        }
    }

    randomType() {
        let r = Math.random();
        if (r < 0.10) return "jackpot";
        if (r < 0.25) return "bonus";
        if (r < 0.28) return "mega";
        return "safe";
    }

    openBox(box) {
        if (!this.isRunning || this.isPaused || box.classList.contains("open")) return;
        
        box.classList.add("open");
        this.clickSound.currentTime = 0;
        this.clickSound.play();
        
        const type = box.dataset.type;
        
        if (type === "bomb") {
            box.innerText = "💣";
            this.bombSound.currentTime = 0;
            this.bombSound.play();
            this.lives--;
            this.multiplier = 1;
            this.shake();
            this.showBurst("💥 OOPS! BOMB!", "error");
        } else if (type === "jackpot") {
            box.innerText = "💰💰";
            this.jackpotSound.currentTime = 0;
            this.jackpotSound.play();
            this.addScore(100 * this.multiplier);
            this.multiplier += 2;
            this.showBurst("🎉 JACKPOT!", "win");
            box.classList.add("jackpot");
        } else if (type === "mega") {
            box.innerText = "💎";
            this.addScore(1000);
            this.showBurst("💎 MEGA JACKPOT 💎", "win");
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        } else if (type === "bonus") {
            box.innerText = "⭐";
            this.addScore(30 * this.multiplier);
            this.multiplier++;
            this.showBurst(`⭐ BONUS! x${this.multiplier}`, "combo");
        } else {
            box.innerText = "💰";
            this.addScore(10 * this.multiplier);
        }
        
        this.updateUI();
        
        if (this.lives <= 0) {
            this.gameOver(false);
            return;
        }
        
        const remaining = document.querySelectorAll(".box:not(.open)").length;
        if (remaining === 0) {
            this.createBoxes();
            this.showBurst("🎁 NEW ROUND!", "win");
        }
    }

    shake() {
        document.body.classList.add("shake");
        setTimeout(() => { document.body.classList.remove("shake"); }, 300);
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }

    showBurst(text, type = "win") {
        const burst = document.createElement("div");
        burst.className = type === "error" ? "burst-effect" : type === "combo" ? "combo-text" : "burst-effect";
        burst.innerText = text;
        const x = window.innerWidth / 2;
        const y = window.innerHeight / 2;
        burst.style.left = x + "px";
        burst.style.top = y + "px";
        document.body.appendChild(burst);
        setTimeout(() => { burst.remove(); }, 1500);
    }

    onGameOver(isWin) {
        clearInterval(this.timerInterval);
        
        setTimeout(() => { 
            this.overlayTitle.textContent = isWin ? "🏆 CASHED OUT!" : "💥 Game Over!";
            this.overlayMessage.textContent = isWin ? `You secured a score of ${this.score}!` : `Final Score: ${this.score}`;
            this.overlayBtn.textContent = "Play Again";
            this.overlay.classList.remove("hidden");
        }, 1500);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", () => {
    const game = new MysteryVault();
    document.getElementById("overlayBtn").addEventListener("click", () => {
        if (window.ArcadeSounds) window.ArcadeSounds.playSelect();
        game.start();
    });
} else {
    const _init = () => {
    const game = new MysteryVault();
    document.getElementById("overlayBtn").addEventListener("click", () => {
        if (window.ArcadeSounds) window.ArcadeSounds.playSelect();
        game.start();
    };
    _init();
}
});