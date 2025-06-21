#!/usr/bin/env node

require('dotenv').config();
const axios = require('axios');

// URLs dos webhooks Discord
const webhooks = {
    alerts: process.env.DISCORD_WEBHOOK_ALERTS,
    errors: process.env.DISCORD_WEBHOOK_ERRORS,
    monitoring: process.env.DISCORD_WEBHOOK_MONITORING,
    backup: process.env.DISCORD_WEBHOOK_BACKUP,
    beta: process.env.DISCORD_WEBHOOK_BETA
};

async function testWebhook(name, url) {
    if (!url) {
        console.log(`❌ ${name}: URL não configurada`);
        return false;
    }

    try {
        const payload = {
            username: `VocalCoach-${name.charAt(0).toUpperCase() + name.slice(1)}`,
            content: `🔍 Teste do webhook ${name}`,
            embeds: [{
                title: 'Teste de Webhook',
                description: `Este é um teste do webhook ${name} do VocalCoach AI`,
                color: 0x00FF00,
                timestamp: new Date().toISOString(),
                footer: {
                    text: 'VocalCoach AI - Teste de Sistema'
                }
            }]
        };

        const response = await axios.post(url, payload);
        
        if (response.status === 204) {
            console.log(`✅ ${name}: Teste bem sucedido`);
            return true;
        } else {
            console.log(`❌ ${name}: Status inesperado ${response.status}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ ${name}: Erro - ${error.message}`);
        return false;
    }
}

async function testAllWebhooks() {
    console.log('🔍 Iniciando testes dos webhooks Discord...\n');
    
    const results = [];
    
    for (const [name, url] of Object.entries(webhooks)) {
        const success = await testWebhook(name, url);
        results.push({ name, success });
        console.log(''); // Linha em branco
    }
    
    // Resumo
    console.log('📊 Resumo dos Testes:');
    console.log('='.repeat(50));
    
    const successful = results.filter(r => r.success).length;
    const total = results.length;
    
    results.forEach(result => {
        const status = result.success ? '✅' : '❌';
        console.log(`${status} ${result.name}`);
    });
    
    console.log(`\n📈 Resultado: ${successful}/${total} webhooks funcionando`);
    
    if (successful === total) {
        console.log('🎉 Todos os webhooks estão funcionando corretamente!');
    } else {
        console.log('⚠️ Alguns webhooks falharam. Verifique as configurações.');
    }
}

// Executar testes
testAllWebhooks().catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
}); 