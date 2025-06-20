# 🔧 Correções Técnicas - VocalCoach AI

## 📦 Dependências

### React Router DOM ⚠️
- **Status**: Crítico
- **Erro**: Exportações não encontradas (Navigate, useLocation, useNavigate)
- **Solução Proposta**:
  ```bash
  npm uninstall react-router-dom
  npm install react-router@6.22.3 react-router-dom@6.22.3 --save --legacy-peer-deps
  ```
- **Arquivos Afetados**:
  - src/App.tsx
  - src/components/Auth/PrivateRoute.tsx
  - src/components/Layout/Navbar.tsx
  - src/pages/Home.tsx

### Material-UI Icons ⚠️
- **Status**: Crítico
- **Erro**: `Cannot find module '@mui/icons-material'`
- **Solução Proposta**:
  ```bash
  npm install @mui/material @mui/icons-material @emotion/react @emotion/styled --save --legacy-peer-deps
  ```
- **Arquivos Afetados**:
  - src/components/Auth/LoginModal.tsx
  - src/components/Layout/Footer.tsx
  - src/components/Layout/Logo.tsx
  - src/components/Layout/Navbar.tsx
  - src/pages/Dashboard.tsx
  - src/pages/Home.tsx
  - src/pages/Karaoke.tsx
  - src/pages/Practice.tsx

## 🎨 Theme System

### Gradients ⚠️
- **Status**: Erro
- **Problema**: Property 'gradients' does not exist on type 'Theme'
- **Solução Proposta**:
  ```typescript
  declare module '@mui/material/styles' {
    interface Theme {
      gradients: {
        primary: string;
        secondary: string;
        text: string;
        button: string;
        buttonHover: string;
        glass: string;
      }
    }
  }
  ```

### Sistema de Sombras ⚠️
- **Status**: Erro
- **Problema**: Tipo incorreto no array de sombras
- **Solução Proposta**:
  ```typescript
  const shadowScale = [
    'none',
    shadows.card,
    // ... (25 elementos)
  ] as const;
  ```

## 🔄 API e TypeScript

### Axios Types ⚠️
- **Status**: Erro
- **Problema**: Tipo InternalAxiosRequestConfig não encontrado
- **Solução Proposta**:
  ```typescript
  import type { AxiosRequestConfig } from 'axios';
  // Usar AxiosRequestConfig em vez de InternalAxiosRequestConfig
  ```

## 🧹 Limpeza de Código

### ESLint Warnings
- **Status**: Pendente
- **Problemas**:
  - Variáveis não utilizadas em Home.tsx
  - Dependências faltantes em useEffect
  - Variáveis não utilizadas em theme.ts
- **Solução**: Remover ou utilizar variáveis não usadas

## 📅 Timeline de Correções
1. Resolver problemas de dependências (React Router, Material-UI)
2. Corrigir sistema de tipos (Theme, Axios)
3. Limpar warnings do ESLint
4. Testar todas as rotas e componentes 