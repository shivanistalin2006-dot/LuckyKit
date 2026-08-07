import os
import re

games = ["tictactoe", "luck", "rps", "mem", "snake", "truck", "whack", "fruit", "box", "chess", "ml",
         "serpent", "quadra", "checkers", "ludo", "wheel", "slots", "cards", "treasure", 
         "space", "balloon", "brick", "bubble", "maze", "2048", "water", "hidden"]

for name in games:
    html_file = f"{name}.html"
    if os.path.exists(html_file):
        with open(html_file, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Remove the button injected by inject_how_to_play.py
        content = re.sub(r'<button type="button" class="btn btn-outline-info btn-sm mt-2" data-bs-toggle="modal" data-bs-target="#howToPlayModal".*?📖 How To Play</button>', '', content)
        
        # Remove the button from build_premium.py (16 new games)
        content = re.sub(r'<button class="btn btn-outline-light me-2" data-bs-toggle="modal" data-bs-target="#howToPlayModal">📖 How To Play</button>', '', content)

        # Remove the modal block
        # For the 11 games (it ends with <script src="...">)
        content = re.sub(r'<!-- HOW TO PLAY MODAL -->.*?<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>', '', content, flags=re.DOTALL)
        
        # For the 16 new games, the script tag is outside the modal, let's remove just the modal block
        content = re.sub(r'<!-- HOW TO PLAY MODAL -->.*?</div>\s*</div>\s*</div>', '', content, flags=re.DOTALL)
        
        with open(html_file, "w", encoding="utf-8") as f:
            f.write(content)

print("Removed duplicate How-To-Play modals and buttons.")
