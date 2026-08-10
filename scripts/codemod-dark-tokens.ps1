<#
.SYNOPSIS
    Replaces hardcoded dark mode colors with semantic tokens.
.DESCRIPTION
    Phase 2 of the Dark Mode audit: batch-replace dark:bg-[#xxx], dark:text-[#xxx],
    dark:border-[#xxx], text-zinc-*, dark:text-white with semantic Tailwind tokens.
.PARAMETER Folder
    Target folder to process (default: src/)
.EXAMPLE
    .\scripts\codemod-dark-tokens.ps1 -Folder "src/pages"
#>
param(
    [string]$Folder = "src"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$target = Join-Path $root $Folder

# ── Replacement map: old → new ──
$replacements = @(
    # backgrounds
    @{ Old = 'dark:bg-[#0d0d0f]';    New = 'dark:bg-card' }
    @{ Old = 'dark:bg-[#0a0a0c]';    New = 'dark:bg-surface' }
    @{ Old = 'dark:bg-[#1a1a1e]';    New = 'dark:bg-hover' }

    # text colors
    @{ Old = 'dark:text-[#D4AF37]';  New = 'dark:text-primary' }
    @{ Old = 'dark:text-white';       New = 'dark:text-main' }

    # border colors
    @{ Old = 'dark:border-[#D4AF37]/20'; New = 'dark:border-primary/20' }
    @{ Old = 'dark:border-[#D4AF37]/15'; New = 'dark:border-primary/15' }
    @{ Old = 'dark:border-[#D4AF37]/10'; New = 'dark:border-primary/10' }
    @{ Old = 'dark:border-[#D4AF37]/40'; New = 'dark:border-primary/40' }
    @{ Old = 'dark:border-[#D4AF37]';    New = 'dark:border-primary' }

    # hover backgrounds
    @{ Old = 'dark:hover:bg-[#D4AF37]/10'; New = 'dark:hover:bg-primary/10' }
    @{ Old = 'dark:hover:bg-[#D4AF37]/5';  New = 'dark:hover:bg-primary/5' }
    @{ Old = 'dark:hover:bg-[#D4AF37]/15'; New = 'dark:hover:bg-primary/15' }

    # bg with opacity
    @{ Old = 'dark:bg-[#D4AF37]/15'; New = 'dark:bg-primary/15' }
    @{ Old = 'dark:bg-[#D4AF37]/10'; New = 'dark:bg-primary/10' }
    @{ Old = 'dark:bg-[#D4AF37]/5';  New = 'dark:bg-primary/5' }
    @{ Old = 'dark:bg-[#D4AF37]/20'; New = 'dark:bg-primary/20' }

    # gradient from/to/via
    @{ Old = 'dark:from-[#D4AF37]';       New = 'dark:from-primary' }
    @{ Old = 'dark:via-[#b8962e]';        New = 'dark:via-primary-deep' }
    @{ Old = 'dark:to-[#0d0d0f]';         New = 'dark:to-card' }
    @{ Old = 'dark:to-[#0a0a0c]';         New = 'dark:to-surface' }
    @{ Old = 'dark:from-[#D4AF37]/10';    New = 'dark:from-primary/10' }
    @{ Old = 'dark:from-[#D4AF37]/[0.05]'; New = 'dark:from-primary/[0.05]' }
    @{ Old = 'dark:via-[#D4AF37]/[0.03]';  New = 'dark:via-primary/[0.03]' }
    @{ Old = 'dark:via-[#D4AF37]/[0.02]';  New = 'dark:via-primary/[0.02]' }
    @{ Old = 'dark:via-[#D4AF37]/10';      New = 'dark:via-primary/10' }

    # stroke/fill (SVG)
    @{ Old = 'dark:stroke-[#D4AF37]/20'; New = 'dark:stroke-primary/20' }
    @{ Old = 'dark:stroke-[#D4AF37]';    New = 'dark:stroke-primary' }
    @{ Old = 'dark:fill-[#D4AF37]';      New = 'dark:fill-primary' }

    # shadow/ring
    @{ Old = 'dark:shadow-[#D4AF37]/20'; New = 'dark:shadow-primary/20' }
    @{ Old = 'dark:ring-[#D4AF37]/30';   New = 'dark:ring-primary/30' }

    # Tailwind named colors → semantic tokens
    @{ Old = 'text-zinc-400';  New = 'text-muted' }
    @{ Old = 'text-zinc-500';  New = 'text-dim' }
    @{ Old = 'text-zinc-300';  New = 'text-muted' }
    @{ Old = 'dark:text-zinc-400'; New = 'dark:text-muted' }
    @{ Old = 'dark:text-zinc-500'; New = 'dark:text-dim' }
    @{ Old = 'dark:text-zinc-300'; New = 'dark:text-muted' }
)

$files = Get-ChildItem -Path $target -Recurse -Include "*.tsx","*.ts" -File
$totalReplacements = 0
$filesModified = 0

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    $fileReplacements = 0

    foreach ($r in $replacements) {
        $count = ([regex]::Matches($content, [regex]::Escape($r.Old))).Count
        if ($count -gt 0) {
            $content = $content.Replace($r.Old, $r.New)
            $fileReplacements += $count
        }
    }

    if ($fileReplacements -gt 0) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        $totalReplacements += $fileReplacements
        $filesModified++
        Write-Host "  $($file.Name) — $fileReplacements replacements" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Codemod Complete" -ForegroundColor Cyan
Write-Host "  Files modified: $filesModified" -ForegroundColor White
Write-Host "  Total replacements: $totalReplacements" -ForegroundColor White
Write-Host "==========================================" -ForegroundColor Cyan
