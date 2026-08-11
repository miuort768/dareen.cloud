import re

def decode_mojibake(s):
    try:
        return s.encode('latin-1').decode('utf-8')
    except:
        try:
            return s.encode('cp1252').decode('utf-8')
        except:
            return s

with open('src/pages/public/components/HeroSection.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')
for i, line in enumerate(lines, 1):
    decoded = re.sub(r'[\u0600-\u07BF\u00C0-\u00FF]{3,}', lambda m: decode_mojibake(m.group()), line)
    if decoded != line:
        print("Line " + str(i) + ": " + decoded.strip()[:120])
