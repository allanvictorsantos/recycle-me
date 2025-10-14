import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  // 1. "Contratamos" o espião que nos diz a URL atual.
  //    Nós só precisamos do `pathname` (o caminho, ex: "/login").
  const { pathname } = useLocation();

  // 2. Criamos o nosso "Gerente de Pós-Produção".
  useEffect(() => {
    // 3. Esta é a instrução: "Role a janela para o topo (posição 0, 0)".
    window.scrollTo(0, 0);
  }, [pathname]); // 4. O GATILHO: Execute esta instrução toda vez que o `pathname` mudar.

  // 5. Este componente não tem aparência, ele só executa uma ação.
  //    Por isso, ele não retorna nada visível (null).
  return null;
}

export default ScrollToTop;
