import os

# --- REWRITE FRUIT.CSS ---
fruit_css = """
/* =========================
   FRUIT NINJA AAA CSS
========================= */
* { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Outfit', sans-serif; }
body { min-height: 100vh; background: #000; color: white; text-align: center; overflow: hidden; }

/* Canvas */
#bgCanvas { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -2; }
#gameCanvas { 
    width: 100vw; 
    height: 100vh; 
    position: fixed; 
    top: 0; 
    left: 0; 
    z-index: 1; 
    cursor: crosshair; 
}

/* UI Layer */
.hud {
    position: fixed;
    top: 100px; /* Below arcade shell */
    left: 20px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 15px;
    pointer-events: none;
}
.hud-box {
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(10px);
    padding: 10px 20px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.1);
    box-shadow: 0 10px 20px rgba(0,0,0,0.5);
    text-align: left;
}
.hud-box span { font-size: 0.8rem; color: #cbd5e1; text-transform: uppercase; letter-spacing: 1px; }
.hud-box h2 { font-size: 1.8rem; margin: 0; font-weight: 800; color: #fff; text-shadow: 0 0 10px rgba(255,255,255,0.5); }

#score { color: #facc15; text-shadow: 0 0 15px #ea580c; }
#lives { color: #ef4444; text-shadow: 0 0 15px #dc2626; }

/* Overlays */
.overlay {
    position: fixed;
    inset: 0;
    background: rgba(10,5,15,0.85);
    backdrop-filter: blur(20px);
    z-index: 100;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
.overlay h2 {
    font-size: 4rem;
    color: #facc15;
    text-shadow: 0 0 20px #ea580c, 0 0 40px #dc2626;
    margin-bottom: 20px;
}
.hidden { display: none !important; }

button {
    padding: 15px 40px;
    border-radius: 30px !important;
    border: none;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white !important;
    font-size: 1.2rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 0 10px 30px rgba(239,68,68,0.5);
    transition: transform 0.3s, box-shadow 0.3s;
    pointer-events: auto;
}
button:hover {
    transform: scale(1.1);
    box-shadow: 0 15px 40px rgba(239,68,68,0.8);
}
#startBtn { background: linear-gradient(135deg, #22c55e, #16a34a); box-shadow: 0 10px 30px rgba(34,197,94,0.5); }
#startBtn:hover { box-shadow: 0 15px 40px rgba(34,197,94,0.8); }

.shake { animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both; }
@keyframes shake {
    10%, 90% { transform: translate3d(-5px, 0, 0); }
    20%, 80% { transform: translate3d(5px, 0, 0); }
    30%, 50%, 70% { transform: translate3d(-10px, 0, 0); }
    40%, 60% { transform: translate3d(10px, 0, 0); }
}
"""

with open('fruit.css', 'w', encoding='utf-8') as f:
    f.write(fruit_css)

# --- REWRITE FRUIT.JS ---
fruit_js = """
// Fruit Ninja AAA Engine Rewrite
const bgCanvas = document.getElementById('bgCanvas');
const bgCtx = bgCanvas.getContext('2d');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resize() {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// UI Elements
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const highScoreEl = document.getElementById("highScore");
const finalScoreEl = document.getElementById("finalScore");
const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

let fruits = [];
let particles = [];
let trail = [];
let score = 0;
let lives = 3;
let running = false;
let spawnInterval;
let highScore = localStorage.getItem("fruitHighScore") || 0;
highScoreEl.innerText = highScore;

// Pointer
let pointer = { active: false, lastX: 0, lastY: 0 };

const FRUITS = [
    { emoji: "🍎", color: "#ef4444" },
    { emoji: "🍌", color: "#facc15" },
    { emoji: "🍉", color: "#22c55e" },
    { emoji: "🍇", color: "#a855f7" },
    { emoji: "🍊", color: "#f97316" }
];
const BOMB = { emoji: "💣", color: "#000000" };

class Fruit {
    constructor(x, y, data) {
        this.x = x;
        this.y = y;
        this.data = data;
        this.r = 40; // Hitbox
        
        // Launch Physics (Parabolic)
        // Aim for the center top area
        const targetX = canvas.width / 2 + (Math.random() - 0.5) * 400;
        const targetY = 100;
        
        // Calculate velocity to reach target
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        
        this.vx = dx * 0.015 * (Math.random() * 0.5 + 0.8);
        this.vy = dy * 0.03 * (Math.random() * 0.5 + 0.8);
        this.g = 0.25;
        
        this.rot = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.15;
        this.dead = false;
        this.halves = []; // for when sliced
    }
    
    update() {
        if (this.dead) {
            // Update halves
            this.halves.forEach(h => {
                h.x += h.vx;
                h.y += h.vy;
                h.vy += this.g;
                h.rot += h.rotSpeed;
            });
            return;
        }
        
        this.vy += this.g;
        this.x += this.vx;
        this.y += this.vy;
        this.rot += this.rotSpeed;
    }
    
    draw() {
        ctx.save();
        if (this.dead) {
            // Draw halves spinning away
            this.halves.forEach(h => {
                ctx.save();
                ctx.translate(h.x, h.y);
                ctx.rotate(h.rot);
                ctx.font = "60px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.globalAlpha = h.alpha;
                ctx.fillText(this.data.emoji, 0, 0); // Hack: real games render half images. We render full emoji at 50% opacity/clip or just shrink it for effect.
                ctx.restore();
            });
        } else {
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rot);
            ctx.font = "70px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.shadowBlur = 20;
            ctx.shadowColor = this.data.color;
            ctx.fillText(this.data.emoji, 0, 0);
        }
        ctx.restore();
    }
    
    slice() {
        this.dead = true;
        // Create two halves
        this.halves = [
            { x: this.x, y: this.y, vx: -3 + Math.random(), vy: -2, rot: this.rot, rotSpeed: -0.2, alpha: 0.8 },
            { x: this.x, y: this.y, vx: 3 + Math.random(), vy: -2, rot: this.rot, rotSpeed: 0.2, alpha: 0.8 }
        ];
        
        // Splash Particles
        if (this.data !== BOMB) {
            for(let i=0; i<15; i++) {
                particles.push({
                    x: this.x, y: this.y,
                    vx: (Math.random()-0.5)*15, vy: (Math.random()-0.5)*15,
                    life: 1, color: this.data.color, size: Math.random()*8+4
                });
            }
        } else {
            // Bomb Explosion
            for(let i=0; i<30; i++) {
                particles.push({
                    x: this.x, y: this.y,
                    vx: (Math.random()-0.5)*25, vy: (Math.random()-0.5)*25,
                    life: 1, color: "#fff", size: Math.random()*12+6
                });
            }
        }
    }
}

function spawn() {
    if (!running) return;
    
    // Spawn from bottom left or right
    const side = Math.random() > 0.5;
    const x = side ? (Math.random() * 200 + 100) : (canvas.width - Math.random() * 200 - 100);
    const y = canvas.height + 50;
    
    const isBomb = Math.random() < 0.15;
    const data = isBomb ? BOMB : FRUITS[Math.floor(Math.random() * FRUITS.length)];
    
    fruits.push(new Fruit(x, y, data));
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.4; // heavy gravity for juice
        p.life -= 0.02;
        
        if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
        }
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

function drawTrail() {
    if (trail.length < 2) return;
    ctx.beginPath();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#06b6d4";
    
    ctx.moveTo(trail[0].x, trail[0].y);
    for (let i = 1; i < trail.length; i++) {
        ctx.lineTo(trail[i].x, trail[i].y);
    }
    ctx.stroke();
    
    // Inner bright core
    ctx.beginPath();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.shadowBlur = 0;
    ctx.moveTo(trail[0].x, trail[0].y);
    for (let i = 1; i < trail.length; i++) {
        ctx.lineTo(trail[i].x, trail[i].y);
    }
    ctx.stroke();
}

function checkCollisions(px, py) {
    if (trail.length < 2) return;
    const prev = trail[trail.length - 2];
    
    fruits.forEach(f => {
        if (f.dead) return;
        // Line-Circle collision math
        const A = px - prev.x;
        const B = py - prev.y;
        const len = A*A + B*B;
        if (len === 0) return;
        
        const t = Math.max(0, Math.min(1, ((f.x - prev.x)*A + (f.y - prev.y)*B) / len));
        const nearestX = prev.x + t * A;
        const nearestY = prev.y + t * B;
        
        const dist = Math.hypot(f.x - nearestX, f.y - nearestY);
        
        if (dist < f.r) {
            f.slice();
            if (f.data === BOMB) {
                lives = 0;
                document.body.classList.add('shake');
                setTimeout(() => document.body.classList.remove('shake'), 400);
                updateUI();
                checkGameOver();
            } else {
                score += 10;
                updateUI();
            }
        }
    });
}

function loop() {
    if (!running) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = fruits.length - 1; i >= 0; i--) {
        let f = fruits[i];
        f.update();
        f.draw();
        
        // Remove if off screen bottom
        if (f.y > canvas.height + 100 && f.vy > 0) {
            if (!f.dead && f.data !== BOMB) {
                lives--;
                updateUI();
                document.body.classList.add('shake');
                setTimeout(() => document.body.classList.remove('shake'), 400);
                checkGameOver();
            }
            fruits.splice(i, 1);
        }
    }
    
    updateParticles();
    drawTrail();
    
    requestAnimationFrame(loop);
}

function updateUI() {
    scoreEl.innerText = score;
    livesEl.innerText = lives;
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
    }
}

// Input Handling
function addTrailPoint(x, y) {
    trail.push({x, y});
    if (trail.length > 10) trail.shift();
    checkCollisions(x, y);
}

canvas.addEventListener("mousedown", (e) => {
    pointer.active = true;
    trail = [];
    addTrailPoint(e.clientX, e.clientY);
});
canvas.addEventListener("mousemove", (e) => {
    if (!pointer.active) return;
    addTrailPoint(e.clientX, e.clientY);
});
canvas.addEventListener("mouseup", () => { pointer.active = false; trail = []; });

canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    pointer.active = true;
    trail = [];
    addTrailPoint(e.touches[0].clientX, e.touches[0].clientY);
}, {passive: false});
canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (!pointer.active) return;
    addTrailPoint(e.touches[0].clientX, e.touches[0].clientY);
}, {passive: false});
canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    pointer.active = false;
    trail = [];
});

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);

function startGame() {
    score = 0;
    lives = 3;
    fruits = [];
    particles = [];
    trail = [];
    updateUI();
    running = true;
    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");
    
    clearInterval(spawnInterval);
    spawnInterval = setInterval(spawn, 800);
    loop();
}

// Draw static background mesh gradient
function drawBg() {
    bgCtx.clearRect(0,0, bgCanvas.width, bgCanvas.height);
    const grad = bgCtx.createRadialGradient(bgCanvas.width/2, bgCanvas.height/2, 0, bgCanvas.width/2, bgCanvas.height/2, bgCanvas.width);
    grad.addColorStop(0, '#1e1b4b');
    grad.addColorStop(1, '#020617');
    bgCtx.fillStyle = grad;
    bgCtx.fillRect(0,0,bgCanvas.width, bgCanvas.height);
}
setInterval(drawBg, 1000);
drawBg();
"""

with open('fruit.js', 'w', encoding='utf-8') as f:
    f.write(fruit_js)

print("Fruit Ninja AAA rewrite complete.")
