# Client Setup Instructions

## Dependencies

Before running the client, you need to install the required dependencies:

```bash
npm install ethers@5.7.2
```

## Environment Variables

Create a `.env.local` file in the client directory with the following variables:

```
# API URL (default points to localhost:3001)
NEXT_PUBLIC_API_URL=http://localhost:3001

# Client wallet private key (IMPORTANT: Use a test account only, never use a real account with funds)
# This is used for automatic payments without requiring MetaMask
NEXT_PUBLIC_CLIENT_PRIVATE_KEY=your_private_key_here
```

### Private Key Setup

1. Use the included wallet generation script:
   ```bash
   # Navigate to the client directory
   cd client
   
   # Install ethers if you haven't already
   npm install ethers@5.7.2
   
   # Run the wallet generation script
   node tools/generate-wallet.js
   ```

   This will output a wallet address and private key you can use for testing.

2. Fund this wallet with Base Sepolia testnet ETH and USDC for testing:
   - Get testnet ETH from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-sepolia-faucet)
   - For testnet USDC, you may need to bridge from Sepolia or use a dedicated faucet

3. Copy the private key to your `.env.local` file

## Network Information

The application is configured to use the Base Sepolia testnet with the following details:

- **Network Name**: Base Sepolia Testnet
- **RPC URL**: https://sepolia.base.org
- **Chain ID**: 84532
- **Currency Symbol**: ETH
- **Block Explorer URL**: https://sepolia.basescan.org

## Running the Client

Start the client with:

```bash
npm run dev
```

Or using the provided script:

```bash
.\start-client.bat
```

## Automated Payment Flow

The client now uses a fully automated payment process:

1. When a payment-required tool is requested, the wallet will automatically:
   - Check if it has sufficient USDC balance
   - Sign and send the transaction
   - Wait for confirmation
   - Continue with the original request

2. No manual intervention is needed, except in case of errors:
   - If the transaction fails, a retry button will be available
   - You can also cancel the payment process

## Security Warning

**IMPORTANT**: This implementation uses a client-side private key approach for simplicity in a demo/testing environment. For production applications:

- NEVER store private keys in client-side code or environment variables
- Consider using a more secure approach like MetaMask for production
- Use secure key management services for any server-side operations

The current implementation trades security for simplicity and is intended for demonstration purposes only. 