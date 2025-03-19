# Server Setup Instructions

## Dependencies

Before running the server, you need to install the required dependencies:

```bash
npm install ethers@5.7.2
```

## Wallet Setup

1. Generate a server wallet for testing:

   ```bash
   # Navigate to the server directory
   cd server
   
   # Run the wallet generation script
   .\generate-wallet.bat
   # Or directly with Node:
   # node tools/generate-wallet.js
   ```

   This will output a wallet address and private key. Copy the private key for the next step.

2. Fund this wallet with Base Sepolia testnet ETH for transaction gas:
   - Get testnet ETH from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-sepolia-faucet)

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```
# Server configuration
PORT=3001

# Crypto wallet configuration from the generated wallet
SERVER_PRIVATE_KEY=your_private_key_here

# USDC contract address on Base Sepolia testnet
USDC_CONTRACT_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e
```

Notes:
- If you don't provide a SERVER_PRIVATE_KEY, the server will run in demo mode with a randomly generated wallet
- For production, always use a secure private key management system
- Never commit your .env file to version control

## Running the Server

Start the server with:

```bash
npm run dev
```

Or using the provided script:

```bash
.\start-server.bat
``` 