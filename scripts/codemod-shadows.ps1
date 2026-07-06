param([string]$Folder = "src")

function Process-File {
    param([string]$Path)
    $c = Get-Content -Path $Path -Raw
    $original = $c

    # Retro pixel shadows: replace #000 with rgba(0,0,0,1)
    $c = $c -replace 'shadow-\[(\d+px_\d+px_0px_0px_)#000\]', 'shadow-[$1rgba(0,0,0,1)]'

    # Variant: 1px_1px_0_#000 (no px on the 0)
    $c = $c -replace 'shadow-\[(\d+px_\d+px_0_)#000\]', 'shadow-[$1rgba(0,0,0,1)]'

    # Named color black in pixel shadows
    $c = $c -replace 'shadow-\[(\d+px_\d+px_0px_0px_)black\]', 'shadow-[$1rgba(0,0,0,1)]'
    $c = $c -replace 'shadow-\[(\d+px_\d+px_0_)black\]', 'shadow-[$1rgba(0,0,0,1)]'

    if ($c -ne $original) {
        Set-Content -Path $Path -Value $c -NoNewline
        Write-Host "  Fixed: $Path"
    }
}

Write-Host "Processing shadow-[*] fixes (HEX + named color cleanup)..."
$files = Get-ChildItem -Path $Folder -Recurse -Include "*.tsx","*.ts","*.jsx" | Where-Object {
    $_.FullName -notmatch '\\node_modules\\'
}
foreach ($f in $files) {
    Process-File -Path $f.FullName
}
Write-Host "Done!"
