const { ethers } = require('ethers');

// Create a new random wallet
const wallet = ethers.Wallet.createRandom();

console.log('============================================');
console.log('GENERATED SERVER WALLET FOR TESTING PURPOSES ONLY!');
console.log('============================================');
console.log(`Address:     ${wallet.address}`);
console.log(`Private Key: ${wallet.privateKey}`);
console.log('============================================');
console.log('IMPORTANT: Only use this for testing!');
console.log('Add this private key to your .env file as SERVER_PRIVATE_KEY');
console.log('============================================'); 