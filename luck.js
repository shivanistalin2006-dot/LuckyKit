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

let currentRotation = 0;
let isTossing = false;

tossBtn.addEventListener("click", () => {
    if(selectedChoice === "") {
        alert("Please choose Head or Tail first!");
        return;
    }
    if (isTossing) return;

    isTossing = true;
    resultText.textContent = "Coin Tossing...";
    
    // Play sound if available
    if (window.ArcadeSounds) window.ArcadeSounds.playSelect();

    const result = Math.random() < 0.5 ? "Head" : "Tail";
    
    // Calculate spins
    const spins = 5; // 5 full rotations
    const baseRotation = currentRotation + (spins * 360);
    // If result is Tail, we need it to land on 180, 540, 900 etc.
    currentRotation = result === "Head" ? baseRotation : baseRotation + 180;
    
    coin.style.transform = `rotateY(${currentRotation}deg)`;

    setTimeout(() => {
        isTossing = false;

        if(selectedChoice === result) {
            wins++;
            winCount.textContent = wins;
            resultText.textContent = `🎉 Result: ${result} | You Win!`;
            
            createBurst();
            if (window.ArcadeSounds) window.ArcadeSounds.playWin();
            if (window.ArcadeCore) window.ArcadeCore.addXP(20);
        } else {
            losses++;
            loseCount.textContent = losses;
            resultText.textContent = `😢 Result: ${result} | You Lose!`;
            if (window.ArcadeSounds) window.ArcadeSounds.playGameOver();
        }

    }, 3000); // Wait for CSS transition (3s)
});

replayBtn.addEventListener("click", () => {
    if (isTossing) return;
    selectedChoice = "";
    
    // Reset to head side up without transition
    coin.style.transition = 'none';
    currentRotation = 0;
    coin.style.transform = `rotateY(0deg)`;
    // Force reflow
    void coin.offsetWidth;
    coin.style.transition = 'transform 3s cubic-bezier(0.4, 0.0, 0.2, 1)';
    
    resultText.textContent = "Make Your Choice";
    headBtn.classList.remove("selected");
    tailBtn.classList.remove("selected");
});

homeBtn.addEventListener("click", () => {
    window.location.href = "index.html";
});
