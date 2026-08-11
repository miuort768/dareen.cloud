import re, glob, os

def decode_mojibake(s):
    try:
        return s.encode('latin-1').decode('utf-8')
    except:
        try:
            return s.encode('cp1252').decode('utf-8')
        except:
            return s

def fix_mojibake_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Pattern: sequences of mojibake Arabic (3-byte UTF-8 that was double-encoded)
    # Mojibake Arabic chars are in ranges: \u0627-\u06FF mixed with Latin chars
    # We look for strings that contain repeated mojibake patterns
    mojibake_pattern = re.compile(r'[\u0600-\u0800A-Za-z0-9\s\u060C\u061B\u061F\u002C\u002E\u0028\u0029\u0022\u2019\u201C\u201D\u2014\u2013]{10,}')
    
    def try_decode_match(m):
        text = m.group()
        try:
            decoded = text.encode('latin-1').decode('utf-8')
            # Check if decoded text contains real Arabic
            if re.search(r'[\u0600-\u06FF]', decoded) and not re.search(r'[\u0600-\u06FF]', text):
                return decoded
        except:
            pass
        return text
    
    content = mojibake_pattern.sub(try_decode_match, content)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

# Check all tsx/ts files in src/
files = glob.glob('src/**/*.tsx', recursive=True) + glob.glob('src/**/*.ts', recursive=True)
fixed = []
for f in files:
    if 'node_modules' in f or 'scripts' in f or '.d.ts' in f:
        continue
    if fix_mojibake_in_file(f):
        fixed.append(f)

if fixed:
    print('Fixed ' + str(len(fixed)) + ' files:')
    for f in fixed:
        print('  ' + f)
else:
    print('No mojibake found')
