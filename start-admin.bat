@echo off
cd /d "%~dp0"
echo Admin: http://127.0.0.1:8765/admin.html
echo Bantuan: http://127.0.0.1:8765/index.html
echo Tekan Ctrl+C untuk menghentikan server.
where py >nul 2>&1
if %errorlevel%==0 (
  py -3 -m http.server 8765 --bind 127.0.0.1
) else (
  python -m http.server 8765 --bind 127.0.0.1
)
pause
