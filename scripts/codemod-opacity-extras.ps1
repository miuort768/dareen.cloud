# Extra passes: broken shadow colors, border/chart/divider opacity, whitespace cleanup
# Uses .NET IO (UTF-8 safe) exclusively.
param([switch]$DryRun)

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$files = Get-ChildItem -Path 'src' -Recurse -Include *.tsx, *.ts |
  Where-Object { $_.FullName -notmatch '\\theme\\|\\styles\\' }

$script:total = 0

# --- Pass A: remove shadow-{var-token}/N (never emitted; primary/white/gold kept) ---
$rxShadow = '(?<![\w/-])((?:(?:hover|focus|dark|group-hover):)?)(shadow)-(success|error|warning|info|accent|card|surface|background|muted|dim|inverse|divider)/\d+'

# --- Pass B: border/bg/divide/ring/text on var tokens with /N ---
$rxBorder = '(?<![\w/-])((?:(?:hover|focus|dark|group-hover|placeholder|disabled|sm|md|lg|xl|2xl):)*)(border|bg|divide|ring|text)-(border(?:-strong)?|chart-[1-6]|focus|page)/(\d+)'
$script:nB = 0
function Convert-Border {
  param($m)
  $v = $m.Groups[1].Value; $u = $m.Groups[2].Value; $tk = $m.Groups[3].Value; $A = [int]$m.Groups[4].Value
  $script:nB++
  if ($tk -like 'chart-*') { return '' }
  if ($u -in @('border', 'divide', 'ring')) { if ($A -le 45) { return "${v}$u-divider" } return "${v}$u-$tk" }
  if ($u -eq 'bg') { if ($tk -eq 'border') { return "${v}bg-divider" } return "${v}bg-$tk" }
  return "${v}$u-$tk"
}

# --- Pass C: collapse whitespace artifacts inside className-ish lines ---
function Clean-Content([string]$c) {
  $lines = $c -split "`n", -1
  for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'className|class=|cn\(') {
      $lines[$i] = [regex]::Replace($lines[$i], '([\w\]\)]) +(["''])', '$1$2')
      $lines[$i] = [regex]::Replace($lines[$i], '(["'']) +([\w$])', '$1$2')
      $lines[$i] = [regex]::Replace($lines[$i], '([\w\]\)-]) {2,}(?=[\w\]\)-])', ' ')
    }
  }
  return $lines -join "`n"
}

foreach ($f in $files) {
  $c = [IO.File]::ReadAllText($f.FullName, [Text.Encoding]::UTF8)
  $orig = $c

  $c = [regex]::Replace($c, $rxShadow, '')

  $script:nB = 0
  $ev = [System.Text.RegularExpressions.MatchEvaluator] { param($m) Convert-Border $m }
  $c = [regex]::Replace($c, $rxBorder, $ev)

  $c = Clean-Content $c

  if ($c -ne $orig) {
    $changed = if (-not $DryRun) { [IO.File]::WriteAllText($f.FullName, $c, $utf8NoBom) } else { $null }
    Write-Host ("{0}: border/chart fixes={1}" -f $f.Name, $script:nB) -ForegroundColor Cyan
    $script:total += $script:nB
  }
}
Write-Host ("EXTRAS DONE: {0} class fixes{1}" -f $script:total, $(if ($DryRun) { ' (DRY RUN)' }))
