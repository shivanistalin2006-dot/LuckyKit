import re

with open('arcade-shell.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace background gradient in logo
content = re.sub(r'background: linear-gradient\(to right, var\(--neon-cyan\), var\(--neon-purple\)\);',
                 r'background: linear-gradient(to right, var(--game-theme-color, var(--neon-cyan)), var(--neon-purple));', content)

# Replace hover border color in nav button
content = re.sub(r'border-color: var\(--neon-cyan\);',
                 r'border-color: var(--game-theme-color, var(--neon-cyan));', content)

content = re.sub(r'box-shadow: var\(--shadow-neon-cyan\);',
                 r'box-shadow: 0 0 15px var(--game-theme-color, rgba(6, 182, 212, 0.5));', content)

content = re.sub(r'color: var\(--neon-cyan\);',
                 r'color: var(--game-theme-color, var(--neon-cyan));', content)

# Apply to modal
content = re.sub(r'border-bottom: 1px solid rgba\(6, 182, 212, 0\.2\);',
                 r'border-bottom: 1px solid var(--game-theme-color, rgba(6, 182, 212, 0.2));', content)

with open('arcade-shell.css', 'w', encoding='utf-8') as f:
    f.write(content)

print("CSS updated with dynamic theme color.")
