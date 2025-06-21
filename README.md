# VocalCoach AI 🎵

[![Tests](https://github.com/JoaoSantosCodes/VOCALCOACH-AI/actions/workflows/tests.yml/badge.svg)](https://github.com/JoaoSantosCodes/VOCALCOACH-AI/actions/workflows/tests.yml)
[![Coverage](https://img.shields.io/badge/coverage-85%25-brightgreen.svg)](https://github.com/JoaoSantosCodes/VOCALCOACH-AI)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PWA](https://img.shields.io/badge/PWA-ready-blue.svg)](https://web.dev/progressive-web-apps/)
[![Beta](https://img.shields.io/badge/beta-in%20progress-orange.svg)](https://vocalcoach.ai/beta)

Uma plataforma inovadora de treinamento vocal que utiliza inteligência artificial para fornecer feedback em tempo real e exercícios personalizados.

## 🚀 Beta Test

O VocalCoach AI está atualmente em fase beta! Se você recebeu um convite, siga as instruções abaixo para começar.

### 📋 Requisitos

- Node.js 18+
- MongoDB 6+
- Discord Bot Token
- SMTP Server (para envio de emails)

### 🛠️ Configuração do Ambiente Beta

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/vocalcoach-ai.git
cd vocalcoach-ai
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o ambiente beta:
```bash
npm run beta:setup
```

Este comando irá:
- Verificar e configurar variáveis de ambiente necessárias
- Criar diretórios para logs, relatórios e dados
- Configurar banco de dados e índices
- Configurar canais do Discord
- Instalar dependências adicionais se necessário

### 🎮 Comandos do Beta

- `npm run beta:setup` - Configura o ambiente beta
- `npm run beta:monitor` - Inicia o monitoramento em tempo real
- `npm run beta:send-invites` - Envia convites para beta testers
- `npm run beta:report` - Gera relatório manual
- `npm run beta:report:daily` - Gera relatório diário
- `npm run beta:report:weekly` - Gera relatório semanal
- `npm run beta:schedule-reports` - Agenda geração automática de relatórios
- `npm run beta:backup` - Realiza backup manual dos dados
- `npm run beta:backup:daily` - Agenda backup diário automático
- `npm run beta:progress` - Gera relatório de progresso do beta
- `npm run beta:setup:ci` - Configura ambiente beta em CI
- `npm run beta:monitor:ci` - Executa monitoramento em CI

### 📊 Monitoramento

O sistema de monitoramento coleta as seguintes métricas:

- **Usuários**
  - Total de beta testers
  - Usuários ativos (diário/semanal)
  - Retenção por grupo
  - Progresso nos exercícios

- **Performance**
  - Taxa de erro
  - Latência média
  - Uso de recursos
  - Disponibilidade

- **Feedback**
  - Bugs reportados
  - Sugestões de features
  - Avaliações gerais
  - Satisfação do usuário

### 📈 Relatórios

Os relatórios são gerados nos seguintes formatos:

- **Diário**: Métricas das últimas 24 horas
- **Semanal**: Análise completa da semana
- **Manual**: Relatório personalizado por período

Os relatórios são salvos em `reports/beta` e enviados por email.

### 🎯 Grupos de Beta Testers

- **Iniciante**
  - Foco em exercícios básicos
  - Modo offline disponível
  - 40 vagas

- **Intermediário**
  - Análise de voz em tempo real
  - Sistema de gamificação
  - 40 vagas

- **Avançado**
  - Acesso a todas as features
  - Feedback prioritário
  - 20 vagas

### 💬 Canais de Comunicação

- **Discord**
  - #beta-general: Discussões gerais
  - #beta-bugs: Reporte de problemas
  - #beta-feedback: Sugestões
  - #beta-announcements: Anúncios importantes

- **Email**: beta@vocalcoach.ai
- **Suporte**: [Portal de Suporte](https://support.vocalcoach.ai)

### 🏆 Sistema de Recompensas

Os beta testers podem ganhar pontos através de:

- Reporte de bugs (10 pontos)
- Sugestões de features (5 pontos)
- Preenchimento de pesquisas (15 pontos)
- Login diário (1 ponto)
- Conclusão de exercícios (2 pontos)

**Níveis e Recompensas:**

- **Bronze** (0+ pontos)
  - 1 mês premium

- **Prata** (100+ pontos)
  - 3 meses premium
  - Acesso antecipado

- **Ouro** (300+ pontos)
  - 6 meses premium
  - Acesso antecipado
  - Badge exclusiva

- **Platina** (1000+ pontos)
  - 12 meses premium
  - Acesso antecipado
  - Badge exclusiva
  - Menção especial

### 📝 Documentação Adicional

- [Guia do Beta Tester](docs/BETA_TESTER_GUIDE.md)
- [Plano de Testes Beta](docs/BETA_TEST_PLAN.md)
- [Procedimentos de Rollback](docs/ROLLBACK_PROCEDURES.md)
- [Checklist de Desenvolvimento](docs/checklist.md)

### ⚠️ Suporte

Para problemas urgentes:
- Discord: @VocalCoachSupport
- Email: beta@vocalcoach.ai
- Telefone: +XX XX XXXX-XXXX

Horário de atendimento:
- Segunda a Sexta: 9:00-18:00
- Sábado e Domingo: 10:00-16:00
(Horário de Brasília)

## 🌟 Features

- Análise de voz em tempo real
- Exercícios personalizados
- Feedback detalhado
- Sistema de gamificação
- Modo offline
- Integração com Discord
- Relatórios de progresso
- Comunidade ativa

## 🛠️ Tecnologias

- React
- TypeScript
- Node.js
- MongoDB
- Discord.js
- WebRTC
- TensorFlow.js
- Web Audio API

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Contribuição

Veja o guia de [contribuição](CONTRIBUTING.md) para detalhes sobre nosso código de conduta e o processo para enviar pull requests.

## ✨ Destaques

- 🎮 **Sistema de Gamificação Completo**
  - Pontos e recompensas por prática
  - Conquistas e badges
  - Ranking e leaderboards
  - Níveis de progresso
  - Desafios diários
  - Integração social

- 📱 **Suporte Offline**
  - Funciona sem internet
  - Sincronização automática
  - Cache inteligente de exercícios
  - PWA instalável
  - Backup local de progresso

- 🎯 **Análise de Voz Avançada**
  - Captura de áudio em tempo real
  - Análise precisa de pitch e afinação
  - Visualização detalhada de timbre
  - Feedback instantâneo de performance
  - Detecção de silêncio
  - Filtragem de ruído

- 🎨 **Interface Moderna**
  - Design responsivo e acessível
  - Temas claro/escuro
  - Animações suaves com React Spring
  - Microinterações e feedback visual
  - Suporte a leitores de tela
  - Navegação por teclado

## 🚀 Requisitos do Sistema

- Node.js 18+
- Navegador moderno com suporte a:
  - Web Audio API
  - IndexedDB
  - Service Workers
  - WebAssembly
- Microfone (para exercícios vocais)
- 2GB RAM (recomendado)
- Conexão à internet (inicial, depois funciona offline)

## 📦 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/JoaoSantosCodes/VOCALCOACH-AI.git
```

2. Instale as dependências:
```bash
cd VOCALCOACH-AI
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite .env com suas configurações
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

5. Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 📁 Estrutura do Projeto

```
src/
  ├── components/          # Componentes React
  │   ├── Auth/           # Autenticação
  │   ├── Dashboard/      # Painel principal
  │   ├── Exercises/      # Exercícios vocais
  │   ├── Gamification/   # Sistema de gamificação
  │   └── Voice/          # Análise de voz
  ├── hooks/              # Custom hooks
  ├── services/           # Serviços e APIs
  ├── store/              # Gerenciamento de estado
  ├── styles/             # Estilos e temas
  ├── types/              # TypeScript types
  ├── utils/              # Utilitários
  └── workers/            # Service/Web Workers
```

## 🎵 Exercícios Disponíveis

1. **Aquecimento Básico**
   - Exercícios de respiração
   - Duração: 5 minutos
   - Nível: Iniciante
   - Pontos: 50
   - Conquistas: 2

2. **Controle de Afinação**
   - Exercícios de pitch
   - Duração: 7 minutos
   - Nível: Intermediário
   - Pontos: 75
   - Conquistas: 3

3. **Respiração Diafragmática**
   - Técnicas avançadas
   - Duração: 6 minutos
   - Nível: Iniciante
   - Pontos: 60
   - Conquistas: 2

4. **Desafios Diários**
   - Exercícios variados
   - Duração: 10-15 minutos
   - Nível: Todos
   - Pontos: 100-150
   - Recompensas especiais

## 🛠️ Scripts de Desenvolvimento

```bash
# Desenvolvimento
npm run dev           # Inicia servidor de desenvolvimento
npm run test         # Executa testes
npm run test:watch   # Testes em modo watch
npm run lint         # Verifica código
npm run lint:fix     # Corrige problemas de lint

# Produção
npm run build        # Build de produção
npm run start        # Inicia servidor de produção
npm run analyze      # Analisa bundle size

# PWA
npm run build:pwa    # Build com suporte PWA
```

## 📊 Métricas de Qualidade

- **Performance**
  - Lighthouse Score: 95+
  - First Paint: < 1.5s
  - Time to Interactive: < 3.5s
  - Bundle Size: < 250KB (gzipped)

- **Testes**
  - Unitários: 90% cobertura
  - Integração: 85% cobertura
  - E2E: Principais fluxos
  - Visual Regression: Implementado

## 🤝 Contribuindo

1. Fork o projeto
2. Configure o ambiente:
   ```bash
   npm install
   npm run prepare     # Instala husky hooks
   ```
3. Crie sua branch:
   ```bash
   git checkout -b feature/MinhaFeature
   ```
4. Faça suas alterações seguindo:
   - [Conventional Commits](https://www.conventionalcommits.org/)
   - [Código de Conduta](CODE_OF_CONDUCT.md)
   - [Guia de Contribuição](CONTRIBUTING.md)
5. Teste suas mudanças:
   ```bash
   npm run test
   npm run lint
   ```
6. Commit e push:
   ```bash
   git commit -m "feat: adiciona nova feature"
   git push origin feature/MinhaFeature
   ```
7. Abra um Pull Request

## 📱 PWA

O VocalCoach AI é uma Progressive Web App (PWA) que pode ser instalada em dispositivos móveis e desktop. Para instalar:

1. Acesse o site em um navegador compatível
2. Clique no botão "Instalar" na barra de endereço
3. Siga as instruções de instalação

Features offline:
- Exercícios disponíveis sem internet
- Progresso salvo localmente
- Sincronização automática
- Notificações push
- Updates automáticos

## 🎮 Sistema de Gamificação

### Pontos e Níveis
- Pontos por exercício completado
- Bônus por performance
- Níveis de experiência
- Recompensas por nível

### Conquistas
- Badges por marcos alcançados
- Conquistas diárias
- Conquistas especiais
- Coleções de badges

### Social
- Ranking global
- Competições semanais
- Compartilhamento de progresso
- Desafios em grupo

## 🔒 Segurança

- Autenticação JWT
- OAuth providers
- Rate limiting
- CORS e XSS protection
- Input sanitization
- Role-based access

## 📞 Contato

João Santos - [@JoaoSantosCodes](https://github.com/JoaoSantosCodes)

Link do Projeto: [https://github.com/JoaoSantosCodes/VOCALCOACH-AI](https://github.com/JoaoSantosCodes/VOCALCOACH-AI) 