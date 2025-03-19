const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Import MCP protocol handler
const mcpHandler = require('./mcpHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Track active contexts
const activeContexts = new Map();

// Tool descriptions for discovery
const toolDescriptions = {
  capitalize: {
    name: 'capitalize',
    description: 'Converts input text to all uppercase letters',
    usage: '/capitalize your text here',
    example: '/capitalize hello world -> HELLO WORLD'
  },
  hash: {
    name: 'hash',
    description: 'Generates a SHA-1 hash of the input text (requires payment of 0.10 USDC on Base)',
    usage: '/hash your text here',
    example: '/hash hello world -> Payment required -> Pay 0.10 USDC -> /hash hello world --tx=0x123... -> 2aae6c35c94fcfb415dbe95f408b9ce91ee846ed',
    paymentRequired: true,
    paymentAmount: '0.10',
    paymentCurrency: 'USDC',
    paymentNetwork: 'Base Sepolia'
  }
};

// Routes
app.get('/', (req, res) => {
  res.send('MCP Server is running');
});

// Create a new context
app.post('/context', (req, res) => {
  const contextId = uuidv4();
  const initialContext = {
    id: contextId,
    created: new Date().toISOString(),
    messages: [],
    metadata: req.body.metadata || {}
  };
  
  activeContexts.set(contextId, initialContext);
  
  console.log(`Created new context: ${contextId}`);
  res.json({ contextId, context: initialContext });
});

// Get a specific context
app.get('/context/:contextId', (req, res) => {
  const { contextId } = req.params;
  
  if (!activeContexts.has(contextId)) {
    return res.status(404).json({ error: 'Context not found' });
  }
  
  res.json({ context: activeContexts.get(contextId) });
});

// Add a message to a context
app.post('/context/:contextId/message', async (req, res) => {
  const { contextId } = req.params;
  const { role, content } = req.body;
  
  if (!activeContexts.has(contextId)) {
    return res.status(404).json({ error: 'Context not found' });
  }
  
  const context = activeContexts.get(contextId);
  
  // Add the message to the context
  const message = {
    id: uuidv4(),
    role,
    content,
    timestamp: new Date().toISOString()
  };
  
  context.messages.push(message);
  
  // Process the message via the MCP handler if it's a user message
  let response = null;
  if (role === 'user') {
    try {
      response = await mcpHandler.processMessage(context, message);
      
      // Add the response to the context
      if (response) {
        const responseMsg = {
          id: uuidv4(),
          role: 'assistant',
          content: response,
          timestamp: new Date().toISOString()
        };
        context.messages.push(responseMsg);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      return res.status(500).json({ error: 'Failed to process message' });
    }
  }
  
  // Update the context
  activeContexts.set(contextId, context);
  
  res.json({
    message,
    response,
    context
  });
});

// List all contexts (for demo purposes)
app.get('/contexts', (req, res) => {
  const contexts = Array.from(activeContexts.values());
  res.json({ contexts });
});

// List available tools
app.get('/tools', (req, res) => {
  res.json({ 
    tools: toolDescriptions,
    usage: "To use a tool, send a message that starts with '/' followed by the tool name and the input, e.g., '/capitalize hello world'. Some tools require payment in cryptocurrency. For these tools, you'll receive payment instructions and need to resubmit with your transaction hash using format: '/toolname input --tx=YOUR_TX_HASH'"
  });
});

// Server start
app.listen(PORT, () => {
  console.log(`MCP Server running on port ${PORT}`);
}); 