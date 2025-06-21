const nodemailer = require('nodemailer');
const dns = require('dns');
const { promisify } = require('util');
const path = require('path');
const dotenv = require('dotenv');

// Carrega as variáveis de ambiente
dotenv.config();

// Configuração do email
const emailConfig = {
  from: process.env.EMAIL_FROM || 'noreply@vocalcoach.ai',
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },
};

const resolveMx = promisify(dns.resolveMx);
const resolveTxt = promisify(dns.resolveTxt);

// Configurações
const TEST_EMAILS = [
  'test1@vocalcoach.ai',
  'test2@vocalcoach.ai',
  'test3@vocalcoach.ai'
];

const BATCH_SIZE = 10;
const DELAY_BETWEEN_BATCHES = 1000; // 1 segundo

async function validateSPFRecord(domain) {
  try {
    const records = await resolveTxt(domain);
    const spfRecord = records.find(record => 
      record[0].startsWith('v=spf1')
    );
    
    if (!spfRecord) {
      console.log('❌ SPF record não encontrado');
      return false;
    }

    console.log('✅ SPF record encontrado:', spfRecord[0]);
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar SPF:', error);
    return false;
  }
}

async function validateDKIM(domain) {
  try {
    const selector = 'default'; // Ajuste conforme seu seletor DKIM
    const records = await resolveTxt(`${selector}._domainkey.${domain}`);
    
    if (!records || records.length === 0) {
      console.log('❌ DKIM record não encontrado');
      return false;
    }

    console.log('✅ DKIM record encontrado');
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar DKIM:', error);
    return false;
  }
}

async function validateSMTPConnection() {
  const transporter = nodemailer.createTransport(emailConfig.smtp);

  try {
    await transporter.verify();
    console.log('✅ Conexão SMTP estabelecida com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão SMTP:', error);
    return false;
  }
}

async function testBulkSend() {
  const transporter = nodemailer.createTransport(emailConfig.smtp);
  const results = {
    success: 0,
    failed: 0,
    errors: []
  };

  console.log('\n📧 Iniciando teste de envio em massa...');

  for (let i = 0; i < TEST_EMAILS.length; i += BATCH_SIZE) {
    const batch = TEST_EMAILS.slice(i, i + BATCH_SIZE);
    
    for (const email of batch) {
      try {
        await transporter.sendMail({
          from: emailConfig.from,
          to: email,
          subject: 'VocalCoach AI - Teste de Email',
          text: 'Este é um email de teste do sistema VocalCoach AI.',
          html: `
            <h2>VocalCoach AI - Teste de Sistema</h2>
            <p>Este é um email de teste do sistema VocalCoach AI.</p>
            <p>Data e hora do teste: ${new Date().toLocaleString()}</p>
            <p>Email de teste #${i + batch.indexOf(email) + 1}</p>
          `
        });
        
        results.success++;
        console.log(`✅ Email enviado com sucesso para ${email}`);
      } catch (error) {
        results.failed++;
        results.errors.push({ email, error: error.message });
        console.error(`❌ Erro ao enviar para ${email}:`, error.message);
      }
    }

    // Aguarda entre os lotes para evitar throttling
    if (i + BATCH_SIZE < TEST_EMAILS.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
    }
  }

  return results;
}

async function validateEmailSystem() {
  console.log('🚀 Iniciando validação do sistema de email...\n');

  // 1. Validar SPF
  console.log('1️⃣ Verificando registro SPF...');
  const spfValid = await validateSPFRecord('vocalcoach.ai');

  // 2. Validar DKIM
  console.log('\n2️⃣ Verificando registro DKIM...');
  const dkimValid = await validateDKIM('vocalcoach.ai');

  // 3. Testar conexão SMTP
  console.log('\n3️⃣ Testando conexão SMTP...');
  const smtpValid = await validateSMTPConnection();

  // 4. Realizar teste de envio em massa
  console.log('\n4️⃣ Realizando teste de envio em massa...');
  const bulkResults = await testBulkSend();

  // Relatório final
  console.log('\n📊 Relatório Final:');
  console.log('-------------------');
  console.log(`SPF: ${spfValid ? '✅' : '❌'}`);
  console.log(`DKIM: ${dkimValid ? '✅' : '❌'}`);
  console.log(`SMTP: ${smtpValid ? '✅' : '❌'}`);
  console.log('\nResultados do envio em massa:');
  console.log(`- Emails enviados com sucesso: ${bulkResults.success}`);
  console.log(`- Falhas de envio: ${bulkResults.failed}`);
  console.log(`- Taxa de sucesso: ${((bulkResults.success / TEST_EMAILS.length) * 100).toFixed(2)}%`);

  if (bulkResults.errors.length > 0) {
    console.log('\nErros encontrados:');
    bulkResults.errors.forEach(({ email, error }) => {
      console.log(`- ${email}: ${error}`);
    });
  }

  // Verificar se todos os testes passaram
  const allTestsPassed = spfValid && dkimValid && smtpValid && bulkResults.failed === 0;
  
  console.log('\n🎯 Status Final:', allTestsPassed ? '✅ APROVADO' : '❌ NECESSITA ATENÇÃO');
  
  if (!allTestsPassed) {
    console.log('\n⚠️ Ações Recomendadas:');
    if (!spfValid) console.log('- Configurar registro SPF no DNS');
    if (!dkimValid) console.log('- Configurar DKIM no servidor de email');
    if (!smtpValid) console.log('- Verificar credenciais e configurações SMTP');
    if (bulkResults.failed > 0) console.log('- Investigar falhas de envio específicas');
  }

  return allTestsPassed;
}

// Executar validação
validateEmailSystem().then(success => {
  if (!success) {
    process.exit(1);
  }
}).catch(error => {
  console.error('Erro fatal durante a validação:', error);
  process.exit(1);
}); 