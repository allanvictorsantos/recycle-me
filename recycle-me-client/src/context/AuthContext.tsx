import { createContext, useState, useContext, ReactNode } from 'react';

// Chaves para o LocalStorage
const TOKEN_KEY = 'recycleme_auth_token';
const USER_KEY = 'recycleme_user_data';

// --- TIPO DE DADOS DO USUÁRIO ---
// Define o que sabemos sobre quem logou
export interface AuthUser {
  id: number;
  name: string;
  email?: string;
  type: 'user' | 'market'; // O pulo do gato: aqui diferenciamos
  isVerified?: boolean;    // Importante para empresas
}

// --- CONTRATO DO CONTEXTO ---
interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null; // Agora temos os dados do usuário acessíveis em todo o app
  login: (token: string, userData: AuthUser) => void; // Login exige Token + Dados
  logout: () => void;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {

  // 1. Estado do Token
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY);
  });

  // 2. Estado do Usuário (Lê do localStorage se existir)
  const [user, setUser] = useState<AuthUser | null>(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // A autenticação é verdadeira se tivermos token E usuário
  const isAuthenticated = !!token && !!user;

  // --- FUNÇÃO DE LOGIN INTELIGENTE ---
  const login = (newToken: string, userData: AuthUser) => {
    // 1. Salva na memória do navegador (persistência)
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));

    // 2. Atualiza o estado da aplicação (reatividade)
    setToken(newToken);
    setUser(userData);
  };

// --- FUNÇÃO DE LOGOUT TURBO ---
  const logout = () => {
    // 1. Limpa o armário
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    
    // 2. Limpa o estado do React
    setToken(null);
    setUser(null);
    
    // 3. O Pulo do Gato: Força um recarregamento da página
    // Isso garante que o menu seja redesenhado do zero
    window.location.href = '/login'; 
  };
  const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}