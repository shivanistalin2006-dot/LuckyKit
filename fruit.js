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
let particles = [];
let trail = [];

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

    fruits.forEach((f, i) => {
        f.update();

        if (f.y > canvas.height + 60) {
            if (f.type !== bomb) {
                lives--;
                updateUI();
                shake();
                checkGameOver();
            }
            fruits.splice(i, 1);
        }
    });

    drawTrail();
    drawGlowTrail();
    updateParticles();

    requestAnimationFrame(loop);
}

// ---------------- ULTRA SLICING (FIXED PERFECT HIT) ----------------
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
                checkGameOver();
                return;
            }

            score += 10;
            comboHit();

            explode(f.x, f.y);

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

// ---------------- TRAIL (NEON SWORD) ----------------
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

// glow layer
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
        combo = 0;
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
    for (let i = 0; i < 12; i++) {
        particles.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 7,
            vy: (Math.random() - 0.5) * 7,
            alpha: 1
        });
    }
}

// ---------------- PARTICLES ----------------
function updateParticles() {
    particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.03;

        ctx.globalAlpha = p.alpha;
        ctx.fillText("💥", p.x, p.y);

        if (p.alpha <= 0) particles.splice(i, 1);
    });

    ctx.globalAlpha = 1;
}

// ---------------- SHAKE ----------------
function shake() {
    canvas.style.transform = "translate(2px,2px)";
    setTimeout(() => canvas.style.transform = "translate(0,0)", 100);
}

// ---------------- UI ----------------
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

// touch
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

// ---------------- START ----------------
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
    spawnInterval = setInterval(spawn, 750);

    loop();
}

startBtn.onclick = startGame;
restartBtn.onclick = startGame;