#!/usr/bin/env node

/**
 * Script para verificar e atualizar o progresso dos checklists
 * VocalCoach AI - Beta Test Phase
 */

const fs = require('fs');
const path = require('path');

// Cores para output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Função para colorir texto
function colorize(text, color) {
    return `${colors[color]}${text}${colors.reset}`;
}

// Função para calcular progresso baseado em checkboxes
function calculateProgress(content) {
    const totalItems = (content.match(/- \[[ x]\]/g) || []).length;
    const completedItems = (content.match(/- \[x\]/g) || []).length;
    
    if (totalItems === 0) return 0;
    return Math.round((completedItems / totalItems) * 100);
}

// Função para verificar se arquivo existe
function fileExists(filePath) {
    return fs.existsSync(filePath);
}

// Função para ler arquivo
function readFile(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.error(`Erro ao ler arquivo ${filePath}:`, error.message);
        return '';
    }
}

// Função para atualizar status no arquivo
function updateStatusInFile(filePath, newStatus) {
    try {
        let content = readFile(filePath);
        
        // Atualizar status geral
        const statusRegex = /## 📋 Status Geral: (\d+)% Concluído/;
        if (statusRegex.test(content)) {
            content = content.replace(statusRegex, `## 📋 Status Geral: ${newStatus}% Concluído`);
        }
        
        // Atualizar data de última atualização
        const dateRegex = /\*Última atualização: \d{2}\/\d{2}\/\d{4}\*/;
        const currentDate = new Date().toLocaleDateString('pt-BR');
        if (dateRegex.test(content)) {
            content = content.replace(dateRegex, `*Última atualização: ${currentDate}*`);
        }
        
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    } catch (error) {
        console.error(`Erro ao atualizar arquivo ${filePath}:`, error.message);
        return false;
    }
}

// Função para verificar dependências instaladas
function checkDependencies() {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const backendPackageJsonPath = path.join(__dirname, '..', 'backend', 'package.json');
    
    let frontendDeps = 0;
    let backendDeps = 0;
    
    if (fileExists(packageJsonPath)) {
        const packageJson = JSON.parse(readFile(packageJsonPath));
        frontendDeps = Object.keys(packageJson.dependencies || {}).length + 
                      Object.keys(packageJson.devDependencies || {}).length;
    }
    
    if (fileExists(backendPackageJsonPath)) {
        const backendPackageJson = JSON.parse(readFile(backendPackageJsonPath));
        backendDeps = Object.keys(backendPackageJson.dependencies || {}).length + 
                      Object.keys(backendPackageJson.devDependencies || {}).length;
    }
    
    return { frontendDeps, backendDeps };
}

// Função para verificar arquivos de configuração
function checkConfigFiles() {
    const configFiles = [
        'package.json',
        'tsconfig.json',
        'backend/package.json',
        'backend/tsconfig.json',
        'cypress.config.ts',
        'jest.config.js'
    ];
    
    let existingFiles = 0;
    configFiles.forEach(file => {
        if (fileExists(path.join(__dirname, '..', file))) {
            existingFiles++;
        }
    });
    
    return Math.round((existingFiles / configFiles.length) * 100);
}

// Função para verificar scripts
function checkScripts() {
    const scriptsDir = path.join(__dirname);
    const scriptFiles = [
        'dashboard-monitor.js',
        'backup-mongodb.js',
        'test-webhooks-simple.js',
        'check-dependencies.js',
        'checklist-progress.js'
    ];
    
    let existingScripts = 0;
    scriptFiles.forEach(script => {
        if (fileExists(path.join(scriptsDir, script))) {
            existingScripts++;
        }
    });
    
    return Math.round((existingScripts / scriptFiles.length) * 100);
}

// Função para verificar documentação
function checkDocumentation() {
    const docsDir = path.join(__dirname, '..', 'docs');
    const docFiles = [
        'checklist.md',
        'backend-checklist.md',
        'frontend-checklist.md',
        'priority-list.md',
        'BETA_TEST_PLAN.md',
        'DEPLOYMENT_GUIDE.md',
        'MONITORING_GUIDE.md',
        'SUPPORT_GUIDE.md'
    ];
    
    let existingDocs = 0;
    docFiles.forEach(doc => {
        if (fileExists(path.join(docsDir, doc))) {
            existingDocs++;
        }
    });
    
    return Math.round((existingDocs / docFiles.length) * 100);
}

// Função principal
function main() {
    console.log(colorize('📋 Verificador de Progresso dos Checklists', 'bright'));
    console.log(colorize('VocalCoach AI - Beta Test Phase', 'cyan'));
    console.log('=' .repeat(50));
    
    const docsDir = path.join(__dirname, '..', 'docs');
    
    // Verificar checklists
    const checklists = [
        { name: 'Backend', file: 'backend-checklist.md' },
        { name: 'Frontend', file: 'frontend-checklist.md' },
        { name: 'Geral', file: 'checklist.md' },
        { name: 'Prioridades', file: 'priority-list.md' }
    ];
    
    let totalProgress = 0;
    let checklistCount = 0;
    
    checklists.forEach(checklist => {
        const filePath = path.join(docsDir, checklist.file);
        
        if (fileExists(filePath)) {
            const content = readFile(filePath);
            const progress = calculateProgress(content);
            totalProgress += progress;
            checklistCount++;
            
            const statusColor = progress >= 80 ? 'green' : progress >= 50 ? 'yellow' : 'red';
            console.log(`${colorize('📄', 'blue')} ${checklist.name}: ${colorize(`${progress}%`, statusColor)}`);
            
            // Atualizar status no arquivo se necessário
            updateStatusInFile(filePath, progress);
        } else {
            console.log(`${colorize('❌', 'red')} ${checklist.name}: ${colorize('Arquivo não encontrado', 'red')}`);
        }
    });
    
    console.log('-'.repeat(30));
    
    // Verificar outros aspectos do projeto
    const configProgress = checkConfigFiles();
    const scriptsProgress = checkScripts();
    const docsProgress = checkDocumentation();
    const { frontendDeps, backendDeps } = checkDependencies();
    
    console.log(`${colorize('⚙️', 'blue')} Configuração: ${colorize(`${configProgress}%`, configProgress >= 80 ? 'green' : 'yellow')}`);
    console.log(`${colorize('📜', 'blue')} Scripts: ${colorize(`${scriptsProgress}%`, scriptsProgress >= 80 ? 'green' : 'yellow')}`);
    console.log(`${colorize('📚', 'blue')} Documentação: ${colorize(`${docsProgress}%`, docsProgress >= 80 ? 'green' : 'yellow')}`);
    console.log(`${colorize('📦', 'blue')} Dependências Frontend: ${colorize(frontendDeps, 'cyan')}`);
    console.log(`${colorize('📦', 'blue')} Dependências Backend: ${colorize(backendDeps, 'cyan')}`);
    
    console.log('-'.repeat(30));
    
    // Progresso geral
    const overallProgress = checklistCount > 0 ? Math.round(totalProgress / checklistCount) : 0;
    const overallColor = overallProgress >= 80 ? 'green' : overallProgress >= 50 ? 'yellow' : 'red';
    
    console.log(`${colorize('🎯', 'bright')} Progresso Geral: ${colorize(`${overallProgress}%`, overallColor)}`);
    
    // Recomendações
    console.log('\n' + colorize('💡 Recomendações:', 'bright'));
    
    if (overallProgress < 50) {
        console.log(colorize('• Foque nas prioridades críticas primeiro', 'yellow'));
        console.log(colorize('• Complete a configuração básica', 'yellow'));
    } else if (overallProgress < 80) {
        console.log(colorize('• Continue com as implementações pendentes', 'blue'));
        console.log(colorize('• Revise e teste as funcionalidades', 'blue'));
    } else {
        console.log(colorize('• Excelente progresso! Foque em otimizações', 'green'));
        console.log(colorize('• Prepare para deploy em produção', 'green'));
    }
    
    console.log('\n' + colorize('✅ Verificação concluída!', 'green'));
}

// Executar se chamado diretamente
if (require.main === module) {
    main();
}

module.exports = {
    calculateProgress,
    checkDependencies,
    checkConfigFiles,
    checkScripts,
    checkDocumentation,
    updateStatusInFile
}; 