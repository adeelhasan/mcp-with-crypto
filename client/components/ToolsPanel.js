import React, { useState, useEffect } from 'react';
import { getTools } from '../lib/api';

const ToolsPanel = ({ onSelectTool }) => {
  const [tools, setTools] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  // Load available tools from the server
  useEffect(() => {
    const fetchTools = async () => {
      try {
        setLoading(true);
        const result = await getTools();
        setTools(result);
        setError(null);
      } catch (err) {
        console.error('Failed to load tools:', err);
        setError('Failed to load tools. The server might be offline.');
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, []);

  // Handler for when a tool is selected
  const handleToolSelect = (toolName) => {
    if (onSelectTool && tools?.tools[toolName]) {
      onSelectTool(`/${toolName} `);
    }
    setExpanded(false);
  };

  if (loading) {
    return (
      <div className="tools-panel">
        <div className="tools-header" onClick={() => setExpanded(!expanded)}>
          🧰 Tools <span className="tools-toggle">{expanded ? '▼' : '▶'}</span>
        </div>
        <div className="tools-content" style={{ display: expanded ? 'block' : 'none' }}>
          <div className="loading">Loading tools...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tools-panel">
        <div className="tools-header" onClick={() => setExpanded(!expanded)}>
          🧰 Tools <span className="tools-toggle">{expanded ? '▼' : '▶'}</span>
        </div>
        <div className="tools-content" style={{ display: expanded ? 'block' : 'none' }}>
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="tools-panel">
      <div className="tools-header" onClick={() => setExpanded(!expanded)}>
        🧰 Tools <span className="tools-toggle">{expanded ? '▼' : '▶'}</span>
      </div>
      {expanded && (
        <div className="tools-content">
          <p className="tools-usage">{tools?.usage}</p>
          
          <div className="tools-list">
            {tools?.tools && Object.entries(tools.tools).map(([toolName, toolInfo]) => (
              <div key={toolName} className="tool-item">
                <div className="tool-name" onClick={() => handleToolSelect(toolName)}>
                  <strong>/{toolName}</strong>
                  {toolInfo.paymentRequired && (
                    <span className="payment-badge">💰 Paid</span>
                  )}
                </div>
                <div className="tool-description">{toolInfo.description}</div>
                {toolInfo.paymentRequired && (
                  <div className="payment-info">
                    <span>Payment: {toolInfo.paymentAmount} {toolInfo.paymentCurrency} on {toolInfo.paymentNetwork}</span>
                  </div>
                )}
                <div className="tool-example">
                  <small>Example: {toolInfo.example}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolsPanel; 