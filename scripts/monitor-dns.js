const axios = require('axios');
const chalk = require('chalk');
const ora = require('ora');
const Table = require('cli-table3');
const { program } = require('commander');

// Configurações
const CONFIG = {
    domain: 'vocalcoach.ai',
    nameservers: [
        'candy.ns.cloudflare.com',
        'sage.ns.cloudflare.com'
    ],
    checkInterval: 14400000, // 4 horas em milissegundos
    regions: [
        'us-east',
        'us-west',
        'eu-west',
        'eu-central',
        'asia-east',
        'asia-southeast',
        'australia-southeast'
    ]
};

// Função para verificar propagação DNS
async function checkDNSPropagation() {
    const spinner = ora('Verificando propagação DNS...').start();
    const table = new Table({
        head: ['Região', 'Status', 'Tempo'],
        colWidths: [20, 20, 20]
    });

    try {
        for (const region of CONFIG.regions) {
            const startTime = Date.now();
            const response = await axios.get(`https://dns.google/resolve?name=${CONFIG.domain}&type=NS`);
            const endTime = Date.now();
            
            const nsRecords = response.data.Answer || [];
            const matchingNS = nsRecords.filter(record => 
                CONFIG.nameservers.some(ns => record.data.includes(ns))
            );

            const status = matchingNS.length === CONFIG.nameservers.length;
            const timeElapsed = `${(endTime - startTime) / 1000}s`;

            table.push([
                region,
                status ? chalk.green('✓ Propagado') : chalk.red('✗ Pendente'),
                timeElapsed
            ]);
        }

        spinner.stop();
        console.log('\nStatus de Propagação DNS:');
        console.log(table.toString());

        // Verificar se todos os nameservers estão propagados
        const allPropagated = table.length === CONFIG.regions.length && 
            table.every(row => row[1].includes('✓'));

        if (allPropagated) {
            console.log(chalk.green('\n✓ DNS totalmente propagado!'));
            console.log(chalk.cyan('Próximos passos:'));
            console.log('1. Configurar registros SPF no Cloudflare');
            console.log('2. Configurar DKIM no Cloudflare');
            console.log('3. Configurar DMARC no Cloudflare');
            process.exit(0);
        } else {
            console.log(chalk.yellow('\n⚠️ DNS ainda em propagação'));
            console.log(`Próxima verificação em 4 horas (${new Date(Date.now() + CONFIG.checkInterval).toLocaleTimeString()})`);
        }
    } catch (error) {
        spinner.fail('Erro ao verificar propagação DNS');
        console.error(chalk.red('Erro:'), error.message);
        process.exit(1);
    }
}

// Configurar CLI
program
    .version('1.0.0')
    .option('-i, --interval <minutes>', 'Intervalo de verificação em minutos', '240')
    .option('-o, --once', 'Executar apenas uma vez')
    .parse(process.argv);

const options = program.opts();

// Função principal
async function main() {
    console.log(chalk.cyan('🌐 Monitor de Propagação DNS - VocalCoach AI'));
    console.log(chalk.gray(`Domain: ${CONFIG.domain}`));
    console.log(chalk.gray('Nameservers:'));
    CONFIG.nameservers.forEach(ns => console.log(chalk.gray(`- ${ns}`)));
    console.log('');

    await checkDNSPropagation();

    if (!options.once) {
        setInterval(checkDNSPropagation, CONFIG.checkInterval);
    }
}

// Executar
main().catch(console.error); 