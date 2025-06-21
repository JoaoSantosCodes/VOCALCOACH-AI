const axe = require('@axe-core/puppeteer');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ROUTES = [
  '/',
  '/dashboard',
  '/practice',
  '/karaoke',
];

// Critérios de acessibilidade e seus níveis
const CRITERIA = {
  'wcag2a': 'WCAG 2.0 Level A',
  'wcag2aa': 'WCAG 2.0 Level AA',
  'wcag21a': 'WCAG 2.1 Level A',
  'wcag21aa': 'WCAG 2.1 Level AA',
  'best-practice': 'Best Practices',
};

// Configurações do teste
const CONFIG = {
  rules: {
    'color-contrast': { enabled: true },
    'html-has-lang': { enabled: true },
    'valid-lang': { enabled: true },
    'region': { enabled: true },
    'page-has-heading-one': { enabled: true },
    'landmark-one-main': { enabled: true },
    'landmark-complementary-is-top-level': { enabled: true },
    'aria-roles': { enabled: true },
    'aria-valid-attr': { enabled: true },
    'aria-valid-attr-value': { enabled: true },
    'button-name': { enabled: true },
    'image-alt': { enabled: true },
    'input-button-name': { enabled: true },
    'label': { enabled: true },
    'link-name': { enabled: true },
    'list': { enabled: true },
    'listitem': { enabled: true },
    'meta-viewport': { enabled: true },
  },
};

async function auditAccessibility() {
  console.log('🔍 Iniciando auditoria de acessibilidade...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu'],
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportsDir = path.join(__dirname, '..', 'reports', 'accessibility', timestamp);

  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const baseUrl = process.env.REACT_APP_URL || 'http://localhost:3000';
  const results = [];
  let hasErrors = false;

  for (const route of ROUTES) {
    const url = `${baseUrl}${route}`;
    console.log(`\n📝 Auditando ${url}...`);

    const page = await browser.newPage();
    await page.setBypassCSP(true);

    try {
      await page.goto(url, { waitUntil: 'networkidle0' });
      await page.waitForTimeout(2000); // Esperar carregamento dinâmico

      const results = await axe.analyze(page, CONFIG);
      
      // Salvar resultados detalhados
      const reportPath = path.join(reportsDir, `${route.replace('/', '_') || 'home'}.json`);
      fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

      // Processar violações
      if (results.violations.length > 0) {
        hasErrors = true;
        console.log(`\n❌ Encontradas ${results.violations.length} violações em ${route}:`);
        
        results.violations.forEach((violation) => {
          console.log(`\n🚫 ${violation.help}`);
          console.log(`Impact: ${violation.impact}`);
          console.log(`WCAG: ${violation.tags.filter(tag => tag.startsWith('wcag')).join(', ')}`);
          console.log('Elementos afetados:');
          
          violation.nodes.forEach((node) => {
            console.log(`- ${node.html}`);
            if (node.failureSummary) {
              console.log(`  ${node.failureSummary}`);
            }
          });
        });
      }

      // Processar passes
      console.log(`\n✅ Passou em ${results.passes.length} testes`);

      // Processar incomplete
      if (results.incomplete.length > 0) {
        console.log(`\n⚠️ ${results.incomplete.length} testes precisam de revisão manual:`);
        results.incomplete.forEach((check) => {
          console.log(`- ${check.help}`);
        });
      }

    } catch (error) {
      console.error(`\n❌ Erro ao auditar ${url}:`, error);
      hasErrors = true;
    } finally {
      await page.close();
    }
  }

  await browser.close();

  // Gerar relatório resumido
  const summary = {
    timestamp,
    routes: ROUTES,
    results,
  };

  const summaryPath = path.join(reportsDir, 'summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

  // Gerar recomendações
  console.log('\n📋 Recomendações Gerais:');
  console.log('1. Contraste de Cores');
  console.log('   - Usar ferramenta de contraste');
  console.log('   - Testar em diferentes temas');
  console.log('   - Verificar texto sobre imagens');

  console.log('\n2. Navegação por Teclado');
  console.log('   - Testar tab order');
  console.log('   - Verificar focus indicators');
  console.log('   - Implementar skip links');

  console.log('\n3. Semântica HTML');
  console.log('   - Usar landmarks apropriados');
  console.log('   - Estruturar headings corretamente');
  console.log('   - Implementar ARIA labels');

  console.log('\n4. Mídia');
  console.log('   - Adicionar alt text');
  console.log('   - Fornecer transcrições');
  console.log('   - Implementar controles de mídia');

  if (hasErrors) {
    console.log('\n❌ Auditoria falhou! Corrija as violações antes de prosseguir.');
    process.exit(1);
  } else {
    console.log('\n✅ Auditoria concluída com sucesso!');
  }
}

// Executar auditoria
auditAccessibility().catch(error => {
  console.error('❌ Erro durante auditoria:', error);
  process.exit(1);
}); 