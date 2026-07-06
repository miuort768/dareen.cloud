param([string]$Folder = "src")

function Process-File {
    param([string]$Path)
    $c = Get-Content -Path $Path -Raw
    $original = $c

    # border-l-{anything} → border-s-{anything}
    $c = $c -replace '\bborder-l-(\w)', 'border-s-$1'

    # border-l (standalone, not followed by letter or digit) → border-s
    $c = $c -replace '\bborder-l([^-\w])', 'border-s$1'

    # border-r-{anything} → border-e-{anything}
    $c = $c -replace '\bborder-r-(\w)', 'border-e-$1'

    # border-r (standalone) → border-e
    $c = $c -replace '\bborder-r([^-\w])', 'border-e$1'

    # rounded-l-{anything} → rounded-s-{anything}
    $c = $c -replace '\brounded-l-(\w)', 'rounded-s-$1'

    # rounded-r-{anything} → rounded-e-{anything}
    $c = $c -replace '\brounded-r-(\w)', 'rounded-e-$1'

    if ($c -ne $original) {
        Set-Content -Path $Path -Value $c -NoNewline
        Write-Host "  Fixed: $Path"
    }
}

Write-Host "Processing RTL border fixes (border-l/r → border-s/e)..."
$files = Get-ChildItem -Path $Folder -Recurse -Include "*.tsx","*.ts","*.jsx" | Where-Object {
    $_.FullName -notmatch '\\node_modules\\'
}
$count = 0
foreach ($f in $files) {
    $content = Get-Content -Path $f.FullName -Raw
    if ($content -match '\bborder-l[^-\w]|\bborder-l-\w|\bborder-r[^-\w]|\bborder-r-\w|\brounded-l-\w|\brounded-r-\w') {
        Process-File -Path $f.FullName
        $count++
    }
}
Write-Host "Done! $count files updated."
