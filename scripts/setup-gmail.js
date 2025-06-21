const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const fs = require('fs').promises;
const path = require('path');

// Carregar variáveis de ambiente
dotenv.config();

// Template de email de teste
const TEST_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>VocalCoach AI - Teste de Email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2c3e50;">🎵 VocalCoach AI</h1>
        <h2>Teste de Configuração de Email</h2>
        <p>Este é um email de teste do sistema VocalCoach AI.</p>
        <p>Configurações verificadas:</p>
        <ul>
            <li>Conexão SMTP ✅</li>
            <li>Template HTML ✅</li>
            <li>Codificação UTF-8 ✅</li>
        </ul>
        <p>Data e hora do teste: {{timestamp}}</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">
            Este é um email automático. Por favor, não responda.
        </p>
    </div>
</body>
</html>
`;

async function setupGmail() {
    console.log('🚀 Iniciando configuração do Gmail...\n');

    // Verificar variáveis de ambiente necessárias
    const requiredEnvVars = [
        'SMTP_HOST',
        'SMTP_PORT',
        'SMTP_USER',
        'SMTP_PASS',
        'EMAIL_FROM'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
        console.error('❌ Variáveis de ambiente faltando:', missingVars.join(', '));
        console.log('\nPor favor, configure as seguintes variáveis no arquivo .env:');
        console.log(\`
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@vocalcoach.ai
SMTP_PASS=sua-senha-de-app
EMAIL_FROM=noreply@vocalcoach.ai
\`);
        process.exit(1);
    }

    // Criar transportador SMTP
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    try {
        // Verificar conexão
        console.log('1️⃣ Verificando conexão SMTP...');
        await transporter.verify();
        console.log('✅ Conexão SMTP estabelecida com sucesso\n');

        // Enviar email de teste
        console.log('2️⃣ Enviando email de teste...');
        const testEmail = process.env.SMTP_USER;
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: testEmail,
            subject: 'VocalCoach AI - Teste de Configuração',
            text: 'Este é um email de teste do sistema VocalCoach AI.',
            html: TEST_EMAIL_TEMPLATE.replace('{{timestamp}}', new Date().toLocaleString())
        });

        console.log('✅ Email de teste enviado com sucesso');
        console.log('📧 ID da mensagem:', info.messageId);
        console.log('📨 Preview URL:', nodemailer.getTestMessageUrl(info));

        // Salvar configuração como template
        console.log('\n3️⃣ Salvando template de configuração...');
        const envTemplate = \`
# Configuração SMTP Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=\${process.env.SMTP_USER}
SMTP_PASS=sua-senha-de-app

# Configuração de Email
EMAIL_FROM=\${process.env.EMAIL_FROM}
EMAIL_REPLY_TO=support@vocalcoach.ai
\`;

        await fs.writeFile(
            path.join(__dirname, '..', '.env.email.example'),
            envTemplate.trim()
        );
        console.log('✅ Template de configuração salvo em .env.email.example');

        console.log('\n🎉 Configuração do Gmail concluída com sucesso!');
        console.log('\nPróximos passos:');
        console.log('1. Verifique o email de teste enviado para', testEmail);
        console.log('2. Configure os templates de email');
        console.log('3. Implemente o sistema de filas');

    } catch (error) {
        console.error('\n❌ Erro durante a configuração:', error);
        console.log('\n⚠️ Verifique:');
        console.log('1. Se a senha de aplicativo do Gmail está correta');
        console.log('2. Se o 2FA está ativado na conta Google');
        console.log('3. Se as configurações de SMTP estão corretas');
        process.exit(1);
    }
}

// Executar configuração
setupGmail().catch(console.error); 