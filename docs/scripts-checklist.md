# Checklist Scripts & Ferramentas - VocalCoach AI

## 📋 Status Geral: 70% Concluído

> **Como usar:**
> - **Crítica:** Scripts essenciais para build, backup, restore, monitoramento e deploy.
> - **Alta:** Scripts de automação, integração e testes.
> - **Média:** Scripts de análise, auditoria e relatórios.
> - **Baixa/Opcional:** Scripts utilitários, experimentais ou de integração extra.

---

## 🔥 Scripts Críticos
- [x] backup-mongodb.js (backup automático)
- [x] test-restore.js (teste de restauração)
- [x] verify-backup.js (verificação de backup)
- [x] dashboard-monitor.js (dashboard de monitoramento)
- [x] monitor-health.js (health check)
- [x] setup-beta.js (setup ambiente beta)
- [x] setup-staging.js (setup ambiente staging)

---

## 🚀 Scripts de Prioridade Alta
- [x] check-dependencies.js (verificação de dependências)
- [x] checklist-progress.js (progresso dos checklists)
- [x] send-beta-invites.js (envio de convites beta)
- [x] generate-beta-report.js (relatórios beta)
- [x] schedule-beta-reports.js (agendamento de relatórios)
- [x] discord-alerts.js (alertas Discord)
- [x] setup-discord-webhooks.js (webhooks Discord)
- [x] validate-email.js (validação de email)
- [x] setup-gmail.js (configuração Gmail)

---

## ⚡ Scripts de Prioridade Média
- [x] analyze-bundle.js (análise de bundle)
- [x] performance-audit.js (auditoria de performance)
- [x] accessibility-audit.js (auditoria de acessibilidade)
- [x] load-test.js (teste de carga)
- [x] monitor-dns.js (monitoramento DNS)

---

## 🟢 Scripts Baixa/Opcionais
- [ ] test-webhooks-simple.js (teste simples de webhooks)
- [ ] test-discord.js (teste Discord)
- [ ] install-mongodb-tools.ps1 (instalação MongoDB tools)
- [ ] setup-dns-provider.js (setup DNS provider)
- [ ] setup-email-dns.js (setup email DNS)

---

## 📋 Scripts e Comandos Úteis

```bash
# Backup e restauração
npm run beta:backup
npm run beta:test-restore
npm run beta:backup:verify

# Monitoramento
npm run beta:dashboard
npm run beta:monitor

# Relatórios
npm run beta:report
npm run beta:schedule-reports

# Dependências
npm run deps:check
npm run beta:checklist
```

---

*Última atualização: 21/06/2025* 