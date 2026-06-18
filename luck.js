const headBtn = document.getElementById("headBtn");
const tailBtn = document.getElementById("tailBtn");
const tossBtn = document.getElementById("tossBtn");
const replayBtn = document.getElementById("replayBtn");
const homeBtn = document.getElementById("homeBtn");

const coin = document.getElementById("coin");
const resultText = document.getElementById("resultText");
const winCount = document.getElementById("winCount");
const loseCount = document.getElementById("loseCount");

let selectedChoice = "";
let wins = 0;
let losses = 0;

// Create floating bubbles
function createBubbles() {
    for (let i = 0; i < 6; i++) {
        const bubble = document.createElement("div");
        bubble.classList.add("bubble");
        bubble.style.left = `${10 + i * 15}%`;
        document.body.appendChild(bubble);
    }
}

createBubbles();

headBtn.addEventListener("click", () => {
    selectedChoice = "Head";
    headBtn.classList.add("selected");
    tailBtn.classList.remove("selected");
    resultText.textContent = "You selected Head 🪙";
});

tailBtn.addEventListener("click", () => {
    selectedChoice = "Tail";
    tailBtn.classList.add("selected");
    headBtn.classList.remove("selected");
    resultText.textContent = "You selected Tail 🪙";
});

function createBurst() {
    const burst = document.createElement("div");
    burst.classList.add("burst");
    
    for (let i = 0; i < 16; i++) {
        const particle = document.createElement("div");
        particle.classList.add("burst-particle");
        
        const angle = (i / 16) * 2 * Math.PI;
        const distance = 150 + Math.random() * 100;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        particle.style.setProperty("--tx", `${tx}px`);
        particle.style.setProperty("--ty", `${ty}px`);
        
        burst.appendChild(particle);
    }
    
    document.body.appendChild(burst);
    
    setTimeout(() => {
        burst.remove();
    }, 1100);
}

tossBtn.addEventListener("click", () => {
    if(selectedChoice === "") {
        alert("Please choose Head or Tail first!");
        return;
    }

    coin.classList.add("flip");
    resultText.textContent = "Coin Tossing...";

    setTimeout(() => {
        coin.classList.remove("flip");

        const result = Math.random() < 0.5 ? "Head" : "Tail";

        if(result === "Head") {
            coin.textContent = "💕";
        } else {
            coin.textContent = "🐵";
        }

        if(selectedChoice === result) {
            wins++;
            winCount.textContent = wins;
            resultText.textContent = `🎉 Result: ${result} | You Win!`;
            
            createBurst();
            coin.classList.add("win-anim");
            
            setTimeout(() => {
                coin.classList.remove("win-anim");
            }, 600);
        } else {
            losses++;
            loseCount.textContent = losses;
            resultText.textContent = `😢 Result: ${result} | You Lose!`;
        }

    }, 1000);
});

replayBtn.addEventListener("click", () => {
    selectedChoice = "";
    coin.textContent = "🪙";
    resultText.textContent = "Make Your Choice";
    headBtn.classList.remove("selected");
    tailBtn.classList.remove("selected");
});

homeBtn.addEventListener("click", () => {
    window.location.href = "index.html";
});