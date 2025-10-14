import { createContext, useState, useContext, ReactNode } from 'react';

// TypeScript: Definindo o "contrato" do nosso quadro de avisos
interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void; // A função login não precisa mais de um token
  logout: () => void;
}

// Criando o quadro de avisos (o Context)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// O componente "Fornecedor" que vai gerir o estado e disponibilizá-lo
export function AuthProvider({ children }: { children: ReactNode }) {
  // Voltamos a usar apenas o estado simples, sem localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Um "Hook" personalizado para facilitar o uso do nosso quadro de avisos
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

