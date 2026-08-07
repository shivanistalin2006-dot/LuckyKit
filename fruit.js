
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
