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

let highScore =
    localStorage.getItem("luckBoxHighScore") || 0;

// Sounds
const clickSound = new Audio(
    "https://www.soundjay.com/buttons/sounds/button-16.mp3"
);

const bombSound = new Audio(
    "https://www.soundjay.com/explosion/sounds/explosion-01.mp3"
);

const jackpotSound = new Audio(
    "https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3"
);

// Timer UI
const timerEl = document.createElement("div");

timerEl.style.marginBottom = "15px";
timerEl.style.fontSize = "22px";
timerEl.style.fontWeight = "700";
timerEl.style.color = "#3a2d00";

document.querySelector(".game").prepend(timerEl);

// ---------------- START GAME ----------------

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
}

// ---------------- TIMER ----------------

function startTimer() {

    clearInterval(timerInterval);

    timerInterval = setInterval(() => {

        timeLeft--;

        timerEl.innerText =
            "⏱ Time Left: " +
            timeLeft +
            "s";

        if (timeLeft <= 0) {
            gameOver();
        }

    }, 1000);
}

// ---------------- UI ----------------

function updateUI() {

    scoreEl.innerText = score;
    lifeEl.innerText = lives;
    multiEl.innerText = "x" + multiplier;
    highScoreEl.innerText = highScore;

}

// ---------------- BOX GENERATION ----------------

function createBoxes() {

    container.innerHTML = "";

    const totalBoxes = 12;

    // EXACTLY 3 BOMBS
    const bombPositions = new Set();

    while (bombPositions.size < 3) {

        bombPositions.add(
            Math.floor(Math.random() * totalBoxes)
        );

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

        box.addEventListener("click", () => {
            openBox(box);
        });

        container.appendChild(box);
    }
}

// ---------------- RANDOM REWARDS ----------------

function randomType() {

    let r = Math.random();

    if (r < 0.10) return "jackpot";

    if (r < 0.25) return "bonus";

    if (r < 0.28) return "mega";

    return "safe";
}

// ---------------- OPEN BOX ----------------

function openBox(box) {

    if (!gameActive) return;

    if (box.classList.contains("open")) return;

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

    }

    else if (type === "jackpot") {

        box.innerText = "💰💰";

        jackpotSound.currentTime = 0;
        jackpotSound.play();

        score += 100 * multiplier;

        multiplier += 2;

        showBurst("🎉 JACKPOT!");

    }

    else if (type === "mega") {

        box.innerText = "💎";

        score += 1000;

        showBurst("💎 MEGA JACKPOT 💎");

        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }

    }

    else if (type === "bonus") {

        box.innerText = "⭐";

        score += 30 * multiplier;

        multiplier++;

    }

    else {

        box.innerText = "💰";

        score += 10 * multiplier;

    }

    updateUI();

    if (lives <= 0) {

        gameOver();
        return;

    }

    // If all boxes opened -> next round
    const remaining =
        document.querySelectorAll(
            ".box:not(.open)"
        ).length;

    if (remaining === 0) {

        createBoxes();

        showBurst("🎁 NEW ROUND!");

    }
}

// ---------------- CASH OUT ----------------

cashOutBtn.addEventListener("click", () => {

    if (!gameActive) return;

    gameActive = false;

    clearInterval(timerInterval);

    saveHighScore();

    alert(
        "🏆 CASHED OUT!\n\nScore: " +
        score
    );

});

// ---------------- SHAKE ----------------

function shake() {

    document.body.classList.add("shake");

    setTimeout(() => {

        document.body.classList.remove("shake");

    }, 300);
}

// ---------------- BURST ----------------

function showBurst(text) {

    const burst =
        document.createElement("div");

    burst.className = "burst";
    burst.innerText = text;

    document.body.appendChild(burst);

    setTimeout(() => {

        burst.remove();

    }, 1500);
}

// ---------------- HIGH SCORE ----------------

function saveHighScore() {

    if (score > highScore) {

        highScore = score;

        localStorage.setItem(
            "luckBoxHighScore",
            highScore
        );

        updateUI();
    }
}

// ---------------- GAME OVER ----------------

function gameOver() {

    gameActive = false;

    clearInterval(timerInterval);

    saveHighScore();

    alert(
        "💥 Game Over!\n\nFinal Score: " +
        score
    );
}

// ---------------- START ----------------

startGame();