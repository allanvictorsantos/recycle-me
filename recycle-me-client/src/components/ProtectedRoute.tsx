// src/components/ProtectedRoute.tsx

// 1. Importamos o Outlet
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// 2. Não precisamos mais de 'children' como prop
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // 3. A lógica de verificação continua IDÊNTICA
  if (!isAuthenticated) {
    // O state={{ from: location }} está perfeito!
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 4. AQUI É A MUDANÇA:
  // Em vez de renderizar {children}, renderizamos <Outlet />.
  // O <Outlet /> é um "espaço reservado" que o React Router
  // vai preencher com a rota filha (MapaPage, DashboardPage, etc.)
  return <Outlet />;
}

// (O export default não é mais necessário se você usa 'export function')
// export default ProtectedRoute;