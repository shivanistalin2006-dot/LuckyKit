const gameBoard = document.getElementById("gameBoard");

const timerElement =
document.getElementById("timer");

const movesElement =
document.getElementById("moves");

const matchesElement =
document.getElementById("matches");

const resultText =
document.getElementById("resultText");

const restartBtn =
document.getElementById("restartBtn");

const homeBtn =
document.getElementById("homeBtn");

/* Emojis */

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

/* Shuffle */

function shuffle(array){

    for(let i=array.length-1;i>0;i--){

        let j =
        Math.floor(
            Math.random()*(i+1)
        );

        [array[i],array[j]] =
        [array[j],array[i]];
    }

    return array;
}

/* Start Game */

function startGame(){

    clearInterval(timer);

    seconds = 0;
    moves = 0;
    matches = 0;

    timerElement.textContent =
    "0s";

    movesElement.textContent =
    "0";

    matchesElement.textContent =
    "0";

    resultText.textContent =
    "Find all matching pairs!";

    firstCard = null;
    secondCard = null;
    lockBoard = false;

    gameBoard.innerHTML = "";

    let shuffled =
    shuffle([...emojis]);

    shuffled.forEach(emoji=>{

        const card =
        document.createElement("div");

        card.classList.add("card");

        card.dataset.emoji =
        emoji;

        card.textContent = "?";

        card.addEventListener(
            "click",
            flipCard
        );

        gameBoard.appendChild(card);

    });

    timer =
    setInterval(()=>{

        seconds++;

        timerElement.textContent =
        `${seconds}s`;

    },1000);

}

/* Flip Card */

function flipCard(){

    if(lockBoard) return;

    if(this === firstCard)
        return;

    if(this.classList.contains(
        "matched"
    )) return;

    this.textContent =
    this.dataset.emoji;

    this.classList.add(
        "flipped"
    );

    if(!firstCard){

        firstCard = this;

        return;
    }

    secondCard = this;

    moves++;

    movesElement.textContent =
    moves;

    checkMatch();
}

/* Check Match */

function checkMatch(){

    let isMatch =
    firstCard.dataset.emoji ===
    secondCard.dataset.emoji;

    if(isMatch){

        firstCard.classList.add(
            "matched"
        );

        secondCard.classList.add(
            "matched"
        );

        matches++;

        matchesElement.textContent =
        matches;

        resetTurn();

        if(matches === 8){

            clearInterval(timer);

            resultText.textContent =
            `🏆 You Won in ${seconds}s with ${moves} moves!`;

        }

    }
    else{

        lockBoard = true;

        setTimeout(()=>{

            firstCard.textContent = "?";
            secondCard.textContent = "?";

            firstCard.classList.remove(
                "flipped"
            );

            secondCard.classList.remove(
                "flipped"
            );

            resetTurn();

        },1000);

    }

}

/* Reset Selection */

function resetTurn(){

    firstCard = null;
    secondCard = null;

    lockBoard = false;
}

/* Restart */

restartBtn.addEventListener(
    "click",
    startGame
);

/* Home */

homeBtn.addEventListener(
    "click",
    ()=>{

        window.location.href =
        "index.html";

    }
);

/* Load */

startGame();