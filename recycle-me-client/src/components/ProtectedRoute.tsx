import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Este componente age como um "invólucro" ou "segurança"
// A propriedade 'children' será a página que queremos proteger (ex: <MapPage />)
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // 1. Verificamos o nosso "quadro de avisos" para saber se o usuário está logado
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // 2. A REGRA DE NEGÓCIO DO SEGURANÇA:
  // Se o usuário NÃO estiver autenticado...
  if (!isAuthenticated) {
    // ...nós o redirecionamos para a página de login.
    // O <Navigate> é um componente do react-router-dom que faz o redirecionamento.
    // A mágica está no 'state': estamos deixando um "post-it" dizendo de onde o usuário veio.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Se o usuário ESTIVER autenticado, nós simplesmente deixamos ele passar
  // e renderizamos a página que ele queria ver.
  return <>{children}</>;
}

export default ProtectedRoute;
