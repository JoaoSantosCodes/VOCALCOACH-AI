const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');

// Configurações
const SCRIPTS = {
  daily_report: 'npm run beta:report:daily',
  weekly_report: 'npm run beta:report:weekly',
  daily_backup: 'npm run beta:backup:daily',
};

// Função para executar script
function runScript(script) {
  return new Promise((resolve, reject) => {
    exec(script, {
      cwd: path.join(__dirname, '..'),
    }, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Erro ao executar ${script}:`, error);
        reject(error);
        return;
      }
      console.log(`✅ Script ${script} executado com sucesso`);
      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);
      resolve();
    });
  });
}

// Função para agendar relatórios diários
function scheduleDailyTasks() {
  // Executar todos os dias às 23:59
  cron.schedule('59 23 * * *', async () => {
    console.log('🔄 Iniciando tarefas diárias...');
    
    try {
      // Gerar relatório
      console.log('📊 Gerando relatório diário...');
      await runScript(SCRIPTS.daily_report);
      console.log('✅ Relatório diário gerado com sucesso');

      // Fazer backup
      console.log('💾 Iniciando backup diário...');
      await runScript(SCRIPTS.daily_backup);
      console.log('✅ Backup diário concluído');

    } catch (error) {
      console.error('❌ Erro nas tarefas diárias:', error);
    }
  }, {
    timezone: 'America/Sao_Paulo',
  });
}

// Função para agendar relatórios semanais
function scheduleWeeklyReports() {
  // Executar todo domingo às 23:59
  cron.schedule('59 23 * * 0', async () => {
    console.log('🔄 Iniciando geração do relatório semanal...');
    try {
      await runScript(SCRIPTS.weekly_report);
      console.log('✅ Relatório semanal gerado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao gerar relatório semanal:', error);
    }
  }, {
    timezone: 'America/Sao_Paulo',
  });
}

// Função principal
function startScheduler() {
  console.log('🚀 Iniciando agendador de tarefas...\n');

  // Agendar tarefas
  scheduleDailyTasks();
  scheduleWeeklyReports();

  console.log('📅 Agendamentos configurados:');
  console.log('- Tarefas diárias (relatório + backup): todos os dias às 23:59');
  console.log('- Relatório semanal: todo domingo às 23:59');
  console.log('\n⏰ Agendador em execução...');
}

// Iniciar agendador
startScheduler(); 