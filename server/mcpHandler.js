/**
 * Model Context Protocol (MCP) Handler
 * 
 * This module implements the core functionality of the MCP protocol,
 * processing messages and generating responses based on the context.
 */
const crypto = require('crypto');
const cryptoWallet = require('./cryptoWallet');

// Payment details
const PAYMENT_AMOUNT = "0.10"; // 0.10 USDC (human-readable format, USDC has 6 decimals)
const PAYMENT_CURRENCY = "USDC";
const PAYMENT_DESCRIPTION = "Premium tier access keys for compute resources";

// Tool functions
const tools = {
  // Free tier access keys generator
  // This is a free tool provided for testing and demonstration purposes
  // In a real-world scenario, this would represent a basic free tier functionality
  // that provides limited access keys with shorter validity
  freetieraccesskeys: () => {
    // Generate access keys (hash of current time)
    const currentTime = new Date().toISOString();
    const accessKeys = crypto.createHash('sha256').update(currentTime).digest('hex');
    
    return {
      result: `Free Tier Access Keys: ${accessKeys}\nValid for 1 hour. Use these keys to access basic compute resources.`,
      metadata: {
        tool: 'freetieraccesskeys',
        algorithm: 'sha256',
        validUntil: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), // 1 hour from now
        keyLength: accessKeys.length,
        tier: 'free'
      }
    };
  },
  
  // Payment-required premium access keys function
  // This tool provides premium access keys to fictional compute resources
  // with extended validity and higher resource limits
  paidtieraccesskeys: {
    requiresPayment: true,
    paymentAmount: PAYMENT_AMOUNT,
    paymentCurrency: PAYMENT_CURRENCY,
    
    execute: (text = "", paymentProof = null) => {
      // If no payment proof, return payment requirements
      if (!paymentProof) {
        return {
          paymentRequired: true,
          paymentDetails: {
            amount: PAYMENT_AMOUNT,  // Human-readable amount (0.10)
            currency: PAYMENT_CURRENCY,
            recipient: cryptoWallet.getAddress(),
            network: "Base Sepolia",
            message: `Please pay ${PAYMENT_AMOUNT} ${PAYMENT_CURRENCY} for ${PAYMENT_DESCRIPTION}.`
          }
        };
      }
      
      // With payment proof, verify before providing result
      return {
        verificationRequired: true,
        txHash: paymentProof,
        inputText: text
      };
    },
    
    // Separate function for verification to allow async
    verifyAndExecute: async (text, txHash) => {
      // Verify the payment
      const verificationResult = await cryptoWallet.verifyPayment(txHash, PAYMENT_AMOUNT);
      
      if (!verificationResult.verified) {
        return {
          result: `Payment verification failed: ${verificationResult.reason}`,
          metadata: {
            tool: 'paidtieraccesskeys',
            error: true,
            paymentVerified: false,
            reason: verificationResult.reason,
            // Include transaction details even on failure for better debugging
            txHash: verificationResult.txHash,
            explorerUrl: verificationResult.explorerUrl || null
          }
        };
      }
      
      // Payment verified, generate premium access keys (hash of current time)
      const currentTime = new Date().toISOString();
      const accessKeys = crypto.createHash('sha256').update(currentTime).digest('hex');
      return {
        result: `Premium Tier Access Keys: ${accessKeys}\nValid for 30 days. Use these keys to access premium compute resources with higher limits.`,
        metadata: {
          tool: 'paidtieraccesskeys',
          algorithm: 'sha256',
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          keyLength: accessKeys.length,
          tier: 'premium',
          paymentVerified: true,
          // Include all transaction details
          txHash: verificationResult.txHash,
          explorerUrl: verificationResult.explorerUrl,
          blockNumber: verificationResult.blockNumber,
          gasUsed: verificationResult.gasUsed,
          network: verificationResult.network || 'Base Sepolia',
          senderAddress: verificationResult.senderAddress,
          senderExplorerUrl: verificationResult.senderExplorerUrl,
          recipientAddress: verificationResult.recipientAddress,
          recipientExplorerUrl: verificationResult.recipientExplorerUrl,
          paymentAmount: verificationResult.amount,
          timestamp: verificationResult.timestamp
        }
      };
    }
  }
};

// Simulated model processing - in a real implementation, this would call an AI model
const simulateModelProcessing = async (prompt, context) => {
  // Check if the message is a tool command
  if (prompt.startsWith('/')) {
    const parts = prompt.substring(1).split(' ');
    let toolName = parts[0].toLowerCase();
    let actualInput = parts.slice(1).join(' ');
    let paymentProof = null;
    
    // Check if payment proof is included (format: /paidTierAccessKeys --tx=0x123...)
    const txMatch = actualInput.match(/--tx=([a-zA-Z0-9]+)/);
    if (txMatch) {
      paymentProof = txMatch[1];
      actualInput = actualInput.replace(/\s*--tx=[a-zA-Z0-9]+\s*/, ' ').trim();
    }
    
    // Handle tool invocation
    if (tools[toolName]) {
      try {
        // If tool requires payment
        if (tools[toolName].requiresPayment) {
          if (!paymentProof) {
            // First request - return payment requirements
            const paymentDetails = tools[toolName].execute(actualInput);
            return {
              response: `💰 This tool requires payment: ${PAYMENT_AMOUNT} ${PAYMENT_CURRENCY} to ${cryptoWallet.getAddress()}.\n\nPlease complete payment and resubmit with transaction hash using format:\n\`/${toolName} ${actualInput} --tx=YOUR_TX_HASH\`\n\nPayment goes to Wallet: \`${cryptoWallet.getAddress()}\` on Base Sepolia network.`,
              metadata: {
                requiresPayment: true,
                ...paymentDetails.paymentDetails
              }
            };
          } else {
            // Request with payment proof - verify and execute
            const verificationRequest = tools[toolName].execute(actualInput, paymentProof);
            if (verificationRequest.verificationRequired) {
              // Perform verification and execution (async)
              const result = await tools[toolName].verifyAndExecute(
                verificationRequest.inputText, 
                verificationRequest.txHash
              );
              
              if (result.metadata.error) {
                return {
                  response: `❌ ${result.result}`,
                  metadata: result.metadata
                };
              }
              
              // Format a more detailed success response
              const txDetails = result.metadata.explorerUrl 
                ? `[View Transaction](${result.metadata.explorerUrl})` 
                : `(TX: ${result.metadata.txHash.substring(0, 10)}...)`;
                
              return {
                response: `✅ Tool ${toolName} result:\n\n\`\`\`\n${result.result}\n\`\`\`\n\n**Transaction Details**\n- Amount: ${result.metadata.paymentAmount} ${PAYMENT_CURRENCY}\n- Block: ${result.metadata.blockNumber}\n- Gas Used: ${result.metadata.gasUsed}\n- ${txDetails}`,
                metadata: result.metadata
              };
            }
          }
        } else {
          // Regular non-payment tool
          const toolResult = tools[toolName](actualInput);
          return {
            response: `Tool ${toolName} result: ${toolResult.result}`,
            metadata: {
              processingTime: Math.random() * 50,
              toolName,
              ...toolResult.metadata
            }
          };
        }
      } catch (error) {
        return {
          response: `Error using tool ${toolName}: ${error.message}`,
          metadata: {
            processingTime: Math.random() * 50,
            error: true,
            toolName
          }
        };
      }
    } else {
      return {
        response: `Unknown tool: ${toolName}. Available tools: ${Object.keys(tools).join(', ')}`,
        metadata: {
          processingTime: Math.random() * 50,
          error: true
        }
      };
    }
  }
  
  // For regular messages (not tool commands), use the default echo behavior
  return {
    response: `Processed: ${prompt} (Context ID: ${context.id}, Messages: ${context.messages.length})`,
    metadata: {
      processingTime: Math.random() * 1000,
      tokensUsed: prompt.length * 0.5,
      model: "demo-model-v1"
    }
  };
};

/**
 * Process an incoming message within a context
 * @param {Object} context - The current conversation context
 * @param {Object} message - The new message to process
 * @returns {Promise<string>} The response to the message
 */
const processMessage = async (context, message) => {
  console.log(`Processing message in context ${context.id}`);
  
  // Extract the content from the message
  const { content } = message;
  
  // In a real implementation, we might preprocess the context and messages here
  // to format them appropriately for the model
  
  try {
    // Process the message with our simulated model
    const result = await simulateModelProcessing(content, context);
    
    // Store any metadata from processing in the context
    context.lastProcessingMetadata = result.metadata;
    
    return result.response;
  } catch (error) {
    console.error('Error in model processing:', error);
    throw new Error('Failed to process message with model');
  }
};

/**
 * Check if a given context is valid according to MCP specifications
 * @param {Object} context - The context to validate
 * @returns {boolean} Whether the context is valid
 */
const validateContext = (context) => {
  // Basic validation - check that required fields exist
  if (!context || !context.id || !Array.isArray(context.messages)) {
    return false;
  }
  
  // Ensure all messages have the required fields
  for (const message of context.messages) {
    if (!message.role || !message.content || !message.id) {
      return false;
    }
  }
  
  return true;
};

module.exports = {
  processMessage,
  validateContext,
  tools // Export tools for potential direct access
}; 