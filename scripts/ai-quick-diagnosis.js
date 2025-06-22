#!/usr/bin/env node

/**
 * 🤖 Script de Diagnóstico Rápido para IA
 * VocalCoach AI - Beta Test Phase
 * 
 * Este script executa verificações rápidas e fornece recomendações
 * automáticas para qualquer IA determinar próximas ações.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Cores para output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
    console.log(`\n${colors.bold}${colors.cyan}${'='.repeat(50)}`);
    console.log(`${title}`);
    console.log(`${'='.repeat(50)}${colors.reset}\n`);
}

function checkCommand(command, description) {
    try {
        const result = execSync(command, { encoding: 'utf8', timeout: 10000 });
        log(`✅ ${description}`, 'green');
        return { success: true, output: result };
    } catch (error) {
        log(`❌ ${description}`, 'red');
        return { success: false, error: error.message };
    }
}

function checkFileExists(filePath) {
    return fs.existsSync(filePath);
}

function getProgressFromChecklist() {
    try {
        const result = execSync('npm run beta:checklist', { encoding: 'utf8' });
        const progressMatch = result.match(/Progresso Geral: (\d+)%/);
        return progressMatch ? parseInt(progressMatch[1]) : 0;
    } catch (error) {
        return 0;
    }
}

function analyzeProblems() {
    const problems = {
        critical: [],
        medium: [],
        low: []
    };

    // Verificar diretório logs
    if (!checkFileExists('logs')) {
        problems.critical.push({
            type: 'Diretório logs não existe',
            solution: 'mkdir -p logs',
            impact: 'Dashboard não funciona'
        });
    }

    // Verificar dependência morgan
    if (!checkFileExists('backend/node_modules/morgan')) {
        problems.critical.push({
            type: 'Dependência morgan faltando',
            solution: 'cd backend && npm install morgan',
            impact: 'Servidor não inicia'
        });
    }

    // Verificar build backend
    const buildCheck = checkCommand('npm run build:backend', 'Build do backend');
    if (!buildCheck.success) {
        problems.critical.push({
            type: 'Build do backend falhando',
            solution: 'Verificar erros TypeScript e dependências',
            impact: 'Deploy não possível'
        });
    }

    return problems;
}

function generateRecommendations(problems, progress) {
    const recommendations = [];

    if (problems.critical.length > 0) {
        recommendations.push({
            priority: 'CRÍTICA',
            action: 'Corrigir problemas críticos primeiro',
            commands: problems.critical.map(p => p.solution),
            time: '5-10 minutos'
        });
    }

    if (progress < 50) {
        recommendations.push({
            priority: 'ALTA',
            action: 'Focar em configuração básica',
            commands: [
                'npm run beta:checklist',
                'npm run deps:check',
                'mkdir -p logs'
            ],
            time: '30 minutos'
        });
    } else {
        recommendations.push({
            priority: 'ALTA',
            action: 'Implementar funcionalidades avançadas',
            commands: [
                'npm run dev:backend:simple',
                'npm run beta:dashboard'
            ],
            time: '1-2 horas'
        });
    }

    return recommendations;
}

function main() {
    logSection('🤖 DIAGNÓSTICO RÁPIDO - VocalCoach AI');
    
    // 1. Verificar progresso atual
    logSection('📊 VERIFICANDO PROGRESSO');
    const progress = getProgressFromChecklist();
    log(`Progresso Geral: ${progress}%`, progress > 50 ? 'green' : 'yellow');

    // 2. Verificar dependências
    logSection('📦 VERIFICANDO DEPENDÊNCIAS');
    checkCommand('npm run deps:check', 'Verificação de dependências');

    // 3. Verificar builds
    logSection('🔨 VERIFICANDO BUILDS');
    checkCommand('npm run build:backend', 'Build do Backend');
    checkCommand('npm run build', 'Build do Frontend');

    // 4. Verificar servidor
    logSection('🚀 VERIFICANDO SERVIDOR');
    checkCommand('npm run dev:backend:simple --dry-run', 'Servidor Backend');

    // 5. Analisar problemas
    logSection('🔍 ANÁLISE DE PROBLEMAS');
    const problems = analyzeProblems();
    
    if (problems.critical.length > 0) {
        log('🚨 PROBLEMAS CRÍTICOS DETECTADOS:', 'red');
        problems.critical.forEach(problem => {
            log(`  • ${problem.type}`, 'red');
            log(`    Solução: ${problem.solution}`, 'yellow');
            log(`    Impacto: ${problem.impact}`, 'yellow');
        });
    } else {
        log('✅ Nenhum problema crítico detectado', 'green');
    }

    // 6. Gerar recomendações
    logSection('🎯 RECOMENDAÇÕES');
    const recommendations = generateRecommendations(problems, progress);
    
    recommendations.forEach(rec => {
        log(`${rec.priority}: ${rec.action}`, 'cyan');
        log(`  Comandos:`, 'yellow');
        rec.commands.forEach(cmd => log(`    ${cmd}`, 'yellow'));
        log(`  Tempo estimado: ${rec.time}`, 'magenta');
    });

    // 7. Template de resposta
    logSection('📋 TEMPLATE DE RESPOSTA PARA IA');
    console.log(`
## 📊 Status Atual do Projeto

**Progresso Geral:** ${progress}%
- Backend: ${progress < 30 ? 'Baixo' : 'Médio'}
- Frontend: ${progress < 30 ? 'Baixo' : 'Médio'}
- Prioridades: ${progress < 20 ? 'Baixo' : 'Médio'}

## 🚨 Problemas Críticos Identificados
${problems.critical.length > 0 ? 
    problems.critical.map(p => `- ${p.type}: ${p.solution}`).join('\n') : 
    '- Nenhum problema crítico detectado'}

## 🔥 Próximas Ações Prioritárias
${recommendations.map((rec, i) => `${i + 1}. **${rec.priority}**: ${rec.action}
   - Comandos: ${rec.commands.join(', ')}
   - Tempo estimado: ${rec.time}`).join('\n\n')}

## 📋 Checklist de Verificação
- [ ] Executar \`npm run beta:checklist\`
- [ ] Verificar builds (backend/frontend)
- [ ] Testar servidor de desenvolvimento
- [ ] Corrigir problemas críticos
- [ ] Implementar próximas prioridades
- [ ] Atualizar progresso
- [ ] Commit no GitHub

## 🎯 Recomendação Final
${problems.critical.length > 0 ? 
    'Corrigir problemas críticos primeiro, depois continuar com desenvolvimento.' :
    'Continuar com implementação das próximas prioridades.'}
    `);

    logSection('✅ DIAGNÓSTICO CONCLUÍDO');
    log('Use as recomendações acima para determinar as próximas ações.', 'green');
}

// Executar diagnóstico
if (require.main === module) {
    main();
}

module.exports = { main, analyzeProblems, generateRecommendations }; 