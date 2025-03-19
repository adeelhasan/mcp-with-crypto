import React, { useState, useEffect } from 'react';
import { Modal, Button, Alert, Spinner } from 'react-bootstrap';
import cryptoClient from '../lib/cryptoClient';

export default function PaymentModal({ show, onHide, paymentInfo, onPaymentComplete }) {
  const [status, setStatus] = useState('idle'); // idle, connecting, paying, success, error
  const [error, setError] = useState(null);
  const [txDetails, setTxDetails] = useState(null);
  
  useEffect(() => {
    if (show && status === 'idle') {
      // Auto-start payment process when modal is shown
      startPayment();
    }
  }, [show]);
  
  const startPayment = async () => {
    console.log('⚙️ Starting automatic payment process...');
    
    try {
      // Step 1: Connect wallet
      setStatus('connecting');
      const connected = await cryptoClient.connect();
      
      if (!connected) {
        throw new Error('Failed to connect wallet');
      }
      
      console.log('👛 Wallet connected successfully');
      
      // Step 2: Check balance
      console.log('💲 Checking USDC balance...');
      const balance = await cryptoClient.getBalance();
      
      if (balance === null) {
        throw new Error('Failed to retrieve balance');
      }
      
      console.log(`💰 Current balance: ${balance} USDC`);
      
      if (parseFloat(balance) < parseFloat(paymentInfo.amount)) {
        throw new Error(`Insufficient USDC balance. Required: ${paymentInfo.amount}, Available: ${balance}`);
      }
      
      console.log(`✅ Balance sufficient for payment of ${paymentInfo.amount} USDC`);
      
      // Step 3: Make payment
      setStatus('paying');
      console.log(`💸 Processing payment to ${paymentInfo.recipient}...`);
      
      const result = await cryptoClient.makePayment(
        paymentInfo.recipient,
        paymentInfo.amount
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Payment failed');
      }
      
      setTxDetails(result);
      setStatus('success');
      console.log('✅ Payment completed successfully!');
      console.log(`📃 Transaction details:`, result);
      
      // Notify parent component
      if (onPaymentComplete) {
        onPaymentComplete(result);
      }
    } catch (err) {
      console.error('❌ Payment error:', err);
      setError(err.message);
      setStatus('error');
    }
  };
  
  const getStatusMessage = () => {
    switch (status) {
      case 'connecting':
        return (
          <div className="text-center">
            <Spinner animation="border" variant="primary" className="mb-2" />
            <p>Initializing wallet on Base Sepolia network...</p>
            <small className="text-muted">Connecting to blockchain and verifying wallet...</small>
          </div>
        );
      case 'paying':
        return (
          <div className="text-center">
            <Spinner animation="border" variant="primary" className="mb-2" />
            <p>Processing payment of {paymentInfo.amount} USDC automatically...</p>
            <small className="text-muted">This may take 15-30 seconds to confirm on the Base Sepolia network.</small>
          </div>
        );
      case 'success':
        return (
          <div className="text-center">
            <div className="mb-3 text-success">
              <i className="bi bi-check-circle-fill" style={{ fontSize: '2rem' }}></i>
            </div>
            <h5 className="text-success">Payment successful!</h5>
            {txDetails && (
              <div className="mt-3 text-start">
                <small className="d-block mb-1">
                  <strong>Transaction Hash:</strong> {txDetails.txHash.substring(0, 10)}...{txDetails.txHash.substring(txDetails.txHash.length - 10)}
                </small>
                <small className="d-block mb-1">
                  <strong>Block Number:</strong> {txDetails.blockNumber}
                </small>
                <small className="d-block mb-3">
                  <strong>Gas Used:</strong> {txDetails.gasUsed}
                </small>
                <div className="d-grid">
                  <a 
                    href={txDetails.explorerUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-sm btn-outline-primary"
                  >
                    View on Block Explorer
                  </a>
                </div>
              </div>
            )}
          </div>
        );
      case 'error':
        return (
          <div>
            <Alert variant="danger">
              <Alert.Heading>Payment Error</Alert.Heading>
              <p>{error || 'An unknown error occurred during payment'}</p>
              <hr />
              <p className="mb-0">
                Please check your wallet balance and try again. Make sure you have enough USDC and ETH for gas fees.
              </p>
            </Alert>
            <Button 
              variant="outline-primary" 
              onClick={startPayment} 
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header closeButton={status === 'success' || status === 'error'}>
        <Modal.Title>Crypto Payment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {getStatusMessage()}
      </Modal.Body>
      <Modal.Footer>
        {(status === 'success' || status === 'error') && (
          <Button variant="secondary" onClick={onHide}>
            Close
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
} 