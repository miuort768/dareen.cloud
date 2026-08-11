#!/usr/bin/env python3
"""Fix remaining corrupted Arabic text - improved version."""
import subprocess, re, os

PARENT_COMMIT = "79e84cf~1"

def git_show(ref, filepath):
    try:
        r = subprocess.run(["git", "show", f"{ref}:{filepath}"], capture_output=True)
        return r.stdout.decode('utf-8') if r.returncode == 0 else None
    except:
        return None

def has_arabic(text):
    return bool(re.search(r'[\u0600-\u06FF]', text))

def fix_corrupted_string(corrupted_str, old_strings):
    """Try to fix a corrupted quoted string by matching with old Arabic strings."""
    if '\ufffd' not in corrupted_str:
        return corrupted_str
    
    # Count replacement chars (including spaces as separators)
    corrupted_len = len(corrupted_str)
    
    # Try to find by comparing the "skeleton" (non-Arabic parts)
    for old_s in old_strings:
        # Compare non-Arabic characters  
        c_skeleton = re.sub(r'[\u0600-\u06FF\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\ufffd]+', '\ufffd', corrupted_str)
        o_skeleton = re.sub(r'[\u0600-\u06FF\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]+', '\ufffd', old_s)
        
        if c_skeleton == o_skeleton:
            return old_s
    
    # Fallback: match by number of "words" (splitting by space)
    c_words = len(corrupted_str.split())
    for old_s in old_strings:
        o_words = len(old_s.split())
        if c_words == o_words and abs(len(corrupted_str) - len(old_s)) < 5:
            # Also check structure similarity
            c_skeleton = re.sub(r'[\u0600-\u06FF\ufffd]+', 'X', corrupted_str)
            o_skeleton = re.sub(r'[\u0600-\u06FF]+', 'X', old_s)
            if c_skeleton == o_skeleton:
                return old_s
    
    return corrupted_str

# Get all corrupted files
all_files = []
for root, dirs, files in os.walk("src"):
    for f in files:
        if f.endswith(('.tsx', '.ts')) and not f.endswith('.d.ts'):
            all_files.append(os.path.join(root, f))

fixed_total = 0
for filepath in all_files:
    with open(filepath, 'rb') as f:
        raw = f.read()
    
    try:
        content = raw.decode('utf-8')
    except UnicodeDecodeError:
        content = raw.decode('utf-8', errors='replace')
    
    if '\ufffd' not in content:
        continue
    
    # Get old version
    old_content = git_show(PARENT_COMMIT, filepath)
    if not old_content or not has_arabic(old_content):
        continue
    
    # Extract all quoted strings with Arabic from old version
    old_strings = []
    for m in re.finditer(r"""(['"])(.*?)\1""", old_content):
        if has_arabic(m.group(2)):
            old_strings.append(m.group(2))
    
    if not old_strings:
        continue
    
    # Fix corrupted strings in current content
    new_content = content
    changed = [0]
    
    def replace_match(m):
        result = fix_corrupted_string(m.group(2), old_strings)
        if result != m.group(2):
            changed[0] += 1
            return m.group(1) + result + m.group(1)
        return m.group(0)
    
    new_content = re.sub(r"""(['"])(.*?)\1""", replace_match, new_content, flags=re.DOTALL)
    
    if changed[0] > 0:
        with open(filepath, 'wb') as f:
            f.write(new_content.encode('utf-8'))
        print(f"FIXED ({changed[0]} strings): {filepath}")
        fixed_total += 1
    else:
        print(f"SKIP (no match): {filepath}")

print(f"\nTotal fixed: {fixed_total}")
