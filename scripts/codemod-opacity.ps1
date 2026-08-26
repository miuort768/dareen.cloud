# Codemod: remove/replace Tailwind opacity modifiers applied to tokens
# that are defined as plain var(--*) without <alpha-value> support.
# These utilities currently generate NO CSS (silently broken).
# Usage: .\scripts\codemod-opacity.ps1 [-DryRun]

param([switch]$DryRun)

$statuses = @('success', 'error', 'warning', 'info')
$pattern = '(?<![\w/-])(?<vars>(?:(?:hover|focus|dark|group-hover|placeholder|disabled|sm|md|lg|xl|2xl):)*)(?<util>bg|text|border|ring|from|to|via|fill|divide)-(?<token>(?:success|error|warning|info)(?:-(?:soft|light|dark|hover|active))?|surface|card|background|main|muted|dim|inverse|accent(?:-(?:hover|soft|light))?|on-(?:primary|success|warning|error|info)|primary-(?:deep|hover|active|soft|light|200|400)|divider|hover)/(?<alpha>\d+)(?![\w/-])'

function Convert-Token {
  param([string]$Vars, [string]$Util, [string]$Token, [int]$A)

  if ($Token -match '^on-(primary|success|warning|error|info)$') {
    switch ($Util) {
      'text'   { return "text-white/$A" }
      'bg'     { return "bg-white/$A" }
      'border' { return "border-white/$A" }
      'from'   { return "from-white/$A" }
      'via'    { return "via-white/$A" }
      'to'     { return "to-white/$A" }
      default  { return "$Vars$Util-$Token" }
    }
  }

  if ($statuses -contains $Token) {
    switch ($Util) {
      'bg' {
        $isHover = $Vars -match 'hover:'
        if (($isHover -and $A -ge 20) -or ($A -ge 40)) { return "${Vars}bg-$Token" }
        return "${Vars}bg-$Token-soft"
      }
      { $_ -in @('from', 'to', 'via') } {
        if ($A -ge 50) { return "${Vars}$Util-$Token" }
        if ($A -ge 15) { return "${Vars}$Util-$Token-soft" }
        if ($Util -eq 'from') { return "${Vars}from-$Token-soft" }
        return "${Vars}$Util-transparent"
      }
      { $_ -in @('border', 'ring', 'divide', 'fill') } {
        if ($A -ge 40) { return "${Vars}$Util-$Token" }
        return "${Vars}$Util-$Token-soft"
      }
      default { return "${Vars}$Util-$Token" }
    }
  }

  if (($Token -match '^(?:success|error|warning|info)-(?:soft|light|dark|hover|active)$') -or
      ($Token -match '^primary-(?:deep|hover|active|soft|light|200|400)$')) {
    return "${Vars}$Util-$Token"
  }

  if ($Token -in @('card', 'surface', 'background', 'dim', 'inverse', 'divider', 'hover')) {
    return "${Vars}$Util-$Token"
  }

  if ($Token -eq 'muted') {
    if ($Util -eq 'text' -and $Vars.Contains('placeholder:')) {
      $v = $Vars.Replace('placeholder:', '')
      return "${v}text-dim"
    }
    if ($Util -eq 'text') { return "${Vars}text-muted" }
    if ($Util -eq 'bg') { return "${Vars}bg-hover" }
    return "${Vars}$Util-muted"
  }

  if ($Token -eq 'main') {
    if ($Util -eq 'text') {
      if ($A -ge 60) { return "${Vars}text-main" }
      if ($Vars.Contains('dark:')) { return 'dark:text-muted' }
      return 'text-muted'
    }
    if ($Util -eq 'bg') { return "${Vars}bg-hover" }
    return "${Vars}$Util-main"
  }

  if ($Token -like 'accent*') {
    if ($Token -ne 'accent') { return "${Vars}$Util-$Token" }
    switch ($Util) {
      'bg' {
        if ($A -le 30) { return "${Vars}bg-accent-soft" }
        return "${Vars}bg-accent"
      }
      { $_ -in @('border', 'ring') } {
        if ($A -ge 40) { return "${Vars}$Util-accent" }
        return "${Vars}$Util-accent-soft"
      }
      { $_ -in @('from', 'to', 'via') } {
        if ($A -ge 50) { return "${Vars}$Util-accent" }
        if ($A -ge 15) { return "${Vars}$Util-accent-soft" }
        return "${Vars}$Util-transparent"
      }
      default { return "${Vars}$Util-accent" }
    }
  }

  return "${Vars}$Util-$Token/$A"
}

$files = Get-ChildItem -Path 'src' -Recurse -Include *.tsx, *.ts |
  Where-Object { $_.FullName -notmatch '\\theme\\|\\styles\\' }

$script:total = 0
$touched = 0
foreach ($f in $files) {
  $content = [IO.File]::ReadAllText($f.FullName, [Text.Encoding]::UTF8)
  $script:count = 0
  $evaluator = [System.Text.RegularExpressions.MatchEvaluator] {
    param($m)
    $script:count++
    $lineNo = ($content.Substring(0, $m.Index) -split "`n").Count
    $replacement = Convert-Token $m.Groups['vars'].Value $m.Groups['util'].Value $m.Groups['token'].Value ([int]$m.Groups['alpha'].Value)
    Write-Host ("  line {0}: {1} -> {2}" -f $lineNo, $m.Value, $replacement)
    return $replacement
  }
  $newContent = [regex]::Replace($content, $pattern, $evaluator)
  if ($script:count -gt 0) {
    $total += $script:count
    $touched++
    Write-Host ("{0}: {1} replacements" -f $f.FullName.Replace((Get-Location).Path + '\', ''), $script:count) -ForegroundColor Cyan
    if (-not $DryRun) {
      $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
      [IO.File]::WriteAllText($f.FullName, $newContent, $utf8NoBom)
    }
  }
}
Write-Host ("DONE: {0} replacements across {1} files{2}" -f $total, $touched, $(if ($DryRun) { ' (DRY RUN)' }))
