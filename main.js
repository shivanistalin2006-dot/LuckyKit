// LuckyKit Home Page JS

document.addEventListener("DOMContentLoaded", () => {

    console.log("LuckyKit Loaded Successfully!");

    const cards = document.querySelectorAll(".game-card");

    cards.forEach(card => {

        card.addEventListener("mouseenter", () => {
            card.style.transition = "0.3s";
        });

    });

});

function openTicTacToe() {
    window.location.href = "tictactoe.html";
}

function openLuckGame() {
    window.location.href = "luck.html";
}

function openRPS() {
    window.location.href = "rps.html";
}
function openMemoryGame() {

    window.location.href =
    "mem.html";

}

function openSnakeGame() {

    window.location.href =
    "snake.html";

}

function openBoxGame(){
    window.location.href = "box.html";
}

function openChessGame() {

    window.location.href =
    "chess.html";

}

function openFruitGame() {
    window.location.href = "fruit.html";
}

function openTruckGame() {
    window.location.href = "truck.html";
}

function openWhackGame() {
    window.location.href = "whack.html";
}
function openMemoryLinkGame(){
    window.location.href = "ml.html";
}