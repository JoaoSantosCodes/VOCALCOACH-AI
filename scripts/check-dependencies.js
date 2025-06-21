#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Lista de dependências necessárias organizadas por categoria
const requiredDependencies = {
  frontend: {
    react: ['react', 'react-dom', 'react-router-dom'],
    ui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
    charts: ['react-chartjs-2', 'chart.js'],
    audio: ['pitchy'],
    animations: ['react-spring', '@react-spring/web'],
    serviceWorker: [
      'workbox-cacheable-response',
      'workbox-precaching',
      'workbox-expiration',
      'workbox-recipes',
      'workbox-background-sync',
      'workbox-routing',
      'workbox-strategies'
    ]
  },
  backend: {
    server: ['express', 'cors', 'helmet'],
    database: ['mongoose', 'mongodb'],
    auth: ['passport', 'passport-jwt', 'passport-local', 'jsonwebtoken', 'bcrypt'],
    security: ['rate-limiter-flexible'],
    validation: ['joi', 'express-validator'],
    monitoring: ['winston', 'morgan', 'axios', 'dotenv']
  },
  development: {
    typescript: ['typescript', '@types/node'],
    linting: ['eslint', '@typescript-eslint/eslint-plugin', '@typescript-eslint/parser'],
    testing: ['jest', 'react-testing-library', 'cypress'],
    build: ['react-scripts']
  }
};

// Lista de dependências opcionais
const optionalDependencies = {
  documentation: ['typedoc', 'storybook'],
  ci: ['husky', 'lint-staged', 'commitizen'],
  analysis: ['sonarqube-scanner', 'codecov']
};

function checkPackageJson() {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };
    
    return allDeps;
  } catch (error) {
    console.error('❌ Erro ao ler package.json:', error.message);
    return {};
  }
}

function checkDependency(dep, installedDeps) {
  return installedDeps.hasOwnProperty(dep);
}

function checkCategory(category, installedDeps) {
  const results = {};
  let total = 0;
  let installed = 0;
  
  for (const [subcategory, deps] of Object.entries(category)) {
    results[subcategory] = {};
    for (const dep of deps) {
      total++;
      const isInstalled = checkDependency(dep, installedDeps);
      results[subcategory][dep] = isInstalled;
      if (isInstalled) installed++;
    }
  }
  
  return { results, total, installed };
}

function displayResults(categoryName, categoryResults, installedDeps) {
  console.log(`\n📦 ${categoryName.toUpperCase()}`);
  console.log('='.repeat(50));
  
  for (const [subcategory, deps] of Object.entries(categoryResults.results)) {
    console.log(`\n🔧 ${subcategory}:`);
    
    for (const [dep, isInstalled] of Object.entries(deps)) {
      const status = isInstalled ? '✅' : '❌';
      const version = isInstalled ? ` (${installedDeps[dep]})` : '';
      console.log(`  ${status} ${dep}${version}`);
    }
  }
  
  const percentage = Math.round((categoryResults.installed / categoryResults.total) * 100);
  console.log(`\n📊 Progresso: ${categoryResults.installed}/${categoryResults.total} (${percentage}%)`);
}

function generateInstallCommands(missingDeps) {
  if (missingDeps.length === 0) {
    console.log('\n🎉 Todas as dependências estão instaladas!');
    return;
  }
  
  console.log('\n📋 Comandos para instalar dependências faltantes:');
  console.log('='.repeat(50));
  
  // Agrupar por categoria
  const grouped = {};
  for (const dep of missingDeps) {
    const category = getDependencyCategory(dep);
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push(dep);
  }
  
  for (const [category, deps] of Object.entries(grouped)) {
    console.log(`\n# ${category}:`);
    console.log(`npm install ${deps.join(' ')}`);
  }
  
  console.log('\n# Todas as dependências:');
  console.log(`npm install ${missingDeps.join(' ')}`);
}

function getDependencyCategory(dep) {
  // Determinar categoria baseado no nome da dependência
  if (dep.startsWith('@mui/') || dep.startsWith('@emotion/')) return 'UI';
  if (dep.startsWith('workbox-')) return 'Service Worker';
  if (dep.startsWith('react-')) return 'React';
  if (dep.startsWith('@types/')) return 'TypeScript Types';
  if (dep.startsWith('@testing-library/')) return 'Testing';
  if (dep.includes('chart')) return 'Charts';
  if (['express', 'mongoose', 'passport'].includes(dep)) return 'Backend';
  if (['eslint', 'prettier', 'jest'].includes(dep)) return 'Development';
  return 'Other';
}

function checkVulnerabilities() {
  try {
    console.log('\n🔍 Verificando vulnerabilidades...');
    const result = execSync('npm audit --json', { encoding: 'utf8' });
    const audit = JSON.parse(result);
    
    if (audit.metadata.vulnerabilities.total > 0) {
      console.log(`⚠️  Encontradas ${audit.metadata.vulnerabilities.total} vulnerabilidades:`);
      console.log(`   - ${audit.metadata.vulnerabilities.low} baixas`);
      console.log(`   - ${audit.metadata.vulnerabilities.moderate} moderadas`);
      console.log(`   - ${audit.metadata.vulnerabilities.high} altas`);
      console.log(`   - ${audit.metadata.vulnerabilities.critical} críticas`);
      console.log('\n💡 Execute "npm audit fix" para corrigir automaticamente');
    } else {
      console.log('✅ Nenhuma vulnerabilidade encontrada');
    }
  } catch (error) {
    console.log('⚠️  Não foi possível verificar vulnerabilidades');
  }
}

function main() {
  console.log('🔍 Verificando dependências do VocalCoach AI...\n');
  
  const installedDeps = checkPackageJson();
  const allMissing = [];
  
  // Verificar dependências necessárias
  for (const [categoryName, category] of Object.entries(requiredDependencies)) {
    const results = checkCategory(category, installedDeps);
    displayResults(categoryName, results, installedDeps);
    
    // Coletar dependências faltantes
    for (const [subcategory, deps] of Object.entries(results.results)) {
      for (const [dep, isInstalled] of Object.entries(deps)) {
        if (!isInstalled) allMissing.push(dep);
      }
    }
  }
  
  // Verificar dependências opcionais
  console.log('\n📋 DEPENDÊNCIAS OPCIONAIS');
  console.log('='.repeat(50));
  
  for (const [categoryName, category] of Object.entries(optionalDependencies)) {
    const results = checkCategory({ [categoryName]: category }, installedDeps);
    displayResults(categoryName, results, installedDeps);
  }
  
  // Gerar comandos de instalação
  generateInstallCommands(allMissing);
  
  // Verificar vulnerabilidades
  checkVulnerabilities();
  
  // Resumo final
  console.log('\n📊 RESUMO FINAL');
  console.log('='.repeat(50));
  
  const totalRequired = Object.values(requiredDependencies)
    .flatMap(cat => Object.values(cat))
    .flat()
    .length;
  
  const installedRequired = totalRequired - allMissing.length;
  const percentage = Math.round((installedRequired / totalRequired) * 100);
  
  console.log(`✅ Dependências necessárias: ${installedRequired}/${totalRequired} (${percentage}%)`);
  
  if (percentage === 100) {
    console.log('🎉 Todas as dependências necessárias estão instaladas!');
    console.log('💡 O projeto deve compilar sem problemas.');
  } else {
    console.log('⚠️  Algumas dependências estão faltando.');
    console.log('💡 Execute os comandos acima para instalar as dependências faltantes.');
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkDependencies: main }; 