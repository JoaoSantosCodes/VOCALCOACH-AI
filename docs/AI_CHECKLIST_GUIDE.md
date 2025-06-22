# 🤖 Guia de Verificação de Checklists para IA - VocalCoach AI

## 📋 Visão Geral

Este documento fornece um passo a passo estruturado para qualquer IA verificar automaticamente o status dos checklists do projeto VocalCoach AI e determinar as próximas ações prioritárias.

---

## 🔄 Processo de Verificação Automática

### **PASSO 1: Executar Verificação de Progresso**
```bash
# Comando principal para verificar progresso atual
npm run beta:checklist
```

**O que analisar na saída:**
- Progresso geral do projeto (%)
- Status individual de cada checklist (Backend, Frontend, Geral, Prioridades)
- Recomendações automáticas geradas
- Dependências instaladas (Frontend/Backend)

### **PASSO 2: Verificar Status dos Checklists Específicos**

#### 2.1 Backend Checklist
```bash
# Verificar arquivo de checklist backend
cat docs/backend-checklist.md
```
**Procurar por:**
- Seções com `[ ]` (não concluídas)
- Seções com `[x]` (concluídas)
- Prioridades marcadas (CRÍTICA, ALTA, MÉDIA, BAIXA)

#### 2.2 Frontend Checklist
```bash
# Verificar arquivo de checklist frontend
cat docs/frontend-checklist.md
```
**Procurar por:**
- Tarefas pendentes
- Erros de build
- Componentes não implementados

#### 2.3 Lista de Prioridades
```bash
# Verificar prioridades atuais
cat docs/priority-list.md
```
**Procurar por:**
- Prioridades CRÍTICAS não concluídas
- Prioridades ALTAS pendentes
- Status de cada item (✅ CONCLUÍDO, 🔄 EM ANDAMENTO, 📅 PENDENTE)

### **PASSO 3: Verificar Erros e Problemas Atuais**

#### 3.1 Verificar Build do Backend
```bash
# Testar build do backend
npm run build:backend
```
**Analisar:**
- Erros de TypeScript
- Dependências faltando
- Problemas de configuração

#### 3.2 Verificar Build do Frontend
```bash
# Testar build do frontend
npm run build
```
**Analisar:**
- Erros de compilação
- Dependências faltando
- Problemas de linting

#### 3.3 Verificar Servidor de Desenvolvimento
```bash
# Testar servidor backend
npm run dev:backend:simple
```
**Analisar:**
- Erros de conexão com MongoDB
- Problemas de configuração
- Dependências faltando (ex: morgan)

### **PASSO 4: Verificar Dashboard de Monitoramento**
```bash
# Testar dashboard
npm run beta:dashboard
```
**Analisar:**
- Erros de diretório logs
- Conflitos de porta
- Funcionalidade do dashboard

---

## 🎯 Matriz de Decisão para Próximas Ações

### **PRIORIDADE 1: Problemas Críticos (Resolver Imediatamente)**
Se encontrar:
- [ ] Erros de build impedindo execução
- [ ] Dependências essenciais faltando
- [ ] Dashboard não funcionando
- [ ] Servidor não iniciando

**AÇÃO:** Corrigir problemas críticos primeiro

### **PRIORIDADE 2: Prioridades Altas do Checklist**
Se não houver problemas críticos, seguir ordem:
1. **Sistema de Logs (Winston)**
   - Verificar se Winston está instalado
   - Configurar logger centralizado
   - Integrar com Express

2. **Autenticação Backend (JWT + Passport)**
   - Verificar implementação atual
   - Testar endpoints de auth
   - Corrigir problemas identificados

3. **Banco de Dados (Mongoose)**
   - Verificar conexão MongoDB
   - Validar modelos
   - Testar operações CRUD

### **PRIORIDADE 3: Prioridades Médias**
- Sistema de Email
- Relatórios Automáticos
- Testes de Integração

### **PRIORIDADE 4: Prioridades Baixas**
- Otimizações de Performance
- Documentação Avançada
- Deploy em Produção

---

## 📊 Comandos de Verificação Rápida

### **Verificação Completa (Recomendado)**
```bash
# 1. Progresso geral
npm run beta:checklist

# 2. Verificar dependências
npm run deps:check

# 3. Testar builds
npm run build:backend
npm run build

# 4. Testar servidor
npm run dev:backend:simple

# 5. Testar dashboard
npm run beta:dashboard
```

### **Verificação Rápida**
```bash
# Apenas progresso e recomendações
npm run beta:checklist
```

---

## 🔧 Comandos de Correção Comuns

### **Instalar Dependências Faltando**
```bash
# Backend
cd backend && npm install

# Frontend
npm install

# Verificar dependências específicas
npm run deps:check
```

### **Corrigir Problemas de Build**
```bash
# Limpar cache e reinstalar
npm run deps:clean

# Verificar tipos TypeScript
npm run type-check

# Corrigir linting
npm run lint:fix
```

### **Criar Diretórios Necessários**
```bash
# Criar diretório logs se não existir
mkdir -p logs
```

---

## 📈 Atualização de Progresso

### **Após Concluir Tarefas:**
1. **Atualizar Checklists:**
   ```bash
   # Atualizar status nos arquivos
   npm run beta:checklist:update
   ```

2. **Gerar Relatório de Progresso:**
   ```bash
   # Gerar relatório atualizado
   npm run beta:progress
   ```

3. **Atualizar README:**
   - Modificar seção de progresso
   - Atualizar status de funcionalidades
   - Adicionar novas conquistas

4. **Commit no GitHub:**
   ```bash
   git add .
   git commit -m "feat: [AREA] [DESCRIÇÃO] - Progresso: X%"
   git push origin main
   ```

---

## 🎯 Template de Resposta para IA

### **Estrutura de Resposta Recomendada:**

```
## 📊 Status Atual do Projeto

**Progresso Geral:** X%
- Backend: X%
- Frontend: X%
- Prioridades: X%

## 🚨 Problemas Críticos Identificados
- [Lista de problemas críticos]

## 🔥 Próximas Ações Prioritárias
1. **Prioridade Alta #1:** [Descrição]
   - Comando: [comando para executar]
   - Tempo estimado: [tempo]

2. **Prioridade Alta #2:** [Descrição]
   - Comando: [comando para executar]
   - Tempo estimado: [tempo]

## 📋 Checklist de Verificação
- [ ] Executar `npm run beta:checklist`
- [ ] Verificar builds (backend/frontend)
- [ ] Testar servidor de desenvolvimento
- [ ] Corrigir problemas críticos
- [ ] Implementar próximas prioridades
- [ ] Atualizar progresso
- [ ] Commit no GitHub

## 🎯 Recomendação Final
[Recomendação específica baseada na análise]
```

---

## 🔗 Arquivos de Referência

### **Checklists Principais:**
- `docs/CHECKLISTS_SUMMARY.md` - Resumo executivo
- `docs/priority-list.md` - Lista de prioridades
- `docs/backend-checklist.md` - Checklist backend
- `docs/frontend-checklist.md` - Checklist frontend
- `docs/checklist.md` - Checklist geral

### **Scripts de Verificação:**
- `scripts/checklist-progress.js` - Verificador de progresso
- `scripts/check-dependencies.js` - Verificador de dependências
- `scripts/dashboard-monitor.js` - Dashboard de monitoramento

### **Configurações:**
- `package.json` - Scripts e dependências
- `backend/package.json` - Dependências backend
- `tsconfig.json` - Configuração TypeScript

---

## ⚠️ Observações Importantes

1. **Sempre verificar o progresso atual antes de sugerir ações**
2. **Priorizar problemas críticos sobre melhorias**
3. **Manter consistência entre checklists**
4. **Atualizar progresso após cada ação concluída**
5. **Documentar mudanças significativas**

---

*Este guia permite que qualquer IA execute verificações consistentes e determine as próximas ações prioritárias de forma autônoma.*

**Última atualização:** 22/06/2025 