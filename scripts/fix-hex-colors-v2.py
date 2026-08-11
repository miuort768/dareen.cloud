#!/usr/bin/env python3
"""Fix ALL remaining hex colors across the codebase."""
import re, os

# All files with hex violations (from the audit)
FILES = [
    "src/components/public/PublicFooter.tsx",
    "src/pages/public/components/WhyChooseUs.tsx",
    "src/pages/public/AboutCTA.tsx",
    "src/components/public/MasarSection.tsx",
    "src/features/dashboard/components/ModernAnnouncements.tsx",
    "src/pages/public/Courses.tsx",
    "src/pages/public/Home.tsx",
    "src/pages/public/components/HeroSection.tsx",
    "src/pages/public/components/Testimonials.tsx",
    "src/pages/Leads.tsx",
    "src/pages/ParentDashboard.tsx",
    "src/pages/TrialSessions.tsx",
]

REPLACEMENTS = [
    # Primary accent: #D4AF37 (gold) - with and without opacity
    (r'\[#D4AF37\]/(\d+)', r'primary/\1'),
    (r'\[#D4AF37\]', 'primary'),
    
    # Gold dark variant: #b8960e, #b8962e
    (r'\[#b8960e\]', 'primary'),
    (r'\[#b8962e\]', 'primary'),
    
    # Warning: #f59e0b, #facc15
    (r'\[#f59e0b\]', 'warning'),
    (r'\[#facc15\]', 'warning'),
    
    # Light gold text: #F8F1D2, #f3d368
    (r'\[#F8F1D2\]', 'primary'),
    (r'\[#f3d368\]', 'primary'),
    
    # Surface/Card backgrounds
    (r'\[#0a0a0c\]', 'card'),
    (r'\[#0d0d0f\]', 'card'),
    (r'\[#09090b\]', 'card'),
    (r'\[#1a1a1e\]', 'surface'),
    (r'\[#1a1a1a\]', 'surface'),
    (r'\[#121215\]', 'surface'),
    
    # Named colors -> semantic
    (r'dark:bg-zinc-600', 'dark:bg-surface'),
    (r'dark:text-white', 'dark:text-main'),
    (r'dark:hover:text-white', 'dark:hover:text-main'),
    (r'dark:text-black', 'dark:text-on-primary'),
    
    # Specific: #34d399 (emerald-400) -> success
    (r'\[#34d399\]', 'success'),
    
    # Specific: #6366f1, #7c3aed, #a855f7 -> primary
    (r'\[#6366f1\]', 'primary'),
    (r'\[#7c3aed\]', 'primary'),
    (r'\[#a855f7\]', 'primary'),
    
    # Non-dark mode old hex (shouldn't exist but just in case)
    (r'from-\[#D4AF37\]', 'from-primary'),
    (r'to-\[#D4AF37\]', 'to-primary'),
    (r'from-\[#f59e0b\]', 'from-warning'),
    (r'to-\[#f59e0b\]', 'to-warning'),
    (r'from-\[#0d0d0f\]', 'from-card'),
    (r'to-\[#0d0d0f\]', 'to-card'),
    (r'via-\[#0d0d0f\]', 'via-card'),
    (r'from-\[#1a1a1e\]', 'from-surface'),
    (r'to-\[#1a1a1e\]', 'to-surface'),
    (r'via-\[#1a1a1e\]', 'via-surface'),
    (r'from-\[#1a1a1a\]', 'from-surface'),
    (r'to-\[#1a1a1a\]', 'to-surface'),
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
