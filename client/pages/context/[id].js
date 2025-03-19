import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getContext, sendMessage } from '../../lib/api';
import ToolsPanel from '../../components/ToolsPanel';
import PaymentModal from '../../components/PaymentModal';

export default function ContextPage() {
  const router = useRouter();
  const { id } = router.query;
  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [pendingMessage, setPendingMessage] = useState('');
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  // Load context data when the ID is available
  useEffect(() => {
    if (!id) return;

    const fetchContext = async () => {
      try {
        setLoading(true);
        const result = await getContext(id);
        setContext(result.context);
        setError(null);
      } catch (err) {
        console.error(`Failed to load context ${id}:`, err);
        setError(`Failed to load context. The context may not exist or the server might be offline.`);
      } finally {
        setLoading(false);
      }
    };

    fetchContext();
  }, [id]);

  // Auto-scroll to the bottom of the messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [context?.messages]);

  // Send a new message to the context
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !id) return;
    
    // Store message for potential retry after payment
    setPendingMessage(message);
    
    try {
      setSending(true);
      const result = await sendMessage(id, message);
      
      // Check if payment is required
      if (result.response?.metadata?.requiresPayment) {
        setPaymentRequired(true);
        setPaymentDetails(result.response.metadata);
        setSending(false);
        return;
      }
      
      setContext(result.context);
      setMessage('');
      setError(null);
    } catch (err) {
      console.error(`Failed to send message to context ${id}:`, err);
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };
  
  // Handle payment completion
  const handlePaymentComplete = (txHash) => {
    // Close payment modal
    setPaymentRequired(false);
    
    // Resubmit the message with transaction hash
    if (pendingMessage) {
      const toolCommand = pendingMessage.split(' ')[0];
      const toolInput = pendingMessage.substring(toolCommand.length).trim();
      const messageWithTx = `${toolCommand} ${toolInput} --tx=${txHash}`;
      
      // Update the message input and submit
      setMessage(messageWithTx);
      setTimeout(() => {
        handleSendMessage({ preventDefault: () => {} });
      }, 100);
    }
  };
  
  // Handle payment cancellation
  const handlePaymentCancel = () => {
    setPaymentRequired(false);
    setPendingMessage('');
  };

  // Handle tool selection
  const handleToolSelect = (toolCommand) => {
    setMessage(toolCommand);
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  };

  // Format message content to highlight tool results
  const formatMessageContent = (content) => {
    if (content.startsWith('Tool ') && content.includes('result: ')) {
      const parts = content.split('result: ');
      if (parts.length > 1) {
        return (
          <>
            <span>{parts[0]}result: </span>
            <div className="tool-result">{parts[1]}</div>
          </>
        );
      }
    }
    return content;
  };

  if (!id) {
    return <div className="container loading">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="header">
        <Link href="/">
          <a>← Back to Home</a>
        </Link>
        <h1>Context: {id?.substring(0, 8)}...</h1>
      </div>

      {error && <div className="error">{error}</div>}

      {loading ? (
        <div className="loading">Loading context...</div>
      ) : (
        <>
          <ToolsPanel onSelectTool={handleToolSelect} />
          
          <div className="message-container">
            {context?.messages.length === 0 ? (
              <p>No messages yet. Send your first message below.</p>
            ) : (
              <>
                {context?.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message message-${msg.role}`}
                  >
                    <strong>{msg.role.charAt(0).toUpperCase() + msg.role.slice(1)}:</strong>{' '}
                    {msg.role === 'assistant' ? formatMessageContent(msg.content) : msg.content}
                    <div className="metadata">
                      {new Date(msg.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}

            <form onSubmit={handleSendMessage} className="message-form">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={sending}
                className="message-input"
                placeholder="Type your message here or use a tool (e.g., /capitalize hello)"
                ref={messageInputRef}
              />
              <button
                type="submit"
                disabled={sending || !message.trim()}
                className="message-button"
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>

          {context?.metadata && (
            <div className="metadata">
              <h3>Context Metadata</h3>
              <pre>{JSON.stringify(context.metadata, null, 2)}</pre>
            </div>
          )}

          {context?.lastProcessingMetadata && (
            <div className="metadata">
              <h3>Last Processing Metadata</h3>
              <pre>{JSON.stringify(context.lastProcessingMetadata, null, 2)}</pre>
            </div>
          )}
        </>
      )}

      {paymentRequired && (
        <PaymentModal 
          paymentDetails={paymentDetails}
          onPaymentComplete={handlePaymentComplete}
          onCancel={handlePaymentCancel}
        />
      )}
    </div>
  );
} 