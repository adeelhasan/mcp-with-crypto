import axios from 'axios';

export default async function handler(req, res) {
  const mcp_server_url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  try {
    // Check if the MCP server is available
    const response = await axios.get(`${mcp_server_url}/`);
    
    res.status(200).json({
      status: 'healthy',
      server: {
        status: 'connected',
        url: mcp_server_url,
        message: response.data
      }
    });
  } catch (error) {
    // Return a status indicating that the server is down
    res.status(200).json({
      status: 'unhealthy',
      server: {
        status: 'disconnected',
        url: mcp_server_url,
        error: error.message
      }
    });
  }
} 