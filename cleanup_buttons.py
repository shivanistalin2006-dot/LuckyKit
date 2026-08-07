import os
import glob
import re

html_files = glob.glob("*.html")

for filepath in html_files:
    if filepath == "index.html":
        continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove <button ...> or <a ...> that contains "Home", "🏠", "How To Play", "📖"
    # But only inside the game bodies (not in the injected shell, which is JS).
    # Since they are hardcoded, we can use regex.
    
    content = re.sub(r'<button[^>]*id="homeBtn"[^>]*>.*?</button>', '', content, flags=re.IGNORECASE | re.DOTALL)
    content = re.sub(r'<button[^>]*id="helpBtn"[^>]*>.*?</button>', '', content, flags=re.IGNORECASE | re.DOTALL)
    content = re.sub(r'<a[^>]*href="index\.html"[^>]*>.*?</a>', '', content, flags=re.IGNORECASE | re.DOTALL)
    content = re.sub(r'<button[^>]*onclick="[^"]*index\.html[^"]*"[^>]*>.*?</button>', '', content, flags=re.IGNORECASE | re.DOTALL)
    content = re.sub(r'<button[^>]*data-bs-target="#howToPlayModal"[^>]*>.*?</button>', '', content, flags=re.IGNORECASE | re.DOTALL)
    
    # Also remove the whole How To Play Modal block if it exists
    content = re.sub(r'<!-- HOW TO PLAY MODAL -->.*?</div>\s*</div>\s*</div>', '', content, flags=re.DOTALL)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Cleanup complete.")
