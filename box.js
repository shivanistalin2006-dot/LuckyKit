// =========================
// CASINO ANIMATED BACKGROUND
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
        
        if (this.y > bgCanvas.height + 20) {
            this.y = -20;
            this.x = Math.random() * bgCanvas.width;
        }
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
        bgCtx.globalAlpha = 1;
        bgCtx.shadowBlur = 0;
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
        bgCtx.shadowBlur = 0;
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
        bgCtx.globalAlpha = 1;
        bgCtx.shadowBlur = 0;
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
        bgCtx.globalAlpha = 1;
        bgCtx.shadowBlur = 0;
    }
}

function initBackground() {
    coins = [];
    casinoLights = [];
    goldenParticles = [];
    floatingTexts = [];
    
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
    
    addGoldenBeams();
    
    requestAnimationFrame(animateBackground);
}

function addGoldenBeams() {
    const time = Date.now() * 0.001;
    
    for (let i = 0; i < 7; i++) {
        const x = (time * 80 + i * 150) % bgCanvas.width;
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
}

window.addEventListener('resize', () => {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
    initBackground();
});

initBackground();
animateBackground();

// =========================
// LUCK BOX GAME
// =========================

const container = document.getElementById("boxContainer");
const scoreEl = document.getElementById("score");
const lifeEl = document.getElementById("lives");
const multiEl = document.getElementById("multi");
const highScoreEl = document.getElementById("highScore");
const cashOutBtn = document.getElementById("cashOutBtn");

let score = 0;
let lives = 3;
let multiplier = 1;
let gameActive = true;
let timeLeft = 30;
let timerInterval;
let highScore = localStorage.getItem("luckBoxHighScore") || 0;

const clickSound = new Audio("https://www.soundjay.com/buttons/sounds/button-16.mp3");
const bombSound = new Audio("https://www.soundjay.com/explosion/sounds/explosion-01.mp3");
const jackpotSound = new Audio("https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3");

const timerEl = document.createElement("div");
timerEl.style.marginBottom = "15px";
timerEl.style.fontSize = "22px";
timerEl.style.fontWeight = "700";
timerEl.style.color = "#ffd700";
document.querySelector(".game").prepend(timerEl);

function startGame() {
    clearInterval(timerInterval);
    score = 0;
    lives = 3;
    multiplier = 1;
    timeLeft = 30;
    gameActive = true;
    timerEl.innerText = "⏱ Time Left: 30s";
    updateUI();
    createBoxes();
    startTimer();
    showBurst("🎮 GAME START!", "win");
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.innerText = "⏱ Time Left: " + timeLeft + "s";
        if (timeLeft <= 0) gameOver();
    }, 1000);
}

function updateUI() {
    scoreEl.innerText = score;
    lifeEl.innerText = lives;
    multiEl.innerText = "x" + multiplier;
    highScoreEl.innerText = highScore;
    scoreEl.style.transform = "scale(1.3)";
    setTimeout(() => { scoreEl.style.transform = "scale(1)"; }, 200);
}

function createBoxes() {
    container.innerHTML = "";
    const totalBoxes = 12;
    const bombPositions = new Set();
    while (bombPositions.size < 3) {
        bombPositions.add(Math.floor(Math.random() * totalBoxes));
    }

    for (let i = 0; i < totalBoxes; i++) {
        const box = document.createElement("div");
        box.classList.add("box");
        box.innerText = "🎁";
        
        if (bombPositions.has(i)) {
            box.dataset.type = "bomb";
        } else {
            box.dataset.type = randomType();
        }
        
        box.addEventListener("click", () => openBox(box));
        container.appendChild(box);
    }
}

function randomType() {
    let r = Math.random();
    if (r < 0.10) return "jackpot";
    if (r < 0.25) return "bonus";
    if (r < 0.28) return "mega";
    return "safe";
}

function openBox(box) {
    if (!gameActive || box.classList.contains("open")) return;
    
    box.classList.add("open");
    clickSound.currentTime = 0;
    clickSound.play();
    
    const type = box.dataset.type;
    
    if (type === "bomb") {
        box.innerText = "💣";
        bombSound.currentTime = 0;
        bombSound.play();
        lives--;
        multiplier = 1;
        shake();
        showBurst("💥 OOPS! BOMB!", "error");
    } else if (type === "jackpot") {
        box.innerText = "💰💰";
        jackpotSound.currentTime = 0;
        jackpotSound.play();
        score += 100 * multiplier;
        multiplier += 2;
        showBurst("🎉 JACKPOT!", "win");
        box.classList.add("jackpot");
    } else if (type === "mega") {
        box.innerText = "💎";
        score += 1000;
        showBurst("💎 MEGA JACKPOT 💎", "win");
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    } else if (type === "bonus") {
        box.innerText = "⭐";
        score += 30 * multiplier;
        multiplier++;
        showBurst(`⭐ BONUS! x${multiplier}`, "combo");
    } else {
        box.innerText = "💰";
        score += 10 * multiplier;
    }
    
    updateUI();
    
    if (lives <= 0) {
        gameOver();
        return;
    }
    
    const remaining = document.querySelectorAll(".box:not(.open)").length;
    if (remaining === 0) {
        createBoxes();
        showBurst("🎁 NEW ROUND!", "win");
    }
}

cashOutBtn.addEventListener("click", () => {
    if (!gameActive) return;
    gameActive = false;
    clearInterval(timerInterval);
    saveHighScore();
    showBurst("🏆 CASHED OUT!", "win");
    setTimeout(() => { alert("🏆 CASHED OUT!\n\nScore: " + score); }, 500);
});

function shake() {
    document.body.classList.add("shake");
    setTimeout(() => { document.body.classList.remove("shake"); }, 300);
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
}

function showBurst(text, type = "win") {
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

function saveHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("luckBoxHighScore", highScore);
        updateUI();
    }
}

function gameOver() {
    gameActive = false;
    clearInterval(timerInterval);
    saveHighScore();
    showBurst("💥 GAME OVER", "error");
    setTimeout(() => { alert("💥 Game Over!\n\nFinal Score: " + score); }, 500);
}

startGame();