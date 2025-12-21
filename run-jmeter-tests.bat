@echo off
REM ============================================
REM DocQA-MS - JMeter Performance Test Runner
REM Generates HTML Dashboard Report
REM ============================================

echo ============================================
echo   DocQA-MS Performance Test Runner
echo ============================================
echo.

REM Configuration
set JMETER_HOME=D:\apache-jmeter-5.6.3
set PROJECT_DIR=%~dp0
set TEST_PLAN=%PROJECT_DIR%jmeter\DocQA-MS-Performance-Test.jmx
set RESULTS_DIR=%PROJECT_DIR%jmeter-results
set REPORT_DIR=%RESULTS_DIR%\html-report
set RESULTS_FILE=%RESULTS_DIR%\results.jtl

REM Check if JMeter exists
if not exist "%JMETER_HOME%\bin\jmeter.bat" (
    echo [ERROR] JMeter not found at %JMETER_HOME%
    echo Please update JMETER_HOME in this script
    pause
    exit /b 1
)

REM Check if test plan exists
if not exist "%TEST_PLAN%" (
    echo [ERROR] Test plan not found: %TEST_PLAN%
    pause
    exit /b 1
)

REM Create results directory
if not exist "%RESULTS_DIR%" mkdir "%RESULTS_DIR%"

REM Clean previous results
echo [INFO] Cleaning previous results...
if exist "%RESULTS_FILE%" del /f "%RESULTS_FILE%"
if exist "%REPORT_DIR%" rmdir /s /q "%REPORT_DIR%"

echo.
echo [INFO] Starting JMeter tests...
echo [INFO] Test Plan: %TEST_PLAN%
echo [INFO] Results: %RESULTS_FILE%
echo [INFO] Report: %REPORT_DIR%
echo.

REM Run JMeter in non-GUI mode
echo [INFO] Running tests (this may take a few minutes)...
"%JMETER_HOME%\bin\jmeter.bat" -n -t "%TEST_PLAN%" -l "%RESULTS_FILE%" -e -o "%REPORT_DIR%"

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] JMeter test execution failed!
    pause
    exit /b 1
)

echo.
echo ============================================
echo   Test Execution Complete!
echo ============================================
echo.
echo [SUCCESS] Results saved to: %RESULTS_FILE%
echo [SUCCESS] HTML Report: %REPORT_DIR%\index.html
echo.
echo Opening HTML report in browser...
start "" "%REPORT_DIR%\index.html"

pause
