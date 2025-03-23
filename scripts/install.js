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

        logger.success('All dependencies installed successfully!');
    } catch (error) {
        logger.error(`Failed to install dependencies: ${error.message}`);
        process.exit(1);
    }
}

installDependencies(); 