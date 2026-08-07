// LuckyKit Premium Arcade Page Shell Controller
(function () {
    // 1. Identify current game
    const path = window.location.pathname;
    const filename = path.substring(path.lastIndexOf('/') + 1);
    
    // Map filename to clean title
    const gameTitles = {
        "tictactoe.html": "Tic Tac Toe",
        "luck.html": "Test Your Luck",
        "rps.html": "Rock Paper Scissors",
        "mem.html": "Memory Match",
        "snake.html": "Snake Game",
        "truck.html": "Ultimate Truck Racer",
        "whack.html": "Whack A Mole",
        "fruit.html": "Fruit Ninja",
        "box.html": "Luck Box Challenge",
        "chess.html": "Chess Game",
        "ml.html": "Memory Link",
        "space.html": "Cosmic Strike",
        "brick.html": "Neon Shatter",
        "checkers.html": "Neo Draughts",
        "2048.html": "Quantum Merge"
    };

    const gameCategories = {
        "tictactoe.html": "🎲 Board",
        "luck.html": "🍀 Luck",
        "rps.html": "🍀 Luck",
        "mem.html": "🧠 Brain",
        "snake.html": "⚡ Arcade",
        "truck.html": "⚡ Arcade",
        "whack.html": "⚡ Arcade",
        "fruit.html": "⚡ Arcade",
        "box.html": "🍀 Luck",
        "chess.html": "🎲 Board",
        "ml.html": "🧠 Brain",
        "space.html": "⚡ Arcade",
        "brick.html": "⚡ Arcade",
        "checkers.html": "🎲 Board",
        "2048.html": "🧠 Brain"
    };

    const gameInstructions = {
        "tictactoe.html": "Oru friend kooda play pannu or CPU kooda vilayadu! 3 marks straight line-la place panna you win. (Challenge a friend or AI! Place three of your marks in a row to win).",
        "luck.html": "Head or Tail select pannu, apram 'Toss Coin' click pannu! Correct-a guess panna you win. (Select Head or Tail, then click 'Toss Coin' to test your luck!)",
        "rps.html": "Rock beats Scissors, Scissors beats Paper, Paper beats Rock! Computer-kooda fight pannu. (Classic Rock Paper Scissors against the AI).",
        "mem.html": "Cards-a flip panni matching pairs kandupidi! Time kammiya irukumbodhu match panna win. (Click cards to find matching pairs quickly).",
        "snake.html": "Arrow keys use panni snake-a move pannu, red apple sapudu! Wall-layum un tail-layum idikama play pannu. (Eat apples to grow, avoid walls and your own tail).",
        "truck.html": "Left/Right Arrow keys use panni truck steer pannu, obstacles avoid pannu, gold coins collect pannu. (Drive the truck, avoid obstacles and collect coins).",
        "whack.html": "Moles hole-la irundhu pop aagum, click panni whack pannu! Fast-a click pannu illana lives poidum. (Hammer the moles before they hide back).",
        "fruit.html": "Fruits-a click or drag panni slice pannu! Bombs-a slice panna koodadhu. (Slice flying fruits and avoid bombs).",
        "box.html": "Mystery boxes open panni gems collect pannu. Bomb iruka box open panna lose! (Open boxes to find gems, avoid the bomb).",
        "chess.html": "Chess game! Un strategy use panni opponent King-a Checkmate pannu. (Standard chess game against AI or friend).",
        "ml.html": "CPU oru glowing sequence kaatum, adha correct-a repeat pannu. Levels poga poga sequence perusagum! (Remember the sequence and repeat it).",
        "space.html": "Arrow keys use panni ship-a move pannu, alien invaders-a shoot pannu! (Move your ship and blast the alien invaders).",
        "brick.html": "Paddle use panni ball bounce pannu, ella neon bricks-um shatter pannu! (Bounce the ball and destroy all glowing bricks).",
        "checkers.html": "Neo Draughts! Un pieces-a move panni opponent pieces-a jump panni capture pannu. (Jump and capture all opponent checkers pieces).",
        "2048.html": "Arrow keys or Swipe use panni tiles-a merge pannu. 2048 tile vara varaikum merge pannite iru! (Merge tiles to reach the 2048 tile)."
    };

    const currentGame = gameTitles[filename] || "Arcade Game";
    const currentCategory = gameCategories[filename] || "🎮 Game";
    const instructions = gameInstructions[filename] || "Play and score points to level up!";

    const gameColors = {
        "tictactoe.html": "#06b6d4", "luck.html": "#eab308", "rps.html": "#a855f7", 
        "mem.html": "#ec4899", "snake.html": "#22c55e", "truck.html": "#f97316", 
        "whack.html": "#8b5cf6", "fruit.html": "#ef4444", "box.html": "#d946ef", 
        "chess.html": "#64748b", "ml.html": "#f43f5e", "serpent.html": "#10b981",
        "quadra.html": "#dc2626", "checkers.html": "#a1a1aa", "ludo.html": "#3b82f6",
        "wheel.html": "#f59e0b", "slots.html": "#ec4899", "cards.html": "#a855f7",
        "treasure.html": "#eab308", "space.html": "#06b6d4", "balloon.html": "#f43f5e",
        "brick.html": "#0ea5e9", "bubble.html": "#8b5cf6", "maze.html": "#10b981",
        "2048.html": "#f97316", "water.html": "#38bdf8", "hidden.html": "#9ca3af"
    };

    document.addEventListener("DOMContentLoaded", () => {
        // Only run shell injection if inside a game page, not index.html
        if (filename === "index.html" || filename === "") return;

        // Apply dark-mode premium body class
        document.body.classList.add("arcade-premium-mode");
        
        // Apply dynamic game color
        const themeColor = gameColors[filename] || "#8b5cf6";
        document.documentElement.style.setProperty('--game-theme-color', themeColor);

        // Hide original Home buttons in game content to prevent visual clutter
        setTimeout(() => {
            const homeBtns = document.querySelectorAll("#homeBtn, .homeBtn, button[onclick*='index.html'], button[onclick*='location.href']");
            homeBtns.forEach(btn => {
                btn.style.display = "none";
            });
        }, 100);

        // Inject Premium Top Header Bar
        const header = document.createElement("div");
        header.className = "arcade-header-bar";
        header.innerHTML = `
            <div class="arcade-header-left">
                <a href="index.html" class="arcade-logo-link">🎲 LuckyKit</a>
                <span style="color: rgba(255,255,255,0.4); font-size: 1.2rem;">|</span>
                <span style="font-weight: 500; font-size: 0.8rem; background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 20px; color: #fff; margin-right: 5px;">${currentCategory}</span>
                <span style="font-weight: 700; color: #fff; letter-spacing: 0.5px; font-size: 1.1rem;">${currentGame}</span>
            </div>
            
            <div class="arcade-header-right">
                <div class="arcade-profile-widget">
                    <span class="widget-avatar" id="shellAvatar">🎮</span>
                    <div class="widget-info">
                        <span class="widget-name" id="shellName">Player</span>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span class="widget-level-badge" id="shellLevel">LVL 1</span>
                            <div class="widget-xp-container">
                                <div class="widget-xp-bar" id="shellXpBar"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <button class="arcade-nav-btn" id="shellMuteBtn">🔊 Sound</button>
                <button class="arcade-nav-btn" id="shellHelpBtn">ℹ️ How To Play</button>
                <button class="arcade-nav-btn btn-home" id="shellBackBtn">🏠 Exit Game</button>
            </div>
        `;
        document.body.prepend(header);

        // Bind profile widget updates
        if (window.ArcadeCore) {
            window.ArcadeCore.subscribe((state) => {
                const shellAvatar = document.getElementById("shellAvatar");
                const shellName = document.getElementById("shellName");
                const shellLevel = document.getElementById("shellLevel");
                const shellXpBar = document.getElementById("shellXpBar");
                const shellMuteBtn = document.getElementById("shellMuteBtn");

                if (shellAvatar) shellAvatar.textContent = state.avatar;
                if (shellName) shellName.textContent = state.name;
                if (shellLevel) shellLevel.textContent = `LVL ${state.level}`;
                
                if (shellXpBar) {
                    const xpNeeded = state.level * 100;
                    const percent = Math.min(100, (state.xp / xpNeeded) * 100);
                    shellXpBar.style.width = `${percent}%`;
                }

                if (shellMuteBtn) {
                    shellMuteBtn.innerHTML = state.muted ? "🔇 Muted" : "🔊 Sound";
                    shellMuteBtn.style.color = state.muted ? "rgba(255,255,255,0.4)" : "#fff";
                }
            });

            // Track Game Play stats
            window.ArcadeCore.trackPlay(filename);
        }

        // Add instructions / How to play modal
        const modal = document.createElement("div");
        modal.className = "arcade-modal-backdrop";
        modal.id = "arcadeHelpModal";
        modal.innerHTML = `
            <div class="arcade-modal-content">
                <button class="arcade-modal-close" id="closeHelpModal">&times;</button>
                <div class="arcade-modal-title">How To Play ${currentGame}</div>
                <div class="arcade-modal-body">
                    <p style="margin-bottom: 15px; font-weight: 500; font-size: 1.05rem; color: #fff;">${instructions}</p>
                    <p style="color: #9ca3af; font-size: 0.85rem; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 12px;">
                        💡 <strong>Arcade Rewards:</strong> Playing awards <span style="color: var(--neon-cyan)">+15 XP</span>. Winning awards an additional <span style="color: var(--neon-gold)">+60 XP</span>. Level up to claim achievements!
                    </p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Bind Shell Actions
        const muteBtn = document.getElementById("shellMuteBtn");
        const helpBtn = document.getElementById("shellHelpBtn");
        const backBtn = document.getElementById("shellBackBtn");
        const closeHelp = document.getElementById("closeHelpModal");

        if (muteBtn) {
            muteBtn.addEventListener("click", () => {
                if (window.ArcadeCore) {
                    const isMuted = window.ArcadeCore.toggleMute();
                    if (window.ArcadeSounds) {
                        if (isMuted) window.ArcadeSounds.stopBgMusic();
                        else window.ArcadeSounds.startBgMusic();
                        window.ArcadeSounds.playClick();
                    }
                }
            });
        }

        if (helpBtn) {
            helpBtn.addEventListener("click", () => {
                modal.classList.add("show");
                if (window.ArcadeSounds) window.ArcadeSounds.playSelect();
            });
        }

        if (closeHelp) {
            closeHelp.addEventListener("click", () => {
                modal.classList.remove("show");
                if (window.ArcadeSounds) window.ArcadeSounds.playClick();
            });
        }

        if (backBtn) {
            backBtn.addEventListener("click", () => {
                if (window.ArcadeSounds) window.ArcadeSounds.playSelect();
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 150);
            });
        }

        // Close modal when clicking outside content
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.classList.remove("show");
            }
        });

        // 3. Audio effect binding on game buttons
        document.addEventListener("click", (e) => {
            const tag = e.target.tagName.toLowerCase();
            const role = e.target.getAttribute("role");
            if (tag === "button" || tag === "a" || role === "button" || e.target.classList.contains("cell") || e.target.classList.contains("key")) {
                if (window.ArcadeSounds) {
                    window.ArcadeSounds.playClick();
                }
            }
        });

        // 4. Outcome detection: Automatically listen to DOM changes to detect wins/losses and award XP!
        let gameEndedThisSession = false;

        const handleGameEnding = (isWin) => {
            if (gameEndedThisSession) return;
            gameEndedThisSession = true;

            if (window.ArcadeCore) {
                if (isWin) {
                    window.ArcadeCore.trackWin(filename);
                    if (window.ArcadeSounds) window.ArcadeSounds.playWin();
                } else {
                    if (window.ArcadeSounds) window.ArcadeSounds.playLose();
                }
            }
            
            // Cool down so multiple XP awards don't occur sequentially in 5 seconds
            setTimeout(() => {
                gameEndedThisSession = false;
            }, 6000);
        };

        // Mutation Observer to scan for game over screens and alerts
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "attributes" || mutation.type === "childList") {
                    const text = document.body.innerText || "";
                    
                    // Tic Tac Toe popup detection
                    const winnerMessage = document.getElementById("winnerMessage");
                    if (winnerMessage && winnerMessage.offsetHeight > 0) {
                        const msg = winnerMessage.textContent.toLowerCase();
                        if (msg.includes("wins") || msg.includes("winner")) {
                            // Determine if current user won (X is player 1)
                            if (msg.includes("ai wins") || msg.includes("player 2 wins")) {
                                handleGameEnding(false);
                            } else {
                                handleGameEnding(true);
                            }
                        }
                    }

                    // Snake / general game over detection
                    const statusText = document.getElementById("statusText");
                    if (statusText) {
                        const txt = statusText.textContent.toLowerCase();
                        if (txt.includes("game over") || txt.includes("crash")) {
                            handleGameEnding(false);
                        }
                    }

                    // General class overlay check
                    const overlays = document.querySelectorAll("#game-over-screen, #gameOverScreen, .game-over, .popup");
                    overlays.forEach(overlay => {
                        if (overlay.offsetHeight > 0 && !overlay.classList.contains("hidden")) {
                            const ot = overlay.innerText.toLowerCase();
                            if (ot.includes("game over") || ot.includes("defeat") || ot.includes("lose")) {
                                handleGameEnding(false);
                            } else if (ot.includes("win") || ot.includes("victory") || ot.includes("congratulations")) {
                                handleGameEnding(true);
                            }
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["class", "style"]
        });

        // Intercept standard window.alert calls
        const originalAlert = window.alert;
        window.alert = function (msg) {
            originalAlert(msg);
            const lowerMsg = msg.toLowerCase();
            if (lowerMsg.includes("win") || lowerMsg.includes("victory") || lowerMsg.includes("draw")) {
                if (lowerMsg.includes("draw") || lowerMsg.includes("lose") || lowerMsg.includes("ai wins")) {
                    handleGameEnding(false);
                } else {
                    handleGameEnding(true);
                }
            } else if (lowerMsg.includes("game over") || lowerMsg.includes("lose") || lowerMsg.includes("crash")) {
                handleGameEnding(false);
            }
        };
    });
})();
