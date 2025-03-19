@echo off
echo Installing server dependencies...
cd server
npm install
if %ERRORLEVEL% neq 0 (
  echo Failed to install server dependencies.
  exit /b %ERRORLEVEL%
)

echo.
echo Installing client dependencies...
cd ..\client
npm install
if %ERRORLEVEL% neq 0 (
  echo Failed to install client dependencies.
  exit /b %ERRORLEVEL%
)

echo.
echo All dependencies installed successfully!
cd .. 