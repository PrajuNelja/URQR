Get-ChildItem 'C:\Windows\System32\DriverStore\FileRepository' -Filter 'netwtw6e*.inf' -Recurse | ForEach-Object {
    try {
        $c = Get-Content $_.FullName
        $ver = ($c | Select-String -Pattern 'DriverVer').Line
        Write-Host ($ver + " | " + $_.FullName)
    } catch {
        Write-Host ("Access denied or error on " + $_.FullName)
    }
}
