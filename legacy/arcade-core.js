// LuckyKit Arcade Core State Management
(function () {
    const STORAGE_KEY = "luckykit_arcade_state";

    const defaultState = {
        name: "Player 1",
        avatar: "🎮",
        level: 1,
        xp: 0,
        gamesPlayed: 0,
        wins: 0,
        muted: false,
        achievements: [],
        gameStats: {}
    };

    const achievementsList = [
        { id: "first_game", title: "Novice Gamer", desc: "Play your first game", icon: "🥉" },
        { id: "level_5", title: "Rising Star", desc: "Reach Level 5", icon: "🥈" },
        { id: "level_10", title: "Arcade Legend", desc: "Reach Level 10", icon: "🥇" },
        { id: "winner_1", title: "First Win", desc: "Win your first game match", icon: "🏆" },
        { id: "winner_10", title: "Champion", desc: "Win 10 game matches", icon: "👑" },
        { id: "xp_collector", title: "XP Grinder", desc: "Earn 1000 total XP", icon: "⚡" }
    ];

    class ArcadeCoreController {
        constructor() {
            this.state = this.loadState();
            this.listeners = [];
        }

        loadState() {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    // Merge with defaults to handle new fields
                    return { ...defaultState, ...parsed };
                }
            } catch (e) {
                console.error("Failed to load arcade state:", e);
            }
            return { ...defaultState };
        }

        saveState() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
                this.notifyListeners();
            } catch (e) {
                console.error("Failed to save arcade state:", e);
            }
        }

        notifyListeners() {
            this.listeners.forEach(cb => cb(this.state));
        }

        subscribe(cb) {
            this.listeners.push(cb);
            cb(this.state);
            return () => {
                this.listeners = this.listeners.filter(l => l !== cb);
            };
        }

        updateProfile(name, avatar) {
            if (name) this.state.name = name.trim().substring(0, 15);
            if (avatar) this.state.avatar = avatar;
            this.saveState();
        }

        addXP(amount) {
            this.state.xp += amount;
            let leveledUp = false;
            
            // Calculate XP needed for next level: level * 100
            while (this.state.xp >= this.getXPNeededForNextLevel()) {
                this.state.xp -= this.getXPNeededForNextLevel();
                this.state.level++;
                leveledUp = true;
            }

            this.saveState();
            
            if (leveledUp) {
                this.triggerLevelUpEffect();
                this.checkAchievements();
            }
            return leveledUp;
        }

        getXPNeededForNextLevel() {
            return this.state.level * 100;
        }

        trackPlay(gameId) {
            this.state.gamesPlayed++;
            if (!this.state.gameStats[gameId]) {
                this.state.gameStats[gameId] = { plays: 0, wins: 0 };
            }
            this.state.gameStats[gameId].plays++;
            
            this.addXP(15); // 15 XP just for starting/playing
            this.checkAchievements();
            this.saveState();
        }

        trackWin(gameId) {
            this.state.wins++;
            if (!this.state.gameStats[gameId]) {
                this.state.gameStats[gameId] = { plays: 0, wins: 0 };
            }
            this.state.gameStats[gameId].wins++;
            
            this.addXP(60); // 60 XP bonus for winning!
            this.checkAchievements();
            this.saveState();
        }

        toggleMute() {
            this.state.muted = !this.state.muted;
            this.saveState();
            return this.state.muted;
        }

        checkAchievements() {
            const newlyUnlocked = [];
            const unlock = (id) => {
                if (!this.state.achievements.includes(id)) {
                    this.state.achievements.push(id);
                    newlyUnlocked.push(id);
                }
            };

            // Evaluation logic
            if (this.state.gamesPlayed >= 1) unlock("first_game");
            if (this.state.level >= 5) unlock("level_5");
            if (this.state.level >= 10) unlock("level_10");
            if (this.state.wins >= 1) unlock("winner_1");
            if (this.state.wins >= 10) unlock("winner_10");
            
            // Total XP Calculation
            let totalXP = this.state.xp;
            for (let i = 1; i < this.state.level; i++) {
                totalXP += i * 100;
            }
            if (totalXP >= 1000) unlock("xp_collector");

            if (newlyUnlocked.length > 0) {
                this.saveState();
                newlyUnlocked.forEach(id => {
                    const ach = achievementsList.find(a => a.id === id);
                    if (ach) {
                        this.showAchievementUnlockedPopup(ach);
                    }
                });
            }
        }

        showAchievementUnlockedPopup(ach) {
            // Trigger customized overlay modal for achievement
            const popup = document.createElement("div");
            popup.className = "achievement-unlock-popup";
            popup.innerHTML = `
                <div class="ach-icon">${ach.icon}</div>
                <div class="ach-content">
                    <div class="ach-title">Achievement Unlocked!</div>
                    <div class="ach-name">${ach.title}</div>
                    <div class="ach-desc">${ach.desc}</div>
                </div>
            `;
            document.body.appendChild(popup);

            // Play retro level up sound
            if (window.ArcadeSounds) {
                window.ArcadeSounds.playLevelUp();
            }

            setTimeout(() => {
                popup.classList.add("show");
            }, 100);

            setTimeout(() => {
                popup.classList.remove("show");
                setTimeout(() => popup.remove(), 500);
            }, 4000);
        }

        triggerLevelUpEffect() {
            // Trigger visual level up animation
            const levelUpContainer = document.createElement("div");
            levelUpContainer.className = "levelup-overlay";
            levelUpContainer.innerHTML = `
                <div class="levelup-box">
                    <div class="levelup-shine"></div>
                    <div class="levelup-title">LEVEL UP!</div>
                    <div class="levelup-val">Level ${this.state.level}</div>
                    <div class="levelup-subtitle">Keep dominating the arcade!</div>
                </div>
            `;
            document.body.appendChild(levelUpContainer);

            // Create particles
            for(let i=0; i<40; i++) {
                const p = document.createElement("div");
                p.className = "levelup-particle";
                p.style.setProperty("--tx", `${(Math.random() - 0.5) * 300}px`);
                p.style.setProperty("--ty", `${(Math.random() - 0.5) * 300}px`);
                p.style.setProperty("--color", `hsl(${Math.random() * 360}, 100%, 60%)`);
                p.style.left = "50%";
                p.style.top = "50%";
                levelUpContainer.appendChild(p);
            }

            if (window.ArcadeSounds) {
                window.ArcadeSounds.playLevelUp();
            }

            setTimeout(() => {
                levelUpContainer.classList.add("active");
            }, 50);

            setTimeout(() => {
                levelUpContainer.classList.remove("active");
                setTimeout(() => levelUpContainer.remove(), 600);
            }, 3000);
        }

        getAchievementsList() {
            return achievementsList;
        }
    }

    window.ArcadeCore = new ArcadeCoreController();
})();
