import glob
import re

html_files = glob.glob('*.html')
for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove arcade-shell.js script
    new_content = re.sub(r'<script[^>]*src=["\']legacy/arcade-shell\.js["\'][^>]*></script>\n?', '', content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Removed arcade-shell.js from: {filepath}")
