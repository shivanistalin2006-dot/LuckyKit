import glob
import re

css_files = glob.glob('*.css')
for filepath in css_files:
    if filepath == 'arcade-shell.css':
        continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove lines declaring --theme-color and --theme-glow
    new_content = re.sub(r'^\s*--theme-color:.*$\n?', '', content, flags=re.MULTILINE)
    new_content = re.sub(r'^\s*--theme-glow:.*$\n?', '', new_content, flags=re.MULTILINE)
    
    # Remove redefined .text-theme and .bg-theme to avoid conflicts
    new_content = re.sub(r'^\.text-theme\s*\{.*$\n?', '', new_content, flags=re.MULTILINE)
    new_content = re.sub(r'^\.bg-theme\s*\{.*$\n?', '', new_content, flags=re.MULTILINE)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Stripped theme variables from: {filepath}")
