@echo off
echo Generating test wallet for server...
node tools/generate-wallet.js
echo.
echo Remember to add the private key to your .env file!
pause 