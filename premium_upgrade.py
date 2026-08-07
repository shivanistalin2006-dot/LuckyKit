import os

def append_to_file(filepath, content):
    with open(filepath, 'a', encoding='utf-8') as f:
        f.write("\n" + content + "\n")

# --- 1. OVERHAUL STYLE.CSS ---
style_premium = """
/* ========================================================
   AAA PREMIUM OVERRIDES
   ======================================================== */
.game-card {
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease, border-color 0.4s ease !important;
    backdrop-filter: blur(20px) !important;
    -webkit-backdrop-filter: blur(20px) !important;
    background: rgba(18, 14, 32, 0.75) !important;
}

.game-card:hover {
    transform: translateY(-12px) scale(1.02) !important;
    box-shadow: 0 25px 40px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.2) !important;
}

.game-card::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    border-radius: inherit;
    box-shadow: inset 0 0 20px rgba(255,255,255,0.02);
    pointer-events: none;
}

/* 3D TILT EFFECT SIMULATION via Transform */
.game-card-wrapper {
    perspective: 1000px;
}

/* Category Tabs */
.category-tabs .btn {
    border-radius: 30px !important;
    font-weight: 600;
    letter-spacing: 0.5px;
    padding: 8px 20px !important;
    transition: all 0.3s ease !important;
}
.category-tabs .btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.3);
}

/* Custom Search */
.custom-input-group input {
    background: rgba(0, 0, 0, 0.4) !important;
    border-radius: 30px !important;
    padding: 12px 25px !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
}
.custom-input-group input:focus {
    box-shadow: 0 0 20px rgba(6, 182, 212, 0.5) !important;
    border-color: #06b6d4 !important;
}
"""
append_to_file("style.css", style_premium)


# --- 2. OVERHAUL ARCADE-SHELL.CSS ---
shell_premium = """
/* ========================================================
   AAA SHELL OVERRIDES (FLOATING HEADER)
   ======================================================== */
.arcade-header-bar {
    top: 15px !important;
    left: 20px !important;
    width: calc(100% - 40px) !important;
    border-radius: 50px !important;
    background: rgba(10, 8, 20, 0.85) !important;
    backdrop-filter: blur(25px) !important;
    -webkit-backdrop-filter: blur(25px) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.05) !important;
}

body.arcade-premium-mode {
    padding-top: 110px !important; 
}

.arcade-profile-widget {
    background: rgba(0, 0, 0, 0.3) !important;
    border: 1px solid rgba(255, 255, 255, 0.05) !important;
    border-radius: 50px !important;
    box-shadow: inset 0 2px 10px rgba(0,0,0,0.5) !important;
}

.arcade-nav-btn {
    border-radius: 50px !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
    letter-spacing: 1px !important;
    padding: 8px 24px !important;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
}
.arcade-nav-btn:hover {
    transform: translateY(-2px) scale(1.05) !important;
}

/* Modals */
.arcade-modal-content {
    background: rgba(15, 12, 25, 0.95) !important;
    backdrop-filter: blur(30px) !important;
    border-radius: 30px !important;
    border: 1px solid var(--game-theme-color, rgba(255,255,255,0.1)) !important;
    box-shadow: 0 30px 60px rgba(0,0,0,0.8), 0 0 40px var(--game-theme-color, rgba(0,0,0,0.3)) !important;
}
"""
append_to_file("arcade-shell.css", shell_premium)


# --- 3. UPGRADE CORE GAMES (TicTacToe, Snake, Fruit Ninja) ---
game_premium = """
/* ========================================================
   GAMEPLAY AAA POLISH
   ======================================================== */
.container, .game-wrapper, .board-section, #gameArea {
    background: rgba(0, 0, 0, 0.3) !important;
    backdrop-filter: blur(20px) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 30px !important;
    box-shadow: 0 20px 50px rgba(0,0,0,0.6), inset 0 0 20px rgba(255,255,255,0.02) !important;
    padding: 20px !important;
}

button {
    border-radius: 16px !important;
    text-transform: uppercase;
    font-weight: 800 !important;
    letter-spacing: 1px;
    transition: all 0.3s ease !important;
}
button:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 10px 20px rgba(0,0,0,0.4) !important;
}
"""

core_games = ["tictactoe.css", "snake.css", "fruit.css", "truck.css", "checkers.css"]
for game in core_games:
    if os.path.exists(game):
        append_to_file(game, game_premium)

print("AAA Premium Design System Injected.")
