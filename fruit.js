// =========================
// ANIMATED BACKGROUND
// =========================

const bgCanvas = document.getElementById('bgCanvas');
const bgCtx = bgCanvas.getContext('2d');

bgCanvas.width = window.innerWidth;
bgCanvas.height = window.innerHeight;

let particles = [];
let stars = [];
let glowingOrbs = [];

const colors = [
    '#facc15', '#ef4444', '#22c55e', '#a855f7', 
    '#f43f5e', '#3b82f6', '#ffffff', '#ffd700'
];

class Particle {
    constructor() {
        this.x = Math.random() * bgCanvas.width;
        this.y = Math.random() * bgCanvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = Math.random() * 0.8 + 0.2;
        this.glow = Math.random() * 10 + 5;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > bgCanvas.width) this.x = 0;
        if (this.x < 0) this.x = bgCanvas.width;
        if (this.y > bgCanvas.height) this.y = 0;
        if (this.y < 0) this.y = bgCanvas.height;

        this.opacity += Math.sin(Date.now() * 0.005 + this.x) * 0.01;
    }

    draw() {
        bgCtx.beginPath();
        bgCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        bgCtx.fillStyle = this.color;
        bgCtx.globalAlpha = this.opacity;
        bgCtx.fill();
        
        bgCtx.shadowBlur = this.glow;
        bgCtx.shadowColor = this.color;
        bgCtx.fill();
        bgCtx.shadowBlur = 0;
        bgCtx.globalAlpha = 1;
    }
}

class Star {
    constructor() {
        this.x = Math.random() * bgCanvas.width;
        this.y = Math.random() * bgCanvas.height;
        this.size = Math.random() * 2;
        this.brightness = Math.random();
        this.speed = Math.random() * 0.5 + 0.1;
    }

    update() {
        this.y += this.speed;
        this.brightness += Math.sin(Date.now() * 0.003 + this.x) * 0.02;
        
        if (this.y > bgCanvas.height) {
            this.y = 0;
            this.x = Math.random() * bgCanvas.width;
        }
    }

    draw() {
        bgCtx.beginPath();
        bgCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        bgCtx.fillStyle = '#ffffff';
        bgCtx.globalAlpha = Math.max(0.2, Math.min(1, this.brightness));
        bgCtx.fill();
        bgCtx.globalAlpha = 1;
    }
}

class GlowingOrb {
    constructor() {
        this.x = Math.random() * bgCanvas.width;
        this.y = Math.random() * bgCanvas.height;
        this.size = Math.random() * 40 + 20;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.pulse = 0;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.pulse += 0.05;

        if (this.x > bgCanvas.width + this.size) this.x = -this.size;
        if (this.x < -this.size) this.x = bgCanvas.width + this.size;
        if (this.y > bgCanvas.height + this.size) this.y = -this.size;
        if (this.y < -this.size) this.y = bgCanvas.height + this.size;
    }

    draw() {
        const pulseSize = this.size + Math.sin(this.pulse) * 10;
        
        const gradient = bgCtx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, pulseSize * 2
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.5, this.color + '88');
        gradient.addColorStop(1, 'transparent');
        
        bgCtx.beginPath();
        bgCtx.arc(this.x, this.y, pulseSize * 2, 0, Math.PI * 2);
        bgCtx.fillStyle = gradient;
        bgCtx.fill();
    }
}

function initBackground() {
    particles = [];
    stars = [];
    glowingOrbs = [];
    
    for (let i = 0; i < 80; i++) particles.push(new Particle());
    for (let i = 0; i < 50; i++) stars.push(new Star());
    for (let i = 0; i < 8; i++) glowingOrbs.push(new GlowingOrb());
}

function animateBackground() {
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    
    const gradient = bgCtx.createLinearGradient(0, 0, 0, bgCanvas.height);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(0.5, '#1e293b');
    gradient.addColorStop(1, '#334155');
    bgCtx.fillStyle = gradient;
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
    
    glowingOrbs.forEach(orb => { orb.update(); orb.draw(); });
    stars.forEach(star => { star.update(); star.draw(); });
    particles.forEach(particle => { particle.update(); particle.draw(); });
    
    addLightBeams();
    
    requestAnimationFrame(animateBackground);
}

function addLightBeams() {
    const time = Date.now() * 0.001;
    
    for (let i = 0; i < 5; i++) {
        const x = (time * 50 + i * 200) % bgCanvas.width;
        const beamGradient = bgCtx.createLinearGradient(x, 0, x + 100, bgCanvas.height);
        beamGradient.addColorStop(0, 'transparent');
        beamGradient.addColorStop(0.5, '#facc1588');
        beamGradient.addColorStop(1, 'transparent');
        
        bgCtx.fillStyle = beamGradient;
        bgCtx.globalAlpha = 0.1;
        bgCtx.fillRect(x - 50, 0, 100, bgCanvas.height);
        bgCtx.globalAlpha = 1;
    }
}

window.addEventListener('resize', () => {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
    initBackground();
});

// Start background animation
initBackground();
animateBackground();

// =========================
// FRUIT NINJA GAME
// =========================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// UI
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const highScoreEl = document.getElementById("highScore");
const finalScoreEl = document.getElementById("finalScore");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

// ---------------- GAME STATE ----------------
let fruits = [];
let gameParticles = [];
let trail = [];
let fruitPieces = [];

let score = 0;
let lives = 3;
let running = false;

let spawnInterval;
let highScore = localStorage.getItem("fruitHighScore") || 0;
highScoreEl.innerText = highScore;

// combo
let combo = 0;
let comboTimer = null;
let slowMotion = false;

// pointer
let pointer = { active: false, lastX: 0, lastY: 0 };

// ---------------- DATA ----------------
const fruitsList = ["🍎", "🍌", "🍉", "🍇", "🍓"];
const bomb = "💣";

// Fruit colors for pieces
const fruitColors = {
    "🍎": "#ef4444",
    "🍌": "#facc15",
    "🍉": "#ef4444",
    "🍇": "#a855f7",
    "🍓": "#f43f5e"
};

// ---------------- CLASS ----------------
class Item {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.r = 28;

        this.vx = (Math.random() - 0.5) * 5;
        this.vy = -(Math.random() * 9 + 10);
        this.g = 0.35;

        this.rot = 0;
        this.dead = false;
    }

    update() {
        this.vy += this.g;
        this.x += this.vx;
        this.y += this.vy;
        this.rot += 0.05;
        this.draw();
    }

    draw() {
        ctx.save();
        ctx.font = "32px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        ctx.fillText(this.type, 0, 0);
        ctx.restore();
    }
}

// Fruit Piece class for slicing effect
class FruitPiece {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
        this.size = Math.random() * 6 + 3;
        this.alpha = 1;
        this.rotation = Math.random() * Math.PI;
        this.rotSpeed = (Math.random() - 0.5) * 0.2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2; // gravity
        this.rotation += this.rotSpeed;
        this.alpha -= 0.02;

        this.draw();
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
        ctx.globalAlpha = 1;
    }
}

// ---------------- SPAWN ----------------
function spawn() {
    if (!running) return;

    const x = Math.random() * canvas.width;
    const isBomb = Math.random() < 0.15;

    fruits.push(
        new Item(
            x,
            canvas.height + 20,
            isBomb ? bomb : fruitsList[Math.floor(Math.random() * fruitsList.length)]
        )
    );
}

// ---------------- MAIN LOOP ----------------
function loop() {
    if (!running) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#0f172a");
    gradient.addColorStop(0.5, "#1e293b");
    gradient.addColorStop(1, "#334155");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    fruits.forEach((f, i) => {
        f.update();

        if (f.y > canvas.height + 60) {
            if (f.type !== bomb) {
                lives--;
                updateUI();
                shake();
                showBurst("❌ MISSED!", "error");
                checkGameOver();
            }
            fruits.splice(i, 1);
        }
    });

    drawTrail();
    drawGlowTrail();
    updateGameParticles();
    updateFruitPieces();

    requestAnimationFrame(loop);
}

// ---------------- ULTRA SLICING ----------------
function slice(x, y) {
    fruits.forEach((f, i) => {
        const hit = lineHit(
            pointer.lastX,
            pointer.lastY,
            x,
            y,
            f.x,
            f.y,
            f.r
        );

        if (hit && !f.dead) {
            f.dead = true;

            if (f.type === bomb) {
                lives = 0;
                updateUI();
                shake();
                showBurst("💥 BOMB!", "error");
                checkGameOver();
                return;
            }

            score += 10;
            comboHit();
            explode(f.x, f.y);
            createFruitPieces(f.x, f.y, f.type);

            fruits.splice(i, 1);
            updateUI();
        }
    });

    pointer.lastX = x;
    pointer.lastY = y;
}

// ---------------- LINE COLLISION ----------------
function lineHit(x1, y1, x2, y2, cx, cy, r) {
    const A = x2 - x1;
    const B = y2 - y1;
    const len = A * A + B * B;

    const t = Math.max(0, Math.min(1,
        ((cx - x1) * A + (cy - y1) * B) / len
    ));

    const px = x1 + t * A;
    const py = y1 + t * B;

    return Math.hypot(px - cx, py - cy) < r;
}

// ---------------- TRAIL ----------------
function drawTrail() {
    if (trail.length < 2) return;

    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 4;
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#00ffff";

    for (let i = 0; i < trail.length - 1; i++) {
        ctx.moveTo(trail[i].x, trail[i].y);
        ctx.lineTo(trail[i + 1].x, trail[i + 1].y);
    }

    ctx.stroke();
    ctx.shadowBlur = 0;
}

function drawGlowTrail() {
    ctx.globalAlpha = 0.3;
    drawTrail();
    ctx.globalAlpha = 1;
}

// ---------------- COMBO + SLOW ----------------
function comboHit() {
    combo++;

    clearTimeout(comboTimer);
    comboTimer = setTimeout(() => combo = 0, 1000);

    if (combo === 3) {
        slowMo();
        showBurst("🔥 COMBO x3!", "combo");
        combo = 0;
    } else if (combo > 1) {
        showBurst(`⚡ COMBO x${combo}!`, "combo");
    }
}

function slowMo() {
    if (slowMotion) return;

    slowMotion = true;

    clearInterval(spawnInterval);
    spawnInterval = setInterval(spawn, 1300);

    setTimeout(() => {
        slowMotion = false;
        clearInterval(spawnInterval);
        spawnInterval = setInterval(spawn, 750);
    }, 2500);
}

// ---------------- EXPLOSION ----------------
function explode(x, y) {
    for (let i = 0; i < 20; i++) {
        gameParticles.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 12,
            vy: (Math.random() - 0.5) * 12,
            alpha: 1,
            size: Math.random() * 5 + 2,
            color: `hsl(${Math.random() * 60 + 10}, 100%, 50%)`
        });
    }
}

// ---------------- CREATE FRUIT PIECES ----------------
function createFruitPieces(x, y, fruitType) {
    const color = fruitColors[fruitType] || "#facc15";
    
    for (let i = 0; i < 8; i++) {
        fruitPieces.push(new FruitPiece(x, y, color));
    }
    
    for (let i = 0; i < 5; i++) {
        gameParticles.push({
            x: x + (Math.random() - 0.5) * 40,
            y: y + (Math.random() - 0.5) * 40,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            alpha: 1,
            size: Math.random() * 3 + 1,
            color: "#ffffff"
        });
    }
}

// ---------------- PARTICLES ----------------
function updateGameParticles() {
    gameParticles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.alpha -= 0.02;

        if (p.color) {
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.globalAlpha = p.alpha;
            ctx.fillText("💥", p.x, p.y);
        }

        if (p.alpha <= 0) gameParticles.splice(i, 1);
    });

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
}

// ---------------- FRUIT PIECES UPDATE ----------------
function updateFruitPieces() {
    fruitPieces.forEach((piece, i) => {
        piece.update();
        if (piece.alpha <= 0) fruitPieces.splice(i, 1);
    });
}

// ---------------- SHAKE ----------------
function shake() {
    canvas.classList.add("shake");
    setTimeout(() => {
        canvas.classList.remove("shake");
    }, 400);
    
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
    }
}

// ---------------- BURST EFFECT ----------------
function showBurst(text, type = "win") {
    const burst = document.createElement("div");
    burst.className = type === "error" ? "burst-effect" : 
                       type === "combo" ? "combo-text" : "burst-effect";
    burst.innerText = text;
    
    const x = canvas.width / 2 + (Math.random() - 0.5) * 100;
    const y = canvas.height / 2 + (Math.random() - 0.5) * 100;
    
    burst.style.left = x + "px";
    burst.style.top = y + "px";
    
    document.querySelector(".game-wrapper").appendChild(burst);
    
    setTimeout(() => {
        burst.remove();
    }, 1500);
}

// ---------------- UI ----------------
function updateUI() {
    scoreEl.innerText = score;
    livesEl.innerText = lives;
    
    scoreEl.style.transform = "scale(1.3)";
    setTimeout(() => {
        scoreEl.style.transform = "scale(1)";
    }, 200);
}

function checkGameOver() {
    if (lives <= 0) {
        running = false;

        finalScoreEl.innerText = score;

        if (score > highScore) {
            highScore = score;
            localStorage.setItem("fruitHighScore", highScore);
        }

        highScoreEl.innerText = highScore;
        gameOverScreen.classList.remove("hidden");

        clearInterval(spawnInterval);
        
        showBurst("💀 GAME OVER", "error");
    }
}

// ---------------- INPUT ----------------
canvas.addEventListener("mousedown", (e) => {
    pointer.active = true;
    pointer.lastX = e.offsetX;
    pointer.lastY = e.offsetY;
});

canvas.addEventListener("mouseup", () => {
    pointer.active = false;
    trail = [];
});

canvas.addEventListener("mousemove", (e) => {
    if (!pointer.active) return;

    const x = e.offsetX;
    const y = e.offsetY;

    trail.push({ x, y });
    if (trail.length > 12) trail.shift();

    slice(x, y);
});

canvas.addEventListener("touchstart", () => pointer.active = true);

canvas.addEventListener("touchend", () => {
    pointer.active = false;
    trail = [];
});

canvas.addEventListener("touchmove", (e) => {
    const rect = canvas.getBoundingClientRect();

    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;

    trail.push({ x, y });
    if (trail.length > 12) trail.shift();

    slice(x, y);
});

// ---------------- START GAME ----------------
function startGame() {
    score = 0;
    lives = 3;
    fruits = [];
    gameParticles = [];
    trail = [];
    fruitPieces = [];

    updateUI();

    running = true;

    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");

    clearInterval(spawnInterval);
    spawnInterval = setInterval(spawn, 750);

    loop();
    
    showBurst("🎮 GAME START!", "win");
}

startBtn.onclick = startGame;
restartBtn.onclick = startGame;