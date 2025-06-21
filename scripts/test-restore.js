const { MongoClient } = require('mongodb');
const { exec } = require('child_process');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs').promises;
const util = require('util');
const execPromise = util.promisify(exec);

// Carregar configuração baseada no ambiente
const envFile = process.argv.includes('--staging') ? 'staging.env' : '.env';
dotenv.config({ path: path.join(__dirname, '..', 'config', 'env', envFile) });

// Configurações
const BACKUP_PATH = process.env.BACKUP_PATH || './backups';
const TEST_DB = process.env.TEST_RESTORE_DB;

async function findLatestBackup() {
    const files = await fs.readdir(BACKUP_PATH);
    const backups = files
        .filter(f => f.startsWith('backup-'))
        .sort()
        .reverse();

    if (backups.length === 0) {
        throw new Error('Nenhum backup encontrado');
    }

    return path.join(BACKUP_PATH, backups[0]);
}

async function compareCollections(sourceDb, testDb, collection) {
    const sourceCount = await sourceDb.collection(collection).countDocuments();
    const testCount = await testDb.collection(collection).countDocuments();

    if (sourceCount !== testCount) {
        console.log(`❌ Diferença na coleção ${collection}:`);
        console.log(`   - Original: ${sourceCount} documentos`);
        console.log(`   - Restore: ${testCount} documentos`);
        return false;
    }

    // Comparar alguns documentos aleatórios
    const sampleDocs = await sourceDb.collection(collection)
        .aggregate([{ $sample: { size: 5 } }])
        .toArray();

    for (const doc of sampleDocs) {
        const testDoc = await testDb.collection(collection).findOne({ _id: doc._id });
        if (!testDoc || JSON.stringify(doc) !== JSON.stringify(testDoc)) {
            console.log(`❌ Diferença encontrada no documento ${doc._id} da coleção ${collection}`);
            return false;
        }
    }

    console.log(`✅ Coleção ${collection} verificada com sucesso`);
    return true;
}

async function testRestore() {
    console.log('🚀 Iniciando teste de restore...\n');
    console.log('📂 Usando configuração:', path.join(__dirname, '..', 'config', 'env', envFile));
    console.log('💾 Diretório de backup:', BACKUP_PATH);
    console.log('🗄️ Banco de teste:', TEST_DB);

    const client = new MongoClient(process.env.MONGODB_URI);

    try {
        await client.connect();
        console.log('✅ Conectado ao MongoDB');

        // Encontrar último backup
        console.log('\n1️⃣ Procurando último backup...');
        const backupPath = await findLatestBackup();
        console.log('📦 Usando backup:', backupPath);

        // Restaurar para banco de teste
        console.log('\n2️⃣ Restaurando backup...');
        const mongorestore = [
            'mongorestore',
            `--uri="${process.env.MONGODB_URI}"`,
            `--db=${TEST_DB}`,
            `--drop`,
            backupPath
        ].join(' ');

        await execPromise(mongorestore);
        console.log('✅ Restore concluído');

        // Verificar integridade
        console.log('\n3️⃣ Verificando integridade dos dados...');
        const sourceDb = client.db(process.env.MONGODB_DB);
        const testDb = client.db(TEST_DB);

        // Obter lista de coleções
        const collections = await sourceDb.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);

        // Verificar cada coleção
        let allValid = true;
        for (const collection of collectionNames) {
            const isValid = await compareCollections(sourceDb, testDb, collection);
            if (!isValid) allValid = false;
        }

        if (allValid) {
            console.log('\n🎉 Teste de restore concluído com sucesso!');
            console.log('✅ Todos os dados foram restaurados corretamente');
        } else {
            console.log('\n⚠️ Teste de restore concluído com diferenças');
            console.log('❌ Algumas coleções apresentaram inconsistências');
        }

    } catch (error) {
        console.error('\n❌ Erro durante teste de restore:', error);
        process.exit(1);
    } finally {
        await client.close();
    }
}

// Executar teste
testRestore().catch(console.error); 