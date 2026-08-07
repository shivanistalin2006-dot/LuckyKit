import os
import json

games = {
    # BOARD GAMES
    "tictactoe": {"title": "Grid Clash", "theme": "cyan", "icon": "❌⭕", "category": "board"},
    "chess": {"title": "Grandmaster's Gambit", "theme": "slate", "icon": "♔♛", "category": "board"},
    "serpent": {"title": "Serpent's Ascent", "theme": "green", "icon": "🐍🪜", "category": "board"},
    "quadra": {"title": "Quadra Link", "theme": "red", "icon": "🔴🟡", "category": "board"},
    "checkers": {"title": "Neo Draughts", "theme": "light", "icon": "♟️", "category": "board"},
    "ludo": {"title": "Cosmic Race", "theme": "primary", "icon": "🎲", "category": "board"},

    # LUCK GAMES
    "luck": {"title": "Coin of Destiny", "theme": "gold", "icon": "🪙", "category": "luck"},
    "rps": {"title": "RPS Protocol", "theme": "teal", "icon": "✊✋✌️", "category": "luck"},
    "box": {"title": "Mystery Vault", "theme": "purple", "icon": "🎁💎", "category": "luck"},
    "wheel": {"title": "Fortune Vortex", "theme": "warning", "icon": "🎡", "category": "luck"},
    "slots": {"title": "Cyber Slots", "theme": "danger", "icon": "🎰", "category": "luck"},
    "cards": {"title": "Mystic Oracle", "theme": "info", "icon": "💳", "category": "luck"},
    "treasure": {"title": "Vault Recon", "theme": "warning", "icon": "💎", "category": "luck"},

    # ARCADE GAMES
    "snake": {"title": "Neon Serpent", "theme": "success", "icon": "🐍🍎", "category": "arcade"},
    "truck": {"title": "Midnight Runner", "theme": "dark", "icon": "🚚🛣️", "category": "arcade"},
    "whack": {"title": "Mole Bash", "theme": "warning", "icon": "🔨🐹", "category": "arcade"},
    "fruit": {"title": "Blade Master", "theme": "danger", "icon": "🍉⚔️", "category": "arcade"},
    "space": {"title": "Cosmic Strike", "theme": "info", "icon": "🚀", "category": "arcade"},
    "balloon": {"title": "Aero Burst", "theme": "danger", "icon": "🎈", "category": "arcade"},
    "brick": {"title": "Neon Shatter", "theme": "primary", "icon": "🧱", "category": "arcade"},
    "bubble": {"title": "Orb Cascade", "theme": "primary", "icon": "🫧", "category": "arcade"},

    # BRAIN GAMES
    "mem": {"title": "Synapse Match", "theme": "pink", "icon": "🧠🎴", "category": "brain"},
    "ml": {"title": "Mind Link", "theme": "crimson", "icon": "🔗🧠", "category": "brain"},
    "maze": {"title": "Labyrinth Core", "theme": "success", "icon": "🧭", "category": "brain"},
    "2048": {"title": "Quantum Merge", "theme": "warning", "icon": "🧩", "category": "brain"},
    "water": {"title": "Chroma Sort", "theme": "info", "icon": "💧", "category": "brain"},
    "hidden": {"title": "Shadow Seek", "theme": "secondary", "icon": "🔍", "category": "brain"},
}

colors = {
    "cyan": ("#06b6d4", "rgba(6,182,212,0.15)"),
    "slate": ("#9ca3af", "rgba(156,163,175,0.15)"),
    "green": ("#22c55e", "rgba(34,197,94,0.15)"),
    "success": ("#10b981", "rgba(16,185,129,0.15)"),
    "red": ("#ef4444", "rgba(239,68,68,0.15)"),
    "danger": ("#f43f5e", "rgba(244,63,94,0.15)"),
    "light": ("#f3f4f6", "rgba(243,244,246,0.15)"),
    "primary": ("#3b82f6", "rgba(59,130,246,0.15)"),
    "gold": ("#eab308", "rgba(234,179,8,0.15)"),
    "warning": ("#f59e0b", "rgba(245,158,11,0.15)"),
    "teal": ("#14b8a6", "rgba(20,184,166,0.15)"),
    "purple": ("#a855f7", "rgba(168,85,247,0.15)"),
    "info": ("#0ea5e9", "rgba(14,165,233,0.15)"),
    "dark": ("#fbbf24", "rgba(251,191,36,0.15)"), # Gold on black
    "pink": ("#ec4899", "rgba(236,72,153,0.15)"),
    "crimson": ("#be123c", "rgba(190,18,60,0.15)"),
    "secondary": ("#64748b", "rgba(100,116,139,0.15)"),
}

html_template = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LuckyKit - {title}</title>
    
    <!-- Bootstrap 5 for fast & perfect alignment -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="arcade-shell.css">
    <link rel="stylesheet" href="{name}.css">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    
    <script src="arcade-core.js" defer></script>
    <script src="arcade-sounds.js" defer></script>
    <script src="arcade-shell.js" defer></script>
    <script src="{name}.js" defer></script>
</head>
<body class="bg-dark text-white premium-bg-{name}">

    <!-- Unique Dynamic Background injected via CSS -->
    <div class="bg-overlay"></div>
    <div class="particle-container" id="particles"></div>

    <div class="container py-4 position-relative" style="z-index: 10;">
        
        <!-- Header -->
        <header class="d-flex justify-content-between align-items-center mb-4 p-3 rounded glass-panel">
            <div class="d-flex align-items-center gap-3">
                <span class="fs-1">{icon}</span>
                <div>
                    <h1 class="m-0 fw-bold text-theme">{title}</h1>
                    <span class="text-white-50">Premium Edition</span>
                </div>
            </div>
            <div>
                <button class="btn btn-outline-light me-2" data-bs-toggle="modal" data-bs-target="#howToPlayModal">📖 How To Play</button>
                <a href="index.html" class="btn btn-theme">🏠 Home</a>
            </div>
        </header>

        <!-- Game Interface -->
        <div class="row g-4 justify-content-center">
            
            <!-- Game Canvas / Play Area -->
            <div class="col-12 col-lg-8">
                <div class="glass-panel p-4 rounded text-center min-vh-50 d-flex flex-column align-items-center justify-content-center" id="gameArea">
                    <h2 class="mb-4">System Initializing...</h2>
                    <button class="btn btn-lg btn-theme px-5 py-3 fw-bold fs-4 shadow-lg pulse-btn" id="startBtn">START GAME</button>
                </div>
            </div>

            <!-- Stats & Controls Sidebar -->
            <div class="col-12 col-lg-4">
                <div class="glass-panel p-4 rounded h-100 d-flex flex-column gap-3">
                    <h4 class="text-theme border-bottom border-secondary pb-2">Mission Stats</h4>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="text-white-50">Score</span>
                        <h3 class="m-0 fw-bold" id="scoreDisplay">0</h3>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="text-white-50">Level</span>
                        <h3 class="m-0 fw-bold" id="levelDisplay">1</h3>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="text-white-50">High Score</span>
                        <h3 class="m-0 fw-bold text-theme" id="highScoreDisplay">0</h3>
                    </div>
                    
                    <div class="mt-auto pt-3 border-top border-secondary text-center">
                        <p class="small text-white-50 mb-0">Powered by LuckyKit Core Engine</p>
                    </div>
                </div>
            </div>
        </div>

    </div>

    <!-- HOW TO PLAY MODAL -->
    <div class="modal fade" id="howToPlayModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content bg-dark text-white border-secondary glass-panel">
                <div class="modal-header border-secondary">
                    <h5 class="modal-title text-theme fw-bold">📖 How to play: {title}</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" id="howToPlayBody">
                    <!-- Loaded via JS -->
                </div>
                <div class="modal-footer border-secondary">
                    <button type="button" class="btn btn-theme w-100" data-bs-dismiss="modal">Understood! Let's Play</button>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
"""

css_template = """/* {title} Premium Theme */
:root {{
    --theme-color: {hex};
    --theme-glow: {rgba};
}}

.text-theme {{ color: var(--theme-color) !important; text-shadow: 0 0 10px var(--theme-glow); }}
.bg-theme {{ background-color: var(--theme-color) !important; }}
.btn-theme {{
    background: linear-gradient(135deg, var(--theme-color), rgba(255,255,255,0.2));
    border: 1px solid var(--theme-color);
    color: #fff;
    box-shadow: 0 4px 15px var(--theme-glow);
    transition: all 0.3s;
}}
.btn-theme:hover {{
    transform: translateY(-2px);
    box-shadow: 0 6px 20px var(--theme-color);
    color: #fff;
    border-color: #fff;
}}

.glass-panel {{
    background: rgba(10, 10, 20, 0.7);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(255,255,255,0.1);
    box-shadow: 0 8px 32px rgba(0,0,0,0.5), inset 0 0 20px var(--theme-glow);
}}

/* Dynamic Unique Background */
.premium-bg-{name} {{
    background-color: #050505;
    position: relative;
}}

.bg-overlay {{
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: radial-gradient(circle at center, var(--theme-glow) 0%, transparent 60%);
    z-index: 0;
    pointer-events: none;
    animation: pulseBg 8s infinite alternate ease-in-out;
}}

@keyframes pulseBg {{
    0% {{ transform: scale(1); opacity: 0.5; }}
    100% {{ transform: scale(1.2); opacity: 0.8; }}
}}

.pulse-btn {{
    animation: btnPulse 2s infinite;
}}

@keyframes btnPulse {{
    0% {{ box-shadow: 0 0 0 0 var(--theme-color); }}
    70% {{ box-shadow: 0 0 0 15px transparent; }}
    100% {{ box-shadow: 0 0 0 0 transparent; }}
}}

/* Specific Game Elements */
#gameArea {{
    position: relative;
    overflow: hidden;
}}
"""

js_template = """// {title} - Logic Core

document.addEventListener("DOMContentLoaded", () => {{
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
    if(particles) {{
        for(let i=0; i<30; i++) {{
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
            p.style.animation = `pulseBg ${{3 + Math.random()*5}}s infinite alternate`;
            particles.appendChild(p);
        }}
    }}

    if(startBtn) {{
        startBtn.addEventListener("click", () => {{
            if(window.ArcadeSounds) window.ArcadeSounds.playSelect();
            gameArea.innerHTML = `<h2 class='text-theme fw-bold mb-4'>Game In Progress...</h2>
                                  <p class='text-white-50'>Simulated gameplay mechanic for {title}</p>
                                  <button class='btn btn-lg btn-outline-light mt-4' id='scoreBtn'>+100 Points</button>`;
            
            document.getElementById("scoreBtn").addEventListener("click", () => {{
                if(window.ArcadeSounds) window.ArcadeSounds.playTone(600, "square", 0.1);
                const currentScore = parseInt(scoreDisplay.innerText);
                scoreDisplay.innerText = currentScore + 100;
                
                // Add XP globally
                if(window.ArcadeCore) window.ArcadeCore.addXP(10);
            }});
        }});
    }}
}});
"""

def generate():
    existing_games = ["tictactoe", "luck", "rps", "mem", "snake", "truck", "whack", "fruit", "box", "chess", "ml"]
    for name, data in games.items():
        if name in existing_games:
            continue # Skip existing games to avoid destroying their HTML/logic

        title = data["title"]
        theme = data["theme"]
        icon = data["icon"]
        hex_code, rgba_code = colors[theme]
        
        with open(f"{name}.html", "w", encoding="utf-8") as f:
            f.write(html_template.format(name=name, title=title, icon=icon))
            
        with open(f"{name}.css", "w", encoding="utf-8") as f:
            f.write(css_template.format(name=name, title=title, hex=hex_code, rgba=rgba_code))
            
        with open(f"{name}.js", "w", encoding="utf-8") as f:
            f.write(js_template.format(name=name, title=title))

if __name__ == "__main__":
    generate()
    print("Bulk generation completed successfully!")
