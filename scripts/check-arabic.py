import os, glob

issues = []
for f in glob.glob('src/**/*.tsx', recursive=True) + glob.glob('src/**/*.ts', recursive=True):
    if 'node_modules' in f or 'scripts' in f:
        continue
    raw = open(f, 'rb').read()
    if b'\xef\xbf\xbd' in raw:
        issues.append(f'U+FFFD in {f}')
    try:
        content = raw.decode('utf-8')
    except:
        issues.append(f'Not UTF-8: {f}')

if issues:
    for i in issues:
        print(i)
else:
    print('All files clean')
