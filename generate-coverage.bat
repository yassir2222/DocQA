@echo off
echo ============================================
echo   DocQA-MS Coverage Generation Script
echo ============================================
echo.

echo [1/5] Running Python tests with coverage...
cd /d "%~dp0"
pytest tests/unit/ --cov=microservices --cov-report=xml:coverage.xml --cov-report=term -v
echo.

echo [2/5] Building and testing audit-logger (Java)...
cd microservices\audit-logger
call mvn clean test jacoco:report -q
cd ..\..
echo.

echo [3/5] Building and testing deid-service (Java)...
cd microservices\deid-service
call mvn clean test jacoco:report -q
cd ..\..
echo.

echo [4/5] Building and testing indexeur-semantique (Java)...
cd microservices\indexeur-semantique
call mvn clean test jacoco:report -q
cd ..\..
echo.

echo [5/5] Building and testing synthese-comparative (Java)...
cd microservices\synthese-comparative
call mvn clean test jacoco:report -q
cd ..\..
echo.

echo ============================================
echo   Coverage reports generated!
echo ============================================
echo.
echo Python coverage: coverage.xml
echo Java coverage:
echo   - microservices/audit-logger/target/site/jacoco/jacoco.xml
echo   - microservices/deid-service/target/site/jacoco/jacoco.xml
echo   - microservices/indexeur-semantique/target/site/jacoco/jacoco.xml
echo   - microservices/synthese-comparative/target/site/jacoco/jacoco.xml
echo.
echo Now run: sonar-scanner
