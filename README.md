# VocalCoach AI

Uma aplicação web moderna para treinamento vocal com feedback em tempo real e exercícios guiados.

## Funcionalidades

### Análise de Voz
- Captura de áudio em tempo real
- Análise de pitch e afinação
- Visualização de timbre
- Feedback instantâneo de performance

### Exercícios Guiados
- Exercícios de aquecimento vocal
- Treinos de respiração
- Controle de afinação
- Animações visuais para guiar os exercícios
- Timer e progresso
- Dicas e benefícios para cada exercício

### Interface
- Design moderno e responsivo
- Animações suaves
- Feedback visual em tempo real
- Modo escuro/claro
- Layout adaptativo para diferentes dispositivos

## Tecnologias

- React 18
- TypeScript
- Material-UI
- Framer Motion para animações
- Web Audio API
- FFT para análise de áudio
- Pitch detection

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/vocalcoach-ai.git
```

2. Instale as dependências:
```bash
cd vocalcoach-ai
npm install --legacy-peer-deps
```

3. Inicie o servidor de desenvolvimento:
```bash
npm start
```

4. Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## Estrutura do Projeto

```
src/
  ├── components/
  │   ├── Auth/              # Componentes de autenticação
  │   ├── Dashboard/         # Componentes do painel
  │   ├── Layout/           # Componentes de layout
  │   ├── VoiceAnalysis/    # Componentes de análise de voz
  │   └── VoiceExercise/    # Componentes de exercícios
  ├── data/
  │   └── vocalExercises.ts # Dados dos exercícios
  ├── pages/                # Páginas da aplicação
  ├── services/             # Serviços e APIs
  ├── utils/                # Utilitários
  └── workers/              # Web Workers para processamento
```

## Exercícios Disponíveis

1. **Aquecimento Básico**
   - Exercícios de respiração
   - Duração: 5 minutos
   - Nível: Iniciante

2. **Controle de Afinação**
   - Exercícios de pitch
   - Duração: 7 minutos
   - Nível: Intermediário

3. **Respiração Diafragmática**
   - Técnicas de respiração
   - Duração: 6 minutos
   - Nível: Iniciante

## Desenvolvimento

### Scripts Disponíveis

- `npm start`: Inicia o servidor de desenvolvimento
- `npm test`: Executa os testes
- `npm run build`: Cria a versão de produção
- `npm run eject`: Ejeta as configurações do Create React App

### Testes

O projeto utiliza Jest e Testing Library para testes. Execute os testes com:

```bash
npm test
```

## Próximos Passos

- [ ] Sistema de gamificação
- [ ] Mais exercícios vocais
- [ ] Feedback de áudio
- [ ] Perfil do usuário
- [ ] Progresso e estatísticas
- [ ] Exercícios personalizados
- [ ] Modo offline
- [ ] Integração com dispositivos MIDI

## Contribuindo

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE.md](LICENSE.md) para detalhes.

## Contato

Seu Nome - [@seutwitter](https://twitter.com/seutwitter)

Link do Projeto: [https://github.com/seu-usuario/vocalcoach-ai](https://github.com/seu-usuario/vocalcoach-ai) 