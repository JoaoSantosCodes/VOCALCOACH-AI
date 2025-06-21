# 🛠️ Configuração de Ambiente

## 📋 Visão Geral
Este guia fornece instruções detalhadas para configurar os ambientes de desenvolvimento, teste e produção do VocalCoach AI. Inclui todos os requisitos, dependências e configurações necessárias para cada ambiente.

## 🎯 Objetivos
- Padronizar ambientes de desenvolvimento
- Garantir consistência entre ambientes
- Minimizar problemas de "funciona na minha máquina"
- Facilitar onboarding de novos desenvolvedores
- Automatizar configuração quando possível

## 💻 Requisitos do Sistema

### Hardware Mínimo
- CPU: 4 cores
- RAM: 8GB
- Disco: 256GB SSD
- Microfone (para testes locais)

### Hardware Recomendado
- CPU: 8 cores
- RAM: 16GB
- Disco: 512GB SSD
- Microfone de alta qualidade

### Software Base
- Windows 10/11, macOS 12+, ou Linux (Ubuntu 20.04+)
- Git 2.34+
- Node.js 18.x LTS
- Docker Desktop 4.x
- MongoDB 6.0+
- Redis 7.0+
- VS Code (recomendado)

## 🚀 Configuração Inicial

### 1. Instalação de Dependências

#### Windows
```powershell
# Instalar Chocolatey
Set-ExecutionPolicy Bypass -Scope Process -Force
iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))

# Instalar dependências
choco install -y git nodejs-lts docker-desktop mongodb redis vscode

# Instalar ferramentas globais do Node
npm install -g yarn typescript ts-node nodemon
```

#### macOS
```bash
# Instalar Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar dependências
brew install git node docker mongodb-community redis
brew install --cask visual-studio-code

# Instalar ferramentas globais do Node
npm install -g yarn typescript ts-node nodemon
```

#### Linux (Ubuntu)
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar Docker
curl -fsSL https://get.docker.com | sudo bash
sudo usermod -aG docker $USER

# Instalar MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Instalar Redis
sudo apt install -y redis-server

# Instalar VS Code
sudo snap install code --classic

# Instalar ferramentas globais do Node
npm install -g yarn typescript ts-node nodemon
```

### 2. Configuração do Projeto

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/vocalcoach-ai.git
cd vocalcoach-ai

# Instalar dependências do projeto
yarn install

# Configurar ambiente local
yarn setup:dev
```

## 🔧 Configuração de Ambiente

### 1. Variáveis de Ambiente

#### Desenvolvimento (.env.development)
```env
# Server
PORT=3000
NODE_ENV=development
API_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/vocalcoach_dev
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-dev-secret
JWT_EXPIRY=24h

# AWS (opcional para desenvolvimento)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1

# Discord (opcional para desenvolvimento)
DISCORD_CLIENT_ID=your-client-id
DISCORD_CLIENT_SECRET=your-client-secret
DISCORD_BOT_TOKEN=your-bot-token

# Email (opcional para desenvolvimento)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=test
SMTP_PASS=test
```

#### Produção (.env.production)
```env
# Solicitar ao DevOps as configurações de produção
# NUNCA commitar este arquivo
```

### 2. Banco de Dados

#### MongoDB
```bash
# Iniciar MongoDB
sudo systemctl start mongod

# Criar índices
yarn db:setup

# Importar dados de teste
yarn db:seed
```

#### Redis
```bash
# Iniciar Redis
sudo systemctl start redis

# Verificar status
redis-cli ping
```

### 3. Serviços Externos

#### AWS
1. Criar conta AWS
2. Configurar IAM User
3. Configurar S3 Bucket
4. Configurar CloudFront
5. Configurar Route53 (se necessário)

#### Discord
1. Criar aplicação no Discord Developer Portal
2. Configurar OAuth2
3. Adicionar bot ao servidor
4. Configurar permissões

## 🔒 Segurança

### Certificados SSL
```bash
# Gerar certificado local
yarn ssl:generate

# Instalar certificado
yarn ssl:install
```

### Firewalls
```bash
# Configurar regras básicas
yarn security:setup

# Verificar configuração
yarn security:check
```

## 📊 Monitoramento Local

### Logs
```bash
# Visualizar logs em tempo real
yarn logs:watch

# Filtrar logs por serviço
yarn logs:watch --service=api
```

### Métricas
```bash
# Iniciar dashboard local
yarn metrics:dashboard

# Coletar métricas
yarn metrics:collect
```

## 🧪 Ambiente de Testes

### Jest
```bash
# Executar todos os testes
yarn test

# Executar testes específicos
yarn test:unit
yarn test:integration
yarn test:e2e
```

### Coverage
```bash
# Gerar relatório de cobertura
yarn test:coverage
```

## 🐳 Docker

### Desenvolvimento
```bash
# Iniciar serviços
docker-compose up -d

# Parar serviços
docker-compose down

# Visualizar logs
docker-compose logs -f
```

### Produção
```bash
# Build de imagens
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

## 🔄 Scripts Úteis

### Desenvolvimento
```bash
# Iniciar em modo desenvolvimento
yarn dev

# Compilar TypeScript
yarn build

# Limpar cache
yarn clean

# Lint e formatação
yarn lint
yarn format
```

### Database
```bash
# Backup local
yarn db:backup

# Restaurar backup
yarn db:restore

# Migrations
yarn db:migrate
yarn db:rollback
```

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. Erro de Porta em Uso
```bash
# Verificar processos
lsof -i :3000

# Matar processo
kill -9 <PID>
```

#### 2. Problemas com MongoDB
```bash
# Reparar database
yarn db:repair

# Resetar dados
yarn db:reset
```

#### 3. Problemas com Node
```bash
# Limpar cache do npm
npm cache clean --force

# Reinstalar módulos
rm -rf node_modules
yarn install
```

## 📝 VS Code

### Extensões Recomendadas
- ESLint
- Prettier
- GitLens
- Docker
- MongoDB for VS Code
- Thunder Client

### Configurações Recomendadas
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.updateImportsOnFileMove.enabled": "always"
}
```

## 🔄 Processo de Atualização

Este guia deve ser atualizado:
- Quando novas dependências são adicionadas
- Após mudanças significativas na infraestrutura
- Quando processos de setup são modificados
- Durante atualizações de versões major

## 📝 Notas Importantes
1. Nunca commitar arquivos .env
2. Manter dependências atualizadas
3. Seguir padrões de segurança
4. Documentar mudanças de configuração
5. Testar em ambiente limpo periodicamente 