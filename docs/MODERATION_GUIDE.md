# 👮 Guia de Moderação - VocalCoach AI

## 📋 Sumário
1. [Responsabilidades](#responsabilidades)
2. [Regras Gerais](#regras-gerais)
3. [Ações de Moderação](#ações-de-moderação)
4. [Ferramentas](#ferramentas)
5. [Procedimentos](#procedimentos)

## 🎯 Responsabilidades

### Principais Funções
1. **Manutenção da Ordem**
   - Garantir cumprimento das regras
   - Manter ambiente amigável
   - Prevenir conflitos
   - Mediar discussões

2. **Suporte à Comunidade**
   - Auxiliar novos membros
   - Responder dúvidas básicas
   - Direcionar para canais adequados
   - Promover engajamento

3. **Monitoramento**
   - Verificar conteúdo das mensagens
   - Identificar comportamentos inadequados
   - Monitorar spam e flood
   - Acompanhar discussões

## 📜 Regras Gerais

### Comportamento
1. **Respeito Mútuo**
   - Linguagem apropriada
   - Sem discriminação
   - Sem assédio
   - Sem provocações

2. **Conteúdo**
   - Relevante ao canal
   - Sem spam
   - Sem propaganda
   - Sem conteúdo adulto

3. **Comunicação**
   - Clara e objetiva
   - Sem flood
   - Sem caps lock excessivo
   - Sem mensagens repetitivas

## 🛠️ Ações de Moderação

### Advertências
1. **Primeiro Aviso**
   - Mensagem privada
   - Explicação da regra violada
   - Orientação sobre conduta
   - Registro no sistema

2. **Segundo Aviso**
   - Mensagem pública
   - Timeout de 10 minutos
   - Notificação à equipe
   - Registro detalhado

3. **Terceiro Aviso**
   - Ban temporário (24h)
   - Revisão do caso
   - Notificação aos admins
   - Documentação completa

### Punições
1. **Timeout**
   - 10 minutos: spam leve
   - 1 hora: flood
   - 24 horas: comportamento tóxico
   - 1 semana: violações graves

2. **Ban**
   - Temporário: 1-7 dias
   - Permanente: casos extremos
   - IP Ban: evasão de ban
   - Hardware Ban: reincidência

## 🔧 Ferramentas

### Bots de Moderação
1. **MEE6**
   ```javascript
   // Configuração de Auto-Mod
   !setup automod
   !automod spam on
   !automod links off
   !automod flood on
   ```

2. **Dyno**
   ```javascript
   // Comandos de Moderação
   ?warn @user [razão]
   ?mute @user [duração]
   ?ban @user [razão]
   ```

3. **Carl-bot**
   ```javascript
   // Logs e Relatórios
   !logs @user
   !case 123
   !reason 123 [nova razão]
   ```

### Comandos Essenciais
1. **Gerais**
   ```
   /mod warn @user
   /mod mute @user
   /mod ban @user
   /mod kick @user
   ```

2. **Configuração**
   ```
   /settings automod
   /settings logs
   /settings roles
   /settings channels
   ```

## 📝 Procedimentos

### Spam e Flood
1. **Identificação**
   - Mensagens repetitivas
   - Links suspeitos
   - Menções em massa
   - Flood de emojis

2. **Ação**
   - Deletar mensagens
   - Timeout imediato
   - Aviso ao usuário
   - Registro do incidente

### Conflitos
1. **Mediação**
   - Intervir rapidamente
   - Mover para DM se necessário
   - Esclarecer mal-entendidos
   - Aplicar timeout se preciso

2. **Resolução**
   - Ouvir ambos os lados
   - Buscar acordo
   - Documentar ocorrência
   - Monitorar situação

## 📊 Monitoramento

### Métricas
1. **Atividade**
   - Mensagens por hora
   - Usuários ativos
   - Picos de tráfego
   - Horários críticos

2. **Moderação**
   - Advertências dadas
   - Timeouts aplicados
   - Bans efetuados
   - Casos resolvidos

### Relatórios
1. **Diários**
   - Incidentes
   - Ações tomadas
   - Usuários problemáticos
   - Tendências

2. **Semanais**
   - Análise de padrões
   - Efetividade das ações
   - Sugestões de melhoria
   - Feedback da comunidade

## 🔄 Melhoria Contínua

### Feedback
1. **Coleta**
   - Sugestões dos usuários
   - Feedback da equipe
   - Análise de incidentes
   - Métricas de efetividade

2. **Implementação**
   - Ajuste de regras
   - Atualização de procedimentos
   - Treinamento da equipe
   - Otimização de ferramentas

### Treinamento
1. **Inicial**
   - Regras e políticas
   - Ferramentas
   - Procedimentos
   - Simulações

2. **Contínuo**
   - Atualizações mensais
   - Workshops
   - Estudos de caso
   - Mentoria 