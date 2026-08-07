import os
import re

# LuckyKit Arcade Injector Script
# Automatically inserts arcade-shell links into all game HTML files

directory = os.path.dirname(os.path.abspath(__file__))
html_files = [f for f in os.listdir(directory) if f.endswith('.html') and f != 'index.html']

tags_to_inject = """
    <!-- LuckyKit Arcade Premium Injections -->
    <link rel="stylesheet" href="arcade-shell.css">
    <script src="arcade-core.js" defer></script>
    <script src="arcade-sounds.js" defer></script>
    <script src="arcade-shell.js" defer></script>
"""

print(f"Scanning directory: {directory}")
print(f"Found {len(html_files)} game HTML files to process.")

success_count = 0
skipped_count = 0

for file_name in html_files:
    file_path = os.path.join(directory, file_name)
    
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
        
    # Check if already injected
    if 'arcade-shell.js' in content:
        print(f"[SKIPPED] '{file_name}' already contains arcade shell scripts.")
        skipped_count += 1
        continue
        
    # Insert before </head> tag
    if '</head>' in content:
        # Case insensitive replace to be safe
        new_content = re.sub(r'(</head>)', f'{tags_to_inject}\\1', content, flags=re.IGNORECASE)
        
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(new_content)
            
        print(f"[SUCCESS] Injected arcade shell into '{file_name}'.")
        success_count += 1
    else:
        print(f"[WARNING] Could not find </head> tag in '{file_name}'. Injection skipped.")

print("\n--- Summary ---")
print(f"Total HTML files processed: {len(html_files)}")
print(f"Successfully injected: {success_count}")
print(f"Already injected (skipped): {skipped_count}")
