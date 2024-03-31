Get-ChildItem "./" -Recurse | Where-Object { -not $_.PSIsContainer } | ForEach-Object {
    $newName = $_.Name.ToLower()
    Rename-Item -Path $_.FullName -NewName $newName
    # Capitalize the first letter of each file name
    $newName = $newName.Substring(0,1).ToUpper() + $newName.Substring(1)
    Rename-Item -Path $_.FullName -NewName $newName
}
