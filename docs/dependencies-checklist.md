# Checklist de Dependências - VocalCoach AI

## 📦 Dependências Frontend

### React e Roteamento
- [x] `react` - Biblioteca principal do React
- [x] `react-dom` - Renderização do React no DOM
- [x] `react-router-dom` - Roteamento da aplicação
- [x] `@types/react` - Tipos TypeScript para React
- [x] `@types/react-dom` - Tipos TypeScript para React DOM

### UI e Componentes
- [x] `@mui/material` - Biblioteca de componentes Material-UI
- [x] `@emotion/react` - Runtime do Emotion (CSS-in-JS)
- [x] `@emotion/styled` - Styled components do Emotion
- [x] `@mui/icons-material` - Ícones do Material-UI

### Gráficos e Visualização
- [x] `react-chartjs-2` - Wrapper React para Chart.js
- [x] `chart.js` - Biblioteca de gráficos
- [x] `@types/chart.js` - Tipos TypeScript para Chart.js

### Análise de Áudio
- [x] `pitchy` - Análise de pitch e frequência
- [x] `@types/pitchy` - Tipos TypeScript para pitchy (se disponível)

### Service Worker e PWA
- [x] `workbox-webpack-plugin` - Plugin do Workbox para Webpack
- [x] `workbox-cacheable-response` - Cache de respostas
- [x] `workbox-precaching` - Pré-cache de recursos
- [x] `workbox-expiration` - Expiração de cache
- [x] `workbox-recipes` - Receitas do Workbox
- [x] `workbox-background-sync` - Sincronização em background
- [x] `workbox-routing` - Roteamento do Workbox
- [x] `workbox-strategies` - Estratégias de cache

### Animações
- [x] `react-spring` - Animações baseadas em física
- [x] `@react-spring/web` - Animações para web
- [x] `@react-spring/native` - Animações para React Native (se necessário)

## 🔧 Dependências Backend

### Framework e Servidor
- [x] `express` - Framework web para Node.js
- [x] `@types/express` - Tipos TypeScript para Express
- [x] `cors` - Middleware CORS
- [x] `helmet` - Headers de segurança
- [x] `compression` - Compressão de resposta

### Banco de Dados
- [x] `mongoose` - ODM para MongoDB
- [x] `@types/mongoose` - Tipos TypeScript para Mongoose
- [x] `mongodb` - Driver oficial do MongoDB

### Autenticação e Segurança
- [x] `passport` - Middleware de autenticação
- [x] `passport-jwt` - Estratégia JWT do Passport
- [x] `passport-local` - Estratégia local do Passport
- [x] `jsonwebtoken` - Geração e verificação de JWT
- [x] `bcrypt` - Hash de senhas
- [x] `@types/bcrypt` - Tipos TypeScript para bcrypt
- [x] `rate-limiter-flexible` - Rate limiting

### Validação e Sanitização
- [x] `joi` - Validação de dados
- [x] `express-validator` - Validação para Express
- [x] `sanitize-html` - Sanitização de HTML

### Logs e Monitoramento
- [x] `winston` - Sistema de logs
- [x] `morgan` - Logs de requisições HTTP
- [x] `axios` - Cliente HTTP
- [x] `dotenv` - Variáveis de ambiente

### Utilitários
- [x] `lodash` - Biblioteca de utilitários
- [x] `moment` - Manipulação de datas
- [x] `uuid` - Geração de UUIDs
- [x] `@types/uuid` - Tipos TypeScript para UUID

## 🧪 Dependências de Desenvolvimento

### TypeScript
- [x] `typescript` - Compilador TypeScript
- [x] `@types/node` - Tipos TypeScript para Node.js

### Linting e Formatação
- [x] `eslint` - Linter JavaScript/TypeScript
- [x] `@typescript-eslint/eslint-plugin` - Plugin ESLint para TypeScript
- [x] `@typescript-eslint/parser` - Parser TypeScript para ESLint
- [x] `prettier` - Formatador de código
- [x] `eslint-config-prettier` - Configuração ESLint para Prettier
- [x] `eslint-plugin-prettier` - Plugin Prettier para ESLint

### Testes
- [x] `jest` - Framework de testes
- [x] `@types/jest` - Tipos TypeScript para Jest
- [x] `react-testing-library` - Biblioteca de testes para React
- [x] `@testing-library/jest-dom` - Matchers customizados para Jest
- [x] `@testing-library/user-event` - Simulação de eventos do usuário
- [x] `cypress` - Testes end-to-end
- [x] `@types/cypress` - Tipos TypeScript para Cypress

### Build e Deploy
- [x] `react-scripts` - Scripts do Create React App
- [x] `webpack` - Bundler (incluído no react-scripts)
- [x] `babel` - Transpilador (incluído no react-scripts)

### Monitoramento e Performance
- [x] `web-vitals` - Métricas de performance web
- [x] `lighthouse` - Auditoria de performance
- [x] `@types/lighthouse` - Tipos TypeScript para Lighthouse

## 📋 Dependências Opcionais

### Análise de Código
- [ ] `sonarqube-scanner` - Análise de qualidade de código
- [ ] `codecov` - Cobertura de testes

### Documentação
- [ ] `typedoc` - Geração de documentação TypeScript
- [ ] `storybook` - Desenvolvimento de componentes

### CI/CD
- [ ] `husky` - Git hooks
- [ ] `lint-staged` - Lint apenas arquivos staged
- [ ] `commitizen` - Commits padronizados

## 🚨 Problemas Conhecidos

### Dependências com Conflitos
- [ ] Verificar versões compatíveis do Material-UI
- [ ] Resolver conflitos de tipos TypeScript
- [ ] Verificar compatibilidade do Workbox

### Dependências Desatualizadas
- [ ] Atualizar dependências com vulnerabilidades
- [ ] Verificar compatibilidade com Node.js 18+
- [ ] Atualizar React para versão mais recente

## 📝 Comandos Úteis

### Instalação de Dependências
```bash
# Instalar todas as dependências
npm install

# Instalar apenas dependências de produção
npm install --production

# Instalar apenas dependências de desenvolvimento
npm install --dev
```

### Verificação de Dependências
```bash
# Verificar vulnerabilidades
npm audit

# Verificar dependências desatualizadas
npm outdated

# Listar dependências
npm list --depth=0
```

### Limpeza
```bash
# Limpar cache do npm
npm cache clean --force

# Remover node_modules e reinstalar
rm -rf node_modules package-lock.json && npm install
```

---

*Última atualização: 21/12/2024* 