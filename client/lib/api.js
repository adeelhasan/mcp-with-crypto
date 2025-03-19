/**
 * API Client for MCP Server
 */
import axios from 'axios';
import cryptoClient from './cryptoClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Create a new context on the MCP server
 * @param {Object} metadata - Optional metadata for the context
 * @returns {Promise<Object>} The created context
 */
export const createContext = async (metadata = {}) => {
  try {
    const response = await apiClient.post('/context', { metadata });
    return response.data;
  } catch (error) {
    console.error('Error creating context:', error);
    throw error;
  }
};

/**
 * Get a specific context by ID
 * @param {string} contextId - The ID of the context to retrieve
 * @returns {Promise<Object>} The retrieved context
 */
export const getContext = async (contextId) => {
  try {
    const response = await apiClient.get(`/context/${contextId}`);
    return response.data;
  } catch (error) {
    console.error(`Error getting context ${contextId}:`, error);
    throw error;
  }
};

/**
 * Extract payment details from a server response
 * @param {Object} response - Server response containing payment requirements
 * @returns {Object} Payment details including amount, recipient, etc.
 */
function extractPaymentDetails(response) {
  // Extract from response.metadata if it exists
  if (response.metadata && response.metadata.amount && response.metadata.recipient) {
    return {
      amount: response.metadata.amount,
      currency: response.metadata.currency || 'USDC',
      recipient: response.metadata.recipient,
      network: response.metadata.network || 'Base Sepolia'
    };
  }
  
  // Try to parse from response content
  const content = response.response || '';
  
  // Extract recipient address (assumes format like "payment: 0.10 USDC to 0x123...")
  const recipientMatch = content.match(/to\s+(`?)(0x[a-fA-F0-9]{40})\1/);
  const recipient = recipientMatch ? recipientMatch[2] : null;
  
  // Extract amount (assumes format like "payment: 0.10 USDC")
  const amountMatch = content.match(/payment:?\s+(\d+\.\d+)\s+([A-Z]+)/i) || 
                     content.match(/(\d+\.\d+)\s+([A-Z]+)/i);
  const amount = amountMatch ? amountMatch[1] : '0.10';
  const currency = amountMatch ? amountMatch[2] : 'USDC';
  
  return {
    amount,
    currency,
    recipient,
    network: 'Base Sepolia'
  };
}

/**
 * Checks if a response requires payment
 * @param {Object} response - Server response 
 * @returns {boolean} Whether payment is required
 */
function requiresPayment(response) {
  const responseText = response.response || '';
  return (
    (response.metadata && response.metadata.requiresPayment) ||
    responseText.includes('requires payment') || 
    responseText.includes('USDC') || 
    responseText.includes('--tx=')
  );
}

/**
 * Automatically handle payments when required
 * @param {string} contextId - Context ID
 * @param {string} command - Original command
 * @param {Object} initialResponse - Server response requiring payment
 * @returns {Promise<Object>} Result after payment is processed
 */
async function handlePaymentAutomatically(contextId, command, initialResponse) {
  console.log('🤖 Starting autonomous payment process...');
  
  try {
    // Extract payment details
    const paymentDetails = extractPaymentDetails(initialResponse);
    console.log('💰 Payment required:', paymentDetails);
    
    // Initialize wallet
    console.log('🔄 Initializing wallet connection...');
    const connected = await cryptoClient.connect();
    
    if (!connected) {
      throw new Error('Failed to connect wallet. Check if private key is properly configured');
    }
    
    // Check balance
    console.log('💲 Checking USDC balance...');
    const balance = await cryptoClient.getBalance();
    
    if (balance === null) {
      throw new Error('Failed to retrieve wallet balance');
    }
    
    if (parseFloat(balance) < parseFloat(paymentDetails.amount)) {
      throw new Error(`Insufficient USDC balance. Required: ${paymentDetails.amount}, Available: ${balance}`);
    }
    
    // Make payment
    console.log(`💸 Processing payment of ${paymentDetails.amount} USDC to ${paymentDetails.recipient}...`);
    const paymentResult = await cryptoClient.makePayment(
      paymentDetails.recipient,
      paymentDetails.amount
    );
    
    if (!paymentResult.success) {
      throw new Error(paymentResult.error || 'Payment failed');
    }
    
    console.log('✅ Payment completed successfully!');
    console.log('📃 Transaction details:', paymentResult);
    
    // Resubmit the original command with transaction hash
    const txHash = paymentResult.txHash;
    const commandWithTx = `${command} --tx=${txHash}`;
    
    console.log(`🔄 Resubmitting command with transaction hash: ${commandWithTx}`);
    
    // Send the command with transaction hash
    const finalResponse = await sendMessageRaw(contextId, commandWithTx);
    
    return {
      success: true,
      paymentRequired: true,
      paymentResult,
      finalResponse
    };
    
  } catch (error) {
    console.error('❌ Autonomous payment error:', error);
    throw error;
  }
}

/**
 * Raw implementation of sending a message (without payment handling)
 */
async function sendMessageRaw(contextId, content, role = 'user') {
  const response = await apiClient.post(`/context/${contextId}/message`, {
    role,
    content,
  });
  return response.data;
}

/**
 * Send a message to a specific context with automatic payment handling
 * @param {string} contextId - The ID of the target context
 * @param {string} content - The message content
 * @param {string} role - The role of the message sender (default: 'user')
 * @param {boolean} enableAutoPay - Whether to enable automatic payment (default: true)
 * @returns {Promise<Object>} The response, including the message and any model response
 */
export const sendMessage = async (contextId, content, role = 'user', enableAutoPay = true) => {
  try {
    // Send the initial message
    console.log(`📤 Sending message to context ${contextId}: ${content}`);
    const initialResponse = await sendMessageRaw(contextId, content, role);
    
    // Check if payment is required
    if (enableAutoPay && requiresPayment(initialResponse)) {
      console.log('💰 Payment required. Processing automatically...');
      return handlePaymentAutomatically(contextId, content, initialResponse);
    }
    
    // No payment required, return normal response
    return initialResponse;
  } catch (error) {
    console.error(`Error sending message to context ${contextId}:`, error);
    throw error;
  }
};

/**
 * List all available contexts
 * @returns {Promise<Array>} List of all contexts
 */
export const listContexts = async () => {
  try {
    const response = await apiClient.get('/contexts');
    return response.data.contexts;
  } catch (error) {
    console.error('Error listing contexts:', error);
    throw error;
  }
};

/**
 * Get all available tools from the server
 * @returns {Promise<Object>} The list of available tools and usage information
 */
export const getTools = async () => {
  try {
    const response = await apiClient.get('/tools');
    return response.data;
  } catch (error) {
    console.error('Error fetching tools:', error);
    throw error;
  }
};

export default {
  createContext,
  getContext,
  sendMessage,
  listContexts,
  getTools
}; 