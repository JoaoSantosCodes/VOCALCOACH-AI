#!/usr/bin/env node

/**
 * Script para testar o servidor backend
 * VocalCoach AI - Beta Test Phase
 */

const axios = require('axios');

const BASE_URL = process.env.BACKEND_URL || 'http://localhost:3000';

async function testServer() {
  console.log('🧪 Testando servidor backend...\n');

  const tests = [
    {
      name: 'Health Check',
      url: `${BASE_URL}/health`,
      expectedStatus: 200
    },
    {
      name: 'API Status',
      url: `${BASE_URL}/api/status`,
      expectedStatus: 200
    }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      console.log(`📡 Testando: ${test.name}`);
      console.log(`   URL: ${test.url}`);
      
      const startTime = Date.now();
      const response = await axios.get(test.url, {
        timeout: 5000
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (response.status === test.expectedStatus) {
        console.log(`   ✅ Status: ${response.status} (esperado: ${test.expectedStatus})`);
        console.log(`   ⏱️  Tempo de resposta: ${responseTime}ms`);
        
        if (response.data) {
          console.log(`   📊 Dados:`, JSON.stringify(response.data, null, 2));
        }
        
        passedTests++;
      } else {
        console.log(`   ❌ Status: ${response.status} (esperado: ${test.expectedStatus})`);
      }
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`);
      if (error.code === 'ECONNREFUSED') {
        console.log('   💡 Servidor não está rodando. Execute: npm run dev:backend');
      }
    }
    
    console.log('');
  }

  // Resumo dos testes
  console.log('📊 Resumo dos Testes:');
  console.log(`   ✅ Passou: ${passedTests}/${totalTests}`);
  console.log(`   ❌ Falhou: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 Todos os testes passaram! Servidor funcionando corretamente.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Alguns testes falharam. Verifique o servidor.');
    process.exit(1);
  }
}

// Executar testes
testServer().catch(error => {
  console.error('❌ Erro ao executar testes:', error.message);
  process.exit(1);
}); 