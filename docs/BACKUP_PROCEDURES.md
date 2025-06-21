# 📚 Procedimentos de Backup e Restauração

## 📋 Visão Geral
Este documento descreve os procedimentos para backup e restauração do banco de dados MongoDB do VocalCoach AI. O sistema utiliza uma estratégia de backup dupla, armazenando localmente e na nuvem (AWS S3) para garantir redundância e segurança dos dados.

## 🔧 Configuração

### Variáveis de Ambiente
```env
# Configurações de Backup
BACKUP_RETENTION_DAYS=7        # Período de retenção dos backups
BACKUP_COMPRESSION=true        # Ativar compressão gzip
BACKUP_PATH=./backups         # Diretório local de backups
TEST_RESTORE_DB=vocalcoach_test_restore  # Banco para testes de restauração

# Configurações S3 (Opcional)
USE_S3_BACKUP=true            # Ativar backup no S3
BACKUP_S3_BUCKET=vocalcoach-backups  # Nome do bucket S3
BACKUP_S3_PREFIX=mongodb-backups/staging/  # Prefixo dos arquivos no S3
AWS_REGION=us-east-1          # Região do S3
AWS_ACCESS_KEY_ID=            # Access Key ID da AWS
AWS_SECRET_ACCESS_KEY=        # Secret Access Key da AWS
```

## 📤 Processo de Backup

### Backup Manual
Para executar um backup manualmente:
```bash
node scripts/backup-mongodb.js
```

Para especificar um banco de dados diferente:
```bash
node scripts/backup-mongodb.js --db nome_do_banco
```

### Backup Automático
O backup é executado automaticamente através de um agendamento:
1. Diariamente às 00:00 UTC
2. A cada 6 horas para o banco de staging
3. Antes de cada deploy em produção

### Estrutura do Backup
- Formato: `backup-YYYY-MM-DDTHH-mm-ss.sssZ`
- Compressão: gzip (opcional)
- Armazenamento:
  - Local: `./backups/`
  - S3: `s3://vocalcoach-backups/mongodb-backups/staging/`

### Retenção
- Período padrão: 7 dias
- Limpeza automática de backups antigos
- Aplicado tanto para armazenamento local quanto S3

## 📥 Processo de Restauração

### Teste de Restauração
Para testar a restauração do backup mais recente:
```bash
node scripts/test-restore.js
```

O script irá:
1. Identificar o backup mais recente
2. Criar um banco de dados de teste
3. Restaurar os dados
4. Verificar a integridade
5. Gerar relatório de restauração

### Restauração em Produção
⚠️ **ATENÇÃO**: Siga estritamente estas etapas para restauração em produção:

1. **Preparação**
   ```bash
   # Pare todos os serviços que acessam o banco
   pm2 stop all
   
   # Faça backup do estado atual
   node scripts/backup-mongodb.js --db vocalcoach_production
   ```

2. **Restauração**
   ```bash
   # Restaure usando o script de teste primeiro
   node scripts/test-restore.js
   
   # Se o teste for bem-sucedido, restaure em produção
   mongorestore --uri="mongodb://localhost:27017" --db=vocalcoach_production --drop /caminho/do/backup
   ```

3. **Verificação**
   ```bash
   # Verifique a integridade dos dados
   node scripts/verify-data.js
   
   # Verifique os logs em busca de erros
   tail -f logs/mongodb.log
   ```

4. **Finalização**
   ```bash
   # Reinicie os serviços
   pm2 start all
   
   # Monitore os logs por 5 minutos
   tail -f logs/app.log
   ```

## 🚨 Procedimentos de Emergência

### Falha no Backup
1. Verifique os logs em `logs/backup.log`
2. Execute backup manual: `node scripts/backup-mongodb.js`
3. Se persistir, notifique a equipe via Discord: #ops-alerts

### Falha na Restauração
1. Pare a restauração imediatamente
2. Verifique a integridade do backup
3. Tente restaurar um backup anterior
4. Se necessário, use o backup do S3

### Perda de Dados
1. Pare todos os serviços
2. Identifique o último backup válido
3. Siga o procedimento de restauração em produção
4. Documente o incidente
5. Revise os logs para identificar a causa

## 📊 Monitoramento

### Métricas
- Tamanho do backup
- Tempo de execução
- Taxa de sucesso
- Uso de armazenamento

### Alertas
Configurados para notificar via Discord (#ops-alerts) em caso de:
- Falha no backup
- Backup maior que o esperado
- Erro na limpeza de backups antigos
- Falha no upload para S3

## 🔍 Verificação Regular
- Teste de restauração semanal
- Verificação de integridade diária
- Auditoria mensal de procedimentos
- Revisão trimestral da política de backup

## 📝 Logs
Todos os logs são mantidos em:
- `logs/backup.log`: Logs de backup
- `logs/restore.log`: Logs de restauração
- `logs/verify.log`: Logs de verificação

## 🔒 Segurança
- Backups são criptografados em repouso (S3)
- Acesso restrito por IAM
- Monitoramento de acesso via CloudTrail
- Logs de auditoria retidos por 90 dias

## 📞 Contatos
Em caso de emergência, contate:
1. DevOps de plantão: via Discord #ops-oncall
2. DBA responsável: via Discord #dba-oncall
3. Tech Lead: via telefone (número no 1Password) 