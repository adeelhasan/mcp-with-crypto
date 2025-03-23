const chalk = require('chalk');

const logger = {
    title: (message) => {
        console.log('\n' + chalk.blue.bold(message));
    },
    
    success: (message) => {
        console.log(chalk.green('✓ ' + message));
    },
    
    error: (message) => {
        console.error(chalk.red('✖ ' + message));
    },
    
    warn: (message) => {
        console.warn(chalk.yellow('⚠ ' + message));
    },
    
    info: (message) => {
        console.log(chalk.cyan('ℹ ' + message));
    },
    
    step: (message) => console.log(chalk.cyan('→'), message)
};

module.exports = logger; 