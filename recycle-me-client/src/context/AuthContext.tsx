import { createContext, useState, useContext, ReactNode } from 'react';

// Chaves para o LocalStorage
const TOKEN_KEY = 'recycleme_auth_token';
const USER_KEY = 'recycleme_user_data';

// --- TIPO DE DADOS DO USUÁRIO (CORRIGIDO) ---
// Agora o TypeScript sabe que 'points' e 'xp' existem!
export interface AuthUser {
  id: number;
  name: string;
  email?: string;
  type: 'user' | 'market'; 
  isVerified?: boolean;    
  points?: number; // <--- ADICIONADO: Saldo de EcoPoints
  xp?: number;     // <--- ADICIONADO: Experiência
}

// --- CONTRATO DO CONTEXTO ---
interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null; 
  login: (token: string, userData: AuthUser) => void; 
  logout: () => void;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {

  // 1. Estado do Token
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY);
  });

  // 2. Estado do Usuário
  const [user, setUser] = useState<AuthUser | null>(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const isAuthenticated = !!token && !!user;

  // --- FUNÇÃO DE LOGIN ---
  const login = (newToken: string, userData: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);
  };

  // --- FUNÇÃO DE LOGOUT TURBO ---
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    
    setToken(null);
    setUser(null);
    
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