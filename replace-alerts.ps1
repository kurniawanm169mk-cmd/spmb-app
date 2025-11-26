# Script to replace all alert() with toast() and add imports

$files = @(
    "src/pages/admin/SchoolProfile.jsx",
    "src/pages/admin/SystemSettings.jsx",
    "src/pages/admin/StudentList.jsx",
    "src/pages/student/PaymentUpload.jsx",
    "src/pages/student/RegistrationForm.jsx",
    "src/pages/student/StudentDashboard.jsx"
)

foreach ($file in $files) {
    $path = "d:\spmb\$file"
    if (Test-Path $path) {
        $content = Get-Content $path -Raw
        
        # Add toast import if not exists
        if ($content -notmatch "import.*toast.*from.*sonner") {
            $content = $content -replace "(import.*from 'lucide-react';)", "`$1`nimport { toast } from 'sonner';"
        }
        
        # Replace alert with toast
        $content = $content -replace "alert\('([^']+)'\);", "toast.success('`$1');"
        $content = $content -replace "alert\(`([^`]+)`\);", "toast.error(```$1``);"
        
        Set-Content $path -Value $content -NoNewline
        Write-Host "Updated: $file"
    }
}

Write-Host "Done! All alerts replaced with toast."`n
