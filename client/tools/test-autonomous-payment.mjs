/**
 * Autonomous Payment Test Script
 * 
 * This script demonstrates how the autonomous payment system works
 * by creating a context, sending a command that requires payment,
 * and letting the system handle the payment automatically.
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import api from '../lib/api.js';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dotenvPath = join(__dirname, '..', '.env.local');

try {
  // Try to load .env.local file
  const envConfig = config({ path: dotenvPath });
  
  if (!envConfig.parsed) {
    console.log('⚠️ No .env.local file found, attempting to read it directly');
    // Fallback: read the file directly and set environment variables
    try {
      const envContent = readFileSync(dotenvPath, 'utf8');
      envContent.split('\n').forEach(line => {
        const match = line.match(/^\s*(NEXT_PUBLIC_[^=]+)\s*=\s*(.*)$/);
        if (match && match[1] && match[2]) {
          const key = match[1].trim();
          const value = match[2].replace(/^['"]|['"]$/g, '').trim();
          process.env[key] = value;
        }
      });
      console.log('✅ Environment variables loaded directly from file');
    } catch (err) {
      console.log('⚠️ Failed to load environment variables:', err.message);
    }
  } else {
    console.log('✅ Environment variables loaded from .env.local');
  }
  
  // Log the client key (partially masked)
  const privateKey = process.env.NEXT_PUBLIC_CLIENT_PRIVATE_KEY;
  if (privateKey) {
    const maskedKey = privateKey.substring(0, 6) + '...' + privateKey.substring(privateKey.length - 4);
    console.log(`🔑 Using client private key: ${maskedKey}`);
  } else {
    console.log('⚠️ No client private key found in environment variables');
  }
} catch (error) {
  console.error('❌ Error loading environment variables:', error);
}

async function testAutonomousPayment() {
  try {
    console.log('🚀 Initializing autonomous payment test...');
    
    // Step 1: Create a new context
    console.log('📝 Creating a new context...');
    const createResult = await api.createContext();
    const contextId = createResult.contextId;
    console.log(`✅ Context created with ID: ${contextId}`);
    
    // Step 2: Send a command that requires payment
    console.log('💬 Sending command that requires payment: /hash test-data');
    console.log('🔄 This will trigger the autonomous payment flow...');
    
    const response = await api.sendMessage(
      contextId,
      '/hash test-autonomous-payment-system',
      'user',
      true // enable auto-payment
    );
    
    console.log('\n-------------------------------------------');
    console.log('✅ AUTONOMOUS PAYMENT PROCESS COMPLETED');
    console.log('-------------------------------------------\n');
    
    if (response.paymentRequired) {
      console.log('💰 Payment was required and processed automatically');
      console.log('📃 Payment Details:');
      console.log(`   - Transaction Hash: ${response.paymentResult.txHash}`);
      console.log(`   - Block Number: ${response.paymentResult.blockNumber}`);
      console.log(`   - Gas Used: ${response.paymentResult.gasUsed}`);
      
      if (response.paymentResult.explorerUrl) {
        console.log(`   - Explorer URL: ${response.paymentResult.explorerUrl}`);
      }
      
      console.log('\n🔢 SHA-1 Hash Result:');
      console.log(`   ${response.finalResponse.response.replace(/.*result:\s+|```/g, '').trim()}`);
    } else {
      console.log('ℹ️ No payment was required');
      console.log('📄 Response:', response.response);
    }
    
    console.log('\n✅ Test completed successfully');
    
  } catch (error) {
    console.error('\n❌ Error during autonomous payment test:', error);
    process.exit(1);
  }
}

// Run the test
testAutonomousPayment(); 