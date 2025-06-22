# Backend Errors Checklist - VocalCoach AI

## 📊 Status Atual
- **Total de Erros:** ~27 (reduzido drasticamente)
- **Arquivos com Erros:** 11
- **Progresso:** 70% corrigido (restam ajustes de tipagem, destructuring e models)

---

## 🔴 PRIORIDADE CRÍTICA (Bloqueiam Build/Deploy)

### ✅ Concluído
- [x] Imports/exports dos controllers e rotas padronizados
- [x] Logger padronizado como default
- [x] Rotas principais corrigidas para usar classes dos controllers
- [x] Correção de handlers duplicados e exports inconsistentes

### 🔄 Em Andamento
- [ ] Ajustar destructuring dos retornos dos validators (não usar `{ error }`)
- [ ] Corrigir propriedades dos models (usar `.toObject()` ou ajustar interface)
- [ ] Corrigir conflitos de tipos do Express (especialmente `user`)
- [ ] Corrigir uso de tipos customizados em rotas
- [ ] Ajustar tipos explícitos para `app` e `router` onde necessário
- [ ] Corrigir uso de `logError` não definido

### ⏳ Pendente
- [ ] Instalar `class-validator` e tipos (se necessário)
- [ ] Corrigir `swagger-ui-express` não encontrado (se necessário)
- [ ] Corrigir `rate-limit-redis` não encontrado (se necessário)

---

## 🟡 PRIORIDADE ALTA (Afetam Funcionalidade)

### Controllers
- [ ] `achievement.controller.ts` - 15 erros
  - [ ] `req.user.id` possivelmente `undefined`
  - [ ] Propriedades `criteria`, `progress`, `completed` inexistentes
  - [ ] Propriedade `score` inexistente em VoiceAnalysis

- [ ] `auth.controller.ts` - 7 erros
  - [ ] `AuthService.findUserByEmail` inexistente
  - [ ] Propriedades `_id`, `email`, `name`, `role` inexistentes em User

- [ ] `blog.controller.ts` - 2 erros
  - [ ] `req.user.id` possivelmente `undefined`

- [ ] `stats.controller.ts` - 2 erros
  - [ ] Propriedade `score` inexistente

### Middleware
- [ ] `auth.middleware.ts` - 5 erros
  - [ ] Propriedades `role`, `isEmailVerified`, `hasActiveSubscription` inexistentes
  - [ ] `AuthService.TokenExpiredError` inexistente

- [ ] `audit.middleware.ts` - 2 erros
  - [ ] `req.ip` possivelmente `undefined`

- [ ] `botProtection.middleware.ts` - 2 erros
  - [ ] `req.ip` possivelmente `undefined`
  - [ ] `error.name` tipo `unknown`

### Routes
- [ ] `achievement.routes.ts` - 1 erro
  - [ ] `authenticateToken` não exportado

- [ ] `auth.routes.ts` - 2 erros
  - [ ] `validateLogin`, `validateRegister` não exportados

- [ ] `blog.routes.ts` - 2 erros
  - [ ] `authenticateToken`, `isAdmin` não exportados

---

## 🟢 PRIORIDADE MÉDIA (Melhorias)

### Services
- [ ] `anomaly.service.ts` - 1 erro
  - [ ] `prisma` não exportado de database

- [ ] `auth.service.ts` - 2 erros
  - [ ] `config` não exportado de auth.config
  - [ ] Tipo `User` usado incorretamente

- [ ] `twoFactor.service.ts` - 3 erros
  - [ ] `prisma` não exportado
  - [ ] Tipo `User` usado incorretamente
  - [ ] Parâmetro `c` tipo `any`

### Validators
- [ ] `twoFactor.validator.ts` - 4 erros
  - [ ] `class-validator` não encontrado
  - [ ] Propriedades sem inicializador

### Models
- [ ] `UserProgress.ts` - 2 erros
  - [ ] Parâmetros `sum`, `attempt` tipo `any`

---

## 📋 Plano de Ação

### Fase 1: Críticos (1-2 horas)
1. Instalar dependências faltantes (`class-validator`, `swagger-ui-express`)
2. Corrigir imports/exports inconsistentes
3. Corrigir propriedades `undefined` em controllers

### Fase 2: Altos (2-3 horas)
1. Corrigir tipos de modelos (User, Achievement, VoiceAnalysis)
2. Corrigir middlewares de autenticação
3. Corrigir validators

### Fase 3: Médios (1-2 horas)
1. Corrigir services
2. Corrigir models
3. Testes finais

---

## 🎯 Objetivo
**Reduzir erros para 0 e permitir build completo do backend**

---

## 📈 Progresso
- **Fase 1:** 0/3 tarefas
- **Fase 2:** 0/3 tarefas  
- **Fase 3:** 0/3 tarefas
- **Total:** 0/9 tarefas (0%)

---

## 📋 Observação
A build já reduziu drasticamente os erros após as últimas correções. Restam principalmente ajustes de destructuring dos validators, propriedades de models, conflitos de tipos do Express, e pequenos ajustes em middlewares/rotas. Próximo passo: atacar esses pontos para zerar os erros e liberar build estável. 