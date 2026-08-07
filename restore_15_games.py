games_html = """            <!-- ====== 15 AAA PLAYABLE GAMES ====== -->
            
            <!-- Original Core Games -->
            <div class="col-12 col-sm-6 col-lg-4 col-xl-3 game-card-wrapper" data-category="board">
                <div class="game-card card-cyan p-3 h-100 d-flex flex-column" onclick="openTicTacToe()">
                    <span class="badge bg-secondary mb-2 align-self-start">Board</span>
                    <div class="icon fs-1 mb-2">❌⭕</div>
                    <h4 class="fw-bold text-white">Grid Clash</h4>
                    <p class="text-white-50 small flex-grow-1">Advanced Tic Tac Toe against the AI.</p>
                    <button class="btn btn-outline-light w-100 mt-2">Play Now</button>
                </div>
            </div>

            <div class="col-12 col-sm-6 col-lg-4 col-xl-3 game-card-wrapper" data-category="luck">
                <div class="game-card card-gold p-3 h-100 d-flex flex-column" onclick="openLuckGame()">
                    <span class="badge bg-secondary mb-2 align-self-start">Luck</span>
                    <div class="icon fs-1 mb-2">🪙</div>
                    <h4 class="fw-bold text-white">Coin of Destiny</h4>
                    <p class="text-white-50 small flex-grow-1">Test your luck with a coin toss.</p>
                    <button class="btn btn-outline-light w-100 mt-2">Play Now</button>
                </div>
            </div>

            <div class="col-12 col-sm-6 col-lg-4 col-xl-3 game-card-wrapper" data-category="luck">
                <div class="game-card card-cyan p-3 h-100 d-flex flex-column" onclick="openRPS()">
                    <span class="badge bg-secondary mb-2 align-self-start">Luck</span>
                    <div class="icon fs-1 mb-2">✊✋✌️</div>
                    <h4 class="fw-bold text-white">RPS Protocol</h4>
                    <p class="text-white-50 small flex-grow-1">Classic Rock Paper Scissors showdown.</p>
                    <button class="btn btn-outline-light w-100 mt-2">Play Now</button>
                </div>
            </div>

            <div class="col-12 col-sm-6 col-lg-4 col-xl-3 game-card-wrapper" data-category="brain">
                <div class="game-card card-pink p-3 h-100 d-flex flex-column" onclick="openMemoryGame()">
                    <span class="badge bg-secondary mb-2 align-self-start">Brain</span>
                    <div class="icon fs-1 mb-2">🧠🎴</div>
                    <h4 class="fw-bold text-white">Synapse Match</h4>
                    <p class="text-white-50 small flex-grow-1">Flip and match cards quickly.</p>
                    <button class="btn btn-outline-light w-100 mt-2">Play Now</button>
                </div>
            </div>

            <div class="col-12 col-sm-6 col-lg-4 col-xl-3 game-card-wrapper" data-category="arcade">
                <div class="game-card card-green p-3 h-100 d-flex flex-column" onclick="openSnakeGame()">
                    <span class="badge bg-secondary mb-2 align-self-start">Arcade</span>
                    <div class="icon fs-1 mb-2">🐍🍎</div>
                    <h4 class="fw-bold text-white">Neon Serpent</h4>
                    <p class="text-white-50 small flex-grow-1">Grow your snake, don't crash.</p>
                    <button class="btn btn-outline-light w-100 mt-2">Play Now</button>
                </div>
            </div>

            <div class="col-12 col-sm-6 col-lg-4 col-xl-3 game-card-wrapper" data-category="arcade">
                <div class="game-card card-dark p-3 h-100 d-flex flex-column" onclick="openTruckGame()">
                    <span class="badge bg-secondary mb-2 align-self-start">Arcade</span>
                    <div class="icon fs-1 mb-2">🚚🛣️</div>
                    <h4 class="fw-bold text-white">Midnight Runner</h4>
                    <p class="text-white-50 small flex-grow-1">Avoid traffic and collect coins.</p>
                    <button class="btn btn-outline-light w-100 mt-2">Play Now</button>
                </div>
            </div>

            <div class="col-12 col-sm-6 col-lg-4 col-xl-3 game-card-wrapper" data-category="arcade">
                <div class="game-card card-yellow p-3 h-100 d-flex flex-column" onclick="openWhackGame()">
                    <span class="badge bg-secondary mb-2 align-self-start">Arcade</span>
                    <div class="icon fs-1 mb-2">🔨🐹</div>
                    <h4 class="fw-bold text-white">Mole Bash</h4>
                    <p class="text-white-50 small flex-grow-1">Hammer moles before they hide.</p>
                    <button class="btn btn-outline-light w-100 mt-2">Play Now</button>
                </div>
            </div>

            <div class="col-12 col-sm-6 col-lg-4 col-xl-3 game-card-wrapper" data-category="arcade">
                <div class="game-card card-red p-3 h-100 d-flex flex-column" onclick="openFruitGame()">
                    <span class="badge bg-secondary mb-2 align-self-start">Arcade</span>
                    <div class="icon fs-1 mb-2">🍉⚔️</div>
                    <h4 class="fw-bold text-white">Blade Master</h4>
                    <p class="text-white-50 small flex-grow-1">Slice fruits, avoid bombs.</p>
                    <button class="btn btn-outline-light w-100 mt-2">Play Now</button>
                </div>
            </div>

            <div class="col-12 col-sm-6 col-lg-4 col-xl-3 game-card-wrapper" data-category="luck">
                <div class="game-card card-purple-gold p-3 h-100 d-flex flex-column" onclick="openBoxGame()">
                    <span class="badge bg-secondary mb-2 align-self-start">Luck</span>
                    <div class="icon fs-1 mb-2">🎁💎</div>
                    <h4 class="fw-bold text-white">Mystery Vault</h4>
                    <p class="text-white-50 small flex-grow-1">Open boxes, avoid the bombs.</p>
                    <button class="btn btn-outline-light w-100 mt-2">Play Now</button>
                </div>
            </div>

            <div class="col-12 col-sm-6 col-lg-4 col-xl-3 game-card-wrapper" data-category="board">
                <div class="game-card card-slate p-3 h-100 d-flex flex-column" onclick="openChessGame()">
                    <span class="badge bg-secondary mb-2 align-self-start">Board</span>
                    <div class="icon fs-1 mb-2">♔♛</div>
                    <h4 class="fw-bold text-white">Grandmaster's Gambit</h4>
                    <p class="text-white-50 small flex-grow-1">Classic battle of strategy.</p>
                    <button class="btn btn-outline-light w-100 mt-2">Play Now</button>
                </div>
            </div>

            <div class="col-12 col-sm-6 col-lg-4 col-xl-3 game-card-wrapper" data-category="brain">
                <div class="game-card card-crimson p-3 h-100 d-flex flex-column" onclick="openMemoryLinkGame()">
                    <span class="badge bg-secondary mb-2 align-self-start">Brain</span>
                    <div class="icon fs-1 mb-2">🔗🧠</div>
                    <h4 class="fw-bold text-white">Mind Link</h4>
                    <p class="text-white-50 small flex-grow-1">Remember and repeat sequences.</p>
                    <button class="btn btn-outline-light w-100 mt-2">Play Now</button>
                </div>
            </div>

            <!-- 4 New Fully Working AAA Games -->
            <div class="col-12 col-sm-6 col-lg-4 col-xl-3 game-card-wrapper" data-category="board">
                <div class="game-card p-3 h-100 d-flex flex-column" style="background: rgba(255, 255, 255, 0.1); border: 1px solid #fff;" onclick="window.location.href='checkers.html'">
                    <span class="badge bg-secondary mb-2 align-self-start">Board</span>
                    <div class="icon fs-1 mb-2">♟️</div>
                    <h4 class="fw-bold text-white">Neo Draughts</h4>
                    <p class="text-white-50 small flex-grow-1">Jump and capture your opponent.</p>
                    <button class="btn btn-outline-light w-100 mt-2">Play Now</button>
                </div>
            </div>

            <div class="col-12 col-sm-6 col-lg-4 col-xl-3 game-card-wrapper" data-category="arcade">
                <div class="game-card p-3 h-100 d-flex flex-column" style="background: rgba(6, 182, 212, 0.2); border: 1px solid #06b6d4;" onclick="window.location.href='space.html'">
                    <span class="badge bg-secondary mb-2 align-self-start">Arcade</span>
                    <div class="icon fs-1 mb-2">🚀</div>
                    <h4 class="fw-bold text-white">Cosmic Strike</h4>
                    <p class="text-white-50 small flex-grow-1">Blast alien invaders from space.</p>
                    <button class="btn btn-outline-info w-100 mt-2">Play Now</button>
                </div>
            </div>

            <div class="col-12 col-sm-6 col-lg-4 col-xl-3 game-card-wrapper" data-category="arcade">
                <div class="game-card p-3 h-100 d-flex flex-column" style="background: rgba(14, 165, 233, 0.2); border: 1px solid #0ea5e9;" onclick="window.location.href='brick.html'">
                    <span class="badge bg-secondary mb-2 align-self-start">Arcade</span>
                    <div class="icon fs-1 mb-2">🧱</div>
                    <h4 class="fw-bold text-white">Neon Shatter</h4>
                    <p class="text-white-50 small flex-grow-1">Break the glowing bricks.</p>
                    <button class="btn btn-outline-primary w-100 mt-2">Play Now</button>
                </div>
            </div>

            <div class="col-12 col-sm-6 col-lg-4 col-xl-3 game-card-wrapper" data-category="brain">
                <div class="game-card p-3 h-100 d-flex flex-column" style="background: rgba(249, 115, 22, 0.2); border: 1px solid #f97316;" onclick="window.location.href='2048.html'">
                    <span class="badge bg-secondary mb-2 align-self-start">Brain</span>
                    <div class="icon fs-1 mb-2">🧩</div>
                    <h4 class="fw-bold text-white">Quantum Merge</h4>
                    <p class="text-white-50 small flex-grow-1">Merge tiles to reach 2048.</p>
                    <button class="btn btn-outline-warning w-100 mt-2">Play Now</button>
                </div>
            </div>"""

import re
with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

grid_pattern = r'(<section class="games row g-4" id="gamesGrid">).*?(</section>)'
updated_content = re.sub(grid_pattern, r'\1\n' + games_html + r'\n        \2', content, flags=re.DOTALL)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(updated_content)

print("index.html now cleanly contains all 15 playable games!")
