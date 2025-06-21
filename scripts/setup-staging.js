const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const fs = require('fs').promises;
const path = require('path');

// Carregar variáveis de ambiente de staging
dotenv.config({ path: path.join(__dirname, '..', 'config', 'env', 'staging.env') });

// Configurações
const STAGING_DB = process.env.MONGODB_DB;
const SAMPLE_DATA = {
    users: [
        {
            email: process.env.TEST_USER_EMAIL || 'test@vocalcoach.ai',
            name: process.env.TEST_USER_NAME || 'Test User',
            created_at: new Date()
        },
        {
            email: 'test2@vocalcoach.ai',
            name: 'Test User 2',
            created_at: new Date()
        }
    ],
    achievements: [
        {
            name: 'First Lesson',
            description: 'Complete your first lesson',
            points: 100
        },
        {
            name: 'Perfect Pitch',
            description: 'Get a perfect score',
            points: 500
        }
    ],
    stats: [
        {
            user_id: 'test1',
            lessons_completed: 5,
            total_time: 3600,
            average_score: 85
        },
        {
            user_id: 'test2',
            lessons_completed: 10,
            total_time: 7200,
            average_score: 92
        }
    ]
};

async function setupStagingDatabase() {
    console.log('🚀 Configurando ambiente de staging...\n');
    console.log('📂 Usando configuração:', path.join(__dirname, '..', 'config', 'env', 'staging.env'));
    console.log('🗄️ Banco de dados:', STAGING_DB);

    const client = new MongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
        console.log('✅ Conectado ao MongoDB');

        // Remover banco de staging existente
        console.log('\n1️⃣ Removendo banco de staging anterior...');
        await client.db(STAGING_DB).dropDatabase();
        console.log('✅ Banco de staging removido');

        // Criar coleções e inserir dados de teste
        console.log('\n2️⃣ Criando coleções com dados de teste...');
        const db = client.db(STAGING_DB);
        
        for (const [collection, data] of Object.entries(SAMPLE_DATA)) {
            await db.collection(collection).insertMany(data);
            console.log(`✅ Coleção ${collection} criada com ${data.length} documentos`);
        }

        // Verificar tamanho do banco
        const stats = await db.stats();
        console.log('\n📊 Estatísticas do banco de staging:');
        console.log(`- Tamanho: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`- Coleções: ${stats.collections}`);
        console.log(`- Documentos: ${stats.objects}`);

        // Criar arquivo de metadados
        const metadata = {
            database: STAGING_DB,
            collections: Object.keys(SAMPLE_DATA),
            created_at: new Date().toISOString(),
            stats: {
                size_mb: (stats.dataSize / 1024 / 1024).toFixed(2),
                collections: stats.collections,
                documents: stats.objects
            }
        };

        // Criar diretório de backup se não existir
        const backupPath = process.env.BACKUP_PATH || './backups/staging';
        await fs.mkdir(backupPath, { recursive: true });

        await fs.writeFile(
            path.join(backupPath, 'staging-metadata.json'),
            JSON.stringify(metadata, null, 2)
        );

        console.log('\n🎉 Ambiente de staging configurado com sucesso!');
        console.log('\n📝 Metadados salvos em:', path.join(backupPath, 'staging-metadata.json'));
        console.log('\nPróximos passos:');
        console.log('1. Execute: npm run beta:backup-staging');
        console.log('2. Execute: npm run beta:test-restore');
        console.log('3. Verifique a integridade dos dados');

    } catch (error) {
        console.error('\n❌ Erro durante configuração:', error);
        process.exit(1);
    } finally {
        await client.close();
    }
}

// Executar configuração
setupStagingDatabase().catch(console.error); 