# Documentação dos Componentes

## Componentes de Autenticação

### LoginModal
**Localização**: `src/components/Auth/LoginModal.tsx`

**Descrição**: Modal de login que permite aos usuários acessar suas contas.

**Props**:
- `isOpen: boolean` - Controla a visibilidade do modal
- `onClose: () => void` - Função chamada ao fechar o modal
- `onSuccess: (user: User) => void` - Callback chamado após login bem-sucedido

**Estado**:
- Gerencia estado do formulário
- Controla erros de validação
- Gerencia estado de loading durante autenticação

**Exemplo de Uso**:
```tsx
<LoginModal
  isOpen={showLogin}
  onClose={() => setShowLogin(false)}
  onSuccess={(user) => handleLoginSuccess(user)}
/>
```

### PrivateRoute
**Localização**: `src/components/Auth/PrivateRoute.tsx`

**Descrição**: Componente de rota que protege páginas que requerem autenticação.

**Props**:
- `children: React.ReactNode` - Componentes a serem renderizados se autenticado

**Exemplo de Uso**:
```tsx
<PrivateRoute>
  <Dashboard />
</PrivateRoute>
```

## Componentes de Layout

### Navbar
**Localização**: `src/components/Layout/Navbar.tsx`

**Descrição**: Barra de navegação principal do aplicativo.

**Features**:
- Navegação responsiva
- Suporte a temas claro/escuro
- Controles de acessibilidade
- Menu de usuário

**Props**:
- `user?: User` - Dados do usuário atual
- `onLogout: () => void` - Função de logout

**Exemplo de Uso**:
```tsx
<Navbar user={currentUser} onLogout={handleLogout} />
```

### Footer
**Localização**: `src/components/Layout/Footer.tsx`

**Descrição**: Rodapé do aplicativo com links e informações.

**Props**: Nenhuma

## Componentes de Análise de Voz

### VoiceCapture
**Localização**: `src/components/VoiceAnalysis/VoiceCapture.tsx`

**Descrição**: Componente para captura e análise de voz em tempo real.

**Features**:
- Captura de áudio do microfone
- Análise de frequência em tempo real
- Feedback visual de afinação
- Suporte a diferentes navegadores

**Props**:
- `onAnalysis: (data: VoiceAnalysisData) => void` - Callback com dados da análise
- `isRecording: boolean` - Controla estado de gravação
- `sensitivity: number` - Sensibilidade da análise (0-1)

**Exemplo de Uso**:
```tsx
<VoiceCapture
  onAnalysis={handleAnalysisData}
  isRecording={true}
  sensitivity={0.8}
/>
```

### TimbreVisualizer
**Localização**: `src/components/VoiceAnalysis/TimbreVisualizer.tsx`

**Descrição**: Visualização gráfica do timbre vocal.

**Props**:
- `data: TimbreData` - Dados do timbre para visualização
- `width: number` - Largura do componente
- `height: number` - Altura do componente

**Exemplo de Uso**:
```tsx
<TimbreVisualizer
  data={timbreData}
  width={600}
  height={400}
/>
```

## Componentes de Exercícios

### ExerciseAnimation
**Localização**: `src/components/VoiceExercise/ExerciseAnimation.tsx`

**Descrição**: Animações para guiar exercícios vocais.

**Props**:
- `exercise: VocalExercise` - Dados do exercício
- `progress: number` - Progresso atual (0-1)
- `isPlaying: boolean` - Estado de reprodução

**Exemplo de Uso**:
```tsx
<ExerciseAnimation
  exercise={currentExercise}
  progress={0.5}
  isPlaying={true}
/>
```

### ExerciseGuide
**Localização**: `src/components/VoiceExercise/ExerciseGuide.tsx`

**Descrição**: Guia passo a passo para exercícios vocais.

**Props**:
- `exercise: VocalExercise` - Dados do exercício
- `onComplete: () => void` - Callback ao completar exercício

## Componentes de Dashboard

### ProgressChart
**Localização**: `src/components/Dashboard/ProgressChart.tsx`

**Descrição**: Gráfico de progresso do usuário.

**Props**:
- `data: ProgressData[]` - Dados de progresso
- `period: 'day' | 'week' | 'month'` - Período de visualização

**Exemplo de Uso**:
```tsx
<ProgressChart
  data={userProgress}
  period="week"
/>
```

### StatCard
**Localização**: `src/components/Dashboard/StatCard.tsx`

**Descrição**: Card para exibição de estatísticas.

**Props**:
- `title: string` - Título da estatística
- `value: number | string` - Valor da estatística
- `icon?: React.ReactNode` - Ícone opcional
- `trend?: number` - Tendência de crescimento

**Exemplo de Uso**:
```tsx
<StatCard
  title="Exercícios Completados"
  value={42}
  icon={<ExerciseIcon />}
  trend={0.15}
/>
```

## Boas Práticas

1. **Acessibilidade**:
   - Todos os componentes seguem as diretrizes WCAG 2.1
   - Suporte a navegação por teclado
   - Labels e descrições para leitores de tela
   - Suporte a alto contraste

2. **Performance**:
   - Uso de React.memo para componentes puros
   - Lazy loading de componentes pesados
   - Otimização de re-renders
   - Debounce em operações custosas

3. **Testes**:
   - Testes unitários com Jest
   - Testes de integração
   - Testes E2E com Cypress
   - Testes de acessibilidade

4. **Estilização**:
   - Uso consistente do tema
   - Responsividade em todos os componentes
   - Suporte a modo escuro
   - Animações suaves

5. **Estado**:
   - Uso apropriado de hooks
   - Gerenciamento de efeitos colaterais
   - Memoização quando necessário
   - Separação clara de responsabilidades 