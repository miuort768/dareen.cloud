param([string]$Folder = "src")
$script:updated = 0
function Process-File {
    param([string]$Path)
    $c = Get-Content -Path $Path -Raw
    $o = $c

    # ---- CORRECT RTL MAPPING ----
    # In RTL: physical left = logical end, physical right = logical start

    # Positioning: left → end, right → start
    $c = $c -replace '\bleft-(1/2|1/3|2/3|1/4|3/4)\b', 'end-$1'
    $c = $c -replace '\bleft-(\d+(?:\.\d+)?)\b', 'end-$1'
    $c = $c -replace '\bleft-(auto|full|px)\b', 'end-$1'
    $c = $c -replace '\bright-(1/2|1/3|2/3|1/4|3/4)\b', 'start-$1'
    $c = $c -replace '\bright-(\d+(?:\.\d+)?)\b', 'start-$1'
    $c = $c -replace '\bright-(auto|full|px)\b', 'start-$1'

    # Negative positioning
    $c = $c -replace '\b-left-(1/2|1/3|2/3|1/4|3/4)\b', '-end-$1'
    $c = $c -replace '\b-left-(\d+(?:\.\d+)?)\b', '-end-$1'
    $c = $c -replace '\b-left-(full|px)\b', '-end-$1'
    $c = $c -replace '\b-right-(1/2|1/3|2/3|1/4|3/4)\b', '-start-$1'
    $c = $c -replace '\b-right-(\d+(?:\.\d+)?)\b', '-start-$1'
    $c = $c -replace '\b-right-(full|px)\b', '-start-$1'

    # Text-align: left → end, right → start
    $c = $c -replace '\btext-left\b', 'text-end'
    $c = $c -replace '\btext-right\b', 'text-start'

    # Padding: pl → pe, pr → ps
    $c = $c -replace '\bpl-(\d+(?:\.\d+)?)\b', 'pe-$1'
    $c = $c -replace '\bpr-(\d+(?:\.\d+)?)\b', 'ps-$1'

    # Borders: border-l → border-e, border-r → border-s
    $c = $c -replace '\bborder-l-(\w)', 'border-e-$1'
    $c = $c -replace '\bborder-l([^-\w])', 'border-e$1'
    $c = $c -replace '\bborder-r-(\w)', 'border-s-$1'
    $c = $c -replace '\bborder-r([^-\w])', 'border-s$1'

    # Rounded: rounded-l → rounded-e, rounded-r → rounded-s
    $c = $c -replace '\brounded-l-(\w)', 'rounded-e-$1'
    $c = $c -replace '\brounded-r-(\w)', 'rounded-s-$1'

    if ($c -ne $o) {
        Set-Content -Path $Path -Value $c -NoNewline
        Write-Host $Path
        $script:updated += 1
    }
}
Write-Host "RTL fix v2 (correct mapping for RTL)..."
$files = Get-ChildItem -Path $Folder -Recurse -Include "*.tsx","*.ts" | Where-Object {
    $_.FullName -notmatch '\\node_modules\\'
}
foreach ($f in $files) { Process-File -Path $f.FullName }
Write-Host "Files changed: $($script:updated)"
