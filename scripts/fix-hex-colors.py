#!/usr/bin/env python3
"""Fix old hex colors in restored files - replace with semantic tokens."""
import re, os

FILES = [
    "src/pages/public/Home.tsx",
    "src/pages/public/Courses.tsx",
    "src/pages/public/components/HeroSection.tsx",
    "src/pages/public/components/HowToSubscribe.tsx",
    "src/pages/public/components/QuranSection.tsx",
    "src/features/dashboard/components/HeroSection.tsx",
    "src/features/dashboard/components/MonthlyReportPreview.tsx",
    "src/features/dashboard/components/NextSessionHero.tsx",
    "src/features/dashboard/components/StudentQuickBrief.tsx",
    "src/features/dashboard/components/TopAttendanceStudents.tsx",
    "src/components/public/MasarSection.tsx",
    "src/components/public/MobileHeader.tsx",
    "src/pages/Leads.tsx",
    "src/pages/TrialSessions.tsx",
    "src/pages/leads/components/AddLeadModal.tsx",
]

REPLACEMENTS = [
    # Primary accent: #D4AF37 (gold)
    (r'dark:text-\[#D4AF37\]', 'dark:text-primary'),
    (r'dark:bg-\[#D4AF37\]', 'dark:bg-primary'),
    (r'dark:border-\[#D4AF37\]', 'dark:border-primary'),
    (r'dark:ring-\[#D4AF37\]', 'dark:ring-primary'),
    (r'dark:fill-\[#D4AF37\]', 'dark:fill-primary'),
    (r'dark:stroke-\[#D4AF37\]', 'dark:stroke-primary'),
    (r'dark:text-\[#D4AF37\]/(\d+)', r'dark:text-primary/\1'),
    (r'dark:bg-\[#D4AF37\]/(\d+)', r'dark:bg-primary/\1'),
    (r'dark:border-\[#D4AF37\]/(\d+)', r'dark:border-primary/\1'),
    (r'dark:shadow-\[#D4AF37\]/(\d+)', r'dark:shadow-primary/\1'),
    (r'dark:from-\[#D4AF37\]', 'dark:from-primary'),
    (r'dark:to-\[#D4AF37\]', 'dark:to-primary'),
    (r'dark:via-\[#D4AF37\]', 'dark:via-primary'),
    (r'dark:from-\[#D4AF37\]/(\d+)', r'dark:from-primary/\1'),
    (r'dark:to-\[#D4AF37\]/(\d+)', r'dark:to-primary/\1'),
    (r'dark:via-\[#D4AF37\]/(\d+)', r'dark:via-primary/\1'),
    
    # Warning colors: #facc15, #f59e0b
    (r'dark:from-\[#facc15\]', 'dark:from-warning'),
    (r'dark:to-\[#facc15\]', 'dark:to-warning'),
    (r'dark:border-\[#facc15\]/(\d+)', r'dark:border-warning/\1'),
    (r'dark:from-\[#f59e0b\]', 'dark:from-warning'),
    (r'dark:to-\[#f59e0b\]', 'dark:to-warning'),
    (r'dark:via-\[#b8962e\]', 'dark:via-primary'),
    (r'dark:text-\[#f3d368\]', 'dark:text-primary'),
    
    # Surface/Card backgrounds
    (r'dark:bg-\[#0a0a0c\]', 'dark:bg-card'),
    (r'dark:bg-\[#0d0d0f\]', 'dark:bg-card'),
    (r'dark:from-\[#0d0d0f\]', 'dark:from-card'),
    (r'dark:via-\[#0d0d0f\]', 'dark:via-card'),
    (r'dark:to-\[#0d0d0f\]', 'dark:to-card'),
    (r'dark:bg-\[#1a1a1e\]', 'dark:bg-surface'),
    (r'dark:bg-\[#1a1a1a\]', 'dark:bg-surface'),
    (r'dark:from-\[#1a1a1e\]', 'dark:from-surface'),
    (r'dark:via-\[#1a1a1e\]', 'dark:via-surface'),
    (r'dark:to-\[#1a1a1e\]', 'dark:to-surface'),
    (r'dark:from-\[#121215\]', 'dark:from-surface'),
    (r'dark:via-\[#121215\]', 'dark:via-surface'),
    
    # Named colors -> semantic
    (r'dark:bg-zinc-600', 'dark:bg-surface'),
    (r'dark:text-white', 'dark:text-main'),
    (r'dark:hover:text-white', 'dark:hover:text-main'),
    (r'dark:text-black', 'dark:text-on-primary'),
    (r'dark:fill-\[#D4AF37\]', 'dark:fill-primary'),
    
    # Non-dark mode old hex (shouldn't exist but just in case)
    (r'from-\[#D4AF37\]', 'from-primary'),
    (r'to-\[#D4AF37\]', 'to-primary'),
    (r'from-\[#f59e0b\]', 'from-warning'),
    (r'to-\[#f59e0b\]', 'to-warning'),
]

total_fixes = 0
for filepath in FILES:
    if not os.path.exists(filepath):
        print(f"MISSING: {filepath}")
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    file_fixes = 0
    
    for pattern, replacement in REPLACEMENTS:
        matches = re.findall(pattern, new_content)
        if matches:
            file_fixes += len(matches)
            new_content = re.sub(pattern, replacement, new_content)
    
    if file_fixes > 0:
        with open(filepath, 'wb') as f:
            f.write(new_content.encode('utf-8'))
        print(f"FIXED ({file_fixes} hex): {filepath}")
        total_fixes += file_fixes
    else:
        print(f"OK: {filepath}")

print(f"\nTotal: {total_fixes} hex colors replaced")
