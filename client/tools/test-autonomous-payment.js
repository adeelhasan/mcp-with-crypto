/**
 * Autonomous Payment Test Script
 * 
 * This script demonstrates how the autonomous payment system works
 * by creating a context, sending a command that requires payment,
 * and letting the system handle the payment automatically.
 */
// Use dynamic import for ES modules
(async () => {
  try {
    console.log('🚀 Initializing test...');
    
    // Dynamically import the API module (since it uses ES module syntax)
    const { createContext, sendMessage } = await import('../lib/api.js');
    
    console.log('🚀 Testing autonomous crypto payment...');
    
    // Step 1: Create a new context
    console.log('📝 Creating a new context...');
    const createResult = await createContext();
    const contextId = createResult.contextId;
    console.log(`✅ Context created with ID: ${contextId}`);
    
    // Step 2: Send a command that requires payment
    console.log('💬 Sending command that requires payment: /hash test-data');
    console.log('🔄 This will trigger the autonomous payment flow...');
    
    const response = await sendMessage(
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
})(); 