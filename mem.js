const gameBoard = document.getElementById("gameBoard");
const timerElement = document.getElementById("timer");
const movesElement = document.getElementById("moves");
const matchesElement = document.getElementById("matches");
const resultText = document.getElementById("resultText");
const restartBtn = document.getElementById("restartBtn");
const homeBtn = document.getElementById("homeBtn");

const emojis = [
    "🍎","🍎",
    "🍌","🍌",
    "🐶","🐶",
    "🐱","🐱",
    "🦜","🦜",
    "🦉","🦉",
    "🏠","🏠",
    "🏛️","🏛️"
];

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let matches = 0;
let seconds = 0;
let timer;

// Create floating stars
function createStars() {
    const starsContainer = document.querySelector('.stars');
    for (let i = 0; i < 15; i++) {
        const star = document.createElement("div");
        star.classList.add("star");
        star.style.left = `${5 + i * 6}%`;
        star.style.top = `${10 + (i % 10) * 8}%`;
        starsContainer.appendChild(star);
    }
}

// Create floating shapes
function createShapes() {
    const shapesContainer = document.querySelector('.floating-shapes');
    for (let i = 0; i < 6; i++) {
        const shape = document.createElement("div");
        shape.classList.add("shape");
        shape.style.left = `${5 + i * 15}%`;
        shapesContainer.appendChild(shape);
    }
}

createStars();
createShapes();

// Create match burst effect
function createBurst(card) {
    const burst = document.createElement("div");
    burst.classList.add("burst");
    
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement("div");
        particle.classList.add("burst-particle");
        
        const angle = (i / 12) * 2 * Math.PI;
        const distance = 80 + Math.random() * 60;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        particle.style.setProperty("--tx", `${tx}px`);
        particle.style.setProperty("--ty", `${ty}px`);
        
        burst.appendChild(particle);
    }
    
    card.appendChild(burst);
    
    setTimeout(() => {
        burst.remove();
    }, 900);
}

function shuffle(array){
    for(let i=array.length-1;i>0;i--){
        let j = Math.floor(Math.random()*(i+1));
        [array[i],array[j]] = [array[j],array[i]];
    }
    return array;
}

function startGame(){
    clearInterval(timer);
    seconds = 0;
    moves = 0;
    matches = 0;

    timerElement.textContent = "0s";
    movesElement.textContent = "0";
    matchesElement.textContent = "0";
    resultText.textContent = "Find all matching pairs!";

    firstCard = null;
    secondCard = null;
    lockBoard = false;

    gameBoard.innerHTML = "";

    let shuffled = shuffle([...emojis]);

    shuffled.forEach(emoji=>{
        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.emoji = emoji;
        card.textContent = "?";
        card.addEventListener("click", flipCard);
        gameBoard.appendChild(card);
    });

    timer = setInterval(()=>{
        seconds++;
        timerElement.textContent = `${seconds}s`;
    },1000);
}

function flipCard(){
    if(lockBoard) return;
    if(this === firstCard) return;
    if(this.classList.contains("matched")) return;

    this.textContent = this.dataset.emoji;
    this.classList.add("flipped");

    if(!firstCard){
        firstCard = this;
        return;
    }

    secondCard = this;
    moves++;
    movesElement.textContent = moves;
    checkMatch();
}

function checkMatch(){
    let isMatch = firstCard.dataset.emoji === secondCard.dataset.emoji;

    if(isMatch){
        firstCard.classList.add("matched");
        secondCard.classList.add("matched");
        
        // Create burst effect on both cards
        createBurst(firstCard);
        createBurst(secondCard);
        
        matches++;
        matchesElement.textContent = matches;
        resetTurn();

        if(matches === 8){
            clearInterval(timer);
            resultText.textContent = `🏆 You Won in ${seconds}s with ${moves} moves!`;
            resultText.style.animation = "winGlow 1s ease infinite";
        }
    }
    else{
        lockBoard = true;
        setTimeout(()=>{
            firstCard.textContent = "?";
            secondCard.textContent = "?";
            firstCard.classList.remove("flipped");
            secondCard.classList.remove("flipped");
            resetTurn();
        },1000);
    }
}

function resetTurn(){
    firstCard = null;
    secondCard = null;
    lockBoard = false;
}

restartBtn.addEventListener("click", startGame);

homeBtn.addEventListener("click", ()=>{
    window.location.href = "index.html";
});

startGame();