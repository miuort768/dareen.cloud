param([string]$Folder = "src")

# Mapping: ml/mr → ms/me for RTL-aware logical margins
# ml-* (margin-left) → me-* (margin-inline-end → in LTR=margin-right, RTL=margin-left)
# mr-* (margin-right) → ms-* (margin-inline-start → in LTR=margin-left, RTL=margin-right)

function Process-File {
    param([string]$Path)
    $c = Get-Content -Path $Path -Raw
    $original = $c
    $total = 0

    # Phase 1: Negative margins (-ml-* / -mr-*)
    # These need replacement BEFORE positive to avoid partial matching
    $c = [regex]::Replace($c, '(?<=[\s"])-ml-(\d+(?:\.\d+)?|px)\b', '-me-$1')
    $c = [regex]::Replace($c, '(?<=[\s"])-mr-(\d+(?:\.\d+)?|px)\b', '-ms-$1')

    # Phase 2: Positive margins (ml-* / mr-*)
    $c = [regex]::Replace($c, '\bml-(\d+(?:\.\d+)?|auto|px)\b', 'me-$1')
    $c = [regex]::Replace($c, '\bmr-(\d+(?:\.\d+)?|auto|px)\b', 'ms-$1')

    if ($c -ne $original) {
        Set-Content -Path $Path -Value $c -NoNewline
        $diff = [regex]::Matches($c, '\bms-\d|me-\d').Count - [regex]::Matches($original, '\bms-\d|me-\d').Count
        Write-Host "  Fixed: $Path ($diff replacements)"
    }
    return $total
}

Write-Host "Processing folder: $Folder"
$files = Get-ChildItem -Path $Folder -Recurse -Include "*.tsx","*.ts","*.jsx" | Where-Object {
    $_.FullName -notmatch '\\node_modules\\'
}
$grand = 0
foreach ($f in $files) {
    $grand += Process-File -Path $f.FullName
}
Write-Host "Done! Processed files."
