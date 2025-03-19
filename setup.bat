@echo off
echo ===== MCP with Cryptocurrency Setup Wizard =====
echo.

echo Step 1: Installing dependencies...
call .\install.bat

echo.
echo Step 2: Setting up server wallet...
cd server
if not exist "tools" mkdir tools
if not exist ".env" (
    copy /y ".env.example" ".env"
    echo Created .env file from template
)

if not exist "tools\generate-wallet.js" (
    echo ERROR: Server wallet generation script not found! Please check your installation.
    pause
    exit /b 1
)

echo Generate a server wallet? (Y/N)
set /p CHOICE="Choice: "
if /i "%CHOICE%"=="Y" (
    node tools\generate-wallet.js
    echo Please copy the private key above to your server/.env file as SERVER_PRIVATE_KEY
    pause
)

echo.
echo Step 3: Setting up client wallet...
cd ..\client
if not exist "tools" mkdir tools
if not exist ".env.local" (
    copy /y ".env.local.example" ".env.local"
    echo Created .env.local file from template
)

if not exist "tools\generate-wallet.js" (
    echo ERROR: Client wallet generation script not found! Please check your installation.
    pause
    exit /b 1
)

echo Generate a client wallet? (Y/N)
set /p CHOICE="Choice: "
if /i "%CHOICE%"=="Y" (
    node tools\generate-wallet.js
    echo Please copy the private key above to your client/.env.local file as NEXT_PUBLIC_CLIENT_PRIVATE_KEY
    pause
)

cd ..
echo.
echo ===== Setup Complete =====
echo.
echo Next steps:
echo 1. Make sure to fund both wallets with Base Sepolia testnet ETH
echo 2. The client wallet also needs USDC on Base Sepolia testnet
echo 3. Start the server: .\start-server.bat
echo 4. Start the client: .\start-client.bat
echo.
pause 