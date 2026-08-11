# Fix corrupted Arabic text by restoring from pre-codemod commit
# while keeping CSS token changes from current version

$parentCommit = "79e84cf~1"
$commit = "79e84cf"

$changedFiles = git show $commit --name-only --diff-filter=M -- "*.tsx" "*.ts" 2>$null | 
    Where-Object { $_ -match '\.(tsx|ts)$' -and $_ -notmatch 'codemod' -and $_ -notmatch 'scripts/' -and $_ -notmatch '\.css$' -and $_ -notmatch 'tailwind' -and $_ -notmatch 'index\.css' }

$fixed = 0
$skipped = 0

foreach ($file in $changedFiles) {
    if (-not (Test-Path $file)) { continue }
    
    $currentContent = Get-Content $file -Raw -Encoding UTF8
    if ($currentContent -notmatch '�') { $skipped++; continue }
    
    $oldContent = git show "${parentCommit}:${file}" 2>$null
    if (-not $oldContent) { continue }
    
    $oldHasArabic = $false
    foreach ($line in ($oldContent -split "`n")) {
        if ($line -match '[\u0600-\u06FF]') { $oldHasArabic = $true; break }
    }
    if (-not $oldHasArabic) { $skipped++; continue }
    
    # Strategy: For each line in current that has corruption, find the matching old line
    # by comparing non-corrupted parts, then use old line's Arabic text
    $currentLines = $currentContent -split "`n"
    $oldLines = $oldContent -split "`n"
    
    $fixedLines = @()
    $fixedLineCount = 0
    
    foreach ($currentLine in $currentLines) {
        if ($currentLine -notmatch '�') {
            $fixedLines += $currentLine
            continue
        }
        
        # This line has corruption - find best match in old lines
        # Strip corrupted parts to get the "skeleton"
        $skeleton = $currentLine -replace '�+', '???'
        
        $bestMatch = $null
        $bestScore = -1
        
        foreach ($oldLine in $oldLines) {
            if ($oldLine -notmatch '[\u0600-\u06FF]') { continue }
            
            # Compare by checking non-Arabic parts match
            $oldSkeleton = $oldLine -replace '[\u0600-\u06FF\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]+', '???'
            
            if ($oldSkeleton -eq $skeleton) {
                # Perfect skeleton match
                $bestMatch = $oldLine
                break
            }
        }
        
        if ($bestMatch) {
            $fixedLines += $bestMatch
            $fixedLineCount++
        } else {
            $fixedLines += $currentLine
        }
    }
    
    if ($fixedLineCount -gt 0) {
        $newContent = $fixedLines -join "`n"
        [System.IO.File]::WriteAllText($file, $newContent, [System.Text.UTF8Encoding]::new($false))
        Write-Output "FIXED ($fixedLineCount lines): $file"
        $fixed++
    } else {
        Write-Output "SKIP (no matches): $file"
        $skipped++
    }
}

Write-Output "`n=== Summary ==="
Write-Output "Fixed: $fixed"
Write-Output "Skipped: $skipped"
