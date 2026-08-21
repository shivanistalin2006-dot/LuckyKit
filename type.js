import { BaseGame } from './core/BaseGame.js?v=2.5';
import { gameManager } from './core/gameManager.js';
import { audioManager } from './audio/audioManager.js';
import { animationManager } from './animation/animationManager.js';

const WORD_BANK = [
    "system", "protocol", "cyber", "network", "firewall", "matrix", "node", "mainframe",
    "override", "encryption", "proxy", "server", "data", "stream", "uplink", "bandwidth",
    "algorithm", "binary", "terminal", "console", "execute", "bypass", "hacker", "breach",
    "latency", "packet", "router", "socket", "virtual", "reality", "neural", "interface",
    "kernel", "shell", "script", "command", "process", "thread", "memory", "cache"
];

class CyberTyper extends BaseGame {
    constructor() {
        super("type");
        
        this.wpmDisplay = document.getElementById('wpmDisplay');
        this.timeDisplay = document.getElementById('timeDisplay');
        this.accDisplay = document.getElementById('accDisplay');
        this.textDisplay = document.getElementById('textDisplay');
        this.hiddenInput = document.getElementById('hiddenInput');
        this.statusMsg = document.getElementById('statusMsg');
        this.hsWpmDisplay = document.getElementById('hsWpmDisplay');
        this.totalWordsDisplay = document.getElementById('totalWordsDisplay');
        
        this.hsWpmDisplay.textContent = this.highScore; // Store WPM in highScore
        
        this.timeLeft = 60;
        this.timerInterval = null;
        this.charIndex = 0;
        this.mistakes = 0;
        this.isTyping = false;
        
        this.targetText = "";
        this.charElements = [];
        
        this.bindEvents();
        gameManager.registerGame(this);
    }

    bindEvents() {
        document.getElementById('startBtn')?.addEventListener('click', () => this.start());
        document.getElementById('restartBtn')?.addEventListener('click', () => this.start());
        
        // Focus hidden input when clicking anywhere in the container
        document.querySelector('.type-container').addEventListener('click', () => {
            this.hiddenInput.focus();
        });
        
        this.hiddenInput.addEventListener('input', (e) => this.handleInput(e));
        
        // Prevent default backspace behavior that navigates back
        this.hiddenInput.addEventListener('keydown', (e) => {
            if (e.key === "Backspace" || e.key === "Delete") {
                this.handleBackspace();
            }
        });
    }

    generateText() {
        // Generate ~40 random words
        let words = [];
        for (let i = 0; i < 40; i++) {
            words.push(WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)]);
        }
        this.targetText = words.join(" ");
        
        this.textDisplay.innerHTML = "";
        this.charElements = [];
        
        this.targetText.split("").forEach((char, index) => {
            const span = document.createElement("span");
            span.textContent = char;
            span.classList.add("char");
            if (index === 0) span.classList.add("active");
            this.textDisplay.appendChild(span);
            this.charElements.push(span);
        });
    }

    onStart() {
        this.timeLeft = 60;
        this.charIndex = 0;
        this.mistakes = 0;
        this.isTyping = false;
        
        this.hiddenInput.value = "";
        this.wpmDisplay.textContent = "0";
        this.timeDisplay.textContent = this.timeLeft;
        this.accDisplay.textContent = "100%";
        this.statusMsg.textContent = "Waiting for first keystroke...";
        this.statusMsg.className = "text-center mt-3 fs-6 text-white";
        
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        this.generateText();
        this.hiddenInput.focus();
    }

    startTimer() {
        this.isTyping = true;
        this.statusMsg.textContent = "Terminal connected. Transmitting data...";
        this.statusMsg.className = "text-center mt-3 fs-6 text-info";
        
        this.timerInterval = setInterval(() => {
            if (this.isPaused) return;
            
            this.timeLeft--;
            this.timeDisplay.textContent = this.timeLeft;
            
            if (this.timeLeft <= 0) {
                this.endTest();
            }
        }, 1000);
    }

    handleInput(e) {
        if (!this.isRunning || this.isPaused || this.timeLeft <= 0) return;
        
        if (!this.isTyping) {
            this.startTimer();
            if (audioManager) audioManager.startBgMusic();
        }
        
        const typedChar = this.hiddenInput.value.slice(-1);
        if (!typedChar) return; // Handled by backspace
        
        if (this.charIndex < this.charElements.length) {
            const expectedChar = this.targetText[this.charIndex];
            const currentSpan = this.charElements[this.charIndex];
            
            currentSpan.classList.remove("active");
            
            if (typedChar === expectedChar) {
                currentSpan.classList.add("correct");
                if (audioManager) audioManager.playTone(400 + Math.random()*200, 'sine', 0.02);
            } else {
                currentSpan.classList.add("incorrect");
                this.mistakes++;
                if (audioManager) audioManager.playTone(150, 'sawtooth', 0.05);
            }
            
            this.charIndex++;
            if (this.charIndex < this.charElements.length) {
                this.charElements[this.charIndex].classList.add("active");
            } else {
                // Generated text finished early, generate more
                this.generateText();
                this.charIndex = 0;
                this.hiddenInput.value = "";
            }
            
            this.updateStats();
        }
    }

    handleBackspace() {
        if (!this.isRunning || this.isPaused || this.charIndex <= 0) return;
        
        const currentSpan = this.charElements[this.charIndex];
        if (currentSpan) currentSpan.classList.remove("active");
        
        this.charIndex--;
        
        const prevSpan = this.charElements[this.charIndex];
        
        if (prevSpan.classList.contains("incorrect")) {
            this.mistakes--;
        }
        
        prevSpan.classList.remove("correct", "incorrect");
        prevSpan.classList.add("active");
        
        this.updateStats();
        if (audioManager) audioManager.playTone(300, 'triangle', 0.02);
    }

    updateStats() {
        const charsTyped = this.charIndex;
        const wordsTyped = charsTyped / 5;
        const timeElapsed = (60 - this.timeLeft) / 60; // in minutes
        
        let wpm = 0;
        if (timeElapsed > 0) {
            wpm = Math.round(wordsTyped / timeElapsed);
        }
        
        const acc = charsTyped > 0 ? Math.round(((charsTyped - this.mistakes) / charsTyped) * 100) : 100;
        
        this.wpmDisplay.textContent = wpm;
        this.accDisplay.textContent = `${acc}%`;
        
        // Dynamic color for WPM
        if (wpm > 60) this.wpmDisplay.className = "fs-2 fw-bold text-success";
        else if (wpm > 30) this.wpmDisplay.className = "fs-2 fw-bold text-warning";
        else this.wpmDisplay.className = "fs-2 fw-bold text-danger";
    }

    endTest() {
        clearInterval(this.timerInterval);
        this.isTyping = false;
        
        const charsTyped = this.charIndex;
        const wordsTyped = charsTyped / 5;
        const finalWpm = Math.round(wordsTyped);
        const acc = charsTyped > 0 ? Math.round(((charsTyped - this.mistakes) / charsTyped) * 100) : 100;
        
        this.statusMsg.textContent = `Test Complete: ${finalWpm} WPM @ ${acc}% Acc`;
        this.statusMsg.className = "text-center mt-3 fs-5 text-success fw-bold";
        this.totalWordsDisplay.textContent = Math.round(wordsTyped);
        
        this.score = finalWpm; // High score represents WPM
        this.hsWpmDisplay.textContent = Math.max(this.highScore, this.score);
        
        this.addScore(finalWpm * 2); // Economy bonus
        
        if (animationManager) {
            animationManager.spawnFloatingIcon('⌨️', window.innerWidth/2, window.innerHeight/2, `${finalWpm} WPM`);
            if (finalWpm > this.highScore) animationManager.spawnConfetti(window.innerWidth/2, window.innerHeight/2, 100);
        }
        
        this.gameOver(true);
    }

    onDestroy() {
        if (this.timerInterval) clearInterval(this.timerInterval);
    }
}

// Add instructions
gameManager.GAME_INSTRUCTIONS = gameManager.GAME_INSTRUCTIONS || {};
gameManager.GAME_INSTRUCTIONS["type"] = {
    title: "Cyber Typer",
    objective: "Type the cyberpunk terms as fast and accurately as possible.",
    controls: "Click the text box and use your keyboard to type.",
    win: "Get the highest Words Per Minute (WPM) before 60 seconds is up.",
    lose: "N/A - Just try to improve your speed!",
    tips: "Accuracy matters! Mistakes lower your final score."
};

if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", () => {
        const game = new CyberTyper();
    });
} else {
    const game = new CyberTyper();
}
