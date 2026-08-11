#!/usr/bin/env python3
"""
Fix remaining corrupted files by:
1. Restore from old version (correct Arabic)
2. Diff with current (codemod version) to find CSS-only changes
3. Apply CSS changes to restored version
"""
import subprocess, re, os, difflib

CORRUPTED_FILES = [
    "src/components/public/MasarSection.tsx",
    "src/components/public/MobileHeader.tsx",
    "src/features/dashboard/components/HeroSection.tsx",
    "src/features/dashboard/components/ModernAnnouncements.tsx",
    "src/features/dashboard/components/MonthlyReportPreview.tsx",
    "src/features/dashboard/components/NextSessionHero.tsx",
    "src/features/dashboard/components/QuickActions.tsx",
    "src/features/dashboard/components/StudentQuickBrief.tsx",
    "src/features/dashboard/components/TopAttendanceStudents.tsx",
    "src/pages/leads/components/AddLeadModal.tsx",
    "src/pages/public/components/AppDownloadSection.tsx",
    "src/pages/public/components/HeroSection.tsx",
    "src/pages/public/components/HowToSubscribe.tsx",
    "src/pages/public/components/QuranSection.tsx",
    "src/pages/public/Courses.tsx",
    "src/pages/public/Home.tsx",
    "src/pages/Agenda.tsx",
    "src/pages/Leads.tsx",
    "src/pages/TrialSessions.tsx",
]

def git_show(ref, filepath):
    try:
        r = subprocess.run(["git", "show", f"{ref}:{filepath}"], capture_output=True)
        if r.returncode == 0:
            return r.stdout.decode('utf-8')
    except:
        pass
    return None

def has_arabic(text):
    return bool(re.search(r'[\u0600-\u06FF]', text))

# CSS token replacements that the codemod makes (known patterns)
# Format: (old_pattern, new_pattern) - applied to className strings
CSS_REPLACEMENTS = [
    # Dark mode semantic tokens
    (r'text-slate-700', 'text-main'),
    (r'text-slate-600', 'text-muted'),
    (r'text-slate-500', 'text-dim'),
    (r'text-slate-400', 'text-dim'),
    (r'text-slate-300', 'text-soft'),
    (r'text-slate-800', 'text-main'),
    (r'bg-slate-50', 'bg-surface'),
    (r'bg-slate-100', 'bg-surface'),
    (r'bg-slate-200', 'bg-surface-alt'),
    (r'border-slate-200', 'border-border'),
    (r'border-slate-300', 'border-border'),
    # Indigo -> primary
    (r'bg-indigo-50', 'bg-primary/10'),
    (r'bg-indigo-100', 'bg-primary/10'),
    (r'bg-indigo-200', 'bg-primary/20'),
    (r'bg-indigo-500', 'bg-primary'),
    (r'bg-indigo-600', 'bg-primary'),
    (r'bg-indigo-700', 'bg-primary-hover'),
    (r'text-indigo-600', 'text-primary'),
    (r'text-indigo-700', 'text-primary'),
    (r'text-indigo-500', 'text-primary'),
    (r'border-indigo-200', 'border-primary/20'),
    (r'border-indigo-500', 'border-primary'),
    (r'from-indigo-50', 'from-primary/5'),
    (r'from-indigo-500', 'from-primary'),
    (r'to-indigo-600', 'to-primary'),
    (r'ring-indigo-500', 'ring-primary'),
    # Rose -> error
    (r'bg-rose-50', 'bg-error/10'),
    (r'bg-rose-500', 'bg-error'),
    (r'bg-rose-600', 'bg-error'),
    (r'text-rose-600', 'text-error'),
    (r'text-rose-500', 'text-error'),
    # Emerald -> success
    (r'bg-emerald-50', 'bg-success/10'),
    (r'bg-emerald-500', 'bg-success'),
    (r'bg-emerald-600', 'bg-success'),
    (r'text-emerald-600', 'text-success'),
    (r'text-emerald-500', 'text-success'),
    # Amber -> warning
    (r'bg-amber-50', 'bg-warning/10'),
    (r'bg-amber-500', 'bg-warning'),
    (r'text-amber-600', 'text-warning'),
    (r'text-amber-500', 'text-warning'),
    # Cyan -> info
    (r'bg-cyan-50', 'bg-info/10'),
    (r'bg-cyan-500', 'bg-info'),
    (r'text-cyan-600', 'text-info'),
    # focus: -> focus-visible:
    (r'\bfocus:', 'focus-visible:'),
]

def normalize_line(line):
    """Normalize a line for comparison: strip whitespace, normalize spaces."""
    s = line.strip()
    s = re.sub(r'\s+', ' ', s)
    return s

def extract_css_classes(line):
    """Extract just CSS class names from a line."""
    # Find className="..." patterns
    classes = set()
    for m in re.finditer(r'className="([^"]*)"', line):
        for c in m.group(1).split():
            classes.add(c)
    return classes

def apply_css_replacements(line):
    """Apply known CSS token replacements to a line."""
    result = line
    for old, new in CSS_REPLACEMENTS:
        result = re.sub(old, new, result)
    return result

for filepath in CORRUPTED_FILES:
    if not os.path.exists(filepath):
        print(f"MISSING: {filepath}")
        continue
    
    # Get old version (correct Arabic, old CSS)
    old_content = git_show("79e84cf~1", filepath)
    if not old_content:
        print(f"NO OLD VERSION: {filepath}")
        continue
    
    # Get current version (corrupted Arabic, new CSS)
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        current_content = f.read()
    
    if '\ufffd' not in current_content:
        print(f"ALREADY FIXED: {filepath}")
        continue
    
    # Strategy: restore from old, then apply CSS changes by line matching
    old_lines = old_content.split('\n')
    current_lines = current_content.split('\n')
    
    # Build a mapping: for each current line with corruption, find the best matching old line
    old_used = set()
    result_lines = []
    
    for i, cline in enumerate(current_lines):
        if '\ufffd' not in cline:
            result_lines.append(cline)
            continue
        
        # This line is corrupted - find best match in old version
        c_normalized = normalize_line(cline)
        # Remove replacement chars for matching
        c_clean = re.sub(r'\ufffd', '', c_normalized)
        c_clean = re.sub(r'\s+', ' ', c_clean).strip()
        
        best_match = None
        best_score = 0
        
        for j, oline in enumerate(old_lines):
            if j in old_used:
                continue
            o_normalized = normalize_line(oline)
            
            # Quick reject: very different length
            if abs(len(c_normalized) - len(o_normalized)) > 20:
                continue
            
            # Check structural similarity (non-Arabic parts)
            c_struct = re.sub(r'[\u0600-\u06FF\ufffd]+', 'ARABIC', c_normalized)
            o_struct = re.sub(r'[\u0600-\u06FF]+', 'ARABIC', o_normalized)
            
            # Calculate similarity
            if c_struct == o_struct:
                score = 100
            else:
                # Fuzzy match
                sm = difflib.SequenceMatcher(None, c_struct, o_struct)
                score = sm.ratio() * 100
            
            if score > best_score:
                best_score = score
                best_match = (j, oline)
        
        if best_match and best_score > 40:
            j, oline = best_match
            old_used.add(j)
            # Apply CSS replacements from current line to old line's structure
            # Use old line's Arabic text + current line's CSS classes
            result_line = apply_css_replacements(oline)
            result_lines.append(result_line)
        else:
            # Can't find match - try to fix just the corrupted parts
            # Replace corruption with old Arabic from nearest context
            result_lines.append(cline)
    
    new_content = '\n'.join(result_lines)
    
    if '\ufffd' in new_content:
        # Still has corruption - count remaining
        remaining = new_content.count('\ufffd')
        print(f"PARTIAL ({remaining} chars remaining): {filepath}")
    else:
        print(f"FIXED: {filepath}")
    
    with open(filepath, 'wb') as f:
        f.write(new_content.encode('utf-8'))
