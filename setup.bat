@echo off
setlocal

echo Vuoi accendere il server? (S/N)
set /p choice=
if /i "%choice%" neq "S" goto :end1

start cmd /k "cd /d C:\Users\marco\music-map\music-map-backend && npm start"
start cmd /k "cd /d C:\Users\marco\music-map\music-map-frontend && npm start"
start cmd /k "cd /d C:\Users\marco\music-map\music-map-mobile && npx expo start -c"

start "" "C:\Program Files\Microsoft Visual Studio\2022\Community\Common7\IDE\devenv.exe" /edit "C:\Users\marco\music-map"

:end1
if /i "%choice%" neq "N" goto :end2

start cmd /k "cd /d C:\Users\marco\music-map\music-map-backend"
start cmd /k "cd /d C:\Users\marco\music-map\music-map-frontend"
start cmd /k "cd /d C:\Users\marco\music-map\music-map-mobile"

start "" "C:\Program Files\Microsoft Visual Studio\2022\Community\Common7\IDE\devenv.exe" /edit "C:\Users\marco\music-map"

:end2
exit