// Chroma Sort - Logic Core

document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("startBtn");
    const gameArea = document.getElementById("gameArea");
    const scoreDisplay = document.getElementById("scoreDisplay");
    
    // Load How To Play
    document.getElementById("howToPlayBody").innerHTML = `
        <ol class="list-group list-group-numbered list-group-flush bg-transparent">
            <li class="list-group-item bg-transparent text-white border-secondary">Read the objective of the game carefully.</li>
            <li class="list-group-item bg-transparent text-white border-secondary">Use your mouse or keyboard to interact.</li>
            <li class="list-group-item bg-transparent text-white border-secondary">Score points to level up and earn XP.</li>
            <li class="list-group-item bg-transparent text-white border-secondary">Have fun!</li>
        </ol>
    `;

    // Visual Particles
    const particles = document.getElementById("particles");
    if(particles) {
        for(let i=0; i<30; i++) {
            const p = document.createElement("div");
            p.style.position = "absolute";
            p.style.width = Math.random() * 5 + "px";
            p.style.height = p.style.width;
            p.style.background = "var(--theme-color)";
            p.style.borderRadius = "50%";
            p.style.left = Math.random() * 100 + "vw";
            p.style.top = Math.random() * 100 + "vh";
            p.style.opacity = Math.random() * 0.5;
            p.style.boxShadow = "0 0 10px var(--theme-color)";
            p.style.animation = `pulseBg ${3 + Math.random()*5}s infinite alternate`;
            particles.appendChild(p);
        }
    }

    if(startBtn) {
        startBtn.addEventListener("click", () => {
            if(window.ArcadeSounds) window.ArcadeSounds.playSelect();
            gameArea.innerHTML = `<h2 class='text-theme fw-bold mb-4'>Game In Progress...</h2>
                                  <p class='text-white-50'>Simulated gameplay mechanic for Chroma Sort</p>
                                  <button class='btn btn-lg btn-outline-light mt-4' id='scoreBtn'>+100 Points</button>`;
            
            document.getElementById("scoreBtn").addEventListener("click", () => {
                if(window.ArcadeSounds) window.ArcadeSounds.playTone(600, "square", 0.1);
                const currentScore = parseInt(scoreDisplay.innerText);
                scoreDisplay.innerText = currentScore + 100;
                
                // Add XP globally
                if(window.ArcadeCore) window.ArcadeCore.addXP(10);
            });
        });
    }
});
