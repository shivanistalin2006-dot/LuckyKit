import os

css_path = 'premium-dashboard.css'

with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# 1. Update variables
new_vars = """:root, [data-theme="dark"] {
    --v2-primary: #0ea5e9;
    --v2-accent: #f43f5e;
    --v2-bg: #0f172a;
    --v2-surface: rgba(30, 41, 59, 0.7);
    --v2-border: rgba(255, 255, 255, 0.1);
    --v2-glow: rgba(14, 165, 233, 0.3);
    
    --v2-text: #f8fafc;
    --v2-text-muted: #94a3b8;
    
    --v2-sidebar-bg: linear-gradient(180deg, rgba(15,23,42,0.9) 0%, rgba(2,6,23,0.95) 100%);
    --v2-card-bg: linear-gradient(180deg, rgba(30,41,59,0.5) 0%, rgba(15,23,42,0.8) 100%);
    --v2-nav-hover: rgba(255,255,255,0.05);
    
    --v2-shadow: rgba(0,0,0,0.5);
    --v2-shadow-lg: 0 15px 35px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
    
    --v2-profile-bg: rgba(255,255,255,0.03);
    --v2-profile-border: rgba(255,255,255,0.05);
    
    --v2-progress-bg: rgba(0,0,0,0.5);
    
    --v2-hero-overlay: linear-gradient(to top, #0f172a 0%, transparent 100%);
    
    --v2-mission-bg: rgba(0,0,0,0.2);
    --v2-mission-hover: rgba(255,255,255,0.05);
}

[data-theme="light"] {
    --v2-primary: #3b82f6;
    --v2-accent: #ec4899;
    --v2-bg: #f8fafc;
    --v2-surface: rgba(255, 255, 255, 0.85);
    --v2-border: rgba(0, 0, 0, 0.08);
    --v2-glow: rgba(59, 130, 246, 0.2);
    
    --v2-text: #0f172a;
    --v2-text-muted: #64748b;
    
    --v2-sidebar-bg: linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%);
    --v2-card-bg: linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(241,245,249,1) 100%);
    --v2-nav-hover: rgba(0,0,0,0.05);
    
    --v2-shadow: rgba(0,0,0,0.05);
    --v2-shadow-lg: 0 10px 25px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8);
    
    --v2-profile-bg: rgba(0,0,0,0.03);
    --v2-profile-border: rgba(0,0,0,0.05);
    
    --v2-progress-bg: rgba(0,0,0,0.1);
    
    --v2-hero-overlay: linear-gradient(to top, #f8fafc 0%, transparent 100%);
    
    --v2-mission-bg: rgba(0,0,0,0.03);
    --v2-mission-hover: rgba(0,0,0,0.06);
}"""

import re
css = re.sub(r':root\s*\{.*?\}(?=\s*body)', new_vars, css, flags=re.DOTALL)

# Now replace hardcoded colors
replacements = {
    'color: #f8fafc;': 'color: var(--v2-text);',
    'background: linear-gradient(180deg, rgba(15,23,42,0.9) 0%, rgba(2,6,23,0.95) 100%);': 'background: var(--v2-sidebar-bg);',
    'color: #94a3b8;': 'color: var(--v2-text-muted);',
    'background: rgba(255,255,255,0.05);': 'background: var(--v2-nav-hover);',
    'color: #fff;': 'color: var(--v2-text);',
    'background: rgba(255,255,255,0.03);': 'background: var(--v2-profile-bg);',
    'border: 1px solid rgba(255,255,255,0.05);': 'border: 1px solid var(--v2-profile-border);',
    'background: rgba(0,0,0,0.5);': 'background: var(--v2-progress-bg);',
    'background: linear-gradient(to top, #0f172a 0%, transparent 100%);': 'background: var(--v2-hero-overlay);',
    'background: rgba(0,0,0,0.2);': 'background: var(--v2-mission-bg);',
    'background: linear-gradient(180deg, rgba(30,41,59,0.5) 0%, rgba(15,23,42,0.8) 100%);': 'background: var(--v2-card-bg);',
    'box-shadow: 0 15px 35px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);': 'box-shadow: var(--v2-shadow-lg);',
    'box-shadow: 0 10px 25px rgba(0,0,0,0.5), 0 0 15px rgba(14,165,233,0.2);': 'box-shadow: 0 10px 25px var(--v2-shadow), 0 0 15px var(--v2-glow);',
    'box-shadow: 0 20px 40px rgba(0,0,0,0.6);': 'box-shadow: 0 20px 40px var(--v2-shadow);',
    'box-shadow: 0 20px 40px rgba(0,0,0,0.6), 0 0 20px var(--v2-glow);': 'box-shadow: 0 20px 40px var(--v2-shadow), 0 0 20px var(--v2-glow);'
}

for old, new in replacements.items():
    css = css.replace(old, new)

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)

print("Updated premium-dashboard.css")
