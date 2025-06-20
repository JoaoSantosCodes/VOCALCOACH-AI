# VocalCoach AI 🎵

Uma aplicação moderna para treinamento vocal com feedback em tempo real usando inteligência artificial.

## 🌟 Funcionalidades

- **Análise Vocal em Tempo Real**: Feedback instantâneo sobre afinação e técnica vocal
- **Interface Moderna e Responsiva**: Design fluido com animações e transições suaves
- **Dashboard Interativo**: Acompanhe seu progresso com visualizações dinâmicas
- **Modo Karaokê**: Pratique com suas músicas favoritas
- **Sistema de Conquistas**: Ganhe recompensas conforme evolui
- **Exercícios Personalizados**: Treinos adaptados ao seu nível

## 🎨 Design System

### Cores e Gradientes
```css
/* Gradientes Principais */
primary: 'linear-gradient(135deg, #1E1E2E 0%, #2D2D44 100%)'
secondary: 'linear-gradient(135deg, #7C4DFF 0%, #651FFF 100%)'
text: 'linear-gradient(135deg, #B388FF 0%, #7C4DFF 100%)'

/* Efeitos de Vidro */
glass: 'rgba(255, 255, 255, 0.1)'
darkGlass: 'rgba(0, 0, 0, 0.2)'
blur: 'blur(10px)'
```

### Tipografia
- **Principal**: Inter, Roboto, Helvetica, Arial, sans-serif
- **Hierarquia**:
  - H1: 4rem (Desktop) / 2.5rem (Mobile)
  - H2: 1.5rem
  - Body: 1rem
  - Small: 0.875rem

### Animações
- Transições suaves: 0.3s ease
- Hover effects: scale(1.02-1.05)
- Page transitions: fade + slide
- Loading states: pulse animation

### Componentes
- **Cards**: Efeito de vidro com bordas suaves
- **Botões**: Gradientes animados com hover effect
- **Gráficos**: Gradientes semi-transparentes
- **Ícones**: Animações de hover e click

## 🚀 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/vocalcoach-ai.git
cd vocalcoach-ai
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```
Edite o arquivo `.env` com suas configurações

4. Inicie o servidor de desenvolvimento:
```bash
npm start
```

## 🛠️ Tecnologias

- **Frontend**:
  - React 18
  - TypeScript
  - Material-UI v5
  - Framer Motion
  - Chart.js
  - Axios

- **Backend**:
  - Node.js
  - Express
  - MongoDB
  - WebSocket
  - TensorFlow.js

## 📱 Compatibilidade

- **Desktop**: Chrome 90+, Firefox 88+, Safari 14+
- **Mobile**: iOS 14+, Android 8+
- **Tablets**: iPad OS 14+, Android 8+

## 🔧 Configuração do Ambiente de Desenvolvimento

### Requisitos
- Node.js 16+
- npm 7+ ou yarn 1.22+
- MongoDB 4.4+

### VSCode Extensions Recomendadas
- ESLint
- Prettier
- Material Icon Theme
- Auto Import
- GitLens

### Scripts Disponíveis
```bash
npm start        # Inicia o servidor de desenvolvimento
npm test        # Executa os testes
npm run build   # Cria a build de produção
npm run lint    # Executa o linter
npm run format  # Formata o código
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Código
- Utilize TypeScript
- Siga o ESLint config
- Mantenha 100% de cobertura de testes
- Documente novas funcionalidades
- Siga o padrão de commits convencional

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

- Email: support@vocalcoach-ai.com
- Discord: [VocalCoach AI Community](https://discord.gg/vocalcoach-ai)
- Twitter: [@VocalCoachAI](https://twitter.com/vocalcoach-ai)

---

Desenvolvido com ❤️ pela equipe VocalCoach AI 