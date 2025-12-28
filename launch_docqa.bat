@echo off
setlocal EnableDelayedExpansion
title DocQA Services Launcher
color 0A

echo ============================================
echo          DocQA Services Launcher
echo ============================================
echo.

:: Set the project directory
set "PROJECT_DIR=C:\Users\karzo\OneDrive\Bureau\study\QA\DocQA"

:: Check if Docker Desktop is running
echo [1/4] Checking Docker Desktop...
docker info >nul 2>&1
if !ERRORLEVEL! neq 0 (
    echo      Docker is not running. Starting Docker Desktop...
    if exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" (
        start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    ) else (
        echo      [ERROR] Docker Desktop not found at default location.
        echo      Please start Docker Desktop manually.
        pause
        goto :menu
    )
    echo      Waiting for Docker to start (this may take up to 60 seconds^)...
    
    set DOCKER_READY=0
    for /L %%i in (1,1,12) do (
        if !DOCKER_READY!==0 (
            timeout /t 5 /nobreak >nul
            docker info >nul 2>&1
            if !ERRORLEVEL!==0 (
                set DOCKER_READY=1
                echo      Docker Desktop is now running!
            ) else (
                echo      Still waiting for Docker... [%%i/12]
            )
        )
    )
    
    if !DOCKER_READY!==0 (
        echo      [ERROR] Docker did not start in time.
        echo      Please start Docker Desktop manually and try again.
        pause
        goto :menu
    )
) else (
    echo      Docker Desktop is already running.
)
echo.

:: Check if Ollama is installed and start it
echo [2/4] Checking Ollama (for LLM service^)...
where ollama >nul 2>&1
if !ERRORLEVEL! equ 0 (
    echo      Starting Ollama in the background...
    start "" /min cmd /c "ollama serve"
    timeout /t 3 /nobreak >nul
    
    :: Check if llama3.1 model is available
    echo      Checking for llama3.1 model...
    ollama list 2>nul | findstr /i "llama3.1" >nul 2>&1
    if !ERRORLEVEL! neq 0 (
        echo      Model llama3.1 not found. You may need to pull it manually:
        echo      Run: ollama pull llama3.1:latest
    ) else (
        echo      Model llama3.1 is available.
    )
) else (
    echo      [WARNING] Ollama is not installed.
    echo      The LLM QA Module and Synthese services require Ollama.
    echo      Please install Ollama from: https://ollama.ai
)
echo.

:: Navigate to project directory and start Docker Compose
echo [3/4] Starting DocQA services with Docker Compose...
echo      Project directory: %PROJECT_DIR%
cd /d "%PROJECT_DIR%"

if not exist "docker-compose.yml" (
    echo      [ERROR] docker-compose.yml not found in project directory!
    echo      Please verify the project path.
    pause
    goto :menu
)

echo      Building and starting all containers...
echo      This may take several minutes on first run...
echo.
docker-compose up -d --build

if !ERRORLEVEL! neq 0 (
    echo.
    echo      [ERROR] Failed to start Docker Compose services.
    echo      Please check the error messages above.
    pause
    goto :menu
)

echo.
echo [4/4] Waiting for services to be ready...
timeout /t 10 /nobreak >nul

:: Display service status
echo.
echo ============================================
echo          Services Status
echo ============================================
docker-compose ps
echo.

echo ============================================
echo          Access URLs
echo ============================================
echo.
echo   Frontend (Interface Clinique^): http://localhost:3000
echo   API Gateway:                   http://localhost:8000
echo   RabbitMQ Management:           http://localhost:15672
echo        (User: docqa_user / Password: docqa_password^)
echo   PostgreSQL:                    localhost:5433
echo        (User: docqa_user / Password: docqa_password^)
echo.
echo ============================================
echo.

:menu
echo.
echo ============================================
echo   What would you like to do?
echo ============================================
echo   [1] Open Frontend in browser
echo   [2] View service logs
echo   [3] Stop all services
echo   [4] Exit
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" (
    start http://localhost:3000
    goto :menu
)
if "%choice%"=="2" (
    echo.
    echo Showing logs (press Ctrl+C to stop^)...
    docker-compose logs -f --tail=50
    goto :menu
)
if "%choice%"=="3" (
    echo.
    echo Stopping all services...
    docker-compose down
    echo Services stopped.
    pause
    goto :menu
)
if "%choice%"=="4" (
    echo.
    echo Goodbye!
    timeout /t 2 >nul
    exit /b 0
)

echo Invalid choice. Please try again.
goto :menu
