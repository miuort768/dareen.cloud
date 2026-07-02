param([string]$Folder = "src/shared")

$semanticMap = @{
    # === INDIGO → primary ===
    'bg-indigo-50' = 'bg-primary-soft'
    'bg-indigo-100' = 'bg-primary-light'
    'bg-indigo-500' = 'bg-primary'
    'bg-indigo-600' = 'bg-primary'
    'bg-indigo-700' = 'bg-primary-hover'
    'bg-indigo-900' = 'bg-primary-active'
    'bg-indigo-950' = 'bg-primary-active'
    'text-indigo-400' = 'text-primary'
    'text-indigo-500' = 'text-primary'
    'text-indigo-600' = 'text-primary'
    'text-indigo-700' = 'text-primary'
    'text-indigo-800' = 'text-primary'
    'border-indigo-200' = 'border-primary'
    'border-indigo-300' = 'border-primary'
    'border-indigo-400' = 'border-primary'
    'border-indigo-500' = 'border-primary'
    'border-indigo-600' = 'border-primary'
    'hover:bg-indigo-50' = 'hover:bg-primary-soft'
    'hover:bg-indigo-100' = 'hover:bg-primary-light'
    'hover:bg-indigo-600' = 'hover:bg-primary'
    'hover:bg-indigo-700' = 'hover:bg-primary-hover'
    'hover:text-indigo-600' = 'hover:text-primary'
    'hover:text-indigo-700' = 'hover:text-primary'
    'hover:border-indigo-300' = 'hover:border-primary'
    'hover:border-indigo-500' = 'hover:border-primary'
    'active:bg-indigo-700' = 'active:bg-primary-active'
    'focus:border-indigo-500' = 'focus:border-primary'
    'focus:ring-indigo-500' = 'focus:ring-primary'
    'group-hover:text-indigo-600' = 'group-hover:text-primary'
    'ring-indigo-500' = 'ring-primary'
    'divide-indigo-200' = 'divide-primary'
    'from-indigo-500' = 'from-[var(--bg-primary)]'
    'from-indigo-600' = 'from-[var(--bg-primary)]'
    'via-indigo-500' = 'via-[var(--bg-primary)]'
    'to-indigo-600' = 'to-[var(--bg-primary)]'
    'to-indigo-700' = 'to-[var(--bg-primary)]'
    'to-indigo-900' = 'to-[var(--bg-primary)]'
    'to-indigo-950' = 'to-[var(--bg-primary)]'

    # === VIOLET → primary (secondary shade) ===
    'bg-violet-50' = 'bg-primary-soft'
    'bg-violet-100' = 'bg-primary-light'
    'bg-violet-500' = 'bg-primary'
    'bg-violet-600' = 'bg-primary'
    'bg-violet-700' = 'bg-primary-hover'
    'text-violet-500' = 'text-primary'
    'text-violet-600' = 'text-primary'
    'text-violet-700' = 'text-primary'
    'border-violet-500' = 'border-primary'
    'border-violet-600' = 'border-primary'
    'hover:bg-violet-600' = 'hover:bg-primary'
    'hover:bg-violet-700' = 'hover:bg-primary-hover'
    'focus:ring-violet-500' = 'focus:ring-primary'

    # === BLUE → info / primary ===
    'bg-blue-50' = 'bg-info-light'
    'bg-blue-100' = 'bg-info-light'
    'bg-blue-500' = 'bg-info'
    'bg-blue-600' = 'bg-info'
    'bg-blue-700' = 'bg-primary-hover'
    'text-blue-500' = 'text-info'
    'text-blue-600' = 'text-info'
    'text-blue-700' = 'text-info'
    'text-blue-800' = 'text-info'
    'border-blue-200' = 'border-info'
    'border-blue-300' = 'border-info'
    'border-blue-400' = 'border-info'
    'border-blue-500' = 'border-info'
    'hover:bg-blue-500' = 'hover:bg-info'
    'hover:bg-blue-600' = 'hover:bg-info'
    'hover:bg-blue-700' = 'hover:bg-primary-hover'
    'hover:text-blue-600' = 'hover:text-info'
    'focus:border-blue-500' = 'focus:border-info'
    'focus:ring-blue-500' = 'focus:ring-info'
    'group-hover:text-blue-600' = 'group-hover:text-info'

    # === EMERALD → success ===
    'bg-emerald-50' = 'bg-success-light'
    'bg-emerald-100' = 'bg-success-light'
    'bg-emerald-400' = 'bg-success'
    'bg-emerald-500' = 'bg-success'
    'bg-emerald-600' = 'bg-success'
    'bg-emerald-700' = 'bg-success'
    'text-emerald-400' = 'text-success'
    'text-emerald-500' = 'text-success'
    'text-emerald-600' = 'text-success'
    'text-emerald-700' = 'text-success'
    'border-emerald-200' = 'border-success'
    'border-emerald-300' = 'border-success'
    'border-emerald-400' = 'border-success'
    'border-emerald-500' = 'border-success'
    'border-emerald-600' = 'border-success'
    'hover:bg-emerald-500' = 'hover:bg-success'
    'hover:bg-emerald-600' = 'hover:bg-success'
    'hover:text-emerald-600' = 'hover:text-success'
    'focus:ring-emerald-500' = 'focus:ring-success'
    'from-emerald-400' = 'from-[var(--bg-success)]'
    'from-emerald-500' = 'from-[var(--bg-success)]'
    'to-emerald-600' = 'to-[var(--bg-success)]'
    'to-emerald-700' = 'to-[var(--bg-success)]'

    # === GREEN → success (generic) ===
    'bg-green-50' = 'bg-success-light'
    'bg-green-100' = 'bg-success-light'
    'bg-green-400' = 'bg-success'
    'bg-green-500' = 'bg-success'
    'bg-green-600' = 'bg-success'
    'text-green-400' = 'text-success'
    'text-green-500' = 'text-success'
    'text-green-600' = 'text-success'
    'text-green-700' = 'text-success'
    'border-green-400' = 'border-success'
    'border-green-500' = 'border-success'
    'hover:bg-green-500' = 'hover:bg-success'
    'hover:bg-green-600' = 'hover:bg-success'

    # === ROSE → error ===
    'bg-rose-50' = 'bg-error-light'
    'bg-rose-100' = 'bg-error-light'
    'bg-rose-400' = 'bg-error'
    'bg-rose-500' = 'bg-error'
    'bg-rose-600' = 'bg-error'
    'text-rose-400' = 'text-error'
    'text-rose-500' = 'text-error'
    'text-rose-600' = 'text-error'
    'border-rose-200' = 'border-error'
    'border-rose-300' = 'border-error'
    'border-rose-400' = 'border-error'
    'border-rose-500' = 'border-error'
    'hover:bg-rose-500' = 'hover:bg-error'
    'hover:bg-rose-600' = 'hover:bg-error'
    'hover:border-rose-300' = 'hover:border-error'
    'hover:text-rose-600' = 'hover:text-error'
    'focus:ring-rose-500' = 'focus:ring-error'
    'from-rose-400' = 'from-[var(--bg-error)]'
    'from-rose-500' = 'from-[var(--bg-error)]'
    'to-rose-600' = 'to-[var(--bg-error)]'

    # === RED → error ===
    'bg-red-50' = 'bg-error-light'
    'bg-red-100' = 'bg-error-light'
    'bg-red-400' = 'bg-error'
    'bg-red-500' = 'bg-error'
    'bg-red-600' = 'bg-error'
    'text-red-400' = 'text-error'
    'text-red-500' = 'text-error'
    'text-red-600' = 'text-error'
    'text-red-700' = 'text-error'
    'border-red-200' = 'border-error'
    'border-red-300' = 'border-error'
    'border-red-400' = 'border-error'
    'border-red-500' = 'border-error'
    'hover:bg-red-500' = 'hover:bg-error'
    'hover:bg-red-600' = 'hover:bg-error'
    'hover:text-red-600' = 'hover:text-error'
    'focus:ring-red-500' = 'focus:ring-error'

    # === AMBER / ORANGE → warning ===
    'bg-amber-50' = 'bg-warning-light'
    'bg-amber-100' = 'bg-warning-light'
    'bg-amber-400' = 'bg-warning'
    'bg-amber-500' = 'bg-warning'
    'bg-amber-600' = 'bg-warning'
    'text-amber-400' = 'text-warning'
    'text-amber-500' = 'text-warning'
    'text-amber-600' = 'text-warning'
    'text-amber-700' = 'text-warning'
    'border-amber-200' = 'border-warning'
    'border-amber-300' = 'border-warning'
    'border-amber-400' = 'border-warning'
    'border-amber-500' = 'border-warning'
    'hover:bg-amber-500' = 'hover:bg-warning'
    'hover:bg-amber-600' = 'hover:bg-warning'
    'focus:ring-amber-500' = 'focus:ring-warning'
    'bg-orange-50' = 'bg-warning-light'
    'bg-orange-100' = 'bg-warning-light'
    'bg-orange-400' = 'bg-warning'
    'bg-orange-500' = 'bg-warning'
    'text-orange-400' = 'text-warning'
    'text-orange-500' = 'text-warning'
    'text-orange-600' = 'text-warning'
    'border-orange-300' = 'border-warning'
    'border-orange-400' = 'border-warning'
    'hover:bg-orange-500' = 'hover:bg-warning'
    'hover:bg-orange-600' = 'hover:bg-warning'

    # === PINK / FUCHSIA → primary (accent) ===
    'bg-pink-500' = 'bg-primary'
    'bg-pink-600' = 'bg-primary'
    'text-pink-500' = 'text-primary'
    'text-pink-600' = 'text-primary'
    'border-pink-500' = 'border-primary'
    'bg-fuchsia-500' = 'bg-primary'
    'text-fuchsia-500' = 'text-primary'

    # === CYAN / SKY → info ===
    'bg-sky-400' = 'bg-info'
    'bg-sky-500' = 'bg-info'
    'bg-sky-600' = 'bg-info'
    'text-sky-400' = 'text-info'
    'text-sky-500' = 'text-info'
    'text-sky-600' = 'text-info'
    'border-sky-400' = 'border-info'
    'border-sky-500' = 'border-info'
    'hover:bg-sky-500' = 'hover:bg-info'
    'hover:bg-sky-600' = 'hover:bg-info'
    'bg-cyan-400' = 'bg-info'
    'bg-cyan-500' = 'bg-info'
    'text-cyan-400' = 'text-info'
    'text-cyan-500' = 'text-info'
    'text-cyan-600' = 'text-info'

    # === GRAY → muted / dim / main / surface / border ===
    'text-gray-200' = 'text-dim'
    'text-gray-300' = 'text-dim'
    'text-gray-400' = 'text-muted'
    'text-gray-500' = 'text-muted'
    'text-gray-600' = 'text-muted'
    'text-gray-700' = 'text-main'
    'text-gray-800' = 'text-main'
    'text-gray-900' = 'text-main'
    'text-gray-950' = 'text-main'
    'text-slate-200' = 'text-dim'
    'text-slate-300' = 'text-dim'
    'text-slate-400' = 'text-muted'
    'text-slate-500' = 'text-muted'
    'text-slate-600' = 'text-muted'
    'text-slate-700' = 'text-main'
    'text-slate-800' = 'text-main'
    'text-slate-900' = 'text-main'
    'text-slate-950' = 'text-main'
    'text-neutral-400' = 'text-muted'
    'text-neutral-500' = 'text-muted'
    'text-neutral-600' = 'text-muted'
    'text-neutral-700' = 'text-main'
    'text-neutral-800' = 'text-main'

    'bg-gray-50' = 'bg-background'
    'bg-gray-100' = 'bg-surface'
    'bg-gray-200' = 'bg-surface'
    'bg-gray-300' = 'bg-card'
    'bg-gray-400' = 'bg-card'
    'bg-slate-50' = 'bg-background'
    'bg-slate-100' = 'bg-surface'
    'bg-slate-200' = 'bg-surface'
    'bg-slate-300' = 'bg-card'
    'bg-neutral-50' = 'bg-background'
    'bg-neutral-100' = 'bg-surface'

    'border-gray-100' = 'border-border'
    'border-gray-200' = 'border-border'
    'border-gray-300' = 'border-border'
    'border-gray-400' = 'border-border'
    'border-slate-100' = 'border-border'
    'border-slate-200' = 'border-border'
    'border-slate-300' = 'border-border'
    'border-neutral-200' = 'border-border'
    'border-neutral-300' = 'border-border'

    'hover:bg-gray-50' = 'hover:bg-surface'
    'hover:bg-gray-100' = 'hover:bg-surface'
    'hover:bg-slate-50' = 'hover:bg-surface'
    'hover:bg-slate-100' = 'hover:bg-surface'

    'divide-gray-200' = 'divide-border'
    'divide-slate-200' = 'divide-border'

    # === PURPLE → primary ===
    'bg-purple-50' = 'bg-primary-soft'
    'bg-purple-100' = 'bg-primary-light'
    'bg-purple-200' = 'bg-primary-light'
    'bg-purple-300' = 'bg-primary'
    'bg-purple-400' = 'bg-primary'
    'bg-purple-500' = 'bg-primary'
    'bg-purple-600' = 'bg-primary'
    'bg-purple-700' = 'bg-primary-hover'
    'bg-purple-800' = 'bg-primary-active'
    'bg-purple-900' = 'bg-primary-active'
    'text-purple-200' = 'text-primary'
    'text-purple-300' = 'text-primary'
    'text-purple-400' = 'text-primary'
    'text-purple-500' = 'text-primary'
    'text-purple-600' = 'text-primary'
    'text-purple-700' = 'text-primary'
    'text-purple-800' = 'text-primary'
    'text-purple-900' = 'text-primary'
    'border-purple-100' = 'border-primary'
    'border-purple-200' = 'border-primary'
    'border-purple-300' = 'border-primary'
    'border-purple-400' = 'border-primary'
    'border-purple-500' = 'border-primary'
    'border-purple-600' = 'border-primary'
    'border-purple-700' = 'border-primary'
    'border-purple-800' = 'border-primary'
    'border-purple-900' = 'border-primary'
    'hover:bg-purple-50' = 'hover:bg-primary-soft'
    'hover:bg-purple-100' = 'hover:bg-primary-light'
    'hover:bg-purple-200' = 'hover:bg-primary-light'
    'hover:bg-purple-600' = 'hover:bg-primary'
    'hover:bg-purple-700' = 'hover:bg-primary-hover'
    'hover:bg-purple-800' = 'hover:bg-primary-active'
    'hover:text-purple-600' = 'hover:text-primary'
    'hover:text-purple-700' = 'hover:text-primary'
    'hover:border-purple-300' = 'hover:border-primary'
    'hover:border-purple-500' = 'hover:border-primary'
    'focus:ring-purple-300' = 'focus:ring-primary'
    'focus:ring-purple-500' = 'focus:ring-primary'
    'from-purple-50' = 'from-[var(--bg-primary-soft)]'
    'from-purple-100' = 'from-[var(--bg-primary-light)]'
    'from-purple-200' = 'from-[var(--bg-primary-light)]'
    'from-purple-300' = 'from-[var(--bg-primary)]'
    'from-purple-400' = 'from-[var(--bg-primary)]'
    'from-purple-500' = 'from-[var(--bg-primary)]'
    'from-purple-600' = 'from-[var(--bg-primary)]'
    'from-purple-900' = 'from-[var(--bg-primary-active)]'
    'to-purple-50' = 'to-[var(--bg-primary-soft)]'
    'to-purple-100' = 'to-[var(--bg-primary-light)]'
    'to-purple-300' = 'to-[var(--bg-primary)]'
    'to-purple-400' = 'to-[var(--bg-primary)]'
    'to-purple-500' = 'to-[var(--bg-primary)]'
    'to-purple-600' = 'to-[var(--bg-primary)]'
    'to-purple-700' = 'to-[var(--bg-primary)]'
    'to-purple-800' = 'to-[var(--bg-primary-active)]'
    'to-purple-900' = 'to-[var(--bg-primary-active)]'
    'via-purple-500' = 'via-[var(--bg-primary)]'
    'via-purple-600' = 'via-[var(--bg-primary)]'
    'shadow-purple-200' = 'shadow-primary'
    'shadow-purple-500' = 'shadow-primary'
    'divide-purple-200' = 'divide-primary'

    # === YELLOW → warning ===
    'bg-yellow-50' = 'bg-warning-light'
    'bg-yellow-100' = 'bg-warning-light'
    'bg-yellow-400' = 'bg-warning'
    'bg-yellow-500' = 'bg-warning'
    'bg-yellow-600' = 'bg-warning'
    'text-yellow-400' = 'text-warning'
    'text-yellow-500' = 'text-warning'
    'text-yellow-600' = 'text-warning'
    'border-yellow-200' = 'border-warning'
    'border-yellow-300' = 'border-warning'
    'border-yellow-400' = 'border-warning'
    'border-yellow-500' = 'border-warning'
    'hover:bg-yellow-500' = 'hover:bg-warning'
    'hover:bg-yellow-600' = 'hover:bg-warning'
    'focus:ring-yellow-500' = 'focus:ring-warning'

    # === TEAL → info ===
    'bg-teal-50' = 'bg-info'
    'bg-teal-100' = 'bg-info'
    'bg-teal-400' = 'bg-info'
    'bg-teal-500' = 'bg-info'
    'bg-teal-600' = 'bg-info'
    'text-teal-400' = 'text-info'
    'text-teal-500' = 'text-info'
    'text-teal-600' = 'text-info'
    'border-teal-400' = 'border-info'
    'border-teal-500' = 'border-info'
    'hover:bg-teal-500' = 'hover:bg-info'
    'hover:bg-teal-600' = 'hover:bg-info'

    # === LIME → success ===
    'bg-lime-400' = 'bg-success'
    'bg-lime-500' = 'bg-success'
    'text-lime-400' = 'text-success'
    'text-lime-500' = 'text-success'

    # === STONE → muted / surface ===
    'text-stone-400' = 'text-muted'
    'text-stone-500' = 'text-muted'
    'text-stone-600' = 'text-muted'
    'text-stone-700' = 'text-main'
    'text-stone-800' = 'text-main'
    'bg-stone-50' = 'bg-background'
    'bg-stone-100' = 'bg-surface'
    'border-stone-200' = 'border-border'
    'border-stone-300' = 'border-border'

    # Additional slate/gray variants
    'bg-slate-400' = 'bg-card'
    'bg-slate-500' = 'bg-card'
    'bg-slate-600' = 'bg-card'
    'bg-slate-700' = 'bg-primary-active'
    'bg-slate-800' = 'bg-primary-active'
    'bg-slate-900' = 'bg-primary-active'
    'bg-slate-950' = 'bg-background'
    'border-slate-400' = 'border-border'
    'border-slate-500' = 'border-border'
    'border-slate-600' = 'border-border'
    'border-slate-700' = 'border-border'
    'border-slate-800' = 'border-border'
    'border-slate-900' = 'border-border'
    'hover:bg-slate-200' = 'hover:bg-surface'
    'hover:bg-slate-300' = 'hover:bg-card'
    'hover:bg-slate-400' = 'hover:bg-card'
    'hover:bg-slate-600' = 'hover:bg-primary-active'
    'hover:bg-slate-700' = 'hover:bg-primary-active'
    'hover:bg-slate-800' = 'hover:bg-primary-active'
    'hover:border-slate-300' = 'hover:border-border'
    'hover:text-slate-600' = 'hover:text-muted'
    'hover:text-slate-700' = 'hover:text-main'
    'from-slate-900' = 'from-[var(--bg-primary-active)]'
    'from-slate-950' = 'from-[var(--bg-background)]'
    'to-slate-800' = 'to-[var(--bg-primary-active)]'
    'to-slate-900' = 'to-[var(--bg-primary-active)]'
    'divide-slate-300' = 'divide-border'
    'divide-slate-400' = 'divide-border'
    
    # Additional gray variants
    'bg-gray-500' = 'bg-card'
    'border-gray-500' = 'border-border'
    'border-gray-600' = 'border-border'
    'hover:bg-gray-200' = 'hover:bg-surface'
    'hover:bg-gray-300' = 'hover:bg-card'
    'hover:border-gray-300' = 'hover:border-border'
    'hover:text-gray-600' = 'hover:text-muted'
    'hover:text-gray-700' = 'hover:text-main'
    'divide-gray-300' = 'divide-border'

    # Primary variants
    'bg-primary-50' = 'bg-primary-soft'
    'bg-primary-100' = 'bg-primary-light'
    'bg-primary-500' = 'bg-primary'
    'bg-primary-600' = 'bg-primary'
    'bg-primary-700' = 'bg-primary-hover'
    'text-primary-500' = 'text-primary'
    'text-primary-600' = 'text-primary'
    'text-primary-700' = 'text-primary'
}

# P2 map (text-white/black → semantic)
$p2Map = @{
    'text-white' = 'text-on-primary'
    'text-black' = 'text-main'
}

function Process-File {
    param([string]$Path)
    $c = Get-Content -Path $Path -Raw
    $original = $c
    $p1Count = 0
    $p2Count = 0

    # Apply P1 replacements (longest first to avoid partial matches)
    $semanticMap.Keys | Sort-Object Length -Descending | ForEach-Object {
        $old = $_
        $new = $semanticMap[$_]
        $count = [regex]::Matches($c, [regex]::Escape($old)).Count
        if ($count -gt 0) {
            $c = $c -replace [regex]::Escape($old), $new
            $p1Count += $count
        }
    }

    # Second pass: catch remaining gradient/shadow/high-weight patterns via regex
    $colorMap = @{indigo='primary';violet='primary';purple='primary';blue='info';sky='info';cyan='info';teal='info';emerald='success';green='success';lime='success';rose='error';red='error';pink='primary';fuchsia='primary';amber='warning';orange='warning';yellow='warning';gray='';slate='';stone='';neutral='';zinc=''}

    # Gradients: from/to/via-{color}-{weight} → from-[var(--bg-{semantic})]
    foreach ($color in $colorMap.Keys) {
        $sem = $colorMap[$color]
        if (-not $sem) { continue }
        $c = $c -replace "(?<![-\w])(from-|to-|via-)$color-\d{2,3}(?![-\w\d])", "`$1-[var(--bg-$sem)]"
        $c = $c -replace "(?<![-\w])(hover:bg-|focus:bg-|active:bg-|group-hover:bg-)$color-\d{2,3}(?![-\w\d])", "`$1$sem"
        $c = $c -replace "(?<![-\w])(shadow-)$color-\d{2,3}(?![-\w\d])", "`$1$sem"
        $c = $c -replace "(?<![-\w])(border-)$color-\d{2,3}(?![-\w\d])", "`$1$sem"
        $c = $c -replace "(?<![-\w])(ring-)$color-\d{2,3}(?![-\w\d])", "`$1$sem"
        $c = $c -replace "(?<![-\w])(divide-)$color-\d{2,3}(?![-\w\d])", "`$1$sem"
        $c = $c -replace "(?<![-\w])(fill-)$color-\d{2,3}(?![-\w\d])", "`$1$sem"
        $c = $c -replace "(?<![-\w])(stroke-)$color-\d{2,3}(?![-\w\d])", "`$1$sem"
        $c = $c -replace "(?<![-\w])(outline-)$color-\d{2,3}(?![-\w\d])", "`$1$sem"
    }

    # bg-{color}-{weight} → bg-{semantic} (with variants for light/dark shades)
    foreach ($color in $colorMap.Keys) {
        $sem = $colorMap[$color]
        if (-not $sem) { continue }
        $c = $c -replace "(?<![-\w])bg-$color-[5-6]\d\d(?![-\w\d])", "bg-$sem"
        $c = $c -replace "(?<![-\w])bg-$color-[7-9]\d\d(?![-\w\d])", "bg-$sem"
        $c = $c -replace "(?<![-\w])bg-$color-4\d\d(?![-\w\d])", "bg-$sem"
        $c = $c -replace "(?<![-\w])bg-$color-[12]\d\d(?![-\w\d])", "bg-${sem}-light"
        $c = $c -replace "(?<![-\w])bg-$color-50(?![-\w\d])", "bg-${sem}-light"
    }

    # text-{color}-{weight} → text-{semantic}
    foreach ($color in @('indigo','violet','purple','pink','fuchsia')) {
        $c = $c -replace "(?<![-\w])text-$color-\d{2,3}(?![-\w\d])", "text-primary"
    }
    foreach ($color in @('blue','sky','cyan','teal')) {
        $c = $c -replace "(?<![-\w])text-$color-\d{2,3}(?![-\w\d])", "text-info"
    }
    foreach ($color in @('emerald','green','lime')) {
        $c = $c -replace "(?<![-\w])text-$color-\d{2,3}(?![-\w\d])", "text-success"
    }
    foreach ($color in @('rose','red')) {
        $c = $c -replace "(?<![-\w])text-$color-\d{2,3}(?![-\w\d])", "text-error"
    }
    foreach ($color in @('amber','orange','yellow')) {
        $c = $c -replace "(?<![-\w])text-$color-\d{2,3}(?![-\w\d])", "text-warning"
    }

    # Gray/slate/stone text → semantic based on weight
    $c = $c -replace "(?<![-\w])text-(?:gray|slate|stone|neutral|zinc)-[12]\d\d(?![-\w\d])", "text-dim"
    $c = $c -replace "(?<![-\w])text-(?:gray|slate|stone|neutral|zinc)-[34]\d\d(?![-\w\d])", "text-muted"
    $c = $c -replace "(?<![-\w])text-(?:gray|slate|stone|neutral|zinc)-[5-9]\d\d(?![-\w\d])", "text-main"
    $c = $c -replace "(?<![-\w])text-(?:gray|slate|stone|neutral|zinc)-50(?![-\w\d])", "text-main"

    # Gray/slate borders → border-border
    $c = $c -replace "(?<![-\w])border-(?:gray|slate|stone|neutral|zinc)-\d{2,3}(?![-\w\d])", "border-border"

    # Gray/slate backgrounds → surface/card/background
    $c = $c -replace "(?<![-\w])bg-(?:gray|slate|stone|neutral|zinc)-50(?![-\w\d])", "bg-background"
    $c = $c -replace "(?<![-\w])bg-(?:gray|slate|stone|neutral|zinc)-[12]\d\d(?![-\w\d])", "bg-surface"
    $c = $c -replace "(?<![-\w])bg-(?:gray|slate|stone|neutral|zinc)-[3-6]\d\d(?![-\w\d])", "bg-card"
    $c = $c -replace "(?<![-\w])bg-(?:gray|slate|stone|neutral|zinc)-[7-9]\d\d(?![-\w\d])", "bg-card"
    $c = $c -replace "(?<![-\w])bg-(?:gray|slate|stone|neutral|zinc)-950(?![-\w\d])", "bg-background"

    # primary-NNN → primary
    $c = $c -replace "(?<![-\w])(bg|text|border|from|to|via|ring|shadow|outline|fill|stroke|focus:ring|focus:border|hover:bg|hover:text|hover:border|active:bg|group-hover:bg|divide)-primary-\d{2,3}(?![-\w\d])", '$1-primary'

    # hover:bg/states for status colors
    $c = $c -replace "(?<![-\w])((?:hover|focus|active|group-hover):bg-)(?:indigo|violet|purple|pink|fuchsia)-\d{2,3}(?![-\w\d])", '$1primary'
    $c = $c -replace "(?<![-\w])((?:hover|focus|active|group-hover):bg-)(?:blue|sky|cyan|teal)-\d{2,3}(?![-\w\d])", '$1info'
    $c = $c -replace "(?<![-\w])((?:hover|focus|active|group-hover):bg-)(?:emerald|green|lime)-\d{2,3}(?![-\w\d])", '$1success'
    $c = $c -replace "(?<![-\w])((?:hover|focus|active|group-hover):bg-)(?:rose|red)-\d{2,3}(?![-\w\d])", '$1error'
    $c = $c -replace "(?<![-\w])((?:hover|focus|active|group-hover):bg-)(?:amber|orange|yellow)-\d{2,3}(?![-\w\d])", '$1warning'
    $c = $c -replace "(?<![-\w])((?:hover|focus|active|group-hover):bg-)(?:gray|slate|stone|neutral|zinc)-\d{2,3}(?![-\w\d])", '$1surface'

    # divide/slate-gray
    $c = $c -replace "(?<![-\w])divide-(?:gray|slate|stone|neutral|zinc)-\d{2,3}(?![-\w\d])", "divide-border"
    $c = $c -replace "(?<![-\w])divide-(?:indigo|violet|purple|blue|sky|cyan|teal|emerald|green|lime|rose|red|pink|fuchsia|amber|orange|yellow)-\d{2,3}(?![-\w\d])", "divide-primary"

    # fill/stroke
    $c = $c -replace "(?<![-\w])fill-(?:amber|orange|yellow)-\d{2,3}(?![-\w\d])", "fill-warning"
    $c = $c -replace "(?<![-\w])fill-(?:indigo|violet|purple|pink|fuchsia)-\d{2,3}(?![-\w\d])", "fill-primary"
    $c = $c -replace "(?<![-\w])fill-(?:emerald|green|lime)-\d{2,3}(?![-\w\d])", "fill-success"
    $c = $c -replace "(?<![-\w])fill-(?:rose|red)-\d{2,3}(?![-\w\d])", "fill-error"
    $c = $c -replace "(?<![-\w])fill-(?:blue|sky|cyan|teal)-\d{2,3}(?![-\w\d])", "fill-info"

    # Apply P2 replacements (only non-glass, non-overlay uses)
    # Skip if part of bg-white/N or bg-black/N patterns (glass/overlay)
    $c = [regex]::Replace($c, '(?<!bg-|from-|via-|to-|shadow-|ring-)text-white(?![/\w-])', 'text-on-primary')
    $c = [regex]::Replace($c, '(?<!bg-|from-|via-|to-|shadow-|ring-)text-black(?![/\w-])', 'text-main')

    if ($c -ne $original) {
        Set-Content -Path $Path -Value $c -NoNewline
        $p2Count = [regex]::Matches($c, 'text-on-primary|text-main').Count - [regex]::Matches($original, 'text-on-primary|text-main').Count
        Write-Host "  Fixed: $Path (P1:$p1Count P2:$p2Count)"
    }
}

Write-Host "Processing folder: $Folder"
$files = Get-ChildItem -Path $Folder -Recurse -Include "*.tsx","*.ts" | Where-Object {
    $_.FullName -notmatch '\\node_modules\\'
}
$totalP1 = 0
$totalP2 = 0
foreach ($f in $files) {
    Process-File -Path $f.FullName
}
Write-Host "Done with $Folder"
