@echo off
title Desktopga qo'shilmoqda...
cd /d "%~dp0"

set DIR=%~dp0
set DESKTOP=%USERPROFILE%\Desktop

:: ===== ISHGA TUSHIR tugmasi =====
powershell -Command "$s=(New-Object -COM WScript.Shell).CreateShortcut('%DESKTOP%\▶ RESTORAN ISHGA TUSHIR.lnk'); $s.TargetPath='%DIR%ISHGA_TUSHIR.bat'; $s.WorkingDirectory='%DIR%'; $s.IconLocation='%SystemRoot%\System32\shell32.dll,137'; $s.Description='Restoran dasturini ishga tushirish'; $s.Save()"

:: ===== TO'XTAT tugmasi =====
powershell -Command "$s=(New-Object -COM WScript.Shell).CreateShortcut('%DESKTOP%\■ RESTORAN TOXTAT.lnk'); $s.TargetPath='%DIR%TOXTAT.bat'; $s.WorkingDirectory='%DIR%'; $s.IconLocation='%SystemRoot%\System32\shell32.dll,131'; $s.Description='Restoran dasturini toxtatish'; $s.Save()"

:: ===== YANGILASH tugmasi =====
powershell -Command "$s=(New-Object -COM WScript.Shell).CreateShortcut('%DESKTOP%\↑ RESTORAN YANGILASH.lnk'); $s.TargetPath='%DIR%YANGILASH.bat'; $s.WorkingDirectory='%DIR%'; $s.IconLocation='%SystemRoot%\System32\shell32.dll,238'; $s.Description='Restoran dasturini yangilash'; $s.Save()"

echo.
echo  Desktopga 3 ta tugma qo'shildi!
echo.
echo  ▶ RESTORAN ISHGA TUSHIR
echo  ■ RESTORAN TOXTAT
echo  ↑ RESTORAN YANGILASH
echo.
timeout /t 3 /nobreak >nul
exit
