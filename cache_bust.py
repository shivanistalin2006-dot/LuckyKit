import glob
import re

html_files = glob.glob('*.html')

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace core/app.js with or without query params to v=2.4
    new_content = re.sub(r'src="core/app\.js(\?v=[0-9\.]+)?', 'src="core/app.js?v=2.4', content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")
