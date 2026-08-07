import os

css_additions = {
    "tictactoe": ("#06b6d4", "rgba(6,182,212,0.15)", "linear-gradient(45deg, #020617, #164e63)"),
    "luck": ("#eab308", "rgba(234,179,8,0.15)", "radial-gradient(circle at center, #422006, #000)"),
    "rps": ("#14b8a6", "rgba(20,184,166,0.15)", "linear-gradient(135deg, #042f2e, #134e4a)"),
    "mem": ("#ec4899", "rgba(236,72,153,0.15)", "radial-gradient(circle at top left, #831843, #000)"),
    "snake": ("#22c55e", "rgba(34,197,94,0.15)", "linear-gradient(to bottom, #052e16, #064e3b)"),
    "truck": ("#fbbf24", "rgba(251,191,36,0.15)", "linear-gradient(to right, #000, #1e1e1e)"),
    "whack": ("#f59e0b", "rgba(245,158,11,0.15)", "radial-gradient(circle, #78350f, #27272a)"),
    "fruit": ("#ef4444", "rgba(239,68,68,0.15)", "linear-gradient(45deg, #7f1d1d, #450a0a)"),
    "box": ("#a855f7", "rgba(168,85,247,0.15)", "linear-gradient(to bottom, #3b0764, #170529)"),
    "chess": ("#9ca3af", "rgba(156,163,175,0.15)", "radial-gradient(circle at center, #1f2937, #111827)"),
    "ml": ("#be123c", "rgba(190,18,60,0.15)", "linear-gradient(135deg, #4c0519, #000)"),
}

for name, (hex_color, rgba_color, bg_style) in css_additions.items():
    css_file = f"{name}.css"
    if os.path.exists(css_file):
        with open(css_file, "a", encoding="utf-8") as f:
            f.write(f"\n\n/* Premium Dynamic Background Injected */\n")
            f.write(f"body {{\n    background: {bg_style} !important;\n    position: relative;\n}}\n")
            f.write(f"body::before {{\n")
            f.write(f"    content: '';\n")
            f.write(f"    position: fixed;\n    top: 0; left: 0; width: 100vw; height: 100vh;\n")
            f.write(f"    background: radial-gradient(circle at 50% 50%, {rgba_color} 0%, transparent 70%);\n")
            f.write(f"    z-index: -1;\n    animation: pulseBg 6s infinite alternate;\n")
            f.write(f"}}\n")
            f.write(f"@keyframes pulseBg {{\n    0% {{ transform: scale(1); opacity: 0.3; }}\n    100% {{ transform: scale(1.3); opacity: 0.7; }}\n}}\n")
            f.write(f"header h1 {{ text-shadow: 0 0 15px {hex_color} !important; }}\n")
            f.write(f"button {{ box-shadow: 0 4px 10px {rgba_color}; }}\n")

print("Added premium unique backgrounds to original 11 games.")
