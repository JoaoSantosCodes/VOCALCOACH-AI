const dns = require('dns').promises;
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

// Configurações
const DOMAIN = process.env.EMAIL_DOMAIN || 'vocalcoach.ai';
const DKIM_SELECTOR = 'beta'; // Seletor para o registro DKIM
const DNS_CONFIG_DIR = path.join(__dirname, '..', 'config', 'dns');

async function generateDKIMKeyPair() {
    console.log('🔑 Gerando par de chaves DKIM...');
    
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });

    // Formatar chave pública para DNS
    const dnsKey = publicKey
        .toString()
        .replace(/-----BEGIN PUBLIC KEY-----\n/, '')
        .replace(/\n-----END PUBLIC KEY-----\n/, '')
        .replace(/\n/g, '');

    return { privateKey, dnsKey };
}

async function generateDNSRecords() {
    console.log('📝 Gerando registros DNS...\n');

    // Gerar par de chaves DKIM
    const { privateKey, dnsKey } = await generateDKIMKeyPair();

    // Criar diretório de configuração DNS
    await fs.mkdir(DNS_CONFIG_DIR, { recursive: true });

    // Salvar chave privada
    await fs.writeFile(
        path.join(DNS_CONFIG_DIR, 'dkim.private.key'),
        privateKey
    );

    // Gerar registros DNS
    const records = {
        spf: {
            name: DOMAIN,
            type: 'TXT',
            value: 'v=spf1 include:_spf.google.com ~all'
        },
        dkim: {
            name: \`\${DKIM_SELECTOR}._domainkey.\${DOMAIN}\`,
            type: 'TXT',
            value: \`v=DKIM1; k=rsa; p=\${dnsKey}\`
        },
        dmarc: {
            name: \`_dmarc.\${DOMAIN}\`,
            type: 'TXT',
            value: 'v=DMARC1; p=quarantine; rua=mailto:dmarc@vocalcoach.ai'
        }
    };

    // Salvar configuração DNS
    await fs.writeFile(
        path.join(DNS_CONFIG_DIR, 'dns-records.json'),
        JSON.stringify(records, null, 2)
    );

    // Gerar instruções
    const instructions = \`
# Configuração DNS para Email - VocalCoach AI

## Registros DNS Necessários

1. Registro SPF (TXT):
   - Nome: \${records.spf.name}
   - Tipo: \${records.spf.type}
   - Valor: \${records.spf.value}

2. Registro DKIM (TXT):
   - Nome: \${records.dkim.name}
   - Tipo: \${records.dkim.type}
   - Valor: \${records.dkim.value}

3. Registro DMARC (TXT):
   - Nome: \${records.dmarc.name}
   - Tipo: \${records.dmarc.type}
   - Valor: \${records.dmarc.value}

## Instruções

1. Adicione os registros acima no seu provedor DNS
2. Aguarde a propagação (pode levar até 48 horas)
3. Use o script de verificação para confirmar a configuração

## Arquivos Gerados

- Chave privada DKIM: ./config/dns/dkim.private.key
- Registros DNS: ./config/dns/dns-records.json

## Próximos Passos

1. Adicione os registros DNS
2. Execute: npm run beta:verify-dns
3. Configure as chaves no servidor SMTP
\`;

    await fs.writeFile(
        path.join(DNS_CONFIG_DIR, 'INSTRUCTIONS.md'),
        instructions.trim()
    );

    console.log('✅ Arquivos de configuração gerados em:', DNS_CONFIG_DIR);
    console.log('📋 Verifique as instruções em:', path.join(DNS_CONFIG_DIR, 'INSTRUCTIONS.md'));
}

async function verifyDNSRecords() {
    console.log('🔍 Verificando registros DNS...\n');

    try {
        // Carregar registros configurados
        const records = JSON.parse(
            await fs.readFile(path.join(DNS_CONFIG_DIR, 'dns-records.json'))
        );

        // Verificar cada registro
        for (const [type, record] of Object.entries(records)) {
            try {
                console.log(\`Verificando \${type.toUpperCase()}...\`);
                const results = await dns.resolveTxt(record.name);
                const found = results.flat().some(txt => txt === record.value);
                
                if (found) {
                    console.log(\`✅ Registro \${type.toUpperCase()} encontrado e correto\`);
                } else {
                    console.log(\`❌ Registro \${type.toUpperCase()} não encontrado ou incorreto\`);
                    console.log('Esperado:', record.value);
                    console.log('Encontrado:', results.flat().join('\n'));
                }
            } catch (error) {
                console.log(\`❌ Erro ao verificar \${type.toUpperCase()}:`, error.message);
            }
            console.log();
        }

    } catch (error) {
        console.error('❌ Erro ao carregar registros:', error);
        process.exit(1);
    }
}

// Verificar comando
const command = process.argv[2];
if (command === 'generate') {
    generateDNSRecords().catch(console.error);
} else if (command === 'verify') {
    verifyDNSRecords().catch(console.error);
} else {
    console.log(\`
Uso: node setup-email-dns.js <comando>

Comandos:
  generate  Gera novos registros DNS e chaves DKIM
  verify    Verifica os registros DNS configurados

Exemplo:
  node setup-email-dns.js generate
  node setup-email-dns.js verify
\`);
} 