@echo off
REM ============================================
REM DocQA-MS - Script d'exécution des tests
REM ============================================

echo ============================================
echo     DocQA-MS Test Runner
echo ============================================
echo.

SET PROJECT_ROOT=%~dp0
SET RESULTS_DIR=%PROJECT_ROOT%test-results

REM Créer le dossier de résultats
if not exist "%RESULTS_DIR%" mkdir "%RESULTS_DIR%"

REM ============================================
REM 1. Tests Unitaires Python
REM ============================================
echo.
echo [1/5] Running Python Unit Tests...
echo ----------------------------------------

pip install -r requirements-test.txt -q

pytest tests/unit/ -v --cov=microservices --cov-report=xml:"%RESULTS_DIR%\coverage.xml" --cov-report=html:"%RESULTS_DIR%\htmlcov" --junitxml="%RESULTS_DIR%\pytest-results.xml"

if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Some Python unit tests failed
) else (
    echo [OK] Python unit tests passed
)

REM ============================================
REM 2. Tests Unitaires Java (audit-logger)
REM ============================================
echo.
echo [2/5] Running Java Unit Tests (audit-logger)...
echo ----------------------------------------

cd microservices\audit-logger
if exist pom.xml (
    call mvnw test -q
    if %ERRORLEVEL% NEQ 0 (
        echo [WARNING] Some Java unit tests failed
    ) else (
        echo [OK] Java unit tests passed
    )
) else (
    echo [SKIP] No pom.xml found
)
cd %PROJECT_ROOT%

REM ============================================
REM 3. Tests Unitaires React (frontend)
REM ============================================
echo.
echo [3/5] Running React Unit Tests...
echo ----------------------------------------

cd microservices\interface-clinique
if exist package.json (
    call npm test -- --watchAll=false --coverage --coverageDirectory="%RESULTS_DIR%\frontend-coverage" 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo [WARNING] Some React tests failed or no tests configured
    ) else (
        echo [OK] React unit tests passed
    )
) else (
    echo [SKIP] No package.json found
)
cd %PROJECT_ROOT%

REM ============================================
REM 4. Tests d'Intégration
REM ============================================
echo.
echo [4/5] Running Integration Tests...
echo ----------------------------------------

pytest tests/integration/ -v --junitxml="%RESULTS_DIR%\integration-results.xml"

if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Some integration tests failed
) else (
    echo [OK] Integration tests passed
)

REM ============================================
REM 5. SonarQube Scan (optionnel)
REM ============================================
echo.
echo [5/5] SonarQube Scan (if available)...
echo ----------------------------------------

where sonar-scanner >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    sonar-scanner
    echo [OK] SonarQube scan completed
) else (
    echo [SKIP] sonar-scanner not found
)

REM ============================================
REM Summary
REM ============================================
echo.
echo ============================================
echo     Test Execution Complete
echo ============================================
echo.
echo Results saved to: %RESULTS_DIR%
echo.
echo Available reports:
echo   - pytest-results.xml (Python tests)
echo   - integration-results.xml (Integration tests)
echo   - coverage.xml (Coverage report)
echo   - htmlcov/ (HTML coverage report)
echo.

pause
