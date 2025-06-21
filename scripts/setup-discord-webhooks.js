const readline = require('readline');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: 'config/env/staging.env' });

// Interface de leitura
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Função para perguntar
function ask(question) {
    return new Promise(resolve => {
        rl.question(question, resolve);
    });
}

// Função para validar URL de webhook
function isValidWebhookUrl(url) {
    const webhookRegex = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[a-zA-Z0-9_-]+$/;
    return webhookRegex.test(url);
}

// Função para testar webhook
async function testWebhook(webhookUrl, name) {
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: `🧪 Teste de webhook: ${name} - ${new Date().toISOString()}`,
                username: 'VocalCoach AI Setup',
                avatar_url: 'https://vocalcoach.ai/logo.png'
            })
        });

        if (response.ok) {
            return { success: true, status: response.status };
        } else {
            return { success: false, status: response.status, error: await response.text() };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Função para atualizar arquivo de ambiente
function updateEnvFile(webhooks) {
    const envPath = path.join(__dirname, '..', 'config', 'env', 'staging.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Atualizar ou adicionar webhooks
    for (const [name, url] of Object.entries(webhooks)) {
        const envVar = `DISCORD_WEBHOOK_${name.toUpperCase()}`;
        const regex = new RegExp(`^${envVar}=.*$`, 'm');
        
        if (regex.test(envContent)) {
            envContent = envContent.replace(regex, `${envVar}=${url}`);
        } else {
            envContent += `\n${envVar}=${url}`;
        }
    }

    fs.writeFileSync(envPath, envContent);
    console.log('✅ Arquivo de ambiente atualizado');
}

// Função principal
async function setupDiscordWebhooks() {
    console.log('🎮 Configuração de Webhooks Discord - VocalCoach AI\n');
    console.log('Este script irá configurar os webhooks necessários para o sistema de alertas.\n');

    const webhooks = {};
    const webhookTypes = [
        { name: 'alerts', description: 'Alertas gerais do sistema' },
        { name: 'errors', description: 'Erros e falhas críticas' },
        { name: 'backup', description: 'Status de backup e restauração' },
        { name: 'beta', description: 'Atualizações do beta test' },
        { name: 'monitoring', description: 'Métricas de monitoramento' }
    ];

    for (const webhookType of webhookTypes) {
        console.log(`\n📡 Configurando webhook: ${webhookType.name.toUpperCase()}`);
        console.log(`📝 Descrição: ${webhookType.description}`);

        let webhookUrl;
        do {
            webhookUrl = await ask('🔗 URL do webhook: ');
            
            if (!webhookUrl.trim()) {
                console.log('⚠️ URL não pode estar vazia');
                continue;
            }

            if (!isValidWebhookUrl(webhookUrl)) {
                console.log('❌ URL de webhook inválida. Formato esperado: https://discord.com/api/webhooks/ID/TOKEN');
                continue;
            }

            // Testar webhook
            console.log('🧪 Testando webhook...');
            const testResult = await testWebhook(webhookUrl, webhookType.name);
            
            if (testResult.success) {
                console.log(`✅ Webhook testado com sucesso (Status: ${testResult.status})`);
                webhooks[webhookType.name] = webhookUrl;
                break;
            } else {
                console.log(`❌ Falha no teste: ${testResult.error || testResult.status}`);
                const retry = await ask('🔄 Tentar novamente? (s/n): ');
                if (retry.toLowerCase() !== 's') {
                    break;
                }
            }
        } while (true);
    }

    // Salvar configurações
    if (Object.keys(webhooks).length > 0) {
        console.log('\n💾 Salvando configurações...');
        updateEnvFile(webhooks);
        
        console.log('\n✅ Configuração concluída!');
        console.log('\n📋 Webhooks configurados:');
        for (const [name, url] of Object.entries(webhooks)) {
            console.log(`- ${name}: ${url.substring(0, 50)}...`);
        }
        
        console.log('\n🚀 Próximos passos:');
        console.log('1. Execute: npm run beta:monitor');
        console.log('2. Execute: node scripts/test-discord.js');
        console.log('3. Verifique os canais do Discord');
    } else {
        console.log('\n⚠️ Nenhum webhook foi configurado');
    }

    rl.close();
}

// Executar
setupDiscordWebhooks().catch(error => {
    console.error('❌ Erro durante configuração:', error);
    rl.close();
    process.exit(1);
}); 