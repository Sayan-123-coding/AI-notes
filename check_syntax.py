import re

with open('frontend/src/pages/Home.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# More accurate regex for div tags
opening_divs = len(re.findall(r'<div[\s>]', content))
closing_divs = len(re.findall(r'</div>', content))

# Also check for other self-closing tags that might affect counts
svg_tags = len(re.findall(r'<svg', content))
svg_close = len(re.findall(r'</svg>', content))

print(f"Opening <div: {opening_divs}")
print(f"Closing </div>: {closing_divs}")
print(f"SVG opens: {svg_tags}")
print(f"SVG closes: {svg_close}")
print(f"Difference in divs: {opening_divs - closing_divs}")

# Find all lines with <div or </div
lines = content.split('\n')
div_lines = [(i+1, line) for i, line in enumerate(lines) if '<div' in line or '</div>' in line]

print(f"\nTotal div-related lines: {len(div_lines)}")
print("\nFirst 10 div lines:")
for line_num, line in div_lines[:10]:
    print(f"{line_num}: {line.strip()[:100]}")

print("\nLast 15 div lines:")
for line_num, line in div_lines[-15:]:
    print(f"{line_num}: {line.strip()[:100]}")
