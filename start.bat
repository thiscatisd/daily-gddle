@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
title GDdle

if not exist public\index.html (
  if exist index.html (
    mkdir public 2>nul
    move index.html public\ >nul
  )
)

if not exist data\levels.json (
  echo First run: building the level data. This takes a minute or two...
  set XLSX=
  for %%f in (*.xlsx) do set XLSX=%%f
  if not defined XLSX (
    echo Put the rated-levels .xlsx file in this folder, then run this again.
    pause
    exit /b 1
  )
  if exist useful.html (
    python build_data.py "!XLSX!" useful.html
  ) else (
    python build_data.py "!XLSX!"
  )
  if errorlevel 1 (
    echo The build failed. See the error above.
    pause
    exit /b 1
  )
)

start "" cmd /c "timeout /t 2 >nul & start http://localhost:3000"
echo GDdle is running at http://localhost:3000  (close this window to stop it)
if exist webhook.txt set /p DISCORD_WEBHOOK=<webhook.txt
node server.js
pause
