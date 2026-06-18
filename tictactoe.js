const cells = document.querySelectorAll(".cell");

const aiModeBtn = document.getElementById("aiModeBtn");
const twoPlayerBtn = document.getElementById("twoPlayerBtn");

const startGameBtn = document.getElementById("startGameBtn");

const player1Input = document.getElementById("player1");
const player2Input = document.getElementById("player2");

const name1 = document.getElementById("name1");
const name2 = document.getElementById("name2");

const score1 = document.getElementById("score1");
const score2 = document.getElementById("score2");

const turnText = document.getElementById("turnText");

const popup = document.getElementById("popup");
const winnerMessage = document.getElementById("winnerMessage");
const closePopupBtn = document.getElementById("closePopupBtn");

const replayBtn = document.getElementById("replayBtn");
const endGameBtn = document.getElementById("endGameBtn");
const homeBtn = document.getElementById("homeBtn");

let gameMode = "";
let currentPlayer = "X";

let board = ["", "", "", "", "", "", "", "", ""];

let gameActive = false;

let player1Name = "Player 1";
let player2Name = "Player 2";

let player1Score = 0;
let player2Score = 0;

const winningCombinations = [
    [0,1,2],
    [3,4,5],
    [6,7,8],

    [0,3,6],
    [1,4,7],
    [2,5,8],

    [0,4,8],
    [2,4,6]
];

aiModeBtn.addEventListener("click", () => {

    gameMode = "AI";

    player2Input.value = "AI";
    player2Input.disabled = true;

    alert("AI Mode Selected");
});

twoPlayerBtn.addEventListener("click", () => {

    gameMode = "TWO";

    player2Input.disabled = false;
    player2Input.value = "";

    alert("Two Player Mode Selected");
});

startGameBtn.addEventListener("click", () => {

    if(gameMode === ""){
        alert("Please Select A Game Mode");
        return;
    }

    player1Name =
        player1Input.value.trim() || "Player 1";

    player2Name =
        player2Input.value.trim() ||
        (gameMode === "AI" ? "AI" : "Player 2");

    name1.textContent = player1Name;
    name2.textContent = player2Name;

    gameActive = true;

    turnText.textContent =
        `${player1Name}'s Turn (X)`;

    resetBoard();
});

cells.forEach((cell,index)=>{

    cell.addEventListener("click",()=>{

        if(!gameActive) return;

        if(board[index] !== "") return;

        makeMove(index,currentPlayer);

        if(checkWinner()) return;

        if(checkDraw()) return;

        currentPlayer =
            currentPlayer === "X" ? "O" : "X";

        updateTurn();

        if(gameMode === "AI" &&
           currentPlayer === "O")
        {
            setTimeout(aiMove,500);
        }

    });

});

function makeMove(index,player){

    board[index] = player;

    cells[index].textContent = player;

    if(player === "X")
        cells[index].classList.add("x");
    else
        cells[index].classList.add("o");
}

function aiMove(){

    let emptyCells = [];

    board.forEach((cell,index)=>{

        if(cell === "")
            emptyCells.push(index);

    });

    if(emptyCells.length === 0) return;

    let randomIndex =
        emptyCells[
            Math.floor(
                Math.random()*emptyCells.length
            )
        ];

    makeMove(randomIndex,"O");

    if(checkWinner()) return;

    if(checkDraw()) return;

    currentPlayer = "X";

    updateTurn();
}

function updateTurn(){

    if(currentPlayer === "X")
    {
        turnText.textContent =
            `${player1Name}'s Turn (X)`;
    }
    else
    {
        turnText.textContent =
            `${player2Name}'s Turn (O)`;
    }

}

function checkWinner(){

    for(let combo of winningCombinations)
    {
        let [a,b,c] = combo;

        if(
            board[a] &&
            board[a] === board[b] &&
            board[a] === board[c]
        )
        {
            gameActive = false;

            if(board[a] === "X")
            {
                player1Score++;
                score1.textContent =
                    player1Score;

                showWinner(
                    `${player1Name} Wins 🎉`
                );
            }
            else
            {
                player2Score++;
                score2.textContent =
                    player2Score;

                showWinner(
                    `${player2Name} Wins 🎉`
                );
            }

            return true;
        }
    }

    return false;
}

function checkDraw(){

    if(!board.includes(""))
    {
        gameActive = false;

        showWinner("It's A Draw 🤝");

        return true;
    }

    return false;
}

function showWinner(message){

    winnerMessage.textContent = message;

    popup.classList.remove("hidden");
}

closePopupBtn.addEventListener("click",()=>{

    popup.classList.add("hidden");
});

replayBtn.addEventListener("click",()=>{

    resetBoard();

    gameActive = true;

    turnText.textContent =
        `${player1Name}'s Turn (X)`;
});

endGameBtn.addEventListener("click",()=>{

    let result =
`Final Score

${player1Name}: ${player1Score}

${player2Name}: ${player2Score}`;

    alert(result);

    resetBoard();

    player1Score = 0;
    player2Score = 0;

    score1.textContent = 0;
    score2.textContent = 0;

    gameActive = false;

    turnText.textContent =
        "Select Mode To Start";
});

homeBtn.addEventListener("click",()=>{

    window.location.href =
        "index.html";
});

function resetBoard(){

    board =
    ["","","","","","","","",""];

    currentPlayer = "X";

    cells.forEach(cell=>{

        cell.textContent = "";

        cell.classList.remove("x");
        cell.classList.remove("o");

    });

}