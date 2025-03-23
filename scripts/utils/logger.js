const chalk = require('chalk');

const logger = {
    info: (message) => console.log(chalk.blue('ℹ'), message),
    success: (message) => console.log(chalk.green('✓'), message),
    warning: (message) => console.log(chalk.yellow('⚠'), message),
    error: (message) => console.log(chalk.red('✖'), message),
    step: (message) => console.log(chalk.cyan('→'), message),
    title: (message) => console.log('\n' + chalk.bold.cyan(message) + '\n')
};

module.exports = logger; 