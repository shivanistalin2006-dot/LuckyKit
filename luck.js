// Buttons
const headBtn = document.getElementById("headBtn");
const tailBtn = document.getElementById("tailBtn");
const tossBtn = document.getElementById("tossBtn");
const replayBtn = document.getElementById("replayBtn");
const homeBtn = document.getElementById("homeBtn");

// Elements
const coin = document.getElementById("coin");
const resultText = document.getElementById("resultText");

const winCount = document.getElementById("winCount");
const loseCount = document.getElementById("loseCount");

// Variables
let selectedChoice = "";
let wins = 0;
let losses = 0;

// Select Head
headBtn.addEventListener("click", () => {

    selectedChoice = "Head";

    headBtn.classList.add("selected");
    tailBtn.classList.remove("selected");

    resultText.textContent =
        "You selected Head 🪙";
});

// Select Tail
tailBtn.addEventListener("click", () => {

    selectedChoice = "Tail";

    tailBtn.classList.add("selected");
    headBtn.classList.remove("selected");

    resultText.textContent =
        "You selected Tail 🪙";
});

// Toss Coin
tossBtn.addEventListener("click", () => {

    if(selectedChoice === "")
    {
        alert("Please choose Head or Tail first!");
        return;
    }

    coin.classList.add("flip");

    resultText.textContent =
        "Coin Tossing...";

    setTimeout(() => {

        coin.classList.remove("flip");

        const result =
            Math.random() < 0.5
            ? "Head"
            : "Tail";

        if(result === "Head")
{
    coin.textContent = "💕";
}
else
{
    coin.textContent = "🐵";
}

        if(selectedChoice === result)
        {
            wins++;

            winCount.textContent = wins;

            resultText.textContent =
                `🎉 Result: ${result} | You Win!`;
        }
        else
        {
            losses++;

            loseCount.textContent = losses;

            resultText.textContent =
                `😢 Result: ${result} | You Lose!`;
        }

    }, 1000);

});

// Replay
replayBtn.addEventListener("click", () => {

    selectedChoice = "";

    coin.textContent = "🪙";

    resultText.textContent =
        "Make Your Choice";

    headBtn.classList.remove("selected");
    tailBtn.classList.remove("selected");

});

// Home
homeBtn.addEventListener("click", () => {

    window.location.href = "index.html";

});