@echo off
echo Detecting active Wi-Fi IP address...

for /f "usebackq tokens=*" %%i in (`powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -like '*Wi-Fi*' -and $_.IPAddress -notlike '169.*' } | Select-Object -First 1).IPAddress"`) do set CURRENT_IP=%%i

if "%CURRENT_IP%"=="" (
    echo [!] No Wi-Fi IP found. Starting with default...
    cd mobile
    npx expo start -c
) else (
    echo [*] Detected active Wi-Fi IP: %CURRENT_IP%
    echo [*] Mobile Browser Direct Link: http://%CURRENT_IP%:8081
    cd mobile
    set REACT_NATIVE_PACKAGER_HOSTNAME=%CURRENT_IP%
    npx expo start -c
)

pause
