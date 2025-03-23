# MCP with Cryptocurrency Payments

This project implements the Model Context Protocol (MCP) with cryptocurrency payment functionality using the Base blockchain.

## Overview

The Model Context Protocol (MCP) provides a standardized way for AI models to maintain context in conversations. This implementation adds cryptocurrency payments for certain tools/features, demonstrating how to monetize AI services.

### Key Features

- **Paid Tools**: Certain tools in the MCP server (like the hash function) require payment
- **Base Integration**: Uses Base blockchain (Ethereum L2) for fast, low-cost transactions
- **Automatic Payments**: Client handles payments automatically with a private key (for demo purposes)
- **Transaction Verification**: Server verifies payments before providing the service
- **Autonomous Payment Flow**: Complete machine-to-machine payment handling with no user intervention

## Quick Start

This project uses Node.js scripts that work across all platforms (Windows, macOS, Linux). To get started:

```bash
# Install all dependencies (root, server, client)
npm run install-all

# Run the setup wizard
npm run setup
```

This will:
1. Install dependencies for both server and client
2. Create environment files from templates
3. Optionally generate test wallets for both server and client
4. Guide you through the setup process

After setup, you need to:
1. Fund the server wallet with Base Sepolia testnet ETH
2. Fund the client wallet with Base Sepolia testnet ETH and USDC

## Running the System

Use the included start script to run the system components:

```bash
# Start the server
node start.js server

# Start the client
node start.js client

# Run the autonomous payment test
node start.js test
```

You can also use npm scripts for the same functionality:

```bash
npm run start-server
npm run start-client
npm run test-payment
```

## Testing Autonomous Payments

The system includes an autonomous payment test that demonstrates the end-to-end payment flow:

1. **Using the command-line test**:
   ```bash
   node start.js test
   ```
   This runs a fully automated test that creates a context, sends a command requiring payment, and processes the payment automatically.

2. **Using the API endpoint** (requires the client to be running):
   - Navigate to: http://localhost:3000/api/test-autonomous-payment
   - This endpoint demonstrates the machine-to-machine payment flow with detailed logs.

3. **Using the web interface**:
   - Start the client and navigate to http://localhost:3000
   - Use the "Run Payment Demo" button in the Autonomous Payment Demo section.

The test demonstrates:
- Automatic detection of payment requirements
- Wallet initialization and balance checking
- Transaction creation and signing
- Blockchain confirmation monitoring
- Payment verification by the server
- Service delivery after payment confirmation

## Architecture

The system consists of:

1. **Cross-Platform Scripts**:
   - Platform-agnostic Node.js scripts for setup and operation
   - Unified command interface across all operating systems
   - Automated dependency management

2. **MCP Server**:
   - Manages contexts and conversations
   - Processes tool requests
   - Verifies cryptocurrency payments
   - Includes payment-required tools

3. **MCP Client**:
   - Web interface for conversations
   - Automated cryptocurrency wallet
   - Payment handling via private key
   - Seamless payment flow

4. **Blockchain Components**:
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

Both the server and client need cryptocurrency wallets for operation. The setup wizard includes a cross-platform wallet generation tool:

```bash
npm run setup
```

The wizard will:
1. Guide you through wallet generation for both server and client
2. Create appropriate environment files for your platform
3. Help you securely store the generated private keys
4. Provide instructions for funding the wallets

You can also generate wallets manually:

```bash
# Server wallet
cd server
node tools/generate-wallet.js

# Client wallet
cd client
node tools/generate-wallet.js
```

When prompted, choose to generate wallets for both server and client. Copy the generated private keys to the respective environment files:
- Server: `server/.env`
- Client: `client/.env.local`

## Security Considerations

This implementation is provided as a demonstration of cryptocurrency payments for AI services and is not intended for production use:

### Payment Verification

The system includes a basic payment verification mechanism that:
- Confirms payments on the blockchain before providing service
- Verifies transaction amounts and recipient addresses
- Associates payments with specific requests

### Demonstration Limitations

This is a technology demonstration with simplified security measures:
- Payment verification happens off-chain rather than through smart contracts
- A more robust implementation would use custom smart contracts for payment verification
- Full on-chain verification would require additional blockchain development beyond this demo's scope

### Additional Security Notes

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
- Smart contract integration for more complex payment scenarios
- Payment channel implementation for frequent micro-transactions 