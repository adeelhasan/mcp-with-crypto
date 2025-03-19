import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '../lib/api';

export default function Home() {
  const [contexts, setContexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [demoResponse, setDemoResponse] = useState(null);
  const [demoStatus, setDemoStatus] = useState('idle'); // idle, loading, success, error
  const [demoError, setDemoError] = useState(null);
  
  // Load existing contexts on page load
  useEffect(() => {
    loadContexts();
  }, []);
  
  const loadContexts = async () => {
    try {
      setLoading(true);
      const loadedContexts = await api.listContexts();
      setContexts(loadedContexts || []);
    } catch (error) {
      console.error('Error loading contexts:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const createNewContext = async () => {
    try {
      setLoading(true);
      const result = await api.createContext();
      await loadContexts();
      return result.contextId;
    } catch (error) {
      console.error('Error creating context:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Demonstrates autonomous payment flow
  const demonstrateAutonomousPayment = async () => {
    setDemoStatus('loading');
    setDemoResponse(null);
    setDemoError(null);
    
    try {
      // Step 1: Create a new context
      console.log('🔄 Creating a new context...');
      const contextId = await createNewContext();
      
      if (!contextId) {
        throw new Error('Failed to create context');
      }
      
      console.log(`📝 Context created: ${contextId}`);
      
      // Step 2: Send hash command (this will require payment)
      console.log('🔄 Sending hash command...');
      const response = await api.sendMessage(
        contextId, 
        '/hash Hello, autonomous crypto payments!',
        'user',
        true // enable auto-payment
      );
      
      console.log('✅ Response received:', response);
      setDemoResponse(response);
      setDemoStatus('success');
      
    } catch (error) {
      console.error('❌ Demonstration error:', error);
      setDemoError(error.message || 'An unknown error occurred');
      setDemoStatus('error');
    }
  };
  
  return (
    <div className="container">
      <h1>MCP Client</h1>
      <p>This client demonstrates the Model Context Protocol (MCP) with autonomous crypto payments.</p>
      
      <div className="demo-section mt-4 mb-4 p-4 border rounded bg-light">
        <h2>Autonomous Payment Demonstration</h2>
        
        <div className="alert alert-primary">
          <h4>Machine-to-Machine Autonomous Payment</h4>
          <p>
            This demonstration shows how one machine can automatically pay another for services 
            without any human intervention. The entire flow is automated:
          </p>
          <ol>
            <li>Create a context</li>
            <li>Send a command requiring payment</li>
            <li>Detect payment requirement</li>
            <li>Process the payment</li>
            <li>Submit transaction proof</li>
            <li>Return the final result</li>
          </ol>
          
          <div className="d-grid gap-2 mb-3">
            <a 
              href="/api/test-autonomous-payment" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-lg btn-primary"
            >
              Run Autonomous Payment Test
            </a>
            <p className="text-muted mt-2">
              <small>
                This opens a JSON response showing the complete autonomous payment flow.
                Check the server console for detailed logs of the process.
              </small>
            </p>
          </div>
        </div>
        
        <details className="mt-4">
          <summary><strong>Alternative: UI-based demonstration (for visualization only)</strong></summary>
          <div className="mt-3">
            <p>
              This alternative demo uses the same autonomous payment system but provides 
              UI feedback. The payment still happens automatically without human approval.
            </p>
            
            <button 
              className="btn btn-outline-primary" 
              onClick={demonstrateAutonomousPayment} 
              disabled={demoStatus === 'loading'}
            >
              {demoStatus === 'loading' ? 'Processing...' : 'Run UI Payment Demo'}
            </button>
            
            {demoStatus === 'loading' && (
              <div className="alert alert-info mt-3">
                <p className="mb-0">Processing autonomous payment... Check console for detailed logs.</p>
              </div>
            )}
            
            {demoStatus === 'success' && demoResponse && (
              <div className="alert alert-success mt-3">
                <h4>Autonomous Payment Completed Successfully!</h4>
                
                {demoResponse.paymentRequired && (
                  <div>
                    <p><strong>Payment Details:</strong></p>
                    <ul>
                      <li>Transaction Hash: {demoResponse.paymentResult?.txHash}</li>
                      <li>Block Number: {demoResponse.paymentResult?.blockNumber}</li>
                    </ul>
                    
                    {demoResponse.paymentResult?.explorerUrl && (
                      <a 
                        href={demoResponse.paymentResult.explorerUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn btn-sm btn-outline-primary"
                      >
                        View Transaction
                      </a>
                    )}
                  </div>
                )}
                
                <hr />
                
                <p><strong>Tool Result:</strong></p>
                <pre className="bg-light p-2">{demoResponse.finalResponse?.response || demoResponse.response}</pre>
              </div>
            )}
            
            {demoStatus === 'error' && (
              <div className="alert alert-danger mt-3">
                <h4>Error</h4>
                <p>{demoError}</p>
              </div>
            )}
          </div>
        </details>
      </div>
      
      <h2>Contexts</h2>
      
      {loading ? (
        <p>Loading contexts...</p>
      ) : (
        <>
          <button className="btn btn-primary mb-3" onClick={createNewContext}>
            Create New Context
          </button>
          
          {contexts.length === 0 ? (
            <p>No contexts found. Create one to get started.</p>
          ) : (
            <div className="list-group">
              {contexts.map(context => (
                <Link 
                  href={`/context/${context.id}`} 
                  key={context.id}
                  className="list-group-item list-group-item-action"
                >
                  <div className="d-flex w-100 justify-content-between">
                    <h5 className="mb-1">Context {context.id.substring(0, 8)}...</h5>
                    <small>{new Date(context.created).toLocaleString()}</small>
                  </div>
                  <p className="mb-1">
                    Messages: {context.messages?.length || 0}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
} 