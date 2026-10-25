@echo off
cd /d "%~dp0"
echo Itsak Workspace: http://localhost:8080
start "" http://localhost:8080
php -S localhost:8080 router.php
pause
