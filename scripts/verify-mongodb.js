const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './backend/.env' });

const MONGODB_URI = 'mongodb://localhost:27017/vocalcoach';

async function verifyMongoDB() {
  console.log('🔍 Iniciando verificação do MongoDB...\n');
  
  try {
    // Testar conexão
    console.log('1. Testando conexão...');
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Conexão estabelecida com sucesso\n');

    const db = client.db('vocalcoach');

    // Criar coleções necessárias
    console.log('2. Criando coleções...');
    const collections = ['users', 'feedback', 'performance_metrics', 'beta_metrics'];
    
    for (const collection of collections) {
      await db.createCollection(collection);
      console.log(`✅ Coleção ${collection} criada com sucesso`);
    }
    console.log('\n');

    // Verificar índices
    console.log('3. Verificando índices...');
    for (const collection of collections) {
      const indexes = await db.collection(collection).indexes();
      console.log(`📊 Índices em ${collection}:`, indexes.length);
      for (const index of indexes) {
        console.log(`   - ${index.name}: ${JSON.stringify(index.key)}`);
      }
    }
    console.log('✅ Índices verificados com sucesso\n');

    // Testar inserção
    console.log('4. Testando operações CRUD...');
    const testCollection = db.collection('test_beta');
    
    // Create
    const insertResult = await testCollection.insertOne({
      test: 'beta_verification',
      timestamp: new Date(),
      status: 'testing'
    });
    console.log('✅ Inserção realizada:', insertResult.insertedId);

    // Read
    const readResult = await testCollection.findOne({ test: 'beta_verification' });
    console.log('✅ Leitura realizada:', readResult._id);

    // Update
    const updateResult = await testCollection.updateOne(
      { test: 'beta_verification' },
      { $set: { status: 'verified' } }
    );
    console.log('✅ Atualização realizada:', updateResult.modifiedCount);

    // Delete
    const deleteResult = await testCollection.deleteOne({ test: 'beta_verification' });
    console.log('✅ Deleção realizada:', deleteResult.deletedCount);

    // Testar performance
    console.log('\n5. Testando performance...');
    const startTime = Date.now();
    
    // Inserir 1000 documentos para teste
    const bulkOps = Array(1000).fill().map((_, i) => ({
      insertOne: {
        document: {
          test: `performance_${i}`,
          timestamp: new Date(),
          data: 'test'.repeat(100) // Simular payload
        }
      }
    }));

    await testCollection.bulkWrite(bulkOps);
    
    // Realizar consultas
    await testCollection.find({ test: /performance/ }).limit(100).toArray();
    await testCollection.createIndex({ test: 1 });
    await testCollection.find({ test: /performance/ }).limit(100).toArray();

    const endTime = Date.now();
    console.log(`✅ Teste de performance concluído em ${endTime - startTime}ms\n`);

    // Limpar dados de teste
    await testCollection.drop();

    // Verificar backup
    console.log('6. Verificando configuração de backup...');
    const adminDb = client.db('admin');
    const backup = await adminDb.command({ listBackups: 1 }).catch(() => null);
    
    if (backup) {
      console.log('✅ Sistema de backup configurado');
    } else {
      console.log('⚠️ Sistema de backup não encontrado - necessário configurar');
    }

    console.log('\n🎉 Verificação do MongoDB concluída com sucesso!');
    
    await client.close();
    return true;

  } catch (error) {
    console.error('\n❌ Erro durante verificação:', error);
    return false;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  verifyMongoDB().then(success => {
    process.exit(success ? 0 : 1);
  });
} 