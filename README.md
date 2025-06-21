# VocalCoach AI 🎵

[![Tests](https://github.com/JoaoSantosCodes/VOCALCOACH-AI/actions/workflows/tests.yml/badge.svg)](https://github.com/JoaoSantosCodes/VOCALCOACH-AI/actions/workflows/tests.yml)
[![Coverage](https://img.shields.io/badge/coverage-85%25-brightgreen.svg)](https://github.com/JoaoSantosCodes/VOCALCOACH-AI)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PWA](https://img.shields.io/badge/PWA-ready-blue.svg)](https://web.dev/progressive-web-apps/)

Uma aplicação web moderna para treinamento vocal com feedback em tempo real, exercícios guiados e sistema de gamificação. Funciona offline e oferece uma experiência imersiva de aprendizado.

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

## 🏗️ Tecnologias

- **Frontend**
  - React 18
  - TypeScript 5
  - Material-UI v5
  - React Spring para animações
  - PWA com Workbox
  - IndexedDB para storage

- **Análise de Áudio**
  - Web Audio API
  - FFT para análise espectral
  - ML.js para pitch detection
  - WebAssembly para processamento

- **Performance**
  - Code splitting
  - Service Workers
  - Cache strategies
  - Lazy loading
  - Bundle optimization

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

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE.md](LICENSE.md) para detalhes.

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