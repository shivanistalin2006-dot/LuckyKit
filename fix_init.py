import os
import re

for filename in os.listdir('.'):
    if filename.endswith('.js') and filename not in ['update_css.py', 'build_premium.py']:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Match anything inside DOMContentLoaded
        pattern = re.compile(r'document\.addEventListener\([\'"]DOMContentLoaded[\'"],\s*\(\)\s*=>\s*\{([\s\S]*?)\}\);')
        
        if pattern.search(content):
            # To avoid double-wrapping, check if it's already wrapped in if (document.readyState === 'loading')
            if "document.readyState === 'loading'" not in content:
                replacement = r"""if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", () => {\1});
} else {
    const _init = () => {\1};
    _init();
}"""
                new_content = pattern.sub(replacement, content)
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Fixed {filename}")
