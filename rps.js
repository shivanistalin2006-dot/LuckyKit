const playerCountSelect = document.getElementById("playerCount");
const generatePlayersBtn = document.getElementById("generatePlayersBtn");
const playerInputs = document.getElementById("playerInputs");

const startGameBtn = document.getElementById("startGameBtn");

const scoreboardContainer =
document.getElementById("scoreboardContainer");

const turnText =
document.getElementById("turnText");

const moveButtons =
document.querySelectorAll(".moveBtn");

const lockMoveBtn =
document.getElementById("lockMoveBtn");

const resultsContainer =
document.getElementById("resultsContainer");

const replayBtn =
document.getElementById("replayBtn");

const endGameBtn =
document.getElementById("endGameBtn");

const homeBtn =
document.getElementById("homeBtn");

let players = [];
let scores = {};
let moves = {};

let currentPlayerIndex = 0;
let selectedMove = "";
let gameStarted = false;

/* Generate Name Inputs */

generatePlayersBtn.addEventListener("click", () => {

    playerInputs.innerHTML = "";

    const count =
    parseInt(playerCountSelect.value);

    if(!count)
    {
        alert("Select player count");
        return;
    }

    for(let i=1;i<=count;i++)
    {
        const input =
        document.createElement("input");

        input.type = "text";

        input.placeholder =
        `Player ${i} Name`;

        input.maxLength = 12;

        input.classList.add("playerName");

        playerInputs.appendChild(input);
    }

});

/* Start Game */

startGameBtn.addEventListener("click", () => {

    const inputs =
    document.querySelectorAll(".playerName");

    if(inputs.length === 0)
    {
        alert("Generate players first");
        return;
    }

    players = [];
    scores = {};
    moves = {};

    inputs.forEach((input,index)=>{

        let name =
        input.value.trim();

        if(name === "")
        {
            name =
            `Player ${index+1}`;
        }

        players.push(name);

        scores[name] = 0;
    });

    createScoreboard();

    currentPlayerIndex = 0;

    gameStarted = true;

    turnText.textContent =
    `${players[currentPlayerIndex]}'s Turn`;

});

/* Scoreboard */

function createScoreboard(){

    scoreboardContainer.innerHTML = "";

    players.forEach(player=>{

        const card =
        document.createElement("div");

        card.classList.add("score-card");

        card.innerHTML = `
            <h3>${player}</h3>
            <p id="score-${player}">
                ${scores[player]}
            </p>
        `;

        scoreboardContainer.appendChild(card);

    });

}

/* Select Move */

moveButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        if(!gameStarted) return;

        selectedMove =
        button.dataset.move;

        moveButtons.forEach(btn=>
            btn.classList.remove("selected-move")
        );

        button.classList.add("selected-move");

    });

});

/* Lock Move */

lockMoveBtn.addEventListener("click",()=>{

    if(!gameStarted)
    {
        alert("Start game first");
        return;
    }

    if(selectedMove === "")
    {
        alert("Choose a move");
        return;
    }

    const currentPlayer =
    players[currentPlayerIndex];

    moves[currentPlayer] =
    selectedMove;

    selectedMove = "";

    moveButtons.forEach(btn=>
        btn.classList.remove("selected-move")
    );

    currentPlayerIndex++;

    if(currentPlayerIndex <
        players.length)
    {
        turnText.textContent =
        `${players[currentPlayerIndex]}'s Turn`;
    }
    else
    {
        revealResults();
    }

});

/* Determine Winners */

function beats(a,b){

    return (
        (a === "Rock" &&
         b === "Scissors")

         ||

        (a === "Paper" &&
         b === "Rock")

         ||

        (a === "Scissors" &&
         b === "Paper")
    );
}

function revealResults(){

    let resultHTML =
    "<h3>Moves</h3>";

    players.forEach(player=>{

        resultHTML += `
        <p>
        ${player} :
        ${moves[player]}
        </p>
        `;
    });

    let winners = [];

    players.forEach(player=>{

        let winCount = 0;

        players.forEach(opponent=>{

            if(player === opponent)
                return;

            if(
                beats(
                    moves[player],
                    moves[opponent]
                )
            )
            {
                winCount++;
            }

        });

        if(winCount > 0)
        {
            winners.push(player);
        }

    });

    if(winners.length === 0)
    {
        resultHTML +=
        "<h3>🤝 Draw Round</h3>";
    }
    else
    {
        resultHTML +=
        "<h3>🏆 Round Winners</h3>";

        winners.forEach(player=>{

            scores[player]++;

            document.getElementById(
                `score-${player}`
            ).textContent =
            scores[player];

            resultHTML += `
            <p>${player}</p>
            `;
        });

    }

    resultsContainer.innerHTML =
    resultHTML;

    turnText.textContent =
    "Round Completed";

}

/* Replay Round */

replayBtn.addEventListener("click",()=>{

    moves = {};

    currentPlayerIndex = 0;

    selectedMove = "";

    if(players.length > 0)
    {
        turnText.textContent =
        `${players[0]}'s Turn`;
    }

    resultsContainer.innerHTML =
    "Results Will Appear Here";

});

/* End Game */

endGameBtn.addEventListener("click",()=>{

    if(players.length === 0)
        return;

    let finalResult =
    "Final Scores\n\n";

    players.forEach(player=>{

        finalResult +=
        `${player}: ${scores[player]}\n`;

    });

    alert(finalResult);

    players = [];
    scores = {};
    moves = {};

    gameStarted = false;

    scoreboardContainer.innerHTML = "";

    resultsContainer.innerHTML =
    "Results Will Appear Here";

    turnText.textContent =
    "Setup Players To Start";

});

/* Home */

homeBtn.addEventListener("click",()=>{

    window.location.href =
    "index.html";

});