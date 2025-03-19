@echo off
echo Generating test wallet for client...
node tools/generate-wallet.js
echo.
echo Remember to add the private key to your .env.local file!
pause 