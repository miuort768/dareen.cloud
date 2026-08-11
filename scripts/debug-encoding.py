#!/usr/bin/env python3
"""Debug: check what's happening with string matching."""
import re, os, subprocess

def git_show(ref, filepath):
    try:
        r = subprocess.run(["git", "show", f"{ref}:{filepath}"], capture_output=True)
        return r.stdout.decode('utf-8') if r.returncode == 0 else None
    except:
        return None

filepath = "src/pages/public/components/AppDownloadSection.tsx"
with open(filepath, "r", encoding="utf-8", errors="replace") as f:
    content = f.read()

old = git_show("79e84cf~1", filepath)
if not old:
    print("No old version")
    exit()

# Find corrupted strings - use raw string to avoid PowerShell issues
corrupted = []
pat = r'"([^"]*)"'
for m in re.finditer(pat, content):
    val = m.group(1)
    if "\ufffd" in val:
        corrupted.append(val)

old_strings = []
for m in re.finditer(pat, old):
    val = m.group(1)
    if re.search(r"[\u0600-\u06FF]", val):
        old_strings.append(val)

print(f"Corrupted strings ({len(corrupted)}):")
for s in corrupted[:5]:
    print(f"  [{repr(s)}]")

print(f"Old Arabic strings ({len(old_strings)}):")
for s in old_strings[:5]:
    print(f"  [{repr(s)}]")

if corrupted and old_strings:
    cs = corrupted[0]
    c_skeleton = re.sub(r"[\u0600-\u06FF\ufffd]+", "X", cs)
    print(f"Corrupted skeleton: {repr(c_skeleton)}")
    for os_item in old_strings[:3]:
        o_skeleton = re.sub(r"[\u0600-\u06FF]+", "X", os_item)
        print(f"Old skeleton:       {repr(o_skeleton)} match={c_skeleton == o_skeleton}")
