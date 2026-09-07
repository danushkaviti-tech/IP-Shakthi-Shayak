Set WshShell = WScript.CreateObject("WScript.Shell")
strDesktop = WshShell.SpecialFolders("Desktop")
strAppPath = WshShell.CurrentDirectory & "\Launch-IP-SAKTI.bat"

Set oShellLink = WshShell.CreateShortcut(strDesktop & "\IP-SAKTI.lnk")
oShellLink.TargetPath = strAppPath
oShellLink.WindowStyle = 1
oShellLink.Description = "IP-SAKTI • AI Regulatory & Patent Intelligence"
oShellLink.WorkingDirectory = WshShell.CurrentDirectory
oShellLink.Save

MsgBox "IP-SAKTI Desktop App shortcut created successfully on your Desktop!", 64, "IP-SAKTI Installation Complete"
