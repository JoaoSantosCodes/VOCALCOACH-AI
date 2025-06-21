# Checklist Testes - VocalCoach AI

## 📋 Status Geral: 40% Concluído

> **Como usar:**
> - **Crítica:** Testes que garantem funcionamento do core, segurança e integridade de dados.
> - **Alta:** Testes de APIs principais, autenticação, integração frontend-backend.
> - **Média:** Testes de componentes, performance, acessibilidade.
> - **Baixa/Opcional:** Testes exploratórios, mocks, cenários alternativos.

---

## 🔥 Testes Críticos
- [x] Testes de backup e restauração
- [x] Testes de integridade de dados
- [x] Testes de autenticação backend
- [ ] Testes de autorização (roles/permissões)
- [ ] Testes de endpoints críticos (login, registro, análise de voz)

---

## 🚀 Testes de Prioridade Alta
- [ ] Testes de APIs RESTful (CRUD usuários, exercícios, progresso)
- [ ] Testes de integração frontend-backend
- [ ] Testes de fluxo de usuário (login, dashboard, exercícios)
- [ ] Testes de webhooks Discord
- [ ] Testes de email (envio, recebimento, falha)

---

## ⚡ Testes de Prioridade Média
- [ ] Testes de componentes React
- [ ] Testes de hooks customizados
- [ ] Testes de performance frontend
- [ ] Testes de acessibilidade (axe, lighthouse)
- [ ] Testes de responsividade

---

## 🟢 Testes Baixa/Opcionais
- [ ] Testes exploratórios
- [ ] Testes de mocks e stubs
- [ ] Testes de cenários alternativos
- [ ] Testes de integração com ferramentas externas

---

## 📋 Scripts e Comandos Úteis

```bash
npm run test
npm run test:e2e
npm run audit
npm run audit:accessibility
npm run test:load
```

---

*Última atualização: 21/06/2025* 