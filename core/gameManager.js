const GAME_INSTRUCTIONS = {
    "snake": {
        title: "Neon Serpent",
        objective: "Eat glowing food to grow your serpent and score points.",
        controls: "Swipe (Mobile) or Arrow Keys (Desktop)",
        win: "Get the highest score possible without crashing.",
        lose: "Crashing into walls or your own tail.",
        tips: "Plan your path ahead. Don't trap yourself!"
    },
    "ludo": {
        title: "Cosmic Race (Ludo)",
        objective: "Race your token from base to the center of the board.",
        controls: "Tap 'ROLL DICE', then tap your token.",
        win: "Reach the center before the AI.",
        lose: "AI reaches the center first.",
        tips: "Capture opponent tokens to earn bonus coins!"
    },
    "uno": {
        title: "Cosmic Cards (UNO)",
        objective: "Be the first player to empty your hand.",
        controls: "Tap a valid card to play it.",
        win: "Empty your hand.",
        lose: "AI empties their hand first.",
        tips: "Save Wild +4 cards for emergencies."
    },
    "sudoku": {
        title: "Logic Grid (Sudoku)",
        objective: "Fill the 9x9 grid so every row, column, and 3x3 box contains 1-9.",
        controls: "Tap an empty cell, then tap a number.",
        win: "Fill the entire board correctly.",
        lose: "Make 3 mistakes.",
        tips: "Start with the most filled boxes first."
    },
    "quadra": {
        title: "Quadra Link (Tetris)",
        objective: "Clear horizontal lines by perfectly fitting falling blocks.",
        controls: "Use on-screen D-Pad or Arrow Keys.",
        win: "Survive and get a high score.",
        lose: "Blocks stack to the top of the screen.",
        tips: "Look at the Ghost Piece to see exactly where the block will land."
    },
    "arena": {
        title: "Neon Arena",
        objective: "Survive against 9 AI bots in a shrinking safe zone.",
        controls: "Touch Joysticks (Mobile) or WASD + Mouse (Desktop)",
        win: "Be the last survivor.",
        lose: "Lose all your health.",
        tips: "Stay inside the safe zone and collect health packs!"
    },
    "escape": {
        title: "Escape from Monster",
        objective: "Outrun the giant shadow monster, jump over spikes, and slide under laser gates.",
        controls: "SPACE / UP (Jump, Double Jump), DOWN / S (Slide)",
        win: "Set a record escape distance and collect gold coins.",
        lose: "The monster catches up with you.",
        tips: "Use Double Jump over wide boulder pits and slide under high lasers!"
    }
};

export class GameManager {
    constructor() {
        this.activeGame = null;
        this.GAME_INSTRUCTIONS = GAME_INSTRUCTIONS;
        this.injectGlobalModal();
    }

    injectGlobalModal() {
        if (typeof document === 'undefined') return;
        
        const inject = () => {
            if (document.getElementById('globalInstructionsModal')) return;
            const modalHtml = `
            <div class="modal fade" id="globalInstructionsModal" tabindex="-1" data-bs-backdrop="static">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content text-white" style="background: rgba(15, 15, 25, 0.95); backdrop-filter: blur(15px); border: 1px solid var(--theme-color);">
                        <div class="modal-header border-secondary">
                            <h5 class="modal-title fw-bold text-theme" id="gimTitle">How to Play</h5>
                        </div>
                        <div class="modal-body">
                            <h6 class="text-white-50">Objective</h6>
                            <p id="gimObjective"></p>
                            
                            <h6 class="text-white-50">Controls</h6>
                            <p id="gimControls"></p>
                            
                            <div class="row mb-3">
                                <div class="col-6">
                                    <h6 class="text-white-50">Win</h6>
                                    <p class="text-success small" id="gimWin"></p>
                                </div>
                                <div class="col-6">
                                    <h6 class="text-white-50">Lose</h6>
                                    <p class="text-danger small" id="gimLose"></p>
                                </div>
                            </div>
                            
                            <div class="p-3 rounded" style="background: rgba(255,255,255,0.05);">
                                <strong>💡 Tip:</strong> <span id="gimTips"></span>
                            </div>
                        </div>
                        <div class="modal-footer border-secondary">
                            <div class="form-check me-auto">
                                <input class="form-check-input" type="checkbox" id="gimDontShow">
                                <label class="form-check-label small text-white-50" for="gimDontShow">
                                    Don't show again
                                </label>
                            </div>
                            <button type="button" class="btn btn-theme px-4 fw-bold" id="gimStartBtn">PLAY NOW</button>
                        </div>
                    </div>
                </div>
            </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        };
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', inject);
        } else {
            inject();
        }
    }

    showInstructions(gameId, onStartCallback) {
        const hideFlag = localStorage.getItem(`hide_instructions_${gameId}`);
        if (hideFlag === 'true') {
            onStartCallback();
            return;
        }

        const data = this.GAME_INSTRUCTIONS[gameId] || {
            title: "Game", objective: "Have fun!", controls: "Tap/Click", win: "Win", lose: "Lose", tips: "Good luck!"
        };

        document.getElementById('gimTitle').textContent = `How to Play: ${data.title}`;
        document.getElementById('gimObjective').textContent = data.objective;
        document.getElementById('gimControls').textContent = data.controls;
        document.getElementById('gimWin').textContent = data.win;
        document.getElementById('gimLose').textContent = data.lose;
        document.getElementById('gimTips').textContent = data.tips;

        // Use Bootstrap Modal API if available
        let modalInstance;
        if (window.bootstrap) {
            modalInstance = new window.bootstrap.Modal(document.getElementById('globalInstructionsModal'));
            modalInstance.show();
        } else {
            document.getElementById('globalInstructionsModal').classList.add('show', 'd-block');
        }

        const startBtn = document.getElementById('gimStartBtn');
        const newStartBtn = startBtn.cloneNode(true);
        startBtn.parentNode.replaceChild(newStartBtn, startBtn);
        
        newStartBtn.addEventListener('click', () => {
            const dontShow = document.getElementById('gimDontShow').checked;
            if (dontShow) {
                localStorage.setItem(`hide_instructions_${gameId}`, 'true');
            }
            if (modalInstance) {
                modalInstance.hide();
            } else {
                document.getElementById('globalInstructionsModal').classList.remove('show', 'd-block');
            }
            onStartCallback();
        });
    }

    registerGame(gameInstance) {
        if (this.activeGame && this.activeGame !== gameInstance) {
            this.activeGame.destroy();
        }
        this.activeGame = gameInstance;
        return this.activeGame;
    }

    getActiveGame() { return this.activeGame; }
    startGame() { if (this.activeGame) this.activeGame.start(); }
    pauseGame() { if (this.activeGame) this.activeGame.pause(); }
    resumeGame() { if (this.activeGame) this.activeGame.resume(); }
    restartGame() { if (this.activeGame) this.activeGame.restart(); }
}

export const gameManager = new GameManager();

if (typeof window !== 'undefined') {
    window.GameManager = gameManager;
}
