/**
 * Autonomous Payment Test API
 * 
 * This API endpoint demonstrates machine-to-machine autonomous payment flow
 * with no human interaction required. The entire process happens automatically:
 * 1. Create a context
 * 2. Send a command that requires payment
 * 3. Detect payment requirement
 * 4. Process the payment
 * 5. Submit the transaction hash as proof
 * 6. Return the final result
 */
import api from '../../lib/api';

export default async function handler(req, res) {
  console.log('\n');
  console.log('===========================================================');
  console.log('🤖 AUTONOMOUS CRYPTO PAYMENT DEMONSTRATION');
  console.log('===========================================================');
  
  try {
    const startTime = Date.now();
    
    // Step 1: Create a new context
    console.log('\n📝 STEP 1: Creating a new context...');
    const createResult = await api.createContext();
    const contextId = createResult.contextId;
    console.log(`✅ Context created with ID: ${contextId}`);
    
    // Step 2: Send a command that requires payment
    console.log('\n💬 STEP 2: Sending command that requires payment');
    console.log('Command: /hash test-autonomous-payment-system');
    console.log('🔄 This will trigger the autonomous payment flow...');
    
    const response = await api.sendMessage(
      contextId,
      '/hash test-autonomous-payment-system',
      'user',
      true // enable auto-payment
    );
    
    console.log('\n===========================================================');
    console.log('✅ AUTONOMOUS PAYMENT PROCESS COMPLETED');
    console.log('===========================================================\n');
    
    // Format time taken
    const endTime = Date.now();
    const totalTime = ((endTime - startTime) / 1000).toFixed(2);
    
    let resultData = {
      success: true,
      message: 'Autonomous payment test completed successfully',
      timeTaken: `${totalTime} seconds`,
      contextId,
      paymentRequired: !!response.paymentRequired,
    };
    
    if (response.paymentRequired) {
      console.log('💰 Payment was required and processed automatically');
      console.log('📃 Payment Details:');
      console.log(`   - Transaction Hash: ${response.paymentResult.txHash}`);
      console.log(`   - Block Number: ${response.paymentResult.blockNumber}`);
      console.log(`   - Gas Used: ${response.paymentResult.gasUsed}`);
      
      if (response.paymentResult.explorerUrl) {
        console.log(`   - Explorer URL: ${response.paymentResult.explorerUrl}`);
      }
      
      resultData.paymentResult = {
        txHash: response.paymentResult.txHash,
        blockNumber: response.paymentResult.blockNumber,
        gasUsed: response.paymentResult.gasUsed,
        explorerUrl: response.paymentResult.explorerUrl
      };
      
      console.log('\n🔢 SHA-1 Hash Result:');
      const hashResult = response.finalResponse.response.replace(/.*result:\s+|```/g, '').trim();
      console.log(`   ${hashResult}`);
      
      resultData.result = {
        type: 'SHA-1 Hash',
        value: hashResult
      };
      
      resultData.finalResponse = response.finalResponse;
    } else {
      console.log('ℹ️ No payment was required');
      console.log('📄 Response:', response.response);
      
      resultData.result = {
        type: 'Direct Response',
        value: response.response
      };
      
      resultData.finalResponse = response;
    }
    
    console.log('\n✅ Test completed successfully in', totalTime, 'seconds');
    
    return res.status(200).json(resultData);
    
  } catch (error) {
    console.error('\n❌ Error during autonomous payment test:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Unknown error during autonomous payment test'
    });
  }
} 