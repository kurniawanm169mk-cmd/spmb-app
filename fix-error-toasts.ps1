# Fix error toasts

$files = Get-ChildItem -Path "d:\spmb\src" -Recurse -Filter "*.jsx"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    # Fix toast.success('Gagal -> toast.error('Gagal
    $newContent = $content -replace "toast\.success\('Gagal", "toast.error('Gagal"
    $newContent = $newContent -replace "toast\.success\(`Gagal", "toast.error(``Gagal"
    
    if ($content -ne $newContent) {
        Set-Content $file.FullName -Value $newContent -NoNewline
        Write-Host "Fixed: $($file.Name)"
    }
}

Write-Host "Done fixing error toasts!"
