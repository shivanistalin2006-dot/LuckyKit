import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# Pattern to find all game-card-wrapper blocks
# We only want to keep cards pointing to:
allowed_files = [
    'tictactoe.html', 'luck.html', 'rps.html', 'mem.html', 'snake.html',
    'truck.html', 'whack.html', 'fruit.html', 'box.html', 'chess.html', 'ml.html',
    'checkers.html', 'space.html', 'brick.html', '2048.html'
]

# We split games section or parse card wrappers
card_pattern = r'(<div class="col-12 col-sm-6 col-lg-4 col-xl-3 game-card-wrapper".*?</div>\s*</div>\s*</div>)'

# Let's extract all wrappers
cards = re.findall(r'<div class="col-12 col-sm-6 col-lg-4 col-xl-3 game-card-wrapper".*?</div>\s*</div>', content, re.DOTALL)

print(f"Found {len(cards)} cards total.")

kept_cards = []
for card in cards:
    # check if card contains any allowed html link or onclick
    if any(f in card for f in allowed_files):
        kept_cards.append(card)

print(f"Keeping {len(kept_cards)} cards.")

# Replace the <section class="games row g-4" id="gamesGrid"> content
new_grid_content = '\n\n            '.join(kept_cards)

grid_pattern = r'(<section class="games row g-4" id="gamesGrid">)(.*?)(</section>)'
new_section = r'\1\n            ' + new_grid_content + r'\n        \3'

updated_content = re.sub(grid_pattern, new_section, content, flags=re.DOTALL)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(updated_content)

print("index.html updated successfully!")
