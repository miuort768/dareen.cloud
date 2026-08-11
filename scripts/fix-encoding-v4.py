#!/usr/bin/env python3
"""
Final fix: restore files from old version (correct Arabic), 
then apply the CSS token replacements that the codemod made.
"""
import subprocess, re, os

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

# CSS token replacements from the codemod (dark:[#D4AF37] -> dark:primary, etc.)
CSS_REPLACEMENTS = [
    # Hex color references -> semantic tokens
    (r'dark:text-\[#D4AF37\]', 'dark:text-primary'),
    (r'dark:bg-\[#D4AF37\]', 'dark:bg-primary'),
    (r'dark:border-\[#D4AF37\]', 'dark:border-primary'),
    (r'dark:ring-\[#D4AF37\]', 'dark:ring-primary'),
    (r'dark:text-\[#D4AF37\]/(\d+)', r'dark:text-primary/\1'),
    (r'dark:bg-\[#D4AF37\]/(\d+)', r'dark:bg-primary/\1'),
    (r'dark:border-\[#D4AF37\]/(\d+)', r'dark:border-primary/\1'),
    (r'bg-\[#D4AF37\]', 'bg-primary'),
    (r'text-\[#D4AF37\]', 'text-primary'),
    (r'border-\[#D4AF37\]', 'border-primary'),
    # Dark bg hex -> semantic
    (r'dark:bg-\[#0d0d0f\]', 'dark:bg-card'),
    (r'dark:bg-\[#1a1a2e\]', 'dark:bg-card'),
    (r'dark:bg-\[#0f0f1a\]', 'dark:bg-card'),
    # Named color dark variants -> semantic
    (r'dark:text-zinc-400', 'dark:text-muted'),
    (r'dark:text-zinc-300', 'dark:text-soft'),
    (r'dark:text-zinc-500', 'dark:text-dim'),
    (r'dark:text-slate-400', 'dark:text-muted'),
    (r'dark:text-slate-300', 'dark:text-soft'),
    (r'dark:text-white', 'dark:text-main'),
    (r'dark:bg-zinc-800', 'dark:bg-surface'),
    (r'dark:bg-zinc-900', 'dark:bg-surface'),
    (r'dark:bg-slate-800', 'dark:bg-surface'),
    (r'dark:bg-slate-900', 'dark:bg-surface'),
    (r'dark:border-zinc-700', 'dark:border-border'),
    (r'dark:border-slate-700', 'dark:border-border'),
    (r'dark:border-zinc-800', 'dark:border-border'),
    # focus: -> focus-visible:
    (r'\bfocus:', 'focus-visible:'),
]

def git_show(ref, filepath):
    try:
        r = subprocess.run(["git", "show", f"{ref}:{filepath}"], capture_output=True)
        if r.returncode == 0:
            return r.stdout.decode('utf-8')
    except:
        pass
    return None

def has_corruption(text):
    return '\ufffd' in text

fixed = 0
for filepath in CORRUPTED_FILES:
    if not os.path.exists(filepath):
        print(f"MISSING: {filepath}")
        continue
    
    # Get old version (correct Arabic)
    old_content = git_show("79e84cf~1", filepath)
    if not old_content:
        print(f"NO OLD: {filepath}")
        continue
    
    # Check if still corrupted
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        current = f.read()
    
    if not has_corruption(current):
        print(f"OK: {filepath}")
        continue
    
    # Restore from old version
    new_content = old_content
    
    # Apply CSS token replacements
    for pattern, replacement in CSS_REPLACEMENTS:
        new_content = re.sub(pattern, replacement, new_content)
    
    # Verify Arabic is intact
    if has_corruption(new_content):
        print(f"STILL CORRUPTED AFTER RESTORE: {filepath}")
        continue
    
    # Write
    with open(filepath, 'wb') as f:
        f.write(new_content.encode('utf-8'))
    
    # Check if any CSS changes were actually applied
    css_changes = 0
    for pattern, replacement in CSS_REPLACEMENTS:
        if re.search(pattern, old_content):
            css_changes += len(re.findall(pattern, old_content))
    
    print(f"FIXED ({css_changes} CSS tokens): {filepath}")
    fixed += 1

print(f"\nTotal: {fixed} files fixed")
