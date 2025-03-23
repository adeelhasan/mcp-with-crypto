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

/**
 * Run a command with retry logic
 * @param {string} command - The command to run
 * @param {string[]} args - Command arguments
 * @param {Object} options - Spawn options
 * @param {number} retries - Number of retries (default: 3)
 * @returns {Promise<void>}
 */
async function runCommandWithRetry(command, args = [], options = {}, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await new Promise((resolve, reject) => {
                const proc = spawn(command, args, {
                    ...options,
                    stdio: 'inherit',
                    shell: true
                });

                proc.on('close', (code) => {
                    if (code === 0) {
                        resolve();
                    } else {
                        reject(new Error(`Command failed with exit code ${code}`));
                    }
                });

                proc.on('error', (err) => {
                    reject(new Error(`Failed to start command: ${err.message}`));
                });
            });
            return; // Success
        } catch (error) {
            if (attempt === retries) {
                throw error; // Last attempt failed
            }
            logger.warn(`Attempt ${attempt} failed, retrying...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
}

module.exports = {
    runCommand,
    runCommandWithRetry
}; 