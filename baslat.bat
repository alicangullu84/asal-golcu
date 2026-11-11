@echo off
rem Asal Golcu: yerel sunucuyu baslatir ve tarayicida acar.
cd /d "%~dp0"
start "" http://localhost:5180
node sunucu.js
