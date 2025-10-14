import { useNavigate, useLocation } from 'react-router-dom';

type HashLinkProps = {
  to: string;
  children: React.ReactNode;
  className?: string;
};

function HashLink({ to, children, className }: HashLinkProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Se estamos em outra página (não na inicial)
    if (location.pathname !== '/') {
      e.preventDefault();
      // Navega para a página inicial e passa o 'recado' via estado de navegação
      navigate('/', { state: { scrollToId: to } });
    }
  };

  // Usamos a tag <a> para que, quando já estivermos na HomePage,
  // o comportamento padrão de rolagem de âncora do navegador funcione.
  return (
    <a href={`#${to}`} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}

export default HashLink;

