# Design System - VocalCoach AI

## 🎨 Fundamentos Visuais

### Paleta de Cores

#### Cores Base
```css
--primary: #7C4DFF
--primary-light: #B388FF
--primary-dark: #651FFF
--secondary: #FF4D94
--secondary-light: #FF79B0
--secondary-dark: #FF1F71
--background: #1E1E2E
--surface: #2D2D44
```

#### Gradientes
```css
/* Gradientes Principais */
--gradient-primary: linear-gradient(135deg, #1E1E2E 0%, #2D2D44 100%)
--gradient-secondary: linear-gradient(135deg, #7C4DFF 0%, #651FFF 100%)
--gradient-text: linear-gradient(135deg, #B388FF 0%, #7C4DFF 100%)
--gradient-button: linear-gradient(135deg, #7C4DFF 0%, #651FFF 100%)
--gradient-button-hover: linear-gradient(135deg, #8C5FFF 0%, #7C4DFF 100%)

/* Gradientes de Feature */
--gradient-feature-1: linear-gradient(135deg, #FF4D94 0%, #FF1F71 100%)
--gradient-feature-2: linear-gradient(135deg, #4DB6FF 0%, #1F8FFF 100%)
--gradient-feature-3: linear-gradient(135deg, #4DFFA1 0%, #1FFF8F 100%)
--gradient-feature-4: linear-gradient(135deg, #FFB84D 0%, #FF8F1F 100%)
```

#### Efeitos de Vidro
```css
/* Glass Effects */
--glass-light: rgba(255, 255, 255, 0.1)
--glass-dark: rgba(0, 0, 0, 0.2)
--glass-border: rgba(255, 255, 255, 0.1)
--glass-blur: blur(10px)
```

### Tipografia

#### Família de Fontes
```css
--font-family: "Inter", "Roboto", "Helvetica", "Arial", sans-serif
```

#### Hierarquia
```css
/* Headings */
h1 {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 700;
  letter-spacing: -0.02em;
}

h2 {
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  font-weight: 600;
  letter-spacing: -0.01em;
}

h3 {
  font-size: clamp(1.125rem, 2.5vw, 1.25rem);
  font-weight: 600;
  letter-spacing: -0.01em;
}

/* Body */
body {
  font-size: 1rem;
  line-height: 1.7;
  letter-spacing: 0.01em;
}

small {
  font-size: 0.875rem;
  line-height: 1.5;
}
```

## 💫 Animações e Transições

### Transições Base
```css
--transition-base: all 0.3s ease
--transition-smooth: all 0.5s cubic-bezier(0.4, 0, 0.2, 1)
--transition-bounce: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

### Animações de Componentes

#### Hover States
```css
/* Botões */
transform: translateY(-2px)
scale: 1.02

/* Cards */
transform: translateY(-5px)
scale: 1.02

/* Ícones */
transform: scale(1.1)
rotate: 5deg
```

#### Loading States
```css
@keyframes pulse {
  0% { opacity: 1 }
  50% { opacity: 0.5 }
  100% { opacity: 1 }
}

@keyframes shimmer {
  0% { background-position: 100% 100% }
  100% { background-position: -100% -100% }
}
```

## 🧱 Componentes

### Botões

#### Variantes
```css
/* Primário */
.button-primary {
  background: var(--gradient-button);
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  transition: var(--transition-base);
}

/* Secundário */
.button-outlined {
  border: 2px solid rgba(255, 255, 255, 0.5);
  background: transparent;
  backdrop-filter: var(--glass-blur);
}

/* Ícone */
.button-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--glass-light);
}
```

### Cards

#### Glass Card
```css
.card-glass {
  background: var(--glass-light);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  padding: 24px;
  transition: var(--transition-base);
}
```

#### Feature Card
```css
.card-feature {
  position: relative;
  overflow: hidden;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--gradient-secondary);
    opacity: 0;
    transition: var(--transition-base);
  }
  
  &:hover::before {
    opacity: 1;
  }
}
```

### Gráficos

#### Chart Styles
```css
.chart {
  --chart-grid-color: rgba(255, 255, 255, 0.1);
  --chart-text-color: rgba(255, 255, 255, 0.7);
  --chart-font-size: 11px;
  --chart-line-width: 2px;
  --chart-point-radius: 4px;
  --chart-point-hover-radius: 6px;
}
```

## 📱 Responsividade

### Breakpoints
```css
--breakpoint-sm: 600px
--breakpoint-md: 960px
--breakpoint-lg: 1280px
--breakpoint-xl: 1920px
```

### Grid System
```css
.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
}

@media (max-width: 960px) {
  .grid {
    grid-template-columns: repeat(8, 1fr);
    gap: 16px;
  }
}

@media (max-width: 600px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }
}
```

## 🌓 Temas

### Dark Theme (Padrão)
```css
.theme-dark {
  --text-primary: #FFFFFF;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --surface-primary: #1E1E2E;
  --surface-secondary: #2D2D44;
}
```

### Acessibilidade

#### Contraste
- Texto normal: Mínimo 4.5:1
- Texto grande: Mínimo 3:1
- Elementos interativos: Mínimo 3:1

#### Focus States
```css
:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

## 🎯 Boas Práticas

### Nomenclatura
- Use BEM (Block Element Modifier)
- Prefixe classes utilitárias com `u-`
- Prefixe classes de layout com `l-`
- Use nomes descritivos e significativos

### Performance
- Minimize o uso de sombras complexas
- Use `will-change` com moderação
- Prefira `transform` e `opacity` para animações
- Utilize `contain` para otimização de renderização

### Acessibilidade
- Mantenha hierarquia semântica de headings
- Use ARIA labels quando necessário
- Garanta navegação por teclado
- Forneça feedback visual e auditivo para interações

---

Este documento é vivo e será atualizado conforme o design system evolui. Para sugestões ou dúvidas, entre em contato com a equipe de design. 