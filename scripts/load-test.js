const autocannon = require('autocannon');
const fs = require('fs');
const path = require('path');

// Configurações dos testes
const SCENARIOS = {
  // Teste de carga básico
  basic: {
    title: 'Teste de Carga Básico',
    duration: 30,
    connections: 100,
    pipelining: 1,
    workers: 4,
  },

  // Teste de pico
  spike: {
    title: 'Teste de Pico',
    duration: 60,
    connections: 500,
    pipelining: 1,
    workers: 8,
  },

  // Teste de estresse
  stress: {
    title: 'Teste de Estresse',
    duration: 300,
    connections: 200,
    pipelining: 1,
    workers: 6,
  },
};

// Endpoints a serem testados
const ENDPOINTS = [
  {
    name: 'Home',
    method: 'GET',
    path: '/',
  },
  {
    name: 'Dashboard',
    method: 'GET',
    path: '/dashboard',
    headers: {
      'Authorization': 'Bearer ${TOKEN}',
    },
  },
  {
    name: 'Voice Analysis',
    method: 'POST',
    path: '/api/voice/analyze',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ${TOKEN}',
    },
    body: JSON.stringify({
      audioData: 'base64_encoded_audio_data',
      duration: 10,
      sampleRate: 44100,
    }),
  },
  {
    name: 'Exercise Progress',
    method: 'POST',
    path: '/api/progress/update',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ${TOKEN}',
    },
    body: JSON.stringify({
      exerciseId: 'test-exercise',
      score: 85,
      duration: 300,
    }),
  },
];

// Thresholds de performance
const THRESHOLDS = {
  latency: {
    p50: 100,  // 50º percentil < 100ms
    p90: 200,  // 90º percentil < 200ms
    p99: 500,  // 99º percentil < 500ms
  },
  rps: {
    min: 100,  // Mínimo de 100 requisições por segundo
    target: 200, // Alvo de 200 requisições por segundo
  },
  errors: {
    rate: 0.01, // Taxa de erro máxima de 1%
  },
  timeouts: {
    rate: 0.005, // Taxa de timeout máxima de 0.5%
  },
};

// Função para executar um cenário de teste
async function runScenario(scenario, endpoint) {
  const instance = autocannon({
    ...scenario,
    url: `http://localhost:3000${endpoint.path}`,
    method: endpoint.method,
    headers: endpoint.headers,
    body: endpoint.body,
    setupClient: (client) => {
      client.on('response', handleResponse);
    },
  });

  return new Promise((resolve) => {
    instance.on('done', resolve);
  });
}

// Função para validar resultados
function validateResults(results, scenario) {
  const issues = [];

  // Validar latência
  if (results.latency.p50 > THRESHOLDS.latency.p50) {
    issues.push(`P50 latency (${results.latency.p50}ms) above threshold (${THRESHOLDS.latency.p50}ms)`);
  }
  if (results.latency.p90 > THRESHOLDS.latency.p90) {
    issues.push(`P90 latency (${results.latency.p90}ms) above threshold (${THRESHOLDS.latency.p90}ms)`);
  }
  if (results.latency.p99 > THRESHOLDS.latency.p99) {
    issues.push(`P99 latency (${results.latency.p99}ms) above threshold (${THRESHOLDS.latency.p99}ms)`);
  }

  // Validar RPS
  const rps = results.requests.average;
  if (rps < THRESHOLDS.rps.min) {
    issues.push(`RPS (${rps}) below minimum threshold (${THRESHOLDS.rps.min})`);
  }

  // Validar erros
  const errorRate = results.errors / results.requests.total;
  if (errorRate > THRESHOLDS.errors.rate) {
    issues.push(`Error rate (${errorRate}) above threshold (${THRESHOLDS.errors.rate})`);
  }

  // Validar timeouts
  const timeoutRate = results.timeouts / results.requests.total;
  if (timeoutRate > THRESHOLDS.timeouts.rate) {
    issues.push(`Timeout rate (${timeoutRate}) above threshold (${THRESHOLDS.timeouts.rate})`);
  }

  return issues;
}

// Função principal de teste
async function runLoadTests() {
  console.log('🚀 Iniciando testes de carga...\n');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportsDir = path.join(__dirname, '..', 'reports', 'load-tests', timestamp);

  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const results = [];
  let hasFailures = false;

  for (const [scenarioName, scenario] of Object.entries(SCENARIOS)) {
    console.log(`\n📊 Executando ${scenario.title}...`);

    for (const endpoint of ENDPOINTS) {
      console.log(`\n🔍 Testando ${endpoint.name} (${endpoint.method} ${endpoint.path})`);

      try {
        const result = await runScenario(scenario, endpoint);
        const issues = validateResults(result, scenario);

        const testResult = {
          scenario: scenarioName,
          endpoint: endpoint.name,
          metrics: {
            latency: result.latency,
            requests: result.requests,
            throughput: result.throughput,
            errors: result.errors,
            timeouts: result.timeouts,
          },
          issues,
          passed: issues.length === 0,
        };

        results.push(testResult);

        // Salvar resultado detalhado
        const resultPath = path.join(reportsDir, `${scenarioName}-${endpoint.name}.json`);
        fs.writeFileSync(resultPath, JSON.stringify(testResult, null, 2));

        if (issues.length > 0) {
          hasFailures = true;
          console.log('\n❌ Falhas encontradas:');
          issues.forEach(issue => console.log(`- ${issue}`));
        } else {
          console.log('\n✅ Teste passou!');
          console.log(`- Latência P50: ${result.latency.p50}ms`);
          console.log(`- Latência P90: ${result.latency.p90}ms`);
          console.log(`- RPS: ${result.requests.average}`);
          console.log(`- Erros: ${result.errors}`);
        }

      } catch (error) {
        console.error(`\n❌ Erro ao testar ${endpoint.name}:`, error);
        hasFailures = true;
      }
    }
  }

  // Gerar relatório resumido
  const summary = {
    timestamp,
    scenarios: SCENARIOS,
    endpoints: ENDPOINTS,
    thresholds: THRESHOLDS,
    results,
  };

  const summaryPath = path.join(reportsDir, 'summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

  // Gerar recomendações
  console.log('\n📋 Recomendações Gerais:');
  
  if (hasFailures) {
    console.log('1. Otimização de Performance');
    console.log('   - Implementar caching');
    console.log('   - Otimizar queries');
    console.log('   - Adicionar índices');

    console.log('\n2. Escalabilidade');
    console.log('   - Aumentar recursos');
    console.log('   - Implementar load balancing');
    console.log('   - Otimizar conexões de banco');

    console.log('\n3. Resiliência');
    console.log('   - Implementar circuit breakers');
    console.log('   - Adicionar retry policies');
    console.log('   - Melhorar error handling');

    console.log('\n❌ Alguns testes falharam! Corrija os problemas antes de prosseguir.');
    process.exit(1);
  } else {
    console.log('✅ Todos os testes passaram!');
    console.log('\n1. Monitoramento');
    console.log('   - Continuar monitorando métricas');
    console.log('   - Estabelecer baseline');
    console.log('   - Configurar alertas');

    console.log('\n2. Manutenção');
    console.log('   - Revisar periodicamente');
    console.log('   - Atualizar thresholds');
    console.log('   - Documentar mudanças');
  }
}

// Executar testes
runLoadTests().catch(error => {
  console.error('❌ Erro durante testes:', error);
  process.exit(1); 