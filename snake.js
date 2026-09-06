import { BaseGame } from './core/BaseGame.js?v=2.5';
import { gameManager } from './core/gameManager.js';
import { storage } from './core/storage.js';

// ========================================================
// NOKIA 3310 AUDIO SYNTHESIZER (WEB AUDIO API)
// ========================================================
class NokiaAudio {
    constructor() {
        this.ctx = null;
        this.muted = localStorage.getItem('luckykit_snake_muted') === 'true';
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playTone(freq, type = 'square', duration = 0.04, vol = 0.15) {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            gain.gain.setValueAtTime(vol, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            // Audio context failed or blocked
        }
    }

    buttonBeep() { this.playTone(1200, 'square', 0.03, 0.12); }
    menuBeep() { this.playTone(880, 'square', 0.04, 0.15); }
    selectBeep() { this.playTone(1046, 'square', 0.06, 0.18); }
    eatBeep() { this.playTone(1318, 'square', 0.06, 0.22); }
    countBeep(high = false) { this.playTone(high ? 1318 : 659, 'square', 0.08, 0.2); }
    gameOverBeep() {
        this.playTone(587, 'square', 0.08, 0.2);
        setTimeout(() => this.playTone(493, 'square', 0.08, 0.2), 90);
        setTimeout(() => this.playTone(392, 'square', 0.08, 0.2), 180);
        setTimeout(() => this.playTone(293, 'square', 0.25, 0.25), 270);
    }

    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('luckykit_snake_muted', this.muted.toString());
        return this.muted;
    }
}

// ========================================================
// NOKIA 3310 SNAKE GAME & OS ENGINE
// ========================================================
const GRID_WIDTH = 30;
const GRID_HEIGHT = 18;
const CELL_SIZE = 8; // 30*8 = 240px, 18*8 = 144px

// UI States
const STATES = {
    HOME: 'HOME',
    MAIN_MENU: 'MAIN_MENU',
    GAMES_MENU: 'GAMES_MENU',
    SNAKE_MENU: 'SNAKE_MENU',
    COUNTDOWN: 'COUNTDOWN',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAME_OVER: 'GAME_OVER',
    HIGH_SCORES: 'HIGH_SCORES',
    SETTINGS: 'SETTINGS'
};

class NokiaSnakeGame extends BaseGame {
    constructor() {
        super("snake");

        this.canvas = document.getElementById("nokiaLcdCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.ctx.imageSmoothingEnabled = false;

        this.audio = new NokiaAudio();
        this.uiState = STATES.SNAKE_MENU; // Default directly to Snake Menu for immediate play
        this.menuCursor = 0;

        // Soft Keys Labels
        this.lcdSoftLeft = document.getElementById("lcdSoftLeft");
        this.lcdSoftRight = document.getElementById("lcdSoftRight");
        this.lcdClock = document.getElementById("lcdClock");
        this.soundStatusText = document.getElementById("soundStatusText");
        this.sidebarBestScore = document.getElementById("sidebarBestScore");

        // High Scores from localStorage
        this.highScores = JSON.parse(localStorage.getItem('luckykit_snake_highscores') || '[520, 410, 280, 190, 120]');
        this.highScore = this.highScores[0] || 0;
        this.updateSidebarScore();

        // Snake Engine State
        this.snake = [];
        this.direction = 'RIGHT';
        this.nextDirection = 'RIGHT';
        this.food = { x: 10, y: 5 };
        this.score = 0;
        this.foodEaten = 0;
        this.speedInterval = 180;
        this.countdownNumber = 3;
        this.countdownTimer = null;
        this.lastTick = 0;

        this.updateClock();
        setInterval(() => this.updateClock(), 30000);

        this.bindEvents();
        this.render();

        gameManager.registerGame(this);
    }

    updateClock() {
        const d = new Date();
        const hrs = String(d.getHours()).padStart(2, '0');
        const mins = String(d.getMinutes()).padStart(2, '0');
        if (this.lcdClock) this.lcdClock.textContent = `${hrs}:${mins}`;
    }

    updateSidebarScore() {
        if (this.sidebarBestScore) {
            this.sidebarBestScore.textContent = `${this.highScore} pts`;
        }
    }

    getSpeedInterval(foodCount) {
        if (foodCount >= 40) return 105;
        if (foodCount >= 30) return 120;
        if (foodCount >= 20) return 135;
        if (foodCount >= 10) return 150;
        if (foodCount >= 5) return 165;
        return 180;
    }

    onStart() {
        this.startCountdown();
    }

    startCountdown() {
        this.uiState = STATES.COUNTDOWN;
        this.countdownNumber = 3;
        this.updateSoftKeys();
        this.render();
        this.audio.countBeep(false);

        if (this.countdownTimer) clearInterval(this.countdownTimer);
        this.countdownTimer = setInterval(() => {
            this.countdownNumber--;
            if (this.countdownNumber > 0) {
                this.audio.countBeep(false);
                this.render();
            } else if (this.countdownNumber === 0) {
                this.audio.countBeep(true);
                this.render();
            } else {
                clearInterval(this.countdownTimer);
                this.initNewSnakeGame();
            }
        }, 600);
    }

    initNewSnakeGame() {
        this.uiState = STATES.PLAYING;
        this.isRunning = true;
        this.isPaused = false;

        // Initial 3-segment snake moving RIGHT
        this.snake = [
            { x: 12, y: 9 },
            { x: 11, y: 9 },
            { x: 10, y: 9 }
        ];
        this.direction = 'RIGHT';
        this.nextDirection = 'RIGHT';
        this.score = 0;
        this.foodEaten = 0;
        this.speedInterval = this.getSpeedInterval(0);
        this.spawnFood();

        this.updateSoftKeys();
        this.lastTick = performance.now();
        if (this.loopId) cancelAnimationFrame(this.loopId);
        this.loopId = requestAnimationFrame((t) => this.gameLoop(t));
    }

    spawnFood() {
        let valid = false;
        let attempts = 0;
        while (!valid && attempts < 200) {
            attempts++;
            const fx = Math.floor(Math.random() * (GRID_WIDTH - 2)) + 1;
            const fy = Math.floor(Math.random() * (GRID_HEIGHT - 2)) + 1;
            const onSnake = this.snake.some(seg => seg.x === fx && seg.y === fy);
            if (!onSnake) {
                this.food = { x: fx, y: fy };
                valid = true;
            }
        }
    }

    bindEvents() {
        // Desktop Keyboard Controls
        window.addEventListener("keydown", (e) => {
            const key = e.key;
            const code = e.code;

            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "Enter", "Escape", "Backspace"].includes(code)) {
                e.preventDefault();
            }

            // Animate on-screen button press
            this.triggerKeyVisual(code);

            // Audio & Direction Handler
            if (this.uiState === STATES.PLAYING) {
                if ((code === "ArrowUp" || key === "2" || code === "KeyW") && this.direction !== "DOWN") {
                    this.nextDirection = "UP";
                } else if ((code === "ArrowDown" || key === "8" || code === "KeyS") && this.direction !== "UP") {
                    this.nextDirection = "DOWN";
                } else if ((code === "ArrowLeft" || key === "4" || code === "KeyA") && this.direction !== "RIGHT") {
                    this.nextDirection = "LEFT";
                } else if ((code === "ArrowRight" || key === "6" || code === "KeyD") && this.direction !== "LEFT") {
                    this.nextDirection = "RIGHT";
                } else if (code === "Space" || code === "Enter" || code === "Escape" || key === "5") {
                    this.pauseGame();
                }
                return;
            }

            // Menu Navigation for PAUSED and other UI States
            if (code === "ArrowUp" || key === "2" || code === "KeyW") {
                this.handleMenuNav(-1);
            } else if (code === "ArrowDown" || key === "8" || code === "KeyS") {
                this.handleMenuNav(1);
            } else if (code === "Enter" || code === "Space" || key === "5") {
                this.handleMenuSelect();
            } else if (code === "Escape" || code === "Backspace") {
                this.handleMenuBack();
            }
        });

        // Keypad Button Clicks
        const bindBtn = (id, action) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                action();
            });
        };

        // D-Pad
        bindBtn("btnNavUp", () => this.handleDirectionInput("UP"));
        bindBtn("btnNavDown", () => this.handleDirectionInput("DOWN"));
        bindBtn("btnNavLeft", () => this.handleDirectionInput("LEFT"));
        bindBtn("btnNavRight", () => this.handleDirectionInput("RIGHT"));
        bindBtn("btnNavCenter", () => {
            if (this.uiState === STATES.PLAYING) {
                this.pauseGame();
            } else {
                this.handleMenuSelect();
            }
        });

        // Soft Keys
        bindBtn("btnSoftLeft", () => {
            if (this.uiState === STATES.PLAYING) {
                this.pauseGame();
            } else {
                this.handleMenuSelect();
            }
        });
        bindBtn("btnSoftRight", () => this.handleMenuBack());
        bindBtn("btnCall", () => {
            if (this.uiState === STATES.PLAYING) {
                this.pauseGame();
            } else {
                this.handleMenuSelect();
            }
        });
        bindBtn("btnEnd", () => this.handleMenuBack());

        // Numeric Keypad
        for (let i = 0; i <= 9; i++) {
            bindBtn(`key${i}`, () => this.handleNumKey(i.toString()));
        }
        bindBtn("keyStar", () => this.handleNumKey("*"));
        bindBtn("keyHash", () => this.handleNumKey("#"));

        // Header Buttons
        document.getElementById("startBtn")?.addEventListener("click", () => this.startCountdown());
        document.getElementById("restartBtn")?.addEventListener("click", () => this.resetPhone());
        document.getElementById("sidebarPlayBtn")?.addEventListener("click", () => this.startCountdown());
        document.getElementById("sidebarHighScoresBtn")?.addEventListener("click", () => {
            this.uiState = STATES.HIGH_SCORES;
            this.updateSoftKeys();
            this.render();
        });

        document.getElementById("soundToggleBtn")?.addEventListener("click", () => {
            const isMuted = this.audio.toggleMute();
            if (this.soundStatusText) this.soundStatusText.textContent = isMuted ? "OFF" : "ON";
        });
    }

    triggerKeyVisual(code) {
        let btnId = null;
        if (code === "ArrowUp" || code === "KeyW") btnId = "btnNavUp";
        if (code === "ArrowDown" || code === "KeyS") btnId = "btnNavDown";
        if (code === "ArrowLeft" || code === "KeyA") btnId = "btnNavLeft";
        if (code === "ArrowRight" || code === "KeyD") btnId = "btnNavRight";
        if (code === "Enter" || code === "Space") btnId = "btnNavCenter";
        if (code === "Escape" || code === "Backspace") btnId = "btnSoftRight";
        if (code === "Digit2" || code === "Numpad2") btnId = "key2";
        if (code === "Digit4" || code === "Numpad4") btnId = "key4";
        if (code === "Digit6" || code === "Numpad6") btnId = "key6";
        if (code === "Digit8" || code === "Numpad8") btnId = "key8";
        if (code === "Digit5" || code === "Numpad5") btnId = "key5";

        if (btnId) {
            const el = document.getElementById(btnId);
            if (el) {
                el.classList.add("pressed");
                setTimeout(() => el.classList.remove("pressed"), 120);
            }
        }
    }

    handleDirectionInput(dir) {
        if (this.uiState === STATES.PLAYING) {
            if (dir === "UP" && this.direction !== "DOWN") this.nextDirection = "UP";
            if (dir === "DOWN" && this.direction !== "UP") this.nextDirection = "DOWN";
            if (dir === "LEFT" && this.direction !== "RIGHT") this.nextDirection = "LEFT";
            if (dir === "RIGHT" && this.direction !== "LEFT") this.nextDirection = "RIGHT";
        } else if (this.uiState === STATES.PAUSED) {
            if (dir === "UP") this.handleMenuNav(-1);
            if (dir === "DOWN") this.handleMenuNav(1);
            // Ignore LEFT and RIGHT while paused to keep snake completely frozen
        } else {
            if (dir === "UP") this.handleMenuNav(-1);
            if (dir === "DOWN") this.handleMenuNav(1);
            if (dir === "RIGHT") this.handleMenuSelect();
            if (dir === "LEFT") this.handleMenuBack();
        }
    }

    handleNumKey(num) {
        if (this.uiState === STATES.PLAYING) {
            if (num === "2" && this.direction !== "DOWN") this.nextDirection = "UP";
            if (num === "8" && this.direction !== "UP") this.nextDirection = "DOWN";
            if (num === "4" && this.direction !== "RIGHT") this.nextDirection = "LEFT";
            if (num === "6" && this.direction !== "LEFT") this.nextDirection = "RIGHT";
            if (num === "5") this.pauseGame();
        } else if (this.uiState === STATES.PAUSED) {
            if (num === "2") this.handleMenuNav(-1);
            if (num === "8") this.handleMenuNav(1);
            if (num === "5") this.handleMenuSelect();
            const itemIdx = parseInt(num) - 1;
            if (itemIdx >= 0 && itemIdx <= 2) {
                this.menuCursor = itemIdx;
                this.handleMenuSelect();
            }
        } else {
            if (num === "2") this.handleMenuNav(-1);
            if (num === "8") this.handleMenuNav(1);
            if (num === "5") this.handleMenuSelect();
            const itemIdx = parseInt(num) - 1;
            if (!isNaN(itemIdx) && itemIdx >= 0) {
                this.menuCursor = itemIdx;
                this.handleMenuSelect();
            }
        }
    }

    handleMenuNav(delta) {
        this.audio.menuBeep();
        const menuLen = this.getMenuLength();
        if (menuLen > 0) {
            this.menuCursor = (this.menuCursor + delta + menuLen) % menuLen;
            this.render();
        }
    }

    getMenuLength() {
        if (this.uiState === STATES.HOME) return 1;
        if (this.uiState === STATES.MAIN_MENU) return 4;
        if (this.uiState === STATES.GAMES_MENU) return 3;
        if (this.uiState === STATES.SNAKE_MENU) return 4;
        if (this.uiState === STATES.PAUSED) return 3;
        if (this.uiState === STATES.GAME_OVER) return 2;
        if (this.uiState === STATES.SETTINGS) return 3;
        return 1;
    }

    handleMenuSelect() {
        this.audio.selectBeep();

        if (this.uiState === STATES.HOME) {
            this.uiState = STATES.MAIN_MENU;
            this.menuCursor = 0;
        } else if (this.uiState === STATES.MAIN_MENU) {
            if (this.menuCursor === 0) { // Games
                this.uiState = STATES.GAMES_MENU;
                this.menuCursor = 0;
            } else if (this.menuCursor === 3) { // Settings
                this.uiState = STATES.SETTINGS;
                this.menuCursor = 0;
            }
        } else if (this.uiState === STATES.GAMES_MENU) {
            if (this.menuCursor === 0) { // Snake
                this.uiState = STATES.SNAKE_MENU;
                this.menuCursor = 0;
            }
        } else if (this.uiState === STATES.SNAKE_MENU) {
            if (this.menuCursor === 0 || this.menuCursor === 1) { // Play / New Game
                this.startCountdown();
            } else if (this.menuCursor === 2) { // High Scores
                this.uiState = STATES.HIGH_SCORES;
            } else if (this.menuCursor === 3) { // Settings
                this.uiState = STATES.SETTINGS;
                this.menuCursor = 0;
            }
        } else if (this.uiState === STATES.PAUSED) {
            if (this.menuCursor === 0) { // CONTINUE
                this.resumeGame();
                return;
            } else if (this.menuCursor === 1) { // NEW GAME
                this.startCountdown();
                return;
            } else if (this.menuCursor === 2) { // EXIT
                this.exitToSnakeMenu();
                return;
            }
        } else if (this.uiState === STATES.GAME_OVER) {
            if (this.menuCursor === 0) {
                this.startCountdown();
            } else {
                this.uiState = STATES.SNAKE_MENU;
                this.menuCursor = 0;
            }
        } else if (this.uiState === STATES.HIGH_SCORES) {
            this.uiState = STATES.SNAKE_MENU;
            this.menuCursor = 0;
        } else if (this.uiState === STATES.SETTINGS) {
            if (this.menuCursor === 0) {
                this.audio.toggleMute();
            } else if (this.menuCursor === 2) {
                localStorage.removeItem('luckykit_snake_highscores');
                this.highScores = [520, 410, 280, 190, 120];
                this.highScore = 520;
                this.updateSidebarScore();
            }
        }

        this.updateSoftKeys();
        this.render();
    }

    handleMenuBack() {
        this.audio.buttonBeep();

        if (this.uiState === STATES.PLAYING) {
            this.pauseGame();
            return;
        }

        if (this.uiState === STATES.PAUSED) {
            this.exitToSnakeMenu();
            return;
        }

        if (this.uiState === STATES.GAME_OVER || this.uiState === STATES.HIGH_SCORES) {
            this.uiState = STATES.SNAKE_MENU;
            this.menuCursor = 0;
        } else if (this.uiState === STATES.SNAKE_MENU) {
            this.uiState = STATES.GAMES_MENU;
            this.menuCursor = 0;
        } else if (this.uiState === STATES.GAMES_MENU || this.uiState === STATES.SETTINGS) {
            this.uiState = STATES.MAIN_MENU;
            this.menuCursor = 0;
        } else if (this.uiState === STATES.MAIN_MENU) {
            this.uiState = STATES.HOME;
            this.menuCursor = 0;
        }

        this.updateSoftKeys();
        this.render();
    }

    pauseGame() {
        if (this.uiState !== STATES.PLAYING) return;
        this.uiState = STATES.PAUSED;
        this.isPaused = true;
        this.menuCursor = 0; // Point to > CONTINUE
        if (this.loopId) {
            cancelAnimationFrame(this.loopId);
            this.loopId = null;
        }
        // Discard any pending directional turn
        this.nextDirection = this.direction;
        this.audio.selectBeep();
        this.updateSoftKeys();
        this.render();
    }

    resumeGame() {
        if (this.uiState !== STATES.PAUSED) return;
        this.uiState = STATES.PLAYING;
        this.isPaused = false;
        this.lastTick = performance.now();
        this.nextDirection = this.direction;
        this.audio.selectBeep();
        this.updateSoftKeys();
        if (this.loopId) cancelAnimationFrame(this.loopId);
        this.loopId = requestAnimationFrame((t) => this.gameLoop(t));
    }

    exitToSnakeMenu() {
        this.uiState = STATES.SNAKE_MENU;
        this.isRunning = false;
        this.isPaused = false;
        this.menuCursor = 0;
        if (this.loopId) {
            cancelAnimationFrame(this.loopId);
            this.loopId = null;
        }
        this.updateSoftKeys();
        this.render();
    }

    resetPhone() {
        this.uiState = STATES.HOME;
        this.isRunning = false;
        this.isPaused = false;
        this.menuCursor = 0;
        if (this.loopId) {
            cancelAnimationFrame(this.loopId);
            this.loopId = null;
        }
        this.updateSoftKeys();
        this.render();
    }

    updateSoftKeys() {
        if (!this.lcdSoftLeft || !this.lcdSoftRight) return;

        if (this.uiState === STATES.HOME) {
            this.lcdSoftLeft.textContent = "Menu";
            this.lcdSoftRight.textContent = "Names";
        } else if (this.uiState === STATES.PLAYING) {
            this.lcdSoftLeft.textContent = "Pause";
            this.lcdSoftRight.textContent = "Exit";
        } else if (this.uiState === STATES.COUNTDOWN) {
            this.lcdSoftLeft.textContent = "";
            this.lcdSoftRight.textContent = "";
        } else {
            this.lcdSoftLeft.textContent = "Select";
            this.lcdSoftRight.textContent = "Back";
        }
    }

    // ========================================================
    // SNAKE GAME TICK LOOP
    // ========================================================
    gameLoop(time) {
        if (this.uiState === STATES.PLAYING && this.isRunning && !this.isPaused) {
            const dt = time - this.lastTick;
            if (dt >= this.speedInterval) {
                this.lastTick = time;
                this.updateSnake();
            }
        }

        this.render();

        if (this.uiState === STATES.PLAYING || this.uiState === STATES.COUNTDOWN) {
            this.loopId = requestAnimationFrame((t) => this.gameLoop(t));
        }
    }

    updateSnake() {
        this.direction = this.nextDirection;
        const head = { ...this.snake[0] };

        if (this.direction === 'UP') head.y--;
        if (this.direction === 'DOWN') head.y++;
        if (this.direction === 'LEFT') head.x--;
        if (this.direction === 'RIGHT') head.x++;

        // 1. Hard Wall Collision Check (1..GRID_WIDTH-2, 1..GRID_HEIGHT-2)
        if (head.x <= 0 || head.x >= GRID_WIDTH - 1 || head.y <= 0 || head.y >= GRID_HEIGHT - 1) {
            this.handleGameOver();
            return;
        }

        // 2. Self Collision Check
        for (let i = 0; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                this.handleGameOver();
                return;
            }
        }

        // 3. Move Snake
        this.snake.unshift(head);

        // 4. Check Food Eaten
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.foodEaten++;
            this.speedInterval = this.getSpeedInterval(this.foodEaten);
            this.audio.eatBeep();
            this.spawnFood();

            // Check high score
            if (this.score > this.highScore) {
                this.highScore = this.score;
                this.saveNewHighScore(this.score);
            }
        } else {
            // Remove tail segment if food not eaten
            this.snake.pop();
        }
    }

    handleGameOver() {
        this.uiState = STATES.GAME_OVER;
        this.isRunning = false;
        this.menuCursor = 0;
        this.audio.gameOverBeep();

        this.saveNewHighScore(this.score);
        this.updateSoftKeys();
        this.render();

        // Award Coins in LuckyKit storage
        const coinsEarned = Math.floor(this.score / 2);
        storage.updateState(s => {
            s.coins += coinsEarned;
            s.xp += this.score;
        });
    }

    saveNewHighScore(val) {
        if (!this.highScores.includes(val)) {
            this.highScores.push(val);
            this.highScores.sort((a, b) => b - a);
            this.highScores = this.highScores.slice(0, 5);
            localStorage.setItem('luckykit_snake_highscores', JSON.stringify(this.highScores));
            this.highScore = this.highScores[0];
            this.updateSidebarScore();
        }
    }

    // ========================================================
    // MONOCHROME 2D CANVAS RENDERER
    // ========================================================
    render() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Clear LCD background
        ctx.fillStyle = '#9ea786';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#1d2b1f';

        if (this.uiState === STATES.HOME) {
            this.renderHomeScreen(ctx, w, h);
        } else if (this.uiState === STATES.MAIN_MENU) {
            this.renderMenu(ctx, w, h, "MENU", ["1 Games", "2 Messages", "3 Contacts", "4 Settings"]);
        } else if (this.uiState === STATES.GAMES_MENU) {
            this.renderMenu(ctx, w, h, "GAMES", ["1 Snake", "2 Space Impact", "3 Pairs II"]);
        } else if (this.uiState === STATES.SNAKE_MENU) {
            this.renderMenu(ctx, w, h, "SNAKE", ["1 Play", "2 New Game", "3 High Scores", "4 Settings"]);
        } else if (this.uiState === STATES.COUNTDOWN) {
            this.renderCountdown(ctx, w, h);
        } else if (this.uiState === STATES.PLAYING || this.uiState === STATES.PAUSED) {
            this.renderSnakeBoard(ctx, w, h);
            if (this.uiState === STATES.PAUSED) {
                this.renderPauseOverlay(ctx, w, h);
            }
        } else if (this.uiState === STATES.GAME_OVER) {
            this.renderGameOverScreen(ctx, w, h);
        } else if (this.uiState === STATES.HIGH_SCORES) {
            this.renderHighScores(ctx, w, h);
        } else if (this.uiState === STATES.SETTINGS) {
            const soundTxt = this.audio.muted ? "Sound: OFF" : "Sound: ON";
            this.renderMenu(ctx, w, h, "SETTINGS", [soundTxt, "Vibration: ON", "Reset High Scores"]);
        }
    }

    renderHomeScreen(ctx, w, h) {
        ctx.font = "bold 28px VT323, monospace";
        ctx.textAlign = "center";
        ctx.fillText("NOKIA", w / 2, 45);

        ctx.font = "18px VT323, monospace";
        ctx.fillText("LUCKYKIT NETWORK", w / 2, 75);

        // Little antenna icon
        ctx.fillRect(w / 2 - 15, 95, 30, 2);
        ctx.fillRect(w / 2 - 1, 90, 2, 12);
    }

    renderMenu(ctx, w, h, title, items) {
        ctx.font = "bold 20px VT323, monospace";
        ctx.textAlign = "left";
        ctx.fillText(title, 14, 22);

        // Divider line
        ctx.fillRect(10, 26, w - 20, 1);

        ctx.font = "18px VT323, monospace";
        items.forEach((item, idx) => {
            const y = 50 + (idx * 22);
            if (idx === this.menuCursor) {
                // Inverted highlighted cursor row
                ctx.fillRect(10, y - 14, w - 20, 18);
                ctx.fillStyle = '#9ea786';
                ctx.fillText(`> ${item}`, 14, y);
                ctx.fillStyle = '#1d2b1f';
            } else {
                ctx.fillText(`  ${item}`, 14, y);
            }
        });
    }

    renderCountdown(ctx, w, h) {
        ctx.font = "bold 22px VT323, monospace";
        ctx.textAlign = "center";
        ctx.fillText("SNAKE", w / 2, 40);

        ctx.font = "bold 44px VT323, monospace";
        const txt = this.countdownNumber > 0 ? this.countdownNumber.toString() : "START!";
        ctx.fillText(txt, w / 2, 95);
    }

    renderSnakeBoard(ctx, w, h) {
        // Draw Outer Hard Border
        ctx.fillRect(0, 0, w, CELL_SIZE);
        ctx.fillRect(0, h - CELL_SIZE, w, CELL_SIZE);
        ctx.fillRect(0, 0, CELL_SIZE, h);
        ctx.fillRect(w - CELL_SIZE, 0, CELL_SIZE, h);

        // Draw Score at Top Left inside screen
        ctx.font = "16px VT323, monospace";
        ctx.textAlign = "left";
        ctx.fillText(`SCORE:${this.score}`, 10, CELL_SIZE + 14);

        // Draw Food (Pixel Apple with stem)
        const fx = this.food.x * CELL_SIZE;
        const fy = this.food.y * CELL_SIZE;
        ctx.fillRect(fx + 1, fy + 2, CELL_SIZE - 2, CELL_SIZE - 3);
        ctx.fillRect(fx + 3, fy, 2, 2); // Apple stem

        // Draw Snake Segments
        this.snake.forEach((seg, idx) => {
            const sx = seg.x * CELL_SIZE;
            const sy = seg.y * CELL_SIZE;

            if (idx === 0) {
                // Head: Solid block
                ctx.fillRect(sx, sy, CELL_SIZE, CELL_SIZE);
            } else {
                // Body: Checker-pattern block for authentic Nokia look
                ctx.fillRect(sx + 1, sy + 1, CELL_SIZE - 2, CELL_SIZE - 2);
            }
        });
    }

    renderPauseOverlay(ctx, w, h) {
        // Pixelated LCD Pause Box
        ctx.fillStyle = '#9ea786';
        ctx.fillRect(35, 20, w - 70, 104);
        ctx.strokeStyle = '#1d2b1f';
        ctx.lineWidth = 2;
        ctx.strokeRect(35, 20, w - 70, 104);

        ctx.fillStyle = '#1d2b1f';
        ctx.font = "bold 22px VT323, monospace";
        ctx.textAlign = "center";
        ctx.fillText("PAUSED", w / 2, 42);

        // Divider line
        ctx.fillRect(45, 48, w - 90, 1);

        const items = ["1. CONTINUE", "2. NEW GAME", "3. EXIT"];
        ctx.font = "18px VT323, monospace";
        items.forEach((item, idx) => {
            const y = 72 + (idx * 20);
            if (idx === this.menuCursor) {
                // Inverted highlighted cursor block
                ctx.fillRect(45, y - 14, w - 90, 18);
                ctx.fillStyle = '#9ea786';
                ctx.fillText(`> ${item}`, w / 2, y);
                ctx.fillStyle = '#1d2b1f';
            } else {
                ctx.fillText(`  ${item}`, w / 2, y);
            }
        });
    }

    renderGameOverScreen(ctx, w, h) {
        ctx.font = "bold 22px VT323, monospace";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", w / 2, 35);

        ctx.font = "18px VT323, monospace";
        ctx.fillText(`SCORE: ${this.score}`, w / 2, 60);
        ctx.fillText(`HIGH: ${this.highScore}`, w / 2, 80);

        // Options
        const items = ["1 New Game", "2 Menu"];
        items.forEach((item, idx) => {
            const y = 108 + (idx * 20);
            if (idx === this.menuCursor) {
                ctx.fillText(`> ${item} <`, w / 2, y);
            } else {
                ctx.fillText(item, w / 2, y);
            }
        });
    }

    renderHighScores(ctx, w, h) {
        ctx.font = "bold 20px VT323, monospace";
        ctx.textAlign = "center";
        ctx.fillText("HIGH SCORES", w / 2, 22);

        ctx.fillRect(10, 26, w - 20, 1);

        ctx.font = "16px VT323, monospace";
        this.highScores.forEach((hs, idx) => {
            const y = 46 + (idx * 18);
            ctx.textAlign = "left";
            ctx.fillText(`${idx + 1}. PLAYER`, 20, y);
            ctx.textAlign = "right";
            ctx.fillText(`${hs}`, w - 20, y);
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", () => {
        new NokiaSnakeGame();
    });
} else {
    new NokiaSnakeGame();
}