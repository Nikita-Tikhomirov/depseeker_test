$ErrorActionPreference = 'Stop'
$idxFile   = 'C:\Users\user\Desktop\depseeker_test\index.html'
$heroFile  = 'C:\Users\user\Desktop\depseeker_test\hero-v3.html'

$idxRaw  = [System.IO.File]::ReadAllText($idxFile,  [System.Text.Encoding]::UTF8)
$heroRaw = [System.IO.File]::ReadAllText($heroFile, [System.Text.Encoding]::UTF8)

# ---- Locate boundaries in index.html ----
$startMarker = '<!-- ==================== HERO VARIANT SWITCHER ==================== -->'
$endMarker   = '<!-- ==================== CATEGORIES ==================== -->'

$startIdx = $idxRaw.IndexOf($startMarker)
$endIdx   = $idxRaw.IndexOf($endMarker, $startIdx)

if ($startIdx -lt 0 -or $endIdx -lt 0) { Write-Host 'ERROR idx boundaries'; exit 1 }

# ---- Extract V3 <style> block from hero-v3.html ----
# Find the V3 CSS comment inside a <style> tag
$v3cssMarker = '/* ========== V3: SEARCH-FOCUSED HERO ========== */'
$v3cssPos = $heroRaw.IndexOf($v3cssMarker)
if ($v3cssPos -lt 0) { Write-Host 'ERROR: V3 CSS marker not found'; exit 1 }

# Find the opening <style> before this marker (the one containing it)
$styleOpen = $heroRaw.LastIndexOf('<style>', $v3cssPos)
if ($styleOpen -lt 0) { Write-Host 'ERROR: style open not found'; exit 1 }

# Find the matching closing </style> after the marker
$styleClose = $heroRaw.IndexOf('</style>', $v3cssPos)
if ($styleClose -lt 0) { Write-Host 'ERROR: style close not found'; exit 1 }
$styleClose += '</style>'.Length

$v3StyleBlock = $heroRaw.Substring($styleOpen, $styleClose - $styleOpen)

Write-Host ('V3 style block length: ' + $v3StyleBlock.Length)

# ---- Extract V3 <section> block from hero-v3.html ----
$sectionTag = '<section class="hero-v3"'
$sectionOpen = $heroRaw.IndexOf($sectionTag)
if ($sectionOpen -lt 0) { Write-Host 'ERROR: section open not found'; exit 1 }

# Find the matching </section> by counting depth
$depth = 0
$sectionClose = -1
$pos = $sectionOpen
while ($pos -lt $heroRaw.Length) {
    $nextOpen  = $heroRaw.IndexOf('<section', $pos + 1)
    $nextClose = $heroRaw.IndexOf('</section>', $pos + 1)
    if ($nextClose -lt 0) { break }
    if ($nextOpen -gt 0 -and $nextOpen -lt $nextClose) {
        $depth++
        $pos = $nextOpen + 7  # skip '<section'
    } else {
        if ($depth -eq 0) {
            $sectionClose = $nextClose + '</section>'.Length
            break
        }
        $depth--
        $pos = $nextClose + 9  # skip '</section>'
    }
}

if ($sectionClose -lt 0) { Write-Host 'ERROR: section close not found'; exit 1 }

$v3SectionBlock = $heroRaw.Substring($sectionOpen, $sectionClose - $sectionOpen)
Write-Host ('V3 section block length: ' + $v3SectionBlock.Length)

# ---- Build the replacement ----
$newHero = @"

<!-- ==================== HERO VARIANT SWITCHER ==================== -->
<style>
    .hero-switcher {
        position: fixed;
        top: 76px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 999;
        display: flex;
        gap: 6px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 999px;
        padding: 4px;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
    }
    .hero-switcher a {
        text-decoration: none;
        font-size: 0.72rem;
        font-weight: 600;
        padding: 6px 14px;
        border-radius: 999px;
        color: var(--text-2);
        transition: all 0.2s;
        white-space: nowrap;
        font-family: var(--font);
    }
    .hero-switcher a:hover { color: var(--text); background: var(--surface-2); }
    .hero-switcher a.active { background: var(--accent); color: #fff; }
</style>
<nav class="hero-switcher" aria-label="Варианты первого экрана">
    <a href="index.html" class="active">V3 · Поиск (текущий)</a>
    <a href="hero-v1.html">V1 · Сплит</a>
    <a href="hero-v2.html">V2 · Сетка</a>
    <a href="hero-v4.html">V4 · Карусель</a>
</nav>

<!-- ==================== HERO — V3 SEARCH-FOCUSED ==================== -->
$v3StyleBlock

$v3SectionBlock

"@

$prefix = $idxRaw.Substring(0, $startIdx)
$suffix = $idxRaw.Substring($endIdx)

$newRaw = $prefix + $newHero + $suffix

# Write UTF-8 without BOM
$utf8 = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($idxFile, $newRaw, $utf8)

Write-Host 'index.html updated successfully.'
Write-Host ('New file length: ' + $newRaw.Length)
