@echo off
set /p VEHICLE_COUNT="Enter the number of vehicles: "

:: 1. Generate Vehicles
echo [1/5] Generating vehicles...
cd /d "%~dp0simulation\vehicles"
python generate_vehicles.py %VEHICLE_COUNT%

echo.
echo Generation complete. Press any key to start the Backend and Frontend...
pause > nul

:: 2. Start Backend
echo [2/5] Starting Backend...
start "Backend" cmd /k "cd /d %~dp0smart-dispatch-system && mvn spring-boot:run"

:: 3. Start Frontend
echo [3/5] Starting Frontend...
start "Frontend" cmd /k "cd /d %~dp0smart-dispatch-frontend && npm run dev"

echo.
echo Check the Backend/Frontend windows. Once they are fully loaded,
echo press any key here to start the Simulation Movement...
pause > nul

:: 4. Start Simulation Movement
echo [4/5] Starting Simulation Movement...
start "Simulation Movement" cmd /k "cd /d %~dp0simulation\vehicles && python automatic_vehicle_movement.py %VEHICLE_COUNT%"

echo.
echo Waiting for vehicles to connect... 
echo When you are ready to start the Load Test, press any key...
pause > nul

:: 5. Run JMeter
echo.
echo [5/5] Load Test Scenarios:
echo 1. Standard Randomized Incidents (Random distribution)
echo 2. Equidistant Stress Test (2 incidents, same time, same proximity to Vehicle 1)
set /p SCENARIO="Select scenario (1: custom, 2: 2 incidents, 3: 100 incidetnts, 4: 500 incidents): "

set TIMESTAMP=%date:~10,4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%

if "%SCENARIO%"=="2" (
    set JMX_FILE=EquidistantIncidents.jmx
    set RESULTS_DIR=%~dp0simulation\jmeter\Reports\report_stress_%TIMESTAMP%
) else if "%SCENARIO%"=="3" (
    set JMX_FILE=Incident_100_20.jmx
    set RESULTS_DIR=%~dp0simulation\jmeter\Reports\report_stress_%TIMESTAMP%
) else if "%SCENARIO%"=="4" (
    set JMX_FILE=Incident_500_60.jmx
    set RESULTS_DIR=%~dp0simulation\jmeter\Reports\report_stress_%TIMESTAMP%
) else (
    set JMX_FILE=IncidentGeneration.jmx
    set RESULTS_DIR=%~dp0simulation\jmeter\Reports\report_%TIMESTAMP%
)

if not exist "%~dp0simulation\jmeter\logs" mkdir "%~dp0simulation\jmeter\logs"
if not exist "%~dp0simulation\jmeter\Reports" mkdir "%~dp0simulation\jmeter\Reports"
del /q "%~dp0simulation\jmeter\logs\results.jtl" 2>nul

echo Running JMeter scenario %SCENARIO%...
cd /d "%~dp0simulation\jmeter"
jmeter -Jjmeter.reportgenerator.overall_granularity=1000 -n -t %JMX_FILE% -l logs\results.jtl -e -o "%RESULTS_DIR%"

if exist "%RESULTS_DIR%\index.html" (
    echo Report generated successfully!
    start "" "%RESULTS_DIR%\index.html"
) else (
    echo Error: Report generation failed.
)

pause