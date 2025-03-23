const path = require('path');
const fs = require('fs').promises;
const inquirer = require('inquirer');
const { runCommand } = require('./utils/process');
const logger = require('./utils/logger');

async function copyEnvFile(sourcePath, targetPath) {
    try {
        await fs.access(targetPath);
        logger.info(`${targetPath} already exists, skipping...`);
    } catch {
        await fs.copyFile(sourcePath, targetPath);
        logger.success(`Created ${targetPath} from template`);
    }
}

async function generateWallet(service) {
    const answer = await inquirer.prompt([{
        type: 'confirm',
        name: 'generate',
        message: `Generate a ${service} wallet?`,
        default: false
    }]);

    if (answer.generate) {
        const servicePath = path.join(process.cwd(), service);
        const toolsPath = path.join(servicePath, 'tools');
        
        try {
            await fs.access(path.join(toolsPath, 'generate-wallet.js'));
        } catch {
            logger.error(`${service} wallet generation script not found!`);
            return;
        }

        try {
            await runCommand('node tools/generate-wallet.js', [], { cwd: servicePath });
            logger.info(`Please copy the private key above to your ${service}/.env file as ${service === 'server' ? 'SERVER' : 'NEXT_PUBLIC_CLIENT'}_PRIVATE_KEY`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Give user time to read
        } catch (error) {
            logger.error(`Failed to generate ${service} wallet: ${error.message}`);
        }
    }
}

async function setup() {
    try {
        logger.title('MCP with Cryptocurrency Setup Wizard');

        // Ensure tools directories exist
        await fs.mkdir(path.join(process.cwd(), 'server', 'tools'), { recursive: true });
        await fs.mkdir(path.join(process.cwd(), 'client', 'tools'), { recursive: true });

        // Copy env files
        await copyEnvFile(
            path.join(process.cwd(), 'server', '.env.example'),
            path.join(process.cwd(), 'server', '.env')
        );
        await copyEnvFile(
            path.join(process.cwd(), 'client', '.env.local.example'),
            path.join(process.cwd(), 'client', '.env.local')
        );

        // Generate wallets
        await generateWallet('server');
        await generateWallet('client');

        logger.title('Setup Complete!');
        logger.info('Next steps:');
        logger.step('1. Make sure to fund both wallets with Base Sepolia testnet ETH');
        logger.step('2. The client wallet also needs USDC on Base Sepolia testnet');
        logger.step('3. Start the server: npm run start-server');
        logger.step('4. Start the client: npm run start-client');

    } catch (error) {
        logger.error(`Setup failed: ${error.message}`);
        process.exit(1);
    }
}

setup(); 