/**
 * Platform-agnostic startup script
 * 
 * Usage:
 *   node start.js client - Starts the client
 *   node start.js server - Starts the server
 *   node start.js test   - Runs the autonomous payment test
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Determine the component to start
const component = process.argv[2];

if (!component || !['client', 'server', 'test'].includes(component)) {
  console.log('Please specify a component to start:');
  console.log('  node start.js client - Start the Next.js client');
  console.log('  node start.js server - Start the MCP server');
  console.log('  node start.js test   - Run autonomous payment test');
  process.exit(1);
}

// Define commands for each component
const commands = {
  client: {
    cwd: path.join(__dirname, 'client'),
    cmd: 'npm',
    args: ['run', 'dev'],
    message: '🖥️ Starting client...'
  },
  server: {
    cwd: path.join(__dirname, 'server'),
    cmd: 'npm',
    args: ['start'],
    message: '⚙️ Starting server...'
  },
  test: {
    cwd: path.join(__dirname, 'client'),
    cmd: 'node',
    args: ['tools/test-autonomous-payment.mjs'],
    message: '🧪 Running autonomous payment test...'
  }
};

// Get the command configuration
const command = commands[component];

// Display startup message
console.log(command.message);

// Create and configure the process
const childProcess = spawn(command.cmd, command.args, {
  cwd: command.cwd,
  stdio: 'inherit', // This will pipe the child process I/O to the parent
  shell: true // Use shell for better cross-platform compatibility
});

// Handle process events
childProcess.on('error', (error) => {
  console.error(`Error starting ${component}:`, error.message);
  process.exit(1);
});

childProcess.on('close', (code) => {
  if (code !== 0) {
    console.log(`${component} process exited with code ${code}`);
  }
});

// Allow graceful shutdown when the parent process is terminated
process.on('SIGINT', () => {
  console.log(`\nShutting down ${component}...`);
  childProcess.kill('SIGINT');
});

// For the test component, show instructions for testing via the API endpoint
if (component === 'test') {
  console.log('\n🌐 You can also test via the API endpoint:');
  console.log('  http://localhost:3000/api/test-autonomous-payment');
} 