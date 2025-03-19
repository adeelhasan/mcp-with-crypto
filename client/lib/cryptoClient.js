import { ethers } from 'ethers';

// USDC Contract details on Base Sepolia testnet
const USDC_CONTRACT_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Base Sepolia USDC address
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

// Base Sepolia testnet RPC URL
const RPC_URL = "https://sepolia.base.org";

// USDC has 6 decimal places (unlike ETH which has 18)
const USDC_DECIMALS = 6;

// Default gas limit to use when estimation fails
const DEFAULT_GAS_LIMIT = 100000;

class CryptoClient {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.usdcContract = null;
    this.connected = false;
    this.initialized = false;
    
    console.log("💰 Crypto payment system initialized");
  }
  
  async initialize() {
    if (this.initialized) return true;
    
    console.log("🔄 Initializing wallet connection to Base Sepolia...");
    
    try {
      // Create provider using RPC URL
      this.provider = new ethers.providers.JsonRpcProvider(RPC_URL);
      console.log(`🌐 Connected to Base Sepolia RPC: ${RPC_URL}`);
      
      // Check if we have a private key in the environment
      const privateKey = process.env.NEXT_PUBLIC_CLIENT_PRIVATE_KEY;
      
      if (!privateKey) {
        console.error("❌ No private key provided in environment variables");
        return false;
      }
      
      // Create wallet with private key
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      
      // Create USDC contract instance
      this.usdcContract = new ethers.Contract(
        USDC_CONTRACT_ADDRESS,
        USDC_ABI,
        this.wallet
      );
      
      console.log(`✅ Wallet initialized with address: ${this.wallet.address}`);
      console.log(`💵 USDC contract connected at: ${USDC_CONTRACT_ADDRESS}`);
      
      this.initialized = true;
      this.connected = true;
      return true;
    } catch (error) {
      console.error('❌ Error initializing wallet:', error);
      return false;
    }
  }
  
  async connect() {
    return this.initialize();
  }
  
  async getAddress() {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.wallet ? this.wallet.address : null;
  }
  
  async makePayment(recipient, amount) {
    if (!this.connected) {
      console.log("🔄 Wallet not connected, initializing...");
      const connected = await this.initialize();
      if (!connected) {
        console.error("❌ Failed to initialize wallet connection");
        return {
          success: false,
          error: "Failed to initialize wallet"
        };
      }
    }
    
    try {
      // Get and log current balance
      const currentBalance = await this.getBalance();
      console.log(`💰 Current wallet balance: ${currentBalance} USDC`);
      
      // Convert human-readable amount (e.g., 0.10) to USDC units (with 6 decimals)
      const amountInWei = ethers.utils.parseUnits(amount, USDC_DECIMALS);
      
      console.log(`💸 Preparing payment of ${amount} USDC (${amountInWei.toString()} base units) to ${recipient}`);
      console.log(`📝 Transaction details: 
  - From: ${this.wallet.address}
  - To: ${recipient}
  - Amount: ${amount} USDC
  - Network: Base Sepolia`);
      
      // Try to estimate gas, but use a default if it fails
      let gasLimit;
      try {
        const gasEstimate = await this.usdcContract.estimateGas.transfer(recipient, amountInWei);
        console.log(`⛽ Estimated gas for transaction: ${gasEstimate.toString()}`);
        gasLimit = gasEstimate;
      } catch (error) {
        console.warn(`⚠️ Gas estimation failed: ${error.message}`);
        console.log(`⚠️ Using default gas limit of ${DEFAULT_GAS_LIMIT}`);
        gasLimit = ethers.BigNumber.from(DEFAULT_GAS_LIMIT);
      }
      
      // Send USDC transaction with explicit gas limit
      console.log("🔄 Sending transaction...");
      const tx = await this.usdcContract.transfer(recipient, amountInWei, {
        gasLimit: gasLimit
      });
      console.log(`📤 Transaction sent! Hash: ${tx.hash}`);
      console.log(`🔍 View on explorer: https://sepolia.basescan.org/tx/${tx.hash}`);
      
      // Wait for transaction confirmation
      console.log("⏳ Waiting for transaction confirmation...");
      const receipt = await tx.wait(1); // Wait for 1 confirmation
      console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}!`);
      console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
      
      // Get updated balance
      const newBalance = await this.getBalance();
      console.log(`💰 New wallet balance: ${newBalance} USDC`);
      
      return {
        success: true,
        txHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        explorerUrl: `https://sepolia.basescan.org/tx/${receipt.transactionHash}`
      };
    } catch (error) {
      console.error('❌ Error making payment:', error);
      
      // Provide more detailed error information
      let errorMessage = error.message || 'Unknown error';
      if (error.code) {
        console.error(`Error code: ${error.code}`);
      }
      
      // Check for specific error types
      if (errorMessage.includes('insufficient funds')) {
        console.error('💡 This may be due to insufficient ETH for gas fees.');
      } else if (errorMessage.includes('UNPREDICTABLE_GAS_LIMIT')) {
        console.error('💡 Gas estimation failed. This could indicate an issue with the token contract or insufficient ETH for gas.');
      } else if (errorMessage.includes('gas required exceeds allowance')) {
        console.error('💡 Gas required exceeds allowance. The wallet may need more ETH for gas fees.');
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  async getBalance() {
    if (!this.connected) {
      const connected = await this.initialize();
      if (!connected) return null;
    }
    
    try {
      const balance = await this.usdcContract.balanceOf(this.wallet.address);
      // Convert from token base units (with 6 decimals) to human-readable format
      const formattedBalance = ethers.utils.formatUnits(balance, USDC_DECIMALS);
      console.log(`💰 Wallet ${this.wallet.address} has ${formattedBalance} USDC (${balance.toString()} base units)`);
      return formattedBalance;
    } catch (error) {
      console.error('❌ Error getting balance:', error);
      return null;
    }
  }
}

// Create and export a singleton instance
const cryptoClient = new CryptoClient();
export default cryptoClient; 