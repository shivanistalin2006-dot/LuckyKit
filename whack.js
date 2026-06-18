const holes = document.querySelectorAll(".hole");
const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");

const startBtn = document.getElementById("startBtn");

const gameOverBox = document.getElementById("gameOver");
const finalScore = document.getElementById("finalScore");

let score = 0;
let timeLeft = 30;

let currentHole = null;

let moleInterval;
let timerInterval;

let gameRunning = false;

/* =========================
   RANDOM MOLE
========================= */

function showMole() {

    holes.forEach(hole => {
        hole.classList.remove("mole");
    });

    const randomHole =
        holes[Math.floor(Math.random() * holes.length)];

    randomHole.classList.add("mole");

    currentHole = randomHole;
}

/* =========================
   HIT MOLE
========================= */

holes.forEach(hole => {

    hole.addEventListener("click", () => {

        if (!gameRunning) return;

        if (hole === currentHole) {

            score++;

            scoreDisplay.textContent = score;

            hole.classList.remove("mole");

            currentHole = null;
        }

    });

});

/* =========================
   START GAME
========================= */

function startGame() {

    score = 0;
    timeLeft = 30;

    scoreDisplay.textContent = score;
    timeDisplay.textContent = timeLeft;

    gameOverBox.classList.add("hidden");

    gameRunning = true;

    startBtn.disabled = true;

    moleInterval = setInterval(() => {

        showMole();

    }, 700);

    timerInterval = setInterval(() => {

        timeLeft--;

        timeDisplay.textContent = timeLeft;

        if (timeLeft <= 0) {

            endGame();

        }

    }, 1000);

}

/* =========================
   END GAME
========================= */

function endGame() {

    clearInterval(moleInterval);
    clearInterval(timerInterval);

    gameRunning = false;

    holes.forEach(hole => {
        hole.classList.remove("mole");
    });

    finalScore.textContent = score;

    gameOverBox.classList.remove("hidden");

    startBtn.disabled = false;
}

/* =========================
   START BUTTON
========================= */

startBtn.addEventListener("click", startGame);
const playAgainBtn = document.getElementById("playAgainBtn");

playAgainBtn.addEventListener("click", () => {
    startGame();
});