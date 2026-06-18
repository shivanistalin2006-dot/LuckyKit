/* =========================
   SNAKE GAME (SIMPLE + WORKING)
========================= */

const canvas = document.getElementById("gameBoard");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");
const statusText = document.getElementById("statusText");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const homeBtn = document.getElementById("homeBtn");

/* =========================
   GAME VARIABLES
========================= */

const box = 20;

let snake;
let direction;
let food;
let score;
let highScore = 0;
let game;

/* =========================
   INIT GAME
========================= */

function init(){
    snake = [{x:200, y:200}];
    direction = "RIGHT";
    score = 0;

    console.log("Snake started");
    spawnFood();

    scoreEl.innerText = score;
    statusText.innerText = "Playing...";

    if(game) clearInterval(game);

    game = setInterval(updateGame, 200);
}

/* =========================
   FOOD
========================= */

function spawnFood(){
    food = {
        x: Math.floor(Math.random() * 20) * box,
        y: Math.floor(Math.random() * 20) * box
    };
}

/* =========================
   GAME LOOP
========================= */

function updateGame(){

    let head = { ...snake[0] };

    if(direction === "LEFT") head.x -= box;
    if(direction === "RIGHT") head.x += box;
    if(direction === "UP") head.y -= box;
    if(direction === "DOWN") head.y += box;

    // collision with wall
    if(head.x < 0 || head.x >= 400 || head.y < 0 || head.y >= 400){
        return gameOver();
    }

    // collision with self
    for(let i=0;i<snake.length;i++){
        if(head.x === snake[i].x && head.y === snake[i].y){
            return gameOver();
        }
    }

    snake.unshift(head);

    // eat food
    if(head.x === food.x && head.y === food.y){
        score++;
        scoreEl.innerText = score;
        spawnFood();
    } else {
        snake.pop();
    }

    draw();
}

/* =========================
   DRAW
========================= */

function draw(){

    ctx.fillStyle = "#111";
    ctx.fillRect(0,0,400,400);

    // food
    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);

    // snake
    for(let i=0;i<snake.length;i++){
        ctx.fillStyle = i === 0 ? "#00ff88" : "#0b3d2e";
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
    }
}

/* =========================
   GAME OVER
========================= */

function gameOver(){

    clearInterval(game);

    statusText.innerText = "Game Over 💀";

    if(score > highScore){
        highScore = score;
        highScoreEl.innerText = highScore;
    }
}

/* =========================
   CONTROLS
========================= */
document.addEventListener("keydown", (e) => {

    if(e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
    if(e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
    if(e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
    if(e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";

});

/* =========================
   BUTTONS
========================= */

startBtn.onclick = () => init();

restartBtn.onclick = () => init();

homeBtn.onclick = () => {
    window.location.href = "index.html";
};

/* =========================
   FIRST DRAW
========================= */

draw();