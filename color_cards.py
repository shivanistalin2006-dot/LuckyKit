import re

# 1. Update CSS
css_path = 'premium-dashboard.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# Add theme color variables
dark_vars = """    --v2-mission-hover: rgba(255,255,255,0.05);
    
    --card-bg-red: linear-gradient(180deg, rgba(239, 68, 68, 0.15) 0%, rgba(15,23,42,0.9) 100%);
    --card-bg-blue: linear-gradient(180deg, rgba(59, 130, 246, 0.15) 0%, rgba(15,23,42,0.9) 100%);
    --card-bg-green: linear-gradient(180deg, rgba(34, 197, 94, 0.15) 0%, rgba(15,23,42,0.9) 100%);
    --card-bg-yellow: linear-gradient(180deg, rgba(234, 179, 8, 0.15) 0%, rgba(15,23,42,0.9) 100%);
    --card-bg-purple: linear-gradient(180deg, rgba(168, 85, 247, 0.15) 0%, rgba(15,23,42,0.9) 100%);
    --card-bg-cyan: linear-gradient(180deg, rgba(6, 182, 212, 0.15) 0%, rgba(15,23,42,0.9) 100%);
}"""

light_vars = """    --v2-mission-hover: rgba(0,0,0,0.06);
    
    --card-bg-red: linear-gradient(180deg, rgba(254, 226, 226, 1) 0%, rgba(255, 255, 255, 1) 100%);
    --card-bg-blue: linear-gradient(180deg, rgba(219, 234, 254, 1) 0%, rgba(255, 255, 255, 1) 100%);
    --card-bg-green: linear-gradient(180deg, rgba(220, 252, 231, 1) 0%, rgba(255, 255, 255, 1) 100%);
    --card-bg-yellow: linear-gradient(180deg, rgba(254, 249, 195, 1) 0%, rgba(255, 255, 255, 1) 100%);
    --card-bg-purple: linear-gradient(180deg, rgba(243, 232, 255, 1) 0%, rgba(255, 255, 255, 1) 100%);
    --card-bg-cyan: linear-gradient(180deg, rgba(207, 250, 254, 1) 0%, rgba(255, 255, 255, 1) 100%);
}"""

css = css.replace('    --v2-mission-hover: rgba(255,255,255,0.05);\n}', dark_vars)
css = css.replace('    --v2-mission-hover: rgba(0,0,0,0.06);\n}', light_vars)

card_css = """.v2-card.card-theme-red { background: var(--card-bg-red); border-color: rgba(239, 68, 68, 0.2); }
.v2-card.card-theme-blue { background: var(--card-bg-blue); border-color: rgba(59, 130, 246, 0.2); }
.v2-card.card-theme-green { background: var(--card-bg-green); border-color: rgba(34, 197, 94, 0.2); }
.v2-card.card-theme-yellow { background: var(--card-bg-yellow); border-color: rgba(234, 179, 8, 0.2); }
.v2-card.card-theme-purple { background: var(--card-bg-purple); border-color: rgba(168, 85, 247, 0.2); }
.v2-card.card-theme-cyan { background: var(--card-bg-cyan); border-color: rgba(6, 182, 212, 0.2); }

.v2-card:hover {"""

css = css.replace('.v2-card:hover {', card_css)

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)

# 2. Update HTML
html_path = 'index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Map text-* to card-theme-*
color_map = {
    'text-danger': 'card-theme-red',
    'text-primary': 'card-theme-blue',
    'text-success': 'card-theme-green',
    'text-warning': 'card-theme-yellow',
    'text-info': 'card-theme-cyan',
    'text-secondary': 'card-theme-purple',
    'text-light': 'card-theme-purple' # Chess fallback
}

# Regex to find <div class="premium-card v2-card"...> and look ahead for text-*
def replace_card(match):
    full_match = match.group(0)
    for text_class, theme_class in color_map.items():
        if text_class in full_match:
            # Inject theme_class into v2-card
            return full_match.replace('v2-card', f'v2-card {theme_class}')
    return full_match

pattern = re.compile(r'<div class="premium-card v2-card".*?</div>\s*</div>', re.DOTALL)
html = pattern.sub(replace_card, html)

# Also fix the scroller cards which might not have the outer wrapper
pattern2 = re.compile(r'<div class="premium-card v2-card".*?</div>\s*</div>\s*</div>', re.DOTALL)
# Actually, let's just do a simpler search and replace for specific known blocks or use a simpler regex
def inject_class(html_str):
    for text_cls, theme_cls in color_map.items():
        # Find all v2-card divs that have this text_cls inside them
        # This is a bit hacky but works for this specific HTML structure
        parts = html_str.split('premium-card v2-card')
        new_parts = [parts[0]]
        for part in parts[1:]:
            if text_cls in part[:300]: # Look ahead a bit
                new_parts.append(f' {theme_cls}' + part)
            else:
                new_parts.append('' + part)
        html_str = 'premium-card v2-card'.join(new_parts)
    return html_str

html = inject_class(html)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated HTML and CSS for colorful cards.")
