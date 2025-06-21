const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

// Carregar variáveis de ambiente
dotenv.config();

// Configurações
const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const TEST_DB = process.env.MONGODB_DB + '_test_restore';

async function getLatestBackup() {
    const files = await fs.readdir(BACKUP_DIR);
    const metadataFiles = files.filter(f => f.endsWith('-metadata.json'));
    
    if (metadataFiles.length === 0) {
        throw new Error('Nenhum backup encontrado');
    }

    const latest = metadataFiles.sort().pop();
    const metadata = JSON.parse(
        await fs.readFile(path.join(BACKUP_DIR, latest))
    );

    return {
        timestamp: metadata.timestamp,
        collections: metadata.collections,
        files: metadata.backup_files
    };
}

async function dropTestDatabase() {
    console.log('🗑️ Removendo banco de teste anterior...');
    
    const client = new MongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
        await client.db(TEST_DB).dropDatabase();
        console.log('✅ Banco de teste removido');
    } catch (error) {
        console.log('ℹ️ Banco de teste não existia');
    } finally {
        await client.close();
    }
}

async function restoreBackup(backup) {
    console.log('📦 Restaurando backup...\n');

    for (const file of backup.files) {
        const filePath = path.join(BACKUP_DIR, file);
        const collection = file.match(/backup-.*?-(.*?)\.gz$/)[1];

        console.log(\`Restaurando coleção: \${collection}\`);
        
        const command = \`mongorestore --uri="\${process.env.MONGODB_URI}" --db=\${TEST_DB} --collection=\${collection} --gzip --archive="\${filePath}"\`;

        try {
            await new Promise((resolve, reject) => {
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        console.error(\`❌ Erro ao restaurar \${collection}:\`, stderr);
                        reject(error);
                    } else {
                        console.log(\`✅ \${collection} restaurada\`);
                        resolve(stdout);
                    }
                });
            });
        } catch (error) {
            throw new Error(\`Falha ao restaurar \${collection}: \${error.message}\`);
        }
    }
}

async function verifyRestore(backup) {
    console.log('\n🔍 Verificando restauração...');

    const client = new MongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
        const db = client.db(TEST_DB);
        const sourceDb = client.db(process.env.MONGODB_DB);

        for (const collection of backup.collections) {
            console.log(\`\nVerificando \${collection}:\`);

            // Contar documentos
            const sourceCount = await sourceDb.collection(collection).countDocuments();
            const restoredCount = await db.collection(collection).countDocuments();

            console.log(\`- Documentos originais: \${sourceCount}\`);
            console.log(\`- Documentos restaurados: \${restoredCount}\`);

            if (sourceCount === restoredCount) {
                console.log('✅ Contagem de documentos correta');
            } else {
                console.log('❌ Diferença na contagem de documentos');
            }

            // Verificar alguns documentos
            const sample = await db.collection(collection)
                .find()
                .limit(5)
                .toArray();

            console.log(\`- Amostra de \${sample.length} documentos verificada\`);
            
            if (sample.length > 0) {
                console.log('✅ Documentos parecem íntegros');
            } else {
                console.log('❌ Nenhum documento encontrado');
            }
        }

    } finally {
        await client.close();
    }
}

async function testRestore() {
    console.log('🚀 Iniciando teste de restauração...\n');

    try {
        // Verificar variáveis de ambiente
        if (!process.env.MONGODB_URI || !process.env.MONGODB_DB) {
            throw new Error('Variáveis de ambiente MONGODB_URI e MONGODB_DB são necessárias');
        }

        // Obter último backup
        const backup = await getLatestBackup();
        console.log('📅 Usando backup de:', backup.timestamp);
        console.log('📊 Coleções:', backup.collections.join(', '), '\n');

        // Limpar banco de teste
        await dropTestDatabase();

        // Restaurar backup
        await restoreBackup(backup);

        // Verificar restauração
        await verifyRestore(backup);

        console.log('\n🎉 Teste de restauração concluído com sucesso!');

    } catch (error) {
        console.error('\n❌ Erro durante teste de restauração:', error);
        process.exit(1);
    }
}

// Executar teste
testRestore().catch(console.error); 