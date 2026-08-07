import os
import re

games_info = {
    "tictactoe": "Players take turns placing X and O. The first to get 3 in a row wins!",
    "luck": "Choose Heads or Tails. If the coin lands on your choice, you win!",
    "rps": "Rock beats Scissors, Scissors beats Paper, Paper beats Rock.",
    "mem": "Flip two cards to find a matching pair. Match all pairs to win.",
    "snake": "Use arrow keys to move. Eat apples to grow. Don't hit the walls or yourself.",
    "truck": "Use Left/Right to steer. Hold Shift for Nitro. Avoid traffic and collect coins.",
    "whack": "Click the moles as they appear. Don't click the empty holes.",
    "fruit": "Slice the fruits by swiping. Avoid the bombs!",
    "box": "Click boxes to open them and win prizes. Avoid the hidden bombs.",
    "chess": "Checkmate your opponent's king. Standard chess rules apply.",
    "ml": "Watch the sequence of items, then repeat it back in the exact same order."
}

modal_template = """
    <!-- HOW TO PLAY MODAL -->
    <div class="modal fade" id="howToPlayModal" tabindex="-1" aria-hidden="true" style="z-index: 9999;">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content bg-dark text-white border-secondary" style="background: rgba(10, 10, 20, 0.95) !important; backdrop-filter: blur(15px); border-radius: 16px;">
                <div class="modal-header border-secondary">
                    <h5 class="modal-title fw-bold" style="color: #06b6d4;">📖 How to play</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <ol class="list-group list-group-numbered list-group-flush bg-transparent">
                        <li class="list-group-item bg-transparent text-white border-secondary">{rules}</li>
                        <li class="list-group-item bg-transparent text-white border-secondary">Score points to increase your Arcade Level.</li>
                        <li class="list-group-item bg-transparent text-white border-secondary">Enjoy the premium experience!</li>
                    </ol>
                </div>
                <div class="modal-footer border-secondary">
                    <button type="button" class="btn btn-outline-info w-100" data-bs-dismiss="modal">Understood! Let's Play</button>
                </div>
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
"""

button_html = '<button type="button" class="btn btn-outline-info btn-sm mt-2" data-bs-toggle="modal" data-bs-target="#howToPlayModal" style="box-shadow: 0 0 10px rgba(6,182,212,0.3);">📖 How To Play</button>'

for name, rules in games_info.items():
    html_file = f"{name}.html"
    if os.path.exists(html_file):
        with open(html_file, "r", encoding="utf-8") as f:
            content = f.read()
            
        # Inject modal before </body>
        if "id=\"howToPlayModal\"" not in content:
            content = content.replace("</body>", modal_template.format(rules=rules) + "\n</body>")
            
        # Inject button inside <header> or somewhere visible
        if "data-bs-target=\"#howToPlayModal\"" not in content:
            if "</header>" in content:
                content = content.replace("</header>", f"{button_html}\n</header>")
            elif "<div class=\"hud\">" in content:
                content = content.replace("<div class=\"hud\">", f"<div class=\"hud\">\n{button_html}")
            else:
                # Just append after body
                content = content.replace("<body>", f"<body>\n{button_html}")
                
        with open(html_file, "w", encoding="utf-8") as f:
            f.write(content)

print("Injected How-To-Play modals and buttons into existing games.")
