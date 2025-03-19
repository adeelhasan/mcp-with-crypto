# MCP with Cryptocurrency Payments

This project implements the Model Context Protocol (MCP) with cryptocurrency payment functionality using the Base blockchain.

## Overview

The Model Context Protocol (MCP) provides a standardized way for AI models to maintain context in conversations. This implementation adds cryptocurrency payments for certain tools/features, demonstrating how to monetize AI services.

### Key Features

- **Paid Tools**: Certain tools in the MCP server (like the hash function) require payment
- **Base Integration**: Uses Base blockchain (Ethereum L2) for fast, low-cost transactions
- **Automatic Payments**: Client handles payments automatically with a private key (for demo purposes)
- **Transaction Verification**: Server verifies payments before providing the service

## Quick Start

Run the setup script to quickly configure the project:

```bash
.\setup.bat
```

This will:
1. Install dependencies for both server and client
2. Create environment files from templates
3. Optionally generate test wallets for both server and client
4. Guide you through the setup process

After setup, you need to:
1. Fund the server wallet with Base Sepolia testnet ETH
2. Fund the client wallet with Base Sepolia testnet ETH and USDC
3. Start the server: `.\start-server.bat`
4. Start the client: `.\start-client.bat`

## Architecture

The system consists of:

1. **MCP Server**:
   - Manages contexts and conversations
   - Processes tool requests
   - Verifies cryptocurrency payments
   - Includes payment-required tools

2. **MCP Client**:
   - Web interface for conversations
   - Automated cryptocurrency wallet
   - Payment handling via private key
   - Seamless payment flow

3. **Blockchain Components**:
   - Base Sepolia testnet for development
   - USDC stablecoin for payments
   - Ethers.js for blockchain interactions

## Payment Flow

1. **Client requests a paid tool** (e.g., `/hash hello world`)
2. **Server responds** with payment requirements
3. **Client automatically processes payment** using the configured wallet
4. **Server verifies the transaction** on the Base blockchain
5. **Server delivers the service** once payment is confirmed

## Detailed Setup Instructions

For more detailed setup instructions, see:

- [Server Setup Instructions](server/SETUP.md)
- [Client Setup Instructions](client/SETUP.md)

## Wallet Generation

Both the server and client need cryptocurrency wallets for operation:

### Server Wallet
```bash
cd server
.\generate-wallet.bat
```

### Client Wallet
```bash
cd client
.\generate-wallet.bat
```

Copy the generated private keys to the respective environment files.

## Security Considerations

This implementation is for demonstration purposes:

- The client-side private key approach is not recommended for production
- For a production environment, consider using:
  - MetaMask or similar wallet interfaces
  - Server-side custody solutions
  - Secure key management services

## Future Enhancements

Potential improvements to consider:

- Confirmation requirements based on payment amount
- Different pricing tiers for different tools
- Subscription-based payment models
- Multiple cryptocurrency options
- Receipt generation and payment history 