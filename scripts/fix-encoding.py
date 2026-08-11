#!/usr/bin/env python3
"""Fix corrupted Arabic text (U+FFFD) by restoring from pre-codemod git commit."""
import subprocess, sys, re, os

PARENT_COMMIT = "79e84cf~1"
COMMIT = "79e84cf"

def git_show(ref, filepath):
    try:
        r = subprocess.run(["git", "show", f"{ref}:{filepath}"], capture_output=True)
        return r.stdout.decode('utf-8') if r.returncode == 0 else None
    except:
        return None

def git_files(ref):
    r = subprocess.run(["git", "show", ref, "--name-only", "--diff-filter=M"], capture_output=True)
    lines = r.stdout.decode('utf-8', errors='replace').splitlines()
    return [l for l in lines if l.endswith(('.tsx', '.ts')) and 'codemod' not in l and 'scripts/' not in l and not l.endswith('.css')]

def extract_arabic_strings(text):
    """Extract all Arabic string content from the text."""
    # Match quoted strings containing Arabic
    results = []
    for m in re.finditer(r"""(['"])(.*?)\1""", text):
        content = m.group(2)
        if re.search(r'[\u0600-\u06FF]', content):
            results.append(content)
    return results

def fix_line_corruption(current_line, old_line):
    """If current line has U+FFFD, try to find the corresponding old line and extract Arabic."""
    if '\ufffd' not in current_line:
        return current_line
    if not re.search(r'[\u0600-\u06FF]', old_line):
        return current_line
    
    # Extract quoted strings from both
    current_strings = list(re.finditer(r"""(['"])(.*?)\1""", current_line))
    old_strings = list(re.finditer(r"""(['"])(.*?)\1""", old_line))
    
    if not current_strings or not old_strings:
        return current_line
    
    # For each quoted string with corruption, try to find a match in old
    result = current_line
    for cs in current_strings:
        if '\ufffd' not in cs.group(2):
            continue
        # Try to find matching old string by comparing non-Arabic skeleton
        cs_skeleton = re.sub(r'[\u0600-\u06FF\u0610-\u061A\u064B-\u065F\u0670]+', '', cs.group(2))
        for os_match in old_strings:
            os_skeleton = re.sub(r'[\u0600-\u06FF\u0610-\u061A\u064B-\u065F\u0670]+', '', os_match.group(2))
            if cs_skeleton == os_skeleton and cs.group(2) != os_match.group(2):
                result = result.replace(cs.group(0), os_match.group(0), 1)
                break
    
    return result

# Main
files = git_files(COMMIT)
fixed_count = 0
total_corrupted = 0

for filepath in files:
    if not os.path.exists(filepath):
        continue
    
    with open(filepath, 'rb') as f:
        raw = f.read()
    try:
        current_content = raw.decode('utf-8')
    except UnicodeDecodeError:
        current_content = raw.decode('utf-8', errors='replace')
    
    if '\ufffd' not in current_content:
        continue
    
    total_corrupted += 1
    old_content = git_show(PARENT_COMMIT, filepath)
    if not old_content:
        continue
    
    # Check old has Arabic
    if not re.search(r'[\u0600-\u06FF]', old_content):
        continue
    
    current_lines = current_content.split('\n')
    old_lines = old_content.split('\n')
    
    fixed_lines = []
    changed = 0
    
    for i, cline in enumerate(current_lines):
        if '\ufffd' not in cline:
            fixed_lines.append(cline)
            continue
        
        # Find best matching old line by structure
        # Strip all text content, keep only tags/classes/props
        c_struct = re.sub(r'[>\s][^<]*[<]', '>', cline)
        
        best = None
        best_score = -1
        for oline in old_lines:
            if not re.search(r'[\u0600-\u06FF]', oline):
                continue
            o_struct = re.sub(r'[>\s][^<]*[<]', '>', oline)
            # Simple similarity: count matching non-alpha tokens
            c_tokens = set(re.findall(r'[a-zA-Z_\-]+', c_struct))
            o_tokens = set(re.findall(r'[a-zA-Z_\-]+', o_struct))
            if c_tokens and o_tokens:
                score = len(c_tokens & o_tokens) / max(len(c_tokens | o_tokens), 1)
                if score > best_score and score > 0.5:
                    best_score = score
                    best = oline
        
        if best:
            fixed_lines.append(best)
            changed += 1
        else:
            fixed_lines.append(cline)
    
    if changed > 0:
        with open(filepath, 'w', encoding='utf-8', newline='') as f:
            f.write('\n'.join(fixed_lines))
        print(f"FIXED ({changed} lines): {filepath}")
        fixed_count += 1
    else:
        print(f"SKIP (no match): {filepath}")

print(f"\n=== Total corrupted: {total_corrupted}, Fixed: {fixed_count} ===")
