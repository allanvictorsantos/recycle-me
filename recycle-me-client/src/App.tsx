// src/App.tsx

import { useState, useEffect, useRef } from 'react';
import { Outlet, Link } from 'react-router-dom';
import HashLink from './components/HashLink.tsx';
import ScrollToTop from './components/ScrollToTop.tsx';
import './App.css';

// --- PASSO 1: IMPORTAR O useAuth ---
import { useAuth } from './context/AuthContext'; // (Verifique o caminho se necessário)

function App() {
  // --- PASSO 2: PEGAR O ESTADO DE AUTENTICAÇÃO E A FUNÇÃO LOGOUT ---
  const { isAuthenticated, logout } = useAuth();

  // --- O RESTO DOS SEUS ESTADOS (continua 100% igual) ---
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccessibilityPanelOpen, setAccessibilityPanelOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'auto');
  const [isReadingMode, setReadingMode] = useState(false);
  const [isBackToTopVisible, setBackToTopVisible] = useState(false);

  // --- REFERÊNCIAS (continua 100% igual) ---
  const accessibilityPanelRef = useRef<HTMLDivElement>(null);

  // --- FUNÇÕES (continua 100% igual) ---
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
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- EFEITOS COLATERAIS (continua 100% igual) ---

  // Efeito para aplicar o tema (claro/escuro)
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.toggle('dark', isDark);
  }, [theme]);

  // Efeito para o botão "Voltar ao Topo"
  useEffect(() => {
    const handleScroll = () => setBackToTopVisible(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Efeito para fechar painel ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (accessibilityPanelRef.current && !accessibilityPanelRef.current.contains(target)) {
        setAccessibilityPanelOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [accessibilityPanelRef]);

  return (
    <>
      <ScrollToTop />
      <div id="page-wrapper" className={`bg-brand-cream dark:bg-brand-dark text-brand-dark dark:text-gray-300 transition duration-300 ${isReadingMode ? 'reading-mode' : ''}`}>

        <header className="header-gradient dark:bg-gray-800 shadow-sm sticky top-0 z-50 dark:border-b dark:border-gray-700">
          <div className="container mx-auto flex justify-between items-center p-4">
            <Link to="/" className="text-xl font-extrabold tracking-tighter dark:text-white">RECYCLE_ME</Link>

            {/* --- PASSO 3.1: NAVEGAÇÃO DESKTOP CONDICIONAL --- */}
            <nav id="main-nav" className="hidden md:flex items-center gap-8">
              <HashLink to="clube-recycleme" className="nav-link relative group text-sm font-bold uppercase pb-2 transition-colors hover:text-brand-text-green dark:text-gray-300 dark:hover:text-brand-green"><span>O Clube</span><span className="underline-span absolute bottom-0 left-0 w-0 h-0.5 bg-brand-text-green dark:bg-brand-green transition-all duration-300 group-hover:w-full"></span></HashLink>
              <HashLink to="como-funciona" className="nav-link relative group text-sm font-bold uppercase pb-2 transition-colors hover:text-brand-text-green dark:text-gray-300 dark:hover:text-brand-green"><span>Como Funciona</span><span className="underline-span absolute bottom-0 left-0 w-0 h-0.5 bg-brand-text-green dark:bg-brand-green transition-all duration-300 group-hover:w-full"></span></HashLink>
              <HashLink to="o-que-reciclar" className="nav-link relative group text-sm font-bold uppercase pb-2 transition-colors hover:text-brand-text-green dark:text-gray-300 dark:hover:text-brand-green"><span>O que reciclar</span><span className="underline-span absolute bottom-0 left-0 w-0 h-0.5 bg-brand-text-green dark:bg-brand-green transition-all duration-300 group-hover:w-full"></span></HashLink>
              <HashLink to="sobre-nos" className="nav-link relative group text-sm font-bold uppercase pb-2 transition-colors hover:text-brand-text-green dark:text-gray-300 dark:hover:text-brand-green"><span>Sobre Nós</span><span className="underline-span absolute bottom-0 left-0 w-0 h-0.5 bg-brand-text-green dark:bg-brand-green transition-all duration-300 group-hover:w-full"></span></HashLink>

              {!isAuthenticated ? (
                // SE NÃO ESTIVER LOGADO
                <Link to="/login" className="nav-link relative group text-sm font-bold uppercase pb-2 transition-colors hover:text-brand-text-green dark:text-gray-300 dark:hover:text-brand-green"><span>Login</span><span className="underline-span absolute bottom-0 left-0 w-0 h-0.5 bg-brand-text-green dark:bg-brand-green transition-all duration-300 group-hover:w-full"></span></Link>
              ) : (
                // SE ESTIVER LOGADO
                <>
                  <Link to="/mapa" className="nav-link relative group text-sm font-bold uppercase pb-2 transition-colors hover:text-brand-text-green dark:text-gray-300 dark:hover:text-brand-green"><span>Mapa</span><span className="underline-span absolute bottom-0 left-0 w-0 h-0.5 bg-brand-text-green dark:bg-brand-green transition-all duration-300 group-hover:w-full"></span></Link>
                  <button onClick={logout} className="nav-link relative group text-sm font-bold uppercase pb-2 transition-colors hover:text-brand-text-green dark:text-gray-300 dark:hover:text-brand-green"><span>Sair</span><span className="underline-span absolute bottom-0 left-0 w-0 h-0.5 bg-brand-text-green dark:bg-brand-green transition-all duration-300 group-hover:w-full"></span></button>
                </>
              )}
            </nav>
            <div className="flex items-center gap-4">

              {/* --- PASSO 3.2: ÍCONE DE USUÁRIO/MAPA CONDICIONAL --- */}
              {!isAuthenticated ? (
                <Link to="/login" title="Acessar conta" className="text-2xl hover:text-brand-text-green transition-colors dark:text-gray-300 dark:hover:text-brand-green"><i className="fas fa-user-circle"></i></Link>
              ) : (
                <Link to="/mapa" title="Acessar mapa" className="text-2xl hover:text-brand-text-green transition-colors dark:text-gray-300 dark:hover:text-brand-green"><i className="fas fa-map-marked-alt"></i></Link>
              )}

              <button id="mobile-menu-button" onClick={toggleMobileMenu} className="md:hidden text-2xl dark:text-gray-300"><i className="fas fa-bars"></i></button>
            </div>
          </div>

          {/* --- PASSO 3.3: NAVEGAÇÃO MOBILE CONDICIONAL --- */}
          <div id="mobile-menu" className={`md:hidden bg-brand-cream dark:bg-gray-800 pb-4 ${isMobileMenuOpen ? '' : 'hidden'}`}>
            <HashLink to="clube-recycleme" className="block text-center py-2 px-4 text-sm font-bold uppercase text-brand-dark dark:text-gray-200 hover:bg-brand-light-green dark:hover:bg-gray-700">O Clube</HashLink>
            <HashLink to="como-funciona" className="block text-center py-2 px-4 text-sm font-bold uppercase text-brand-dark dark:text-gray-200 hover:bg-brand-light-green dark:hover:bg-gray-700">Como Funciona</HashLink>
            <HashLink to="o-que-reciclar" className="block text-center py-2 px-4 text-sm font-bold uppercase text-brand-dark dark:text-gray-200 hover:bg-brand-light-green dark:hover:bg-gray-700">O que reciclar</HashLink>
            <HashLink to="sobre-nos" className="block text-center py-2 px-4 text-sm font-bold uppercase text-brand-dark dark:text-gray-200 hover:bg-brand-light-green dark:hover:bg-gray-700">Sobre Nós</HashLink>

            {!isAuthenticated ? (
              <Link to="/login" className="block text-center py-2 px-4 text-sm font-bold uppercase text-brand-dark dark:text-gray-200 hover:bg-brand-light-green dark:hover:bg-gray-700">Login</Link>
            ) : (
              <>
                <Link to="/mapa" className="block text-center py-2 px-4 text-sm font-bold uppercase text-brand-dark dark:text-gray-200 hover:bg-brand-light-green dark:hover:bg-gray-700">Mapa</Link>
                <button onClick={() => { logout(); toggleMobileMenu(); }} className="w-full block text-center py-2 px-4 text-sm font-bold uppercase text-brand-dark dark:text-gray-200 hover:bg-brand-light-green dark:hover:bg-gray-700">Sair</button>
              </>
            )}
          </div>
        </header>

        {/* O <Outlet> continua aqui, perfeito! */}
        <Outlet />

        <footer className="bg-gray-900 text-white">
          <div className="container mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
              <div>
                <h3 className="text-lg font-bold mb-4">♻️ RECYCLE_ME</h3>
                <p className="text-gray-400">Reciclando o presente, garantindo o futuro.</p>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-4">Links Rápidos</h3>
                <ul className="space-y-2">
                  <li><HashLink to="clube-recycleme" className="text-gray-400 hover:text-white transition-colors">O Clube</HashLink></li>
                  <li><Link to="/cadastro" className="text-gray-400 hover:text-white transition-colors">Seja um Parceiro</Link></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contato</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-4">Siga-nos</h3>
                <div className="flex justify-center md:justify-start gap-4 text-2xl">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors"><i className="fab fa-instagram"></i></a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors"><i className="fab fa-facebook"></i></a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors"><i className="fab fa-linkedin"></i></a>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-500">
              <p>&copy; 2025 Recycle_me. Todos os direitos reservados. Projeto de TCC.</p>
            </div>
          </div>
        </footer>
      </div>

      <button id="back-to-top-button" onClick={scrollToTop} title="Voltar ao topo" className={`fixed bottom-20 right-5 z-[60] w-14 h-14 bg-brand-dark/80 backdrop-blur-sm text-white rounded-full shadow-lg flex items-center justify-center text-xl hover:bg-gray-700 transition-all ${isBackToTopVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <i className="fas fa-arrow-up"></i>
      </button>

      <button id="accessibility-button" onClick={toggleAccessibilityPanel} title="Abrir menu de acessibilidade" className="fixed bottom-5 right-5 z-[60] w-14 h-14 bg-brand-dark text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-gray-700 transition-colors">
        <i className="fas fa-universal-access"></i>
      </button>

      <div ref={accessibilityPanelRef} id="accessibility-panel" className={`fixed bottom-24 right-5 z-[60] bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-64 overflow-hidden transition-opacity duration-300 ${isAccessibilityPanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-md text-brand-dark dark:text-white">Acessibilidade</h3>
          <button onClick={() => setAccessibilityPanelOpen(false)} title="Fechar menu" className="text-gray-500 hover:text-brand-dark dark:hover:text-white"><i className="fas fa-times"></i></button>
        </div>
        <div className="p-4 space-y-4">
          <button onClick={toggleReadingMode} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <i className="fas fa-book-open text-brand-text-green"></i>
            <span className="text-brand-dark dark:text-gray-200">Modo Leitura</span>
          </button>
          <div className="flex items-center justify-around p-2 bg-gray-100 dark:bg-gray-900 rounded-lg">
            <button onClick={() => changeTheme('light')} title="Modo Claro" className={`p-2 rounded-full text-gray-800 dark:text-gray-200 ${theme === 'light' ? 'bg-brand-green text-white' : ''}`}>
              <i className="fas fa-sun"></i>
            </button>
            <button onClick={() => changeTheme('auto')} title="Automático (Sistema)" className={`p-2 rounded-full text-gray-800 dark:text-gray-200 ${theme === 'auto' ? 'bg-brand-green text-white' : ''}`}>
              <i className="fas fa-desktop"></i>
            </button>
            <button onClick={() => changeTheme('dark')} title="Modo Escuro" className={`p-2 rounded-full text-gray-800 dark:text-gray-200 ${theme === 'dark' ? 'bg-brand-green text-white' : ''}`}>
              <i className="fas fa-moon"></i>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;