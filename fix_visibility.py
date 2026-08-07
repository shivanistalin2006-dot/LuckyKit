import os

fix_css = """
/* ========================================================
   GLOBAL TEXT VISIBILITY FIX
   ======================================================== */
button, .btn {
    color: #ffffff !important;
    text-shadow: 0 1px 3px rgba(0,0,0,0.8) !important;
}

label, p, span, h1, h2, h3, h4, h5, h6 {
    color: #f3f4f6; /* Force high visibility */
}
"""

core_games = ["tictactoe.css", "snake.css", "fruit.css", "truck.css", "checkers.css", "style.css", "arcade-shell.css"]
for game in core_games:
    if os.path.exists(game):
        with open(game, 'a', encoding='utf-8') as f:
            f.write("\n" + fix_css + "\n")

print("Visibility fixed.")
