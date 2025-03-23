const path = require('path');
const { runCommandWithRetry } = require('./utils/process');
const logger = require('./utils/logger');

async function installDependencies() {
    try {
        // Install root dependencies
        logger.title('Installing root dependencies...');
        await runCommandWithRetry('npm', ['install']);

        // Install server dependencies
        logger.title('Installing server dependencies...');
        const serverPath = path.join(process.cwd(), 'server');
        await runCommandWithRetry('npm', ['install'], { cwd: serverPath });

        // Install client dependencies
        logger.title('Installing client dependencies...');
        const clientPath = path.join(process.cwd(), 'client');
        await runCommandWithRetry('npm', ['install'], { cwd: clientPath });

        // Install client tools dependencies if they exist
        const clientToolsPath = path.join(process.cwd(), 'client', 'tools');
        try {
            await runCommandWithRetry('npm', ['install'], { cwd: clientToolsPath });
            logger.info('Client tools dependencies installed.');
        } catch (error) {
            logger.warn('No client tools dependencies to install.');
        }

        logger.success('All dependencies installed successfully!');
        logger.info('\nNext steps:');
        logger.info('1. Run setup wizard:    npm run setup');
        logger.info('2. Start the server:    npm run start-server');
        logger.info('3. Start the client:    npm run start-client');
    } catch (error) {
        logger.error(`Failed to install dependencies: ${error.message}`);
        process.exit(1);
    }
}

installDependencies(); 