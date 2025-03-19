const { ethers } = require('ethers');

// Create a new random wallet
const wallet = ethers.Wallet.createRandom();

console.log('============================================');
console.log('GENERATED WALLET FOR TESTING PURPOSES ONLY!');
console.log('============================================');
console.log(`Address:     ${wallet.address}`);
console.log(`Private Key: ${wallet.privateKey}`);
console.log('============================================');
console.log('IMPORTANT: Only use this for testing!');
console.log('Fund this wallet with testnet tokens only.');
console.log('============================================'); 