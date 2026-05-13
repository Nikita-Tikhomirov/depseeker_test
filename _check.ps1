$lines = Get-Content 'C:\Users\user\Desktop\depseeker_test\index.html' -Encoding UTF8
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'HERO.*SEARCH') {
        Write-Host ('Line ' + ($i+1) + ': [' + $lines[$i] + ']')
    }
}
# Also show lines around main
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -eq '<main>') {
        Write-Host ('--- Around <main> ---')
        for ($j = [Math]::Max(0, $i-1); $j -le [Math]::Min($lines.Count-1, $i+5); $j++) {
            Write-Host ('L' + ($j+1) + ': [' + $lines[$j] + ']')
        }
    }
}
