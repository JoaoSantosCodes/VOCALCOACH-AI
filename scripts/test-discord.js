require('dotenv').config();
const { discordService } = require('../dist/services/discord.service');
const { LogLevel } = require('../dist/types/monitoring');

async function testWebhooks() {
    console.log('🔍 Iniciando testes dos webhooks Discord...\n');

    const webhooks = ['alerts', 'errors', 'info', 'beta'];
    const results = [];

    for (const webhook of webhooks) {
        try {
            console.log(`📡 Testando webhook: ${webhook}`);
            const result = await discordService.testWebhook(webhook);
            
            if (result.success) {
                console.log(`✅ ${webhook}: Teste bem sucedido (Status: ${result.status})`);
                results.push({ webhook, success: true });
            } else {
                console.error(`❌ ${webhook}: Falha no teste`);
                console.error(`   Status: ${result.status}`);
                console.error(`   Mensagem: ${result.message}`);
                results.push({ webhook, success: false, error: result.message });
            }
        } catch (error) {
            console.error(`❌ ${webhook}: Erro ao testar`);
            console.error(`   ${error.message}`);
            results.push({ webhook, success: false, error: error.message });
        }
        console.log(''); // Linha em branco para separação
    }

    // Teste de mensagens de diferentes níveis
    console.log('🔍 Testando níveis de log...\n');

    const testMessages = [
        {
            level: LogLevel.INFO,
            title: 'Teste de Informação',
            message: 'Esta é uma mensagem de teste de nível INFO'
        },
        {
            level: LogLevel.WARN,
            title: 'Teste de Aviso',
            message: 'Esta é uma mensagem de teste de nível WARN'
        },
        {
            level: LogLevel.ERROR,
            title: 'Teste de Erro',
            message: 'Esta é uma mensagem de teste de nível ERROR'
        },
        {
            level: LogLevel.ALERT,
            title: 'Teste de Alerta',
            message: 'Esta é uma mensagem de teste de nível ALERT'
        }
    ];

    for (const test of testMessages) {
        try {
            console.log(`📡 Enviando mensagem ${test.level}`);
            const result = await discordService.sendAlert(
                test.title,
                test.message,
                test.level
            );

            if (result.success) {
                console.log(`✅ ${test.level}: Mensagem enviada (Status: ${result.status})`);
                results.push({ level: test.level, success: true });
            } else {
                console.error(`❌ ${test.level}: Falha no envio`);
                console.error(`   Status: ${result.status}`);
                console.error(`   Mensagem: ${result.message}`);
                results.push({ level: test.level, success: false, error: result.message });
            }
        } catch (error) {
            console.error(`❌ ${test.level}: Erro ao enviar`);
            console.error(`   ${error.message}`);
            results.push({ level: test.level, success: false, error: error.message });
        }
        console.log(''); // Linha em branco para separação
    }

    // Teste de mensagem beta
    console.log('🔍 Testando mensagem beta...\n');

    try {
        const betaResult = await discordService.sendBetaUpdate(
            'Teste do Sistema Beta',
            'Esta é uma mensagem de teste do sistema beta',
            {
                'Usuários Ativos': 150,
                'Exercícios Completados': 1250,
                'Satisfação': '4.8/5.0'
            }
        );

        if (betaResult.success) {
            console.log('✅ Beta: Mensagem enviada com sucesso');
            results.push({ type: 'beta', success: true });
        } else {
            console.error('❌ Beta: Falha no envio');
            console.error(`   Status: ${betaResult.status}`);
            console.error(`   Mensagem: ${betaResult.message}`);
            results.push({ type: 'beta', success: false, error: betaResult.message });
        }
    } catch (error) {
        console.error('❌ Beta: Erro ao enviar');
        console.error(`   ${error.message}`);
        results.push({ type: 'beta', success: false, error: error.message });
    }

    // Resumo dos testes
    console.log('\n📊 Resumo dos Testes:');
    const successful = results.filter(r => r.success).length;
    const total = results.length;
    console.log(`✓ ${successful}/${total} testes bem sucedidos`);
    
    if (successful === total) {
        console.log('\n🎉 Todos os testes completados com sucesso!');
    } else {
        console.log('\n⚠️ Alguns testes falharam. Verifique os logs acima.');
        process.exit(1);
    }
}

testWebhooks().catch(error => {
    console.error('❌ Erro fatal durante os testes:', error);
    process.exit(1);
}); 