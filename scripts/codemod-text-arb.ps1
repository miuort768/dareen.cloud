param([string]$Folder = "src")

$textMap = @{
    'text-[10px]' = 'text-micro'
    'text-[9px]' = 'text-micro'
    'text-[8px]' = 'text-micro'
    'text-[7px]' = 'text-micro'
    'text-[11px]' = 'text-xs'
    'text-[12px]' = 'text-xs'
    'text-[12.5px]' = 'text-xs'
    'text-[13px]' = 'text-sm'
    'text-[14px]' = 'text-sm'
    'text-[14.2px]' = 'text-sm'
    'text-[15px]' = 'text-button'
    'text-[17px]' = 'text-base'
    'text-[18px]' = 'text-lg'
    'text-[22px]' = 'text-xl'
    'text-[26px]' = 'text-2xl'
}

function Process-File {
    param([string]$Path)
    $c = Get-Content -Path $Path -Raw
    $original = $c
    $total = 0

    $textMap.Keys | Sort-Object Length -Descending | ForEach-Object {
        $old = $_
        $new = $textMap[$_]
        $count = [regex]::Matches($c, [regex]::Escape($old)).Count
        if ($count -gt 0) {
            $c = $c -replace [regex]::Escape($old), $new
            $total += $count
        }
    }

    if ($c -ne $original) {
        Set-Content -Path $Path -Value $c -NoNewline
        Write-Host "  Fixed: $Path ($total replacements)"
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
Write-Host "Done! Total replacements: $grand"
