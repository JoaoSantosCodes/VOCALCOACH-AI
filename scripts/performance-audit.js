const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

const THRESHOLDS = {
  performance: 90,
  accessibility: 90,
  'best-practices': 90,
  seo: 90,
  pwa: 90,
};

const ROUTES = [
  '/',
  '/dashboard',
  '/practice',
  '/karaoke',
];

async function runAudit(url, outputPath) {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox']
  });

  const options = {
    logLevel: 'info',
    output: 'html',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
    port: chrome.port,
  };

  const runnerResult = await lighthouse(url, options);
  const reportHtml = runnerResult.report;
  fs.writeFileSync(outputPath, reportHtml);

  await chrome.kill();

  return runnerResult.lhr;
}

async function auditAllRoutes() {
  const baseUrl = process.env.REACT_APP_URL || 'http://localhost:3000';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportsDir = path.join(__dirname, '..', 'reports', 'performance', timestamp);

  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  console.log('🚀 Iniciando auditoria de performance...\n');

  const results = [];
  for (const route of ROUTES) {
    const url = `${baseUrl}${route}`;
    console.log(`📊 Auditando ${url}...`);

    const outputPath = path.join(reportsDir, `${route.replace('/', '_') || 'home'}.html`);
    const result = await runAudit(url, outputPath);

    results.push({
      route,
      scores: {
        performance: result.categories.performance.score * 100,
        accessibility: result.categories.accessibility.score * 100,
        'best-practices': result.categories['best-practices'].score * 100,
        seo: result.categories.seo.score * 100,
        pwa: result.categories.pwa.score * 100,
      },
      metrics: {
        FCP: result.audits['first-contentful-paint'].numericValue,
        LCP: result.audits['largest-contentful-paint'].numericValue,
        TBT: result.audits['total-blocking-time'].numericValue,
        CLS: result.audits['cumulative-layout-shift'].numericValue,
        TTI: result.audits['interactive'].numericValue,
      },
    });

    console.log(`✅ Relatório gerado: ${outputPath}\n`);
  }

  // Gerar relatório resumido
  const summaryPath = path.join(reportsDir, 'summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2));

  // Verificar thresholds
  let failed = false;
  console.log('📋 Resumo da Auditoria:\n');

  for (const result of results) {
    console.log(`🔍 Rota: ${result.route}`);
    
    for (const [category, score] of Object.entries(result.scores)) {
      const threshold = THRESHOLDS[category];
      const passed = score >= threshold;
      const icon = passed ? '✅' : '❌';
      
      console.log(`${icon} ${category}: ${score.toFixed(1)}% (min: ${threshold}%)`);
      
      if (!passed) failed = true;
    }

    console.log('\n📈 Métricas Core Web Vitals:');
    console.log(`- FCP: ${(result.metrics.FCP / 1000).toFixed(2)}s`);
    console.log(`- LCP: ${(result.metrics.LCP / 1000).toFixed(2)}s`);
    console.log(`- TBT: ${result.metrics.TBT.toFixed(2)}ms`);
    console.log(`- CLS: ${result.metrics.CLS.toFixed(3)}`);
    console.log(`- TTI: ${(result.metrics.TTI / 1000).toFixed(2)}s\n`);
  }

  if (failed) {
    console.log('❌ Alguns scores estão abaixo do threshold mínimo!');
    process.exit(1);
  } else {
    console.log('✅ Todos os scores atingiram o threshold mínimo!');
  }
}

auditAllRoutes().catch(error => {
  console.error('❌ Erro durante a auditoria:', error);
  process.exit(1); 