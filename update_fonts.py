import glob
import re

html_files = glob.glob('*.html')

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Update Google Fonts link
    new_content = re.sub(r'family=Outfit[^"\']*', 'family=Rajdhani:wght@300;400;500;600;700', content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated font in HTML: {filepath}")

css_files = glob.glob('*.css')
for filepath in css_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Update CSS font-family
    new_content = content.replace("'Outfit'", "'Rajdhani'")
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated font in CSS: {filepath}")
