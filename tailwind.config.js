@echo off
cd /d "%~dp0"
"C:\Program Files\nodejs\node.exe" "%~dp0node_modules\vite\bin\vite.js" --host 0.0.0.0 --port 5173 > "%~dp0..\vite-preview-debug.log" 2>&1
type "%~dp0..\vite-preview-debug.log"
pause
