import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'; // Adicionado useLocation
import HashLink from './components/HashLink.tsx';
import ScrollToTop from './components/ScrollToTop.tsx';
import './App.css';

import { useAuth } from './context/AuthContext';
import React from 'react'; 

function App() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Hook para saber a rota atual

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccessibilityPanelOpen, setAccessibilityPanelOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'auto');
  const [isReadingMode, setReadingMode] = useState(false);
  const [isBackToTopVisible, setBackToTopVisible] = useState(false);

  const accessibilityPanelRef = useRef<HTMLDivElement>(null);

  const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);
  const toggleAccessibilityPanel = () => setAccessibilityPanelOpen(prev => !prev);
  const toggleReadingMode = () => setReadingMode(prev => !prev);

  const changeTheme = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme);
    if (newTheme === 'auto') {
      localStorage.removeItem('theme');
    } else {
      localStorage.setItem('theme', newTheme);
    }
    const root = window.document.documentElement;
    const isDark = newTheme === 'dark' || (newTheme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.toggle('dark', isDark);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const root = window.document.documentElement;
    const checkTheme = () => {
        const storedTheme = localStorage.getItem('theme') || 'auto';
        const isDark = storedTheme === 'dark' || (storedTheme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        root.classList.toggle('dark', isDark);
    };
    checkTheme();
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkTheme);
    return () => mediaQuery.removeEventListener('change', checkTheme);
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => setBackToTopVisible(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (accessibilityPanelRef.current && !accessibilityPanelRef.current.contains(target)) {
        setAccessibilityPanelOpen(false);
      }
    }
    if (isAccessibilityPanelOpen) {
        document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAccessibilityPanelOpen]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  
  const handleMobileLogout = () => {
    logout();
    closeMobileMenu();
    navigate('/');
  };

  // Helper para verificar rota ativa
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <ScrollToTop />
      <div id="page-wrapper" className={`min-h-screen flex flex-col bg-brand-cream dark:bg-brand-dark text-brand-dark dark:text-gray-300 transition duration-300 ${isReadingMode ? 'reading-mode' : ''}`}>

        <header className="header-gradient dark:bg-gray-800 shadow-sm sticky top-0 z-50 dark:border-b dark:border-gray-700">
          <div className="container mx-auto flex justify-between items-center p-4">
            <Link to="/" className="text-xl font-extrabold tracking-tighter dark:text-white">♻️ RECYCLE_ME</Link>

            {/* --- NAVEGAÇÃO DESKTOP --- */}
            <nav id="main-nav" className="hidden md:flex items-center gap-6 lg:gap-8">
              
              <HashLink to="/#clube-recycleme" className="nav-link relative group text-sm font-bold uppercase pb-1 transition-colors hover:text-brand-text-green dark:hover:text-brand-green"><span>O Clube</span><span className="underline-span absolute bottom-0 left-0 w-0 h-0.5 bg-brand-text-green dark:bg-brand-green transition-all duration-300 group-hover:w-full"></span></HashLink>
              <HashLink to="/#como-funciona" className="nav-link relative group text-sm font-bold uppercase pb-1 transition-colors hover:text-brand-text-green dark:hover:text-brand-green"><span>Como Funciona</span><span className="underline-span absolute bottom-0 left-0 w-0 h-0.5 bg-brand-text-green dark:bg-brand-green transition-all duration-300 group-hover:w-full"></span></HashLink>
              
              {/* MENU INTELIGENTE: Painel ou Mapa */}
              
              {isAuthenticated && user?.type === 'market' ? (
                 // PAINEL DO PARCEIRO (Ativo se estiver na rota)
                 <Link 
                    to="/painel-fiscal" 
                    className={`nav-link relative group text-sm font-bold uppercase pb-1 transition-colors ${isActive('/painel-fiscal') ? 'text-brand-green' : 'text-brand-dark dark:text-gray-300 hover:text-brand-green'}`}
                 >
                    <span>Painel do Parceiro</span>
                    <span className={`underline-span absolute bottom-0 left-0 h-0.5 bg-brand-green transition-all duration-300 ${isActive('/painel-fiscal') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                 </Link>
              ) : (
                 // MAPA (Ativo se estiver na rota)
                 <Link 
                    to="/mapa" 
                    className={`nav-link relative group text-sm font-bold uppercase pb-1 transition-colors ${isActive('/mapa') ? 'text-brand-green' : 'text-brand-dark dark:text-gray-300 hover:text-brand-green'}`}
                 >
                    <span>Mapa</span>
                    <span className={`underline-span absolute bottom-0 left-0 h-0.5 bg-brand-green transition-all duration-300 ${isActive('/mapa') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                 </Link>
              )}

              {/* Botões de Auth */}
              {!isAuthenticated ? (
                <Link to="/login" className={`nav-link relative group text-sm font-bold uppercase pb-1 transition-colors ${isActive('/login') ? 'text-brand-green' : 'hover:text-brand-text-green dark:hover:text-brand-green'}`}>
                    <span>Login</span>
                    <span className={`underline-span absolute bottom-0 left-0 h-0.5 bg-brand-green transition-all duration-300 ${isActive('/login') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                </Link>
              ) : (
                 <button onClick={() => { logout(); navigate('/'); }} className="nav-link relative group text-sm font-bold uppercase pb-1 transition-colors hover:text-brand-text-green dark:hover:text-brand-green appearance-none bg-transparent border-none cursor-pointer p-0">
                    <span>Sair</span>
                    <span className="underline-span absolute bottom-0 left-0 w-0 h-0.5 bg-brand-text-green dark:bg-brand-green transition-all duration-300 group-hover:w-full"></span>
                 </button>
              )}
            </nav>

            {/* Ícones da Direita */}
            <div className="flex items-center gap-4">
              <Link 
                to={isAuthenticated && user?.type === 'market' ? "/painel-fiscal" : "/perfil"} 
                title="Minha Conta" 
                className={`text-2xl transition-colors ${isActive('/perfil') || isActive('/painel-fiscal') ? 'text-brand-green' : 'hover:text-brand-text-green dark:text-gray-300 dark:hover:text-brand-green'}`}
              >
                <i className={`fas ${user?.type === 'market' ? 'fa-store' : 'fa-user-circle'}`}></i>
              </Link>
              <button id="mobile-menu-button" onClick={toggleMobileMenu} className="md:hidden text-2xl dark:text-gray-300"><i className="fas fa-bars"></i></button>
            </div>
          </div>

          {/* --- NAVEGAÇÃO MOBILE --- */}
          <div id="mobile-menu" className={`md:hidden bg-brand-cream dark:bg-gray-800 pb-4 ${isMobileMenuOpen ? '' : 'hidden'}`}>
             <div onClick={closeMobileMenu}>
                <HashLink to="/#clube-recycleme" className="block text-center py-2 px-4 text-sm font-bold uppercase text-brand-dark dark:text-gray-200 hover:bg-brand-light-green dark:hover:bg-gray-700">O Clube</HashLink>
                <HashLink to="/#como-funciona" className="block text-center py-2 px-4 text-sm font-bold uppercase text-brand-dark dark:text-gray-200 hover:bg-brand-light-green dark:hover:bg-gray-700">Como Funciona</HashLink>
             </div>
             
             {isAuthenticated && user?.type === 'market' ? (
                <Link to="/painel-fiscal" className={`block text-center py-2 px-4 text-sm font-bold uppercase ${isActive('/painel-fiscal') ? 'text-brand-green bg-green-50 dark:bg-gray-700' : 'text-brand-dark dark:text-gray-200 hover:bg-brand-light-green'}`} onClick={closeMobileMenu}>Painel do Parceiro</Link>
             ) : (
                <Link to="/mapa" className={`block text-center py-2 px-4 text-sm font-bold uppercase ${isActive('/mapa') ? 'text-brand-green bg-green-50 dark:bg-gray-700' : 'text-brand-dark dark:text-gray-200 hover:bg-brand-light-green'}`} onClick={closeMobileMenu}>Mapa</Link>
             )}

             {!isAuthenticated ? (
               <Link to="/login" className="block text-center py-2 px-4 text-sm font-bold uppercase text-brand-dark dark:text-gray-200 hover:bg-brand-light-green dark:hover:bg-gray-700" onClick={closeMobileMenu}>Login</Link>
             ) : (
               <>
                 <Link to={user?.type === 'market' ? "/painel-fiscal" : "/perfil"} className="block text-center py-2 px-4 text-sm font-bold uppercase text-brand-dark dark:text-gray-200 hover:bg-brand-light-green dark:hover:bg-gray-700" onClick={closeMobileMenu}>
                    {user?.type === 'market' ? 'Minha Empresa' : 'Meu Perfil'}
                 </Link>
                 <button onClick={handleMobileLogout} className="w-full block text-center py-2 px-4 text-sm font-bold uppercase text-brand-dark dark:text-gray-200 hover:bg-brand-light-green dark:hover:bg-gray-700">Sair</button>
               </>
             )}
           </div>
        </header>

        <main className="flex-grow">
          <Outlet />
        </main>

        <footer className="bg-gray-900 text-white">
           <div className="container mx-auto px-6 py-12">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
               <div> <h3 className="text-lg font-bold mb-4">♻️ RECYCLE_ME</h3> <p className="text-gray-400 text-sm">Reciclando o presente, garantindo o futuro.</p> </div>
               <div> <h3 className="text-lg font-bold mb-4">Links Rápidos</h3>
                 <ul className="space-y-2 text-sm">
                   <li><HashLink  to="/#clube-recycleme" className="text-gray-400 hover:text-white transition-colors">O Clube</HashLink></li>
                   {user?.type !== 'market' && (
                       <li><Link to="/cadastro" className="text-gray-400 hover:text-white transition-colors">Seja um Parceiro</Link></li>
                   )}
                   <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contato</a></li>
                 </ul>
               </div>
               <div> <h3 className="text-lg font-bold mb-4">Siga-nos</h3> <div className="flex justify-center md:justify-start gap-4 text-2xl"> <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-white transition-colors"><i className="fab fa-instagram"></i></a> <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-white transition-colors"><i className="fab fa-facebook"></i></a> <a href="#" aria-label="LinkedIn" className="text-gray-400 hover:text-white transition-colors"><i className="fab fa-linkedin"></i></a> </div> </div>
             </div>
             <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-500"> <p>&copy; {new Date().getFullYear()} Recycle_me. Todos os direitos reservados. Projeto de TCC.</p> </div>
           </div>
        </footer>
      </div>
      
      <button id="back-to-top-button" onClick={scrollToTop} className={`fixed bottom-20 right-5 z-[60] w-12 h-12 md:w-14 md:h-14 bg-brand-dark/80 backdrop-blur-sm text-white rounded-full shadow-lg flex items-center justify-center text-xl hover:bg-gray-700 transition-all duration-300 ${isBackToTopVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}> <i className="fas fa-arrow-up"></i> </button>
      <button id="accessibility-button" onClick={toggleAccessibilityPanel} className="fixed bottom-5 right-5 z-[60] w-12 h-12 md:w-14 md:h-14 bg-brand-dark text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-gray-700 transition-colors"> <i className="fas fa-universal-access"></i> </button>
      
      <div ref={accessibilityPanelRef} className={`fixed bottom-20 md:bottom-24 right-5 z-[60] bg-white/90 backdrop-blur-md dark:bg-gray-800/90 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-64 overflow-hidden transition-all duration-300 ${isAccessibilityPanelOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
        <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-md text-brand-dark dark:text-white">Acessibilidade</h3>
          <button onClick={toggleAccessibilityPanel} className="text-gray-500 hover:text-brand-dark dark:hover:text-white"><i className="fas fa-times"></i></button>
        </div>
        <div className="p-4 space-y-4">
          <button onClick={toggleReadingMode} aria-pressed={isReadingMode} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left">
            <i className="fas fa-book-open text-brand-text-green w-5 text-center"></i>
            <span className="text-brand-dark dark:text-gray-200">Modo Leitura</span>
          </button>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tema Visual</div>
          <div className="flex items-center justify-around p-1 bg-gray-100 dark:bg-gray-900 rounded-lg">
            <button onClick={() => changeTheme('light')} className={`p-2 rounded-md ${theme === 'light' ? 'bg-brand-green text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}><i className="fas fa-sun"></i></button>
            <button onClick={() => changeTheme('auto')} className={`p-2 rounded-md ${theme === 'auto' ? 'bg-brand-green text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}><i className="fas fa-desktop"></i></button>
            <button onClick={() => changeTheme('dark')} className={`p-2 rounded-md ${theme === 'dark' ? 'bg-brand-green text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}><i className="fas fa-moon"></i></button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;