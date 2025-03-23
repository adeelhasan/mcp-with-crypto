const { spawn } = require('child_process');
const logger = require('./logger');

function runCommand(command, args, options = {}) {
    return new Promise((resolve, reject) => {
        const proc = spawn(command, args, {
            stdio: 'inherit',
            shell: true,
            ...options
        });

        proc.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Command failed with exit code ${code}`));
                return;
            }
            resolve();
        });

        proc.on('error', (err) => {
            reject(err);
        });
    });
}

async function runCommandWithRetry(command, args, options = {}, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            await runCommand(command, args, options);
            return;
        } catch (error) {
            if (i === retries - 1) {
                throw error;
            }
            logger.warning(`Command failed, retrying... (${i + 1}/${retries})`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

module.exports = {
    runCommand,
    runCommandWithRetry
}; 