$ErrorActionPreference = 'Stop'
$file = 'C:\Users\user\Desktop\depseeker_test\index.html'
$raw = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)

$startMarker = '<!-- ==================== HERO VARIANT SWITCHER ==================== -->'
$endMarker   = '<!-- ==================== CATEGORIES ==================== -->'

$startIdx = $raw.IndexOf($startMarker)
$endIdx   = $raw.IndexOf($endMarker, $startIdx)

if ($startIdx -lt 0 -or $endIdx -lt 0) {
    Write-Host 'ERROR: boundaries not found'
    exit 1
}

Write-Host ('Boundaries: start=' + $startIdx + ', end=' + $endIdx)

# Read the hero-v3.html template
$heroFile = 'C:\Users\user\Desktop\depseeker_test\hero-v3.html'
$heroRaw = [System.IO.File]::ReadAllText($heroFile, [System.Text.Encoding]::UTF8)

# Extract the <style> block and <section class="hero-v3"> from hero-v3.html
# (everything between the demo-header closing and the theme JS)
$heroStyleStart = $heroRaw.IndexOf('/* ========== V3: SEARCH-FOCUSED HERO ========== */')
$heroSectionEnd = $heroRaw.IndexOf('<!-- ====== THEME SWITCHING JS ====== -->')

if ($heroStyleStart -lt 0 -or $heroSectionEnd -lt 0) {
    Write-Host 'ERROR: hero-v3.html boundaries not found'
    exit 1
}

# Extract: include the opening <style> tag that precedes the V3 comment
$styleTagOpen = $heroRaw.LastIndexOf('<style>', $heroStyleStart)
$sectionEnd   = $heroRaw.LastIndexOf('</section>', $heroSectionEnd) + '</section>'.Length

$heroContent = $heroRaw.Substring($styleTagOpen, $sectionEnd - $styleTagOpen)

Write-Host ('Hero content length: ' + $heroContent.Length)

# Build the new hero switcher + V3 hero section
$newHero = @'

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
'@ + $heroContent + @'

'@

# Prefix from start of file to the hero section
$prefix = $raw.Substring(0, $startIdx)
# Suffix from the categories section onward
$suffix = $raw.Substring($endIdx)

$newRaw = $prefix + $newHero + $suffix

[System.IO.File]::WriteAllText($file, $newRaw, [System.Text.UTF8Encoding]::new($false))
Write-Host 'index.html updated successfully.'
Write-Host ('New file length: ' + $newRaw.Length)
