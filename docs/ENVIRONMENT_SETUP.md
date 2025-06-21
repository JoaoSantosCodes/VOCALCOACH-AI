# Guia de Configuração do Ambiente - VocalCoach AI Beta

Este guia descreve como configurar o ambiente para o beta test do VocalCoach AI.

## 1. Pré-requisitos

- Node.js v16 ou superior
- MongoDB v4.4 ou superior
- MongoDB Database Tools (mongodump, mongorestore)
- Conta Gmail para envio de emails
- Servidor Discord para monitoramento

## 2. Instalação das Ferramentas

### MongoDB Database Tools
```powershell
# Windows (Administrador)
choco install mongodb-database-tools -y

# Verificar instalação
mongodump --version
mongorestore --version
```

### MongoDB
```bash
# Windows (Administrador)
choco install mongodb -y

# macOS (usando Homebrew)
brew tap mongodb/brew
brew install mongodb-community
```

## 3. Configuração do MongoDB

1. **Instalação Local**
   - Certifique-se de que o MongoDB está instalado e rodando
   - Verifique se o MongoDB Database Tools está instalado

2. **Configuração do Ambiente**
   ```bash
   # 1. Criar diretório de configuração
   mkdir -p config/env

   # 2. Criar arquivo de configuração de staging
   cat > config/env/staging.env << EOL
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DB=vocalcoach_staging

   # Backup
   BACKUP_RETENTION_DAYS=7
   BACKUP_COMPRESSION=true
   BACKUP_PATH=./backups/staging

   # Teste
   TEST_USER_EMAIL=test@vocalcoach.ai
   TEST_USER_NAME=Test User
   TEST_RESTORE_DB=vocalcoach_staging_test
   EOL
   ```

3. **Verificação**
   ```bash
   # Inicie o MongoDB
   mongod

   # Configure o ambiente de staging
   npm run beta:setup-staging

   # Teste o backup e restore
   npm run beta:backup-staging
   npm run beta:test-restore
   ```

## 4. Configuração do Email

1. **Configuração do Gmail**
   - Ative a autenticação de duas etapas
   - Gere uma senha de aplicativo
   - Adicione ao `.env`:
     ```
     SMTP_HOST=smtp.gmail.com
     SMTP_PORT=587
     SMTP_USER=seu_email@gmail.com
     SMTP_PASS=sua_senha_de_aplicativo
     ```

2. **Configuração DNS**
   - Execute: `npm run beta:setup-dns`
   - Siga as instruções em `config/dns/INSTRUCTIONS.md`
   - Aguarde a propagação (até 48h)
   - Verifique: `npm run beta:verify-dns`

## 5. Configuração do Discord

1. **Criar Webhook**
   - Abra as configurações do servidor
   - Vá para Integrações > Webhooks
   - Crie um novo webhook
   - Copie a URL do webhook

2. **Configuração**
   - Adicione ao `.env`:
     ```
     DISCORD_WEBHOOK_URL=sua_url_do_webhook
     DISCORD_CHANNEL_ID=id_do_canal
     ```

3. **Teste**
   ```bash
   npm run beta:test-discord
   ```

## 6. Configuração do Beta

1. **Domínio**
   - Adicione ao `.env`:
     ```
     BETA_DOMAIN=vocalcoach.ai
     DKIM_SELECTOR=beta
     ```

2. **Verificação**
   ```bash
   # Teste o ambiente completo
   npm run beta:setup-staging
   npm run beta:backup-staging
   npm run beta:test-restore
   ```

## 7. Verificação Final

Execute a seguinte sequência de testes:

```bash
# 1. Configurar ambiente de staging
npm run beta:setup-staging

# 2. Testar backup e restore
npm run beta:backup-staging
npm run beta:test-restore

# 3. Verificar DNS
npm run beta:verify-dns

# 4. Testar alertas Discord
npm run beta:test-discord
```

## 8. Solução de Problemas

### MongoDB
- **Erro de conexão**: Verifique se o MongoDB está rodando
- **Erro de permissão**: Verifique as credenciais no `.env`

### Email
- **Erro SMTP**: Verifique a senha de aplicativo
- **DNS não propaga**: Aguarde 48h e tente novamente

### Discord
- **Webhook falha**: Verifique a URL do webhook
- **Mensagens não chegam**: Verifique as permissões do canal

## 9. Próximos Passos

1. Execute todos os testes de verificação
2. Documente quaisquer erros encontrados
3. Atualize o checklist com o progresso
4. Prepare o ambiente de produção

## 10. Contatos

- **Suporte Técnico**: tech@vocalcoach.ai
- **Discord**: #beta-support
- **Emergência**: ops@vocalcoach.ai 