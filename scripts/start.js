const path = require('path');
const { runCommand } = require('./utils/process');
const logger = require('./utils/logger');

async function startService() {
    const service = process.argv[2];
    if (!service || !['server', 'client'].includes(service)) {
        logger.error('Please specify which service to start: server or client');
        process.exit(1);
    }

    try {
        const servicePath = path.join(process.cwd(), service);
        const command = service === 'server' ? 'npx nodemon index.js' : 'npx next dev';
        
        logger.title(`Starting ${service}...`);
        await runCommand(command, [], { cwd: servicePath });
    } catch (error) {
        logger.error(`Failed to start ${service}: ${error.message}`);
        if (error.message.includes('nodemon') || error.message.includes('next')) {
            logger.info('Make sure all dependencies are installed by running: npm run install-all');
        }
        process.exit(1);
    }
}

startService(); 