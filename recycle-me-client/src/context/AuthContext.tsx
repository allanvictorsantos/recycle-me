// src/context/AuthContext.tsx

import { createContext, useState, useContext, ReactNode, } from 'react';

// O "NOME DA CHAVE" que usaremos para guardar o token no armário (localStorage)
const TOKEN_KEY = 'recycleme_auth_token';

// --- PASSO 1: Atualizar o "Contrato" ---
// A função login agora precisa receber o crachá (token) para guardar.
// Também vamos adicionar uma função para pegar o crachá guardado.
interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void; 
  logout: () => void;
  getToken: () => string | null; 
}

// O resto é igual...
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {

  // --- PASSO 2: Inicializar o Estado Lendo do Armário ---
  // Usamos uma função no useState para que ele rode SÓ UMA VEZ na inicialização.
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    return !!token; // Se token existir (não for null/undefined), retorna true.
  });

  // --- PASSO 3: Atualizar a Função de Login ---
  // Ela agora recebe o token que o backend enviou e guarda no armário.
  const login = (token: string) => {
    localStorage.setItem(TOKEN_KEY, token); // 1. Guarda no armário
    setIsAuthenticated(true);             // 2. Coloca o crachá temporário
  };

  // --- PASSO 4: Atualizar a Função de Logout ---
  // Ela agora limpa o armário.
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY); // 1. Tira do armário
    setIsAuthenticated(false);         // 2. Tira o crachá temporário
  };

  // --- PASSO 5: Criar a Função para Pegar o Crachá ---
  // Isso será usado para *enviar* o crachá para o backend em rotas protegidas.
  const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

// Seu Hook personalizado continua perfeito
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}