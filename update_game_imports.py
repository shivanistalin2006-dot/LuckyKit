import glob
import re

js_files = glob.glob('*.js')
html_files = glob.glob('*.html')

# Update JS imports to bust BaseGame.js cache
for filepath in js_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Cache bust BaseGame
    new_content = re.sub(r'import \{ BaseGame \} from \'./core/BaseGame\.js(\?v=[0-9\.]+)?\';', 'import { BaseGame } from \'./core/BaseGame.js?v=2.5\';', content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated JS: {filepath}")

# Update HTML files to bust game JS scripts
for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We want to cache bust the main game script in each html
    # e.g. <script type="module" src="arena.js" ...>
    game_name = filepath.replace('.html', '')
    pattern = rf'src="{game_name}\.js(\?v=[0-9\.]+)?"'
    new_content = re.sub(pattern, f'src="{game_name}.js?v=2.5"', content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated HTML: {filepath}")
