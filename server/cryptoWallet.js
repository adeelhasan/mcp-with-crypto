/**
 * Crypto Wallet Management for MCP Server
 * 
 * This module handles server-side crypto wallet operations,
 * including address generation and payment verification.
 */
const { ethers } = require('ethers');
require('dotenv').config();

// USDC Contract details on Base Sepolia testnet
// Get the contract address from environment variables or use default
const USDC_CONTRACT_ADDRESS = process.env.USDC_CONTRACT_ADDRESS || "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

// Base Sepolia RPC URL
const RPC_URL = "https://sepolia.base.org";

// Base Sepolia Block Explorer URL
const BLOCK_EXPLORER_URL = "https://sepolia.basescan.org";

// USDC has 6 decimal places (unlike ETH which has 18)
const USDC_DECIMALS = 6;

// USDC ABI - Only including the functions we need
const USDC_ABI = [
  // Read-only functions
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  
  // Transaction functions
  "function transfer(address to, uint amount) returns (bool)",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

class CryptoWallet {
  constructor() {
    try {
      // Check if the server private key is defined
      if (!process.env.SERVER_PRIVATE_KEY) {
        console.warn("SERVER_PRIVATE_KEY not defined in .env file. Using a demo key for testing only.");
        // Use a demo private key for testing (DO NOT USE IN PRODUCTION)
        this.demoMode = true;
      }
      
      // Setup provider for Base Sepolia testnet
      this.provider = new ethers.providers.JsonRpcProvider(RPC_URL);
      
      // Initialize wallet with private key or use a demo wallet
      if (this.demoMode) {
        // Demo wallet - never use in production or store real funds here
        const demoWallet = ethers.Wallet.createRandom();
        this.wallet = demoWallet.connect(this.provider);
        console.log(`DEMO MODE: Generated wallet address: ${this.wallet.address}`);
        console.log(`DEMO MODE: This is a randomly generated wallet for demonstration only!`);
      } else {
        // Use the server's private key from environment variables
        this.wallet = new ethers.Wallet(process.env.SERVER_PRIVATE_KEY, this.provider);
        console.log(`Server wallet initialized: ${this.wallet.address}`);
      }
      
      // Initialize USDC contract interface
      this.usdcContract = new ethers.Contract(
        USDC_CONTRACT_ADDRESS,
        USDC_ABI,
        this.wallet
      );
      
      console.log(`Using USDC contract at: ${USDC_CONTRACT_ADDRESS}`);
      
    } catch (error) {
      console.error("Error initializing crypto wallet:", error);
      // Create a fallback wallet for demo purposes
      this.demoMode = true;
      const demoWallet = ethers.Wallet.createRandom();
      this.wallet = demoWallet;
      console.log(`FALLBACK MODE: Using demo wallet: ${this.wallet.address}`);
    }
  }
  
  /**
   * Get the wallet's address
   * @returns {string} The wallet address
   */
  getAddress() {
    return this.wallet.address;
  }
  
  /**
   * Get block explorer URL for a transaction
   * @param {string} txHash - Transaction hash
   * @returns {string} Block explorer URL
   */
  getExplorerUrl(txHash) {
    return `${BLOCK_EXPLORER_URL}/tx/${txHash}`;
  }

  /**
   * Get block explorer URL for an address
   * @param {string} address - Ethereum address
   * @returns {string} Block explorer URL
   */
  getAddressExplorerUrl(address) {
    return `${BLOCK_EXPLORER_URL}/address/${address}`;
  }
  
  /**
   * Convert USDC amount from human-readable to base units
   * @param {string|number} amount - Amount in human-readable format (e.g., 0.10)
   * @returns {string} Amount in base units (e.g., 100000 for 0.10 USDC)
   */
  parseUsdcUnits(amount) {
    return ethers.utils.parseUnits(amount.toString(), USDC_DECIMALS).toString();
  }

  /**
   * Convert USDC amount from base units to human-readable
   * @param {string|number|BigNumber} amount - Amount in base units
   * @returns {string} Amount in human-readable format
   */
  formatUsdcUnits(amount) {
    return ethers.utils.formatUnits(amount, USDC_DECIMALS);
  }
  
  /**
   * Verify a payment transaction
   * @param {string} txHash - Transaction hash to verify
   * @param {string} expectedAmount - Expected payment amount in USDC (human-readable format)
   * @returns {Promise<Object>} Verification result
   */
  async verifyPayment(txHash, expectedAmount) {
    try {
      console.log(`🔍 Verifying payment transaction: ${txHash} for ${expectedAmount} USDC (${this.parseUsdcUnits(expectedAmount)} base units)`);
      
      // In demo mode, just simulate a successful transaction verification
      if (this.demoMode) {
        console.log(`DEMO MODE: Simulating verification of transaction ${txHash}`);
        // 80% chance of successful verification in demo mode
        if (Math.random() < 0.8) {
          return {
            verified: true,
            amount: expectedAmount,
            rawAmount: this.parseUsdcUnits(expectedAmount),
            timestamp: new Date().toISOString(),
            txHash: txHash,
            explorerUrl: this.getExplorerUrl(txHash),
            senderAddress: '0x' + '1'.repeat(40), // Demo sender address
            recipientAddress: this.wallet.address,
            recipientExplorerUrl: this.getAddressExplorerUrl(this.wallet.address),
            blockNumber: 12345678,
            gasUsed: '21000',
            network: 'Base Sepolia'
          };
        } else {
          return {
            verified: false,
            reason: "Demo mode random failure",
            txHash: txHash,
            explorerUrl: this.getExplorerUrl(txHash)
          };
        }
      }
      
      // Get transaction receipt
      console.log(`📝 Fetching transaction receipt...`);
      const receipt = await this.provider.getTransactionReceipt(txHash);
      if (!receipt) {
        console.log(`❌ Transaction not found or not confirmed`);
        return { 
          verified: false, 
          reason: "Transaction not found or not confirmed",
          txHash: txHash,
          explorerUrl: this.getExplorerUrl(txHash)
        };
      }
      
      // Check if transaction was successful
      if (receipt.status !== 1) {
        console.log(`❌ Transaction failed with status: ${receipt.status}`);
        return { 
          verified: false, 
          reason: "Transaction failed", 
          txHash: txHash,
          explorerUrl: this.getExplorerUrl(txHash),
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString()
        };
      }
      
      // Get transaction details
      console.log(`📊 Fetching transaction details...`);
      const tx = await this.provider.getTransaction(txHash);
      
      // Check if this is a transaction to the USDC contract
      if (tx.to.toLowerCase() !== USDC_CONTRACT_ADDRESS.toLowerCase()) {
        console.log(`❌ Transaction not sent to USDC contract`);
        return { 
          verified: false, 
          reason: "Transaction not sent to USDC contract",
          txHash: txHash,
          explorerUrl: this.getExplorerUrl(txHash),
          actualContractAddress: tx.to,
          expectedContractAddress: USDC_CONTRACT_ADDRESS,
          senderAddress: tx.from,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString()
        };
      }
      
      // Parse the transaction data
      console.log(`🔄 Parsing transaction data...`);
      const decodedData = this.usdcContract.interface.parseTransaction({ data: tx.data, value: tx.value });
      
      // Check if this is a transfer function
      if (decodedData.name !== 'transfer') {
        console.log(`❌ Not a transfer transaction, function called: ${decodedData.name}`);
        return { 
          verified: false, 
          reason: `Not a transfer transaction (function: ${decodedData.name})`,
          txHash: txHash,
          explorerUrl: this.getExplorerUrl(txHash),
          senderAddress: tx.from,
          functionName: decodedData.name,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString()
        };
      }
      
      // Validate recipient is our wallet
      if (decodedData.args[0].toLowerCase() !== this.wallet.address.toLowerCase()) {
        console.log(`❌ Payment not sent to correct address. Expected: ${this.wallet.address}, Actual: ${decodedData.args[0]}`);
        return { 
          verified: false, 
          reason: "Payment not sent to correct address", 
          txHash: txHash,
          explorerUrl: this.getExplorerUrl(txHash),
          senderAddress: tx.from,
          actualRecipient: decodedData.args[0],
          expectedRecipient: this.wallet.address,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString()
        };
      }
      
      // Get the amount transferred (USDC has 6 decimals)
      const decimals = await this.usdcContract.decimals();
      if (decimals !== USDC_DECIMALS) {
        console.warn(`⚠️ Warning: USDC contract reports ${decimals} decimals, but we expected ${USDC_DECIMALS}`);
      }
      
      const rawAmount = decodedData.args[1];
      const amountPaid = this.formatUsdcUnits(rawAmount);
      
      console.log(`💰 Payment amount: ${amountPaid} USDC (${rawAmount.toString()} base units) - expected: ${expectedAmount} USDC (${this.parseUsdcUnits(expectedAmount)} base units)`);
      
      // Verify the amount
      if (parseFloat(amountPaid) < parseFloat(expectedAmount)) {
        console.log(`❌ Insufficient payment`);
        return { 
          verified: false, 
          reason: `Insufficient payment: expected ${expectedAmount} USDC, received ${amountPaid} USDC`,
          txHash: txHash,
          explorerUrl: this.getExplorerUrl(txHash),
          senderAddress: tx.from,
          senderExplorerUrl: this.getAddressExplorerUrl(tx.from),
          recipientAddress: this.wallet.address,
          recipientExplorerUrl: this.getAddressExplorerUrl(this.wallet.address),
          amountPaid: amountPaid,
          rawAmountPaid: rawAmount.toString(),
          expectedAmount: expectedAmount,
          expectedRawAmount: this.parseUsdcUnits(expectedAmount),
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString()
        };
      }
      
      console.log(`✅ Payment verified successfully`);
      
      // Return comprehensive transaction details on success
      return {
        verified: true,
        amount: amountPaid,
        rawAmount: rawAmount.toString(),
        timestamp: new Date().toISOString(),
        txHash: txHash,
        explorerUrl: this.getExplorerUrl(txHash),
        senderAddress: tx.from,
        senderExplorerUrl: this.getAddressExplorerUrl(tx.from),
        recipientAddress: this.wallet.address,
        recipientExplorerUrl: this.getAddressExplorerUrl(this.wallet.address),
        blockNumber: receipt.blockNumber,
        blockHash: receipt.blockHash,
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: tx.gasPrice.toString(),
        network: 'Base Sepolia',
        contractAddress: USDC_CONTRACT_ADDRESS
      };
      
    } catch (error) {
      console.error("❌ Error verifying payment:", error);
      return { 
        verified: false, 
        reason: `Verification error: ${error.message}`,
        txHash: txHash,
        explorerUrl: this.getExplorerUrl(txHash)
      };
    }
  }
}

// Create and export a singleton instance
module.exports = new CryptoWallet(); 