# Guia de Contribuição - VocalCoach AI

## Índice
1. [Introdução](#introdução)
2. [Processo de Desenvolvimento](#processo-de-desenvolvimento)
3. [Padrões de Código](#padrões-de-código)
4. [Segurança](#segurança)
5. [Testes](#testes)
6. [Commits e Pull Requests](#commits-e-pull-requests)
7. [CI/CD](#cicd)

## Introdução

Bem-vindo ao guia de contribuição do VocalCoach AI! Este documento fornece as diretrizes necessárias para contribuir com o projeto de forma efetiva e segura.

## Processo de Desenvolvimento

1. **Branches**
   - `main`: Produção
   - `develop`: Desenvolvimento
   - `feature/*`: Novas funcionalidades
   - `bugfix/*`: Correções de bugs
   - `security/*`: Melhorias de segurança

2. **Fluxo de Trabalho**
   - Fork do repositório
   - Clone local
   - Criar branch feature/bugfix
   - Desenvolver e testar
   - Submeter PR

3. **Processo de Checklist e Commits**
   - Antes de iniciar uma implementação:
     1. Atualizar o checklist com as etapas planejadas
     2. Adicionar ideias de melhorias futuras
     3. Criar milestone no GitHub se necessário
   
   - Durante o desenvolvimento:
     1. Marcar etapas concluídas no checklist
     2. Documentar decisões técnicas importantes
     3. Registrar aprendizados e desafios
   
   - Ao finalizar uma implementação:
     1. Atualizar o checklist (`docs/checklist.md`)
     2. Fazer commit das alterações incluindo:
        - Código implementado
        - Checklist atualizado
        - Documentação relacionada
     3. Usar mensagem de commit descritiva:
        ```
        tipo(escopo): descrição curta

        - Atualiza checklist com etapas concluídas
        - Lista melhorias implementadas
        - Documenta decisões técnicas
        - Adiciona ideias para futuras iterações
        ```
     4. Push para o GitHub
     5. Atualizar issues/milestones relacionados

   - Formato do Checklist:
     ```markdown
     ### Nome da Feature ⬜️/✅
     - [ ] Etapa Planejada
       - [ ] Sub-etapa 1
       - [ ] Sub-etapa 2
     - [x] Etapa Concluída
       - [x] Sub-etapa A
       - [x] Sub-etapa B
     
     #### Melhorias Futuras
     - Ideia 1: Descrição e benefícios
     - Ideia 2: Descrição e benefícios
     ```

## Padrões de Código

1. **Estilo**
   - Seguir ESLint e Prettier configurados
   - Usar TypeScript para todo código novo
   - Documentar funções e componentes

2. **Nomenclatura**
   - Componentes: PascalCase
   - Funções: camelCase
   - Constantes: UPPER_SNAKE_CASE
   - Arquivos de teste: `.test.ts` ou `.spec.ts`

## Segurança

1. **Verificações Obrigatórias**
   - Análise estática (ESLint security rules)
   - Scan de dependências (Snyk)
   - SAST (SonarCloud)
   - DAST (OWASP ZAP)
   - Verificação de secrets (GitGuardian)

2. **Práticas de Segurança**
   - Nunca commitar secrets ou credenciais
   - Usar variáveis de ambiente para configs sensíveis
   - Validar todas as entradas de usuário
   - Implementar rate limiting em APIs
   - Seguir princípio do menor privilégio

3. **Proteções Implementadas**
   - XSS Protection via Helmet
   - CSRF Protection com tokens
   - Parameter Pollution Protection
   - File Upload Protection
   - Audit Logging
   - Detecção de Anomalias
   - Proteção contra Bots

## Testes

1. **Tipos de Testes**
   - Unitários (Jest)
   - Integração (Supertest)
   - E2E (Cypress)
   - Segurança (OWASP ZAP)
   - Performance (k6)

2. **Cobertura**
   - Mínimo 80% de cobertura para novo código
   - 100% para código de segurança crítico
   - Testes de regressão obrigatórios

## Commits e Pull Requests

1. **Commits**
   - Usar commits semânticos
   - Formato: `tipo(escopo): mensagem`
   - Tipos: feat, fix, docs, style, refactor, test, chore

2. **Pull Requests**
   - Título descritivo
   - Descrição detalhada
   - Referência a issues
   - Checklist de revisão
   - Screenshots (se UI)

## CI/CD

1. **Pipeline de Segurança**
   ```yaml
   - Lint e análise estática
   - Testes unitários e integração
   - Scan de segurança
   - Build e deploy
   - Testes E2E
   - Monitoramento
   ```

2. **Gates de Qualidade**
   - Todos os testes passando
   - Cobertura mínima atingida
   - Sem vulnerabilidades críticas
   - Code review aprovado
   - Checks de segurança OK

## Checklist de PR

- [ ] Código segue padrões do projeto
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada
- [ ] Sem vulnerabilidades de segurança
- [ ] Revisado por pelo menos 2 devs
- [ ] Testado em ambiente de staging
- [ ] Checklist atualizado com implementações
- [ ] Melhorias futuras documentadas

## Contato

- Time de Segurança: security@vocalcoach.ai
- Time de Dev: dev@vocalcoach.ai
- Suporte: support@vocalcoach.ai

## Links Úteis

- [Documentação](./docs)
- [Roadmap](./docs/roadmap.md)
- [Política de Segurança](./SECURITY.md)
- [Código de Conduta](./CODE_OF_CONDUCT.md) 