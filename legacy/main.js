// LuckyKit Premium Arcade Home Page Controller

document.addEventListener("DOMContentLoaded", () => {
    console.log("LuckyKit Premium Arcade Loaded!");

    // Check if ArcadeCore is loaded, otherwise wait a bit
    if (!window.ArcadeCore) {
        console.error("ArcadeCore not found!");
        return;
    }

    const state = window.ArcadeCore.state;

    // --- DOM Elements ---
    const playerAvatar = document.getElementById("playerAvatar");
    const playerName = document.getElementById("playerName");
    const playerLevel = document.getElementById("playerLevel");
    const playerXpBar = document.getElementById("playerXpBar");
    const muteToggleBtn = document.getElementById("muteToggleBtn");

    const profileCardBtn = document.getElementById("profileCardBtn");
    const profileModal = document.getElementById("profileModal");
    const closeProfileModal = document.getElementById("closeProfileModal");
    const playerNameInput = document.getElementById("playerNameInput");
    const saveProfileBtn = document.getElementById("saveProfileBtn");
    const avatarOptions = document.querySelectorAll(".avatar-option");

    const achievementsBtn = document.getElementById("achievementsBtn");
    const achievementsModal = document.getElementById("achievementsModal");
    const closeAchievementsModal = document.getElementById("closeAchievementsModal");
    const achievementsListContainer = document.getElementById("achievementsListContainer");

    const gameSearch = document.getElementById("gameSearch");
    const categoryTabs = document.querySelectorAll(".tab-btn");
    const gameCards = document.querySelectorAll(".game-card-wrapper");

    const statGamesPlayed = document.getElementById("statGamesPlayed");
    const statTotalWins = document.getElementById("statTotalWins");
    const statAchievementsCount = document.getElementById("statAchievementsCount");

    let selectedAvatar = state.avatar || "🎮";

    // --- Sound Synthesis Helpers ---
    const playClick = () => {
        if (window.ArcadeSounds) window.ArcadeSounds.playClick();
    };
    const playSelect = () => {
        if (window.ArcadeSounds) window.ArcadeSounds.playSelect();
    };

    // --- Setup UI bindings to state changes ---
    window.ArcadeCore.subscribe((latestState) => {
        if (playerAvatar) playerAvatar.textContent = latestState.avatar;
        if (playerName) playerName.textContent = latestState.name;
        if (playerLevel) playerLevel.textContent = `LVL ${latestState.level}`;
        
        if (playerXpBar) {
            const xpNeeded = latestState.level * 100;
            const percent = Math.min(100, (latestState.xp / xpNeeded) * 100);
            playerXpBar.style.width = `${percent}%`;
        }

        if (muteToggleBtn) {
            muteToggleBtn.innerHTML = latestState.muted ? "🔇 <span class='btn-text'>Muted</span>" : "🔊 <span class='btn-text'>Sound</span>";
            muteToggleBtn.style.color = latestState.muted ? "rgba(255,255,255,0.4)" : "#fff";
        }

        // Stats Dashboard updates
        if (statGamesPlayed) statGamesPlayed.textContent = latestState.gamesPlayed;
        if (statTotalWins) statTotalWins.textContent = latestState.wins;
        
        const list = window.ArcadeCore.getAchievementsList();
        const unlockedCount = latestState.achievements.length;
        if (statAchievementsCount) statAchievementsCount.textContent = `${unlockedCount}/${list.length}`;
    });

    // --- Profile Editing Modal Logic ---
    if (profileCardBtn) {
        profileCardBtn.addEventListener("click", () => {
            playSelect();
            const currState = window.ArcadeCore.state;
            playerNameInput.value = currState.name;
            selectedAvatar = currState.avatar;

            // Highlight current avatar
            avatarOptions.forEach(opt => {
                const text = opt.innerText.trim();
                // Strip emoji description if user inputs 'Tiger🐯' etc.
                const emojiOnly = text.match(/\p{Emoji}/u)?.[0] || text;
                if (emojiOnly === selectedAvatar || text === selectedAvatar) {
                    opt.classList.add("selected");
                } else {
                    opt.classList.remove("selected");
                }
            });

            profileModal.classList.add("show");
        });
    }

    if (closeProfileModal) {
        closeProfileModal.addEventListener("click", () => {
            playClick();
            profileModal.classList.remove("show");
        });
    }

    avatarOptions.forEach(opt => {
        opt.addEventListener("click", () => {
            playClick();
            avatarOptions.forEach(o => o.classList.remove("selected"));
            opt.classList.add("selected");
            const text = opt.innerText.trim();
            // Extract ONLY the emoji characters to save space
            selectedAvatar = text.match(/\p{Emoji}/u)?.[0] || text;
        });
    });

    if (saveProfileBtn) {
        saveProfileBtn.addEventListener("click", () => {
            playSelect();
            const newName = playerNameInput.value.trim();
            window.ArcadeCore.updateProfile(newName || "Player 1", selectedAvatar);
            profileModal.classList.remove("show");
        });
    }

    // --- Mute Button Logic ---
    if (muteToggleBtn) {
        muteToggleBtn.addEventListener("click", () => {
            if (window.ArcadeCore) {
                const isMuted = window.ArcadeCore.toggleMute();
                if (window.ArcadeSounds) {
                    if (isMuted) window.ArcadeSounds.stopBgMusic();
                    else window.ArcadeSounds.startBgMusic();
                }
                playClick();
            }
        });
    }

    // --- Achievements Modal Logic ---
    if (achievementsBtn) {
        achievementsBtn.addEventListener("click", () => {
            playSelect();
            renderAchievementsList();
            achievementsModal.classList.add("show");
        });
    }

    if (closeAchievementsModal) {
        closeAchievementsModal.addEventListener("click", () => {
            playClick();
            achievementsModal.classList.remove("show");
        });
    }

    function renderAchievementsList() {
        if (!achievementsListContainer) return;
        achievementsListContainer.innerHTML = "";

        const allAchievements = window.ArcadeCore.getAchievementsList();
        const unlockedList = window.ArcadeCore.state.achievements;

        allAchievements.forEach(ach => {
            const isUnlocked = unlockedList.includes(ach.id);
            const item = document.createElement("div");
            item.className = `ach-item ${isUnlocked ? 'unlocked' : ''}`;
            item.innerHTML = `
                <div class="ach-item-icon">${isUnlocked ? ach.icon : '🔒'}</div>
                <div class="ach-item-details">
                    <span class="ach-item-title">${ach.title}</span>
                    <span class="ach-item-desc">${ach.desc}</span>
                </div>
            `;
            achievementsListContainer.appendChild(item);
        });
    }

    // --- Real-time Filter & Search Logic ---
    let currentFilter = "all";
    let searchQuery = "";

    const filterGames = () => {
        gameCards.forEach(cardWrapper => {
            const category = cardWrapper.getAttribute("data-category");
            const titleElement = cardWrapper.querySelector("h4") || cardWrapper.querySelector("h2");
            const title = titleElement ? titleElement.innerText.toLowerCase() : "";
            const descElement = cardWrapper.querySelector("p");
            const desc = descElement ? descElement.innerText.toLowerCase() : "";

            const matchesCategory = (currentFilter === "all" || category === currentFilter);
            const matchesSearch = (title.includes(searchQuery) || desc.includes(searchQuery));

            if (matchesCategory && matchesSearch) {
                cardWrapper.style.display = "block";
            } else {
                cardWrapper.style.display = "none";
            }
        });
    };

    if (gameSearch) {
        gameSearch.addEventListener("input", (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            filterGames();
        });
    }

    categoryTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            playClick();
            categoryTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            currentFilter = tab.getAttribute("data-filter");
            filterGames();
        });
    });

    // --- Hover audio binder for game cards ---
    gameCards.forEach(card => {
        card.addEventListener("mouseenter", () => {
            // Short high pitch hover click
            if (window.ArcadeSounds && !(window.ArcadeCore && window.ArcadeCore.state.muted)) {
                try {
                    const ctx = new (window.AudioContext || window.webkitAudioContext)();
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = "sine";
                    osc.frequency.setValueAtTime(800, ctx.currentTime);
                    gain.gain.setValueAtTime(0.02, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.05);
                } catch(e) {}
            }
        });
    });

    // Close modals on clicking outside content
    window.addEventListener("click", (e) => {
        if (e.target === profileModal) {
            profileModal.classList.remove("show");
        }
        if (e.target === achievementsModal) {
            achievementsModal.classList.remove("show");
        }
    });
});

// --- Page redirect actions ---
function openTicTacToe() { window.location.href = "tictactoe.html"; }
function openLuckGame() { window.location.href = "luck.html"; }
function openRPS() { window.location.href = "rps.html"; }
function openMemoryGame() { window.location.href = "mem.html"; }
function openSnakeGame() { window.location.href = "snake.html"; }
function openBoxGame() { window.location.href = "box.html"; }
function openChessGame() { window.location.href = "chess.html"; }
function openFruitGame() { window.location.href = "fruit.html"; }
function openTruckGame() { window.location.href = "truck.html"; }
function openWhackGame() { window.location.href = "whack.html"; }
function openMemoryLinkGame() { window.location.href = "ml.html"; }