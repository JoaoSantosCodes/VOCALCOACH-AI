const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: 'config/env/.env' });

// Configurações
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const SOURCE_DB = process.env.MONGODB_DB || 'vocalcoach_staging';
const TEST_DB = process.env.TEST_RESTORE_DB || 'vocalcoach_staging_test';
const BACKUP_PATH = process.env.BACKUP_PATH || 'backups';

// Caminho para o MongoDB Tools
const TOOLS_PATH = path.join(__dirname, '..', 'tools', 'mongodb', 'mongodb-database-tools-windows-x86_64-100.9.4', 'bin');
const MONGORESTORE_PATH = path.join(TOOLS_PATH, 'mongorestore.exe');

async function getLatestBackup() {
    const backups = fs.readdirSync(BACKUP_PATH)
        .filter(dir => dir.startsWith('backup-'))
        .map(dir => ({
            name: dir,
            path: path.join(BACKUP_PATH, dir),
            date: new Date(dir.replace('backup-', ''))
        }))
        .sort((a, b) => b.date - a.date);

    if (backups.length === 0) {
        throw new Error('Nenhum backup encontrado');
    }

    return backups[0];
}

async function compareCollections(sourceDb, testDb, collection) {
    const sourceCount = await sourceDb.collection(collection).countDocuments();
    const testCount = await testDb.collection(collection).countDocuments();

    if (sourceCount !== testCount) {
        return {
            collection,
            match: false,
            reason: `Número diferente de documentos (original: ${sourceCount}, restaurado: ${testCount})`
        };
    }

    const sourceDocs = await sourceDb.collection(collection).find().sort({ _id: 1 }).toArray();
    const testDocs = await testDb.collection(collection).find().sort({ _id: 1 }).toArray();

    for (let i = 0; i < sourceDocs.length; i++) {
        if (JSON.stringify(sourceDocs[i]) !== JSON.stringify(testDocs[i])) {
            return {
                collection,
                match: false,
                reason: `Documentos diferentes na posição ${i}`
            };
        }
    }

    return {
        collection,
        match: true
    };
}

async function testRestore() {
    console.log('🚀 Iniciando teste de restore...\n');

    try {
        // 1. Encontrar o backup mais recente
        const latestBackup = await getLatestBackup();
        console.log('📂 Usando backup:', latestBackup.name);

        // 2. Conectar ao MongoDB
        const client = await MongoClient.connect(MONGODB_URI);
        console.log('✅ Conectado ao MongoDB');

        // 3. Limpar banco de teste
        await client.db(TEST_DB).dropDatabase();
        console.log('🗑️ Banco de teste limpo');

        // 4. Restaurar backup
        console.log('\n1️⃣ Restaurando backup...');
        const restoreCommand = [
            `"${MONGORESTORE_PATH}"`,
            `--uri="${MONGODB_URI}"`,
            `--db=${TEST_DB}`,
            `--nsFrom="${SOURCE_DB}.*"`,
            `--nsTo="${TEST_DB}.*"`,
            `"${path.join(latestBackup.path, SOURCE_DB)}"`
        ].join(' ');

        execSync(restoreCommand, { stdio: 'inherit' });

        // 5. Verificar integridade
        console.log('\n2️⃣ Verificando integridade dos dados...');
        const sourceDb = client.db(SOURCE_DB);
        const testDb = client.db(TEST_DB);

        // Obter lista de coleções
        const collections = await sourceDb.listCollections().toArray();
        const results = [];

        for (const col of collections) {
            const result = await compareCollections(sourceDb, testDb, col.name);
            results.push(result);
            
            if (result.match) {
                console.log(`✅ Coleção ${col.name}: OK`);
            } else {
                console.log(`❌ Coleção ${col.name}: ${result.reason}`);
            }
        }

        // 6. Gerar relatório
        console.log('\n📊 Relatório de Verificação:');
        console.log('----------------------------');
        console.log('Total de coleções:', collections.length);
        console.log('Coleções verificadas:', results.length);
        console.log('Coleções íntegras:', results.filter(r => r.match).length);
        console.log('Coleções com diferenças:', results.filter(r => !r.match).length);

        if (results.every(r => r.match)) {
            console.log('\n✨ Teste de restore concluído com sucesso!');
            console.log('Todos os dados foram restaurados corretamente.');
        } else {
            console.log('\n⚠️ Teste de restore concluído com diferenças:');
            results.filter(r => !r.match).forEach(r => {
                console.log(`- ${r.collection}: ${r.reason}`);
            });
            process.exit(1);
        }

        await client.close();
    } catch (error) {
        console.error('\n❌ Erro durante teste:', error.message);
        process.exit(1);
    }
}

// Executar teste
testRestore().catch(console.error); 