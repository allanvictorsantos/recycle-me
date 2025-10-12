import { useState, useEffect, useRef } from 'react';
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './App.css';

// TypeScript: Definindo o tipo para a janela global para incluir a função do Google
declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

function App() {
  // --- ESTADOS (A "MEMÓRIA" DO NOSSO COMPONENTE) ---
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccessibilityPanelOpen, setAccessibilityPanelOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'auto');
  const [isReadingMode, setReadingMode] = useState(false);
  const [isBackToTopVisible, setBackToTopVisible] = useState(false);
  const [isLanguageMenuOpen, setLanguageMenuOpen] = useState(false);

  // --- REFERÊNCIAS (CONEXÃO DIRETA COM ELEMENTOS) ---
  const accessibilityPanelRef = useRef<HTMLDivElement>(null); // Referência para o painel de acessibilidade
  const languageSwitcherRef = useRef<HTMLDivElement>(null); // Referência para o menu de idiomas

  // --- FUNÇÕES (AS "AÇÕES" QUE MUDAM A MEMÓRIA) ---
  const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);
  const toggleAccessibilityPanel = () => setAccessibilityPanelOpen(prev => !prev);
  const toggleReadingMode = () => setReadingMode(prev => !prev);
  const toggleLanguageMenu = () => setLanguageMenuOpen(prev => !prev);

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

  const changeLanguage = (lang: string) => {
    const googleSelect = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (googleSelect) {
      googleSelect.value = lang;
      googleSelect.dispatchEvent(new Event('change'));
    }
    setLanguageMenuOpen(false);
  };

  // --- EFEITOS COLATERAIS (LÓGICA QUE RODA EM RESPOSTA A MUDANÇAS) ---

  // Efeito para o Swiper (Carrossel)
  useEffect(() => {
    const swiper = new Swiper('.swiper-container', {
      modules: [Navigation, Pagination, Autoplay],
      loop: true,
      autoplay: { delay: 7000, disableOnInteraction: false },
      pagination: { el: '.swiper-pagination-custom', clickable: true },
      navigation: {
        nextEl: '.swiper-button-next-custom',
        prevEl: '.swiper-button-prev-custom',
      },
    });
    return () => { swiper.destroy(); };
  }, []);

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

  // Efeito para fechar painéis ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accessibilityPanelRef.current && !accessibilityPanelRef.current.contains(event.target as Node)) {
        setAccessibilityPanelOpen(false);
      }
      if (languageSwitcherRef.current && !languageSwitcherRef.current.contains(event.target as Node)) {
        setLanguageMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [accessibilityPanelRef, languageSwitcherRef]);

  // Efeito para carregar e inicializar o Google Translate
  useEffect(() => {
    // Evita múltiplas instâncias do script do Google Translate
    if (window.google && window.google.translate) {
      return;
    }
    
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: 'pt', includedLanguages: 'en,es,fr,pt', layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE, autoDisplay: false },
        'google_translate_element'
      );
    };
    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
        const a = document.getElementById(':0.targetLanguage');
        if (a) a.remove();
        const b = document.getElementById(':1.targetLanguage');
        if (b) b.remove();
      document.body.removeChild(script);
    };
  }, []);

  return (
    <>
      <div id="page-wrapper" className={`bg-brand-cream dark:bg-brand-dark text-brand-dark dark:text-gray-300 transition duration-300 ${isReadingMode ? 'reading-mode' : ''}`}>
        <header className="header-gradient dark:bg-gray-800 shadow-sm sticky top-0 z-50 dark:border-b dark:border-gray-700">
          <div className="container mx-auto flex justify-between items-center p-4">
            <a href="#inicio" className="text-xl font-extrabold tracking-tighter dark:text-white">♻️ RECYCLE_ME</a>
            <nav id="main-nav" className="hidden md:flex items-center gap-8">
              <a href="#clube-recycleme" className="nav-link relative group text-sm font-bold uppercase pb-2 transition-colors hover:text-brand-text-green dark:text-gray-300 dark:hover:text-brand-green"><span>O Clube</span><span className="underline-span absolute bottom-0 left-0 w-0 h-0.5 bg-brand-text-green dark:bg-brand-green transition-all duration-300 group-hover:w-full"></span></a>
              <a href="#como-funciona" className="nav-link relative group text-sm font-bold uppercase pb-2 transition-colors hover:text-brand-text-green dark:text-gray-300 dark:hover:text-brand-green"><span>Como Funciona</span><span className="underline-span absolute bottom-0 left-0 w-0 h-0.5 bg-brand-text-green dark:bg-brand-green transition-all duration-300 group-hover:w-full"></span></a>
              <a href="#o-que-reciclar" className="nav-link relative group text-sm font-bold uppercase pb-2 transition-colors hover:text-brand-text-green dark:text-gray-300 dark:hover:text-brand-green"><span>O que reciclar</span><span className="underline-span absolute bottom-0 left-0 w-0 h-0.5 bg-brand-text-green dark:bg-brand-green transition-all duration-300 group-hover:w-full"></span></a>
              <a href="#sobre-nos" className="nav-link relative group text-sm font-bold uppercase pb-2 transition-colors hover:text-brand-text-green dark:text-gray-300 dark:hover:text-brand-green"><span>Sobre Nós</span><span className="underline-span absolute bottom-0 left-0 w-0 h-0.5 bg-brand-text-green dark:bg-brand-green transition-all duration-300 group-hover:w-full"></span></a>
              <a href="#" className="nav-link relative group text-sm font-bold uppercase pb-2 transition-colors hover:text-brand-text-green dark:text-gray-300 dark:hover:text-brand-green"><span>Login</span><span className="underline-span absolute bottom-0 left-0 w-0 h-0.5 bg-brand-text-green dark:bg-brand-green transition-all duration-300 group-hover:w-full"></span></a>
            </nav>
            <div className="flex items-center gap-4">
              <div ref={languageSwitcherRef} className="relative" id="language-switcher">
                <button id="language-button" onClick={toggleLanguageMenu} className="text-xl hover:text-brand-text-green transition-colors dark:text-gray-300 dark:hover:text-brand-green">
                  <i className="fas fa-globe"></i>
                </button>
                <div id="language-menu" className={`absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg py-1 z-20 transition-opacity duration-300 ${isLanguageMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  <a href="#" onClick={(e) => { e.preventDefault(); changeLanguage('pt'); }} className="lang-option flex items-center gap-3 px-4 py-2 text-sm text-brand-dark dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">🇧🇷 Português</a>
                  <a href="#" onClick={(e) => { e.preventDefault(); changeLanguage('en'); }} className="lang-option flex items-center gap-3 px-4 py-2 text-sm text-brand-dark dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">🇺🇸 English</a>
                  <a href="#" onClick={(e) => { e.preventDefault(); changeLanguage('es'); }} className="lang-option flex items-center gap-3 px-4 py-2 text-sm text-brand-dark dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">🇪🇸 Español</a>
                  <a href="#" onClick={(e) => { e.preventDefault(); changeLanguage('fr'); }} className="lang-option flex items-center gap-3 px-4 py-2 text-sm text-brand-dark dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">🇫🇷 Français</a>
                </div>
              </div>
              <div id="google_translate_element" style={{ display: 'none' }}></div>
              <a href="#" className="text-2xl hover:text-brand-text-green transition-colors dark:text-gray-300 dark:hover:text-brand-green"><i className="fas fa-user-circle"></i></a>
              <button id="mobile-menu-button" onClick={toggleMobileMenu} className="md:hidden text-2xl dark:text-gray-300"><i className="fas fa-bars"></i></button>
            </div>
          </div>
          <div id="mobile-menu" className={`md:hidden bg-brand-cream dark:bg-gray-800 pb-4 ${isMobileMenuOpen ? '' : 'hidden'}`}>
            <a href="#clube-recycleme" className="block text-center py-2 px-4 text-sm font-bold uppercase text-brand-dark dark:text-gray-200 hover:bg-brand-light-green dark:hover:bg-gray-700">O Clube</a>
            <a href="#como-funciona" className="block text-center py-2 px-4 text-sm font-bold uppercase text-brand-dark dark:text-gray-200 hover:bg-brand-light-green dark:hover:bg-gray-700">Como Funciona</a>
            <a href="#o-que-reciclar" className="block text-center py-2 px-4 text-sm font-bold uppercase text-brand-dark dark:text-gray-200 hover:bg-brand-light-green dark:hover:bg-gray-700">O que reciclar</a>
            <a href="#sobre-nos" className="block text-center py-2 px-4 text-sm font-bold uppercase text-brand-dark dark:text-gray-200 hover:bg-brand-light-green dark:hover:bg-gray-700">Sobre Nós</a>
            <a href="#" className="block text-center py-2 px-4 text-sm font-bold uppercase text-brand-dark dark:text-gray-200 hover:bg-brand-light-green dark:hover:bg-gray-700">Login</a>
          </div>
        </header>

        <main>
          <section id="inicio" className="w-full mt-4 md:mt-10">
            <div className="container mx-auto px-4 md:px-6">
              <div className="swiper-container-wrapper">
                <div className="swiper-container h-[550px] md:h-[500px] rounded-2xl overflow-hidden md:w-[100%]">
                  <div className="swiper-wrapper">
                    <div className="swiper-slide bg-cover bg-center bg-slide-1">
                      <div className="bg-black bg-opacity-50 w-full h-full">
                        <div className="container mx-auto grid md:grid-cols-2 gap-8 items-center h-full p-10 md:p-20">
                          <div className="text-center md:text-left text-white fade-in-up">
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight">Transforme <span className="text-brand-green">Lixo</span> em <span className="text-brand-green">Recompensa</span>.</h1>
                            <p className="mt-4 text-base md:text-lg text-gray-200">Junte-se à Recycle_me e descubra como suas ações sustentáveis geram descontos incríveis em parceiros locais.</p>
                            <div className="mt-8 flex flex-col sm:flex-row justify-center md:justify-start gap-4">
                              <a href="#como-funciona" className="px-6 sm:px-8 py-3 text-sm sm:text-base whitespace-nowrap rounded-full bg-brand-green text-white font-bold shadow-lg hover:scale-105 transform transition-all duration-300 btn-glow-green">Encontrar Pontos de Coleta</a>
                              <a href="#" className="btn-fill-green px-6 sm:px-8 py-3 text-sm sm:text-base whitespace-nowrap rounded-full bg-white text-brand-dark font-bold shadow-lg hover:scale-105 transform transition-transform"><span>Cadastre-se</span></a>
                            </div>
                          </div>
                          <div></div>
                        </div>
                      </div>
                    </div>
                    <div className="swiper-slide bg-cover bg-center bg-slide-2">
                       <div className="bg-black bg-opacity-60 text-white w-full h-full flex flex-col justify-center items-center text-center p-8">
                          <div className="text-5xl md:text-6xl text-white mb-4"><i className="fas fa-graduation-cap"></i></div>
                          <h3 className="text-3xl md:text-4xl font-bold">Eleve seu Conhecimento Sustentável.</h3>
                          <p className="mt-2 text-gray-200 max-w-2xl">Aprenda com nossos especialistas a manusear materiais com segurança e otimizar sua reciclagem.</p>
                          <div className="mt-8"><a href="#" className="px-6 sm:px-8 py-3 text-sm sm:text-base rounded-full bg-brand-green text-white font-bold shadow-lg hover:scale-105 transform transition-all duration-300 btn-glow-green whitespace-nowrap">Explorar Cursos Gratuitos</a></div>
                        </div>
                    </div>
                  </div>
                </div>
                <div className="swiper-button-prev-custom swiper-button-custom"><i className="fas fa-chevron-left"></i></div>
                <div className="swiper-button-next-custom swiper-button-custom"><i className="fas fa-chevron-right"></i></div>
                <div className="swiper-pagination-custom"></div>
              </div>
            </div>
          </section>
          

          {/* Seção do Clube com fundo mais escuro para destaque */}
          <section id="clube-recycleme" className="py-20 bg-gray-900 text-white">
            <div className="container mx-auto px-6 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Mais que Pontos: Faça Parte do <span className="text-brand-green">Clube Recycle_me</span></h2>
              <p className="text-gray-300 mb-16 max-w-3xl mx-auto">Sua jornada de reciclagem é uma aventura. Acumule pontos, suba de nível, ganhe recompensas exclusivas e veja em tempo real o bem que você faz pelo planeta.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="flex flex-col p-8 bg-gray-800 rounded-2xl fade-in-up transition-all duration-300 card-glow-green border border-gray-700">
                    <div className="flex-grow">
                        <div className="text-5xl text-brand-green mb-4"><i className="fas fa-trophy"></i></div>
                        <h3 className="text-2xl font-bold mb-2">Suba de Nível</h3>
                        <p className="text-gray-400">Comece como <span className="font-bold text-white">Iniciante</span> e evolua até <span className="font-bold text-white">Mestre da Sustentabilidade</span>. Desbloqueie novos badges e benefícios.</p>
                    </div>
                    <div className="mt-6"><a href="#" title="Requer login ou cadastro" className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gray-700 text-white font-semibold text-sm hover:bg-gray-600 transition-colors"><i className="fas fa-lock text-xs"></i>Meu Perfil</a></div>
                </div>
                <div className="flex flex-col p-8 bg-gray-800 rounded-2xl fade-in-up transition-all duration-300 card-glow-green border border-gray-700" style={{ animationDelay: '0.1s' }}>
                    <div className="flex-grow">
                        <div className="text-5xl text-brand-green mb-4"><i className="fas fa-gift"></i></div>
                        <h3 className="text-2xl font-bold mb-2">Desbloqueie Recompensas</h3>
                        <p className="text-gray-400">Participe de <span className="font-bold text-white">missões semanais</span> e troque pontos por <span className="font-bold text-white">descontos reais</span> em supermercados e lojas parceiras.</p>
                    </div>
                    <div className="mt-6"><a href="#" className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-brand-green text-white font-bold text-sm shadow-lg hover:scale-105 transform transition-all duration-300 btn-glow-green">Explorar Recompensas</a></div>
                </div>
                <div className="flex flex-col p-8 bg-gray-800 rounded-2xl fade-in-up transition-all duration-300 card-glow-green border border-gray-700" style={{ animationDelay: '0.2s' }}>
                    <div className="flex-grow">
                        <div className="text-5xl text-brand-green mb-4"><i className="fas fa-chart-line"></i></div>
                        <h3 className="text-2xl font-bold mb-2">Veja seu Impacto</h3>
                        <p className="text-gray-400">Acompanhe a quantidade de água e energia que você ajudou a economizar. Veja sua pequena ação fazendo uma <span className="font-bold text-white">grande diferença</span>.</p>
                    </div>
                    <div className="mt-6"><a href="#" title="Requer login ou cadastro" className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gray-700 text-white font-semibold text-sm hover:bg-gray-600 transition-colors"><i className="fas fa-lock text-xs"></i>Minhas Métricas</a></div>
                </div>
              </div>
            </div>
          </section>

          <section id="como-funciona" className="bg-white dark:bg-gray-900 py-20 dark:border-t dark:border-gray-700">
            <div className="container mx-auto px-6 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-2 dark:text-white">Simples, Rápido e Gratificante</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-12">Em 4 passos você já está ajudando o planeta e seu bolso.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                <div className="p-8 bg-brand-cream dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-2xl hover:scale-105 transform transition-all duration-300"><div className="text-4xl text-brand-text-green mb-4"><i className="fas fa-recycle"></i></div><h3 className="text-xl font-bold mb-2 dark:text-white">1. Separe</h3><p className="text-gray-600 dark:text-gray-400">Prepare seus recicláveis limpos e secos, seguindo nossas dicas.</p></div>
                <a href="#" className="block p-8 bg-brand-cream dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-2xl hover:scale-105 transform transition-all duration-300"><div className="text-4xl text-brand-text-green mb-4"><i className="fas fa-map-marker-alt"></i></div><h3 className="text-xl font-bold mb-2 dark:text-white">2. Encontre</h3><p className="text-gray-600 dark:text-gray-400">Use nosso mapa para encontrar o ponto de coleta mais próximo.</p><span className="mt-4 inline-block text-sm font-bold text-brand-text-green">Ver o Mapa →</span></a>
                <div className="p-8 bg-brand-cream dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-2xl hover:scale-105 transform transition-all duration-300"><div className="text-4xl text-brand-text-green mb-4"><i className="fas fa-qrcode"></i></div><h3 className="text-xl font-bold mb-2 dark:text-white">3. Escaneie</h3><p className="text-gray-600 dark:text-gray-400">Apresente seu QR Code no local para uma validação rápida.</p></div>
                <div className="p-8 bg-brand-cream dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-2xl hover:scale-105 transform transition-all duration-300"><div className="text-4xl text-brand-text-green mb-4"><i className="fas fa-star"></i></div><h3 className="text-xl font-bold mb-2 dark:text-white">4. Ganhe</h3><p className="text-gray-600 dark:text-gray-400">Receba seus pontos na hora e comece a aproveitar os benefícios!</p></div>
              </div>
            </div>
          </section>

          <section id="o-que-reciclar" className="py-20 bg-brand-cream dark:bg-brand-dark">
            <div className="container mx-auto px-6">
              <div className="text-center mb-16"><h2 className="text-3xl md:text-4xl font-bold mb-2 dark:text-white">Prepare seus recicláveis</h2><p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Siga nosso padrão de qualidade para agilizar o processo e garantir seus pontos.</p></div>
              <div className="space-y-24">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div><img loading="lazy" width="500" height="400" src="https://placehold.co/500x400/A7F3D0/1F2937?text=Pl%C3%A1stico" alt="Ilustração de plásticos recicláveis limpos" className="rounded-2xl shadow-xl w-full" /></div>
                  <div>
                    <div className="flex items-center gap-4 mb-4"><i className="fas fa-bottle-water text-3xl md:text-4xl text-brand-text-green"></i><h3 className="text-3xl md:text-4xl font-bold dark:text-white">Plástico</h3></div>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">Aceitamos garrafas PET, embalagens de limpeza, potes de alimentos e outros plásticos rígidos.</p>
                    <div>
                      <h4 className="text-xl font-bold mb-3 border-b-2 border-brand-light-green pb-2 dark:text-white">Padrão de Qualidade</h4>
                      <ul className="list-none space-y-4 text-md text-gray-700 dark:text-gray-400 mt-4">
                        <li className="flex items-start"><i className="fas fa-check-circle text-green-500 mr-3 mt-1 flex-shrink-0"></i><span>Entregue <strong>limpo e sem restos</strong> de alimentos ou líquidos para evitar contaminação.</span></li>
                        <li className="flex items-start"><i className="fas fa-check-circle text-green-500 mr-3 mt-1 flex-shrink-0"></i><span>O material deve estar <strong>seco</strong> para não mofar e prejudicar o processo.</span></li>
                        <li className="flex items-start"><i className="fas fa-times-circle text-red-500 mr-3 mt-1 flex-shrink-0"></i><span><strong>Não aceitamos</strong> plásticos com resíduos orgânicos ou adesivos metalizados.</span></li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="md:order-last"><img loading="lazy" width="500" height="400" src="https://placehold.co/500x400/A7F3D0/1F2937?text=Papel" alt="Ilustração de papéis e caixas de papelão limpos" className="rounded-2xl shadow-xl w-full" /></div>
                  <div>
                    <div className="flex items-center gap-4 mb-4"><i className="fas fa-newspaper text-3xl md:text-4xl text-brand-text-green"></i><h3 className="text-3xl md:text-4xl font-bold dark:text-white">Papel</h3></div>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">Jornais, revistas, caixas de papelão e folhas de sulfite são bem-vindos.</p>
                    <div>
                      <h4 className="text-xl font-bold mb-3 border-b-2 border-brand-light-green pb-2 dark:text-white">Padrão de Qualidade</h4>
                      <ul className="list-none space-y-4 text-md text-gray-700 dark:text-gray-400 mt-4">
                        <li className="flex items-start"><i className="fas fa-check-circle text-green-500 mr-3 mt-1 flex-shrink-0"></i><span>O material deve estar <strong>seco e sem gordura</strong>. Papel engordurado não pode ser reciclado.</span></li>
                        <li className="flex items-start"><i className="fas fa-times-circle text-red-500 mr-3 mt-1 flex-shrink-0"></i><span><strong>Não aceitamos</strong> papel higiênico, guardanapos, fotografias ou papel carbono.</span></li>
                        <li className="flex items-start"><i className="fas fa-times-circle text-red-500 mr-3 mt-1 flex-shrink-0"></i><span>Retire <strong>grampos, clipes e espirais</strong> antes de descartar.</span></li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div><img loading="lazy" width="500" height="400" src="https://placehold.co/500x400/A7F3D0/1F2937?text=Metal" alt="Ilustração de latas de alumínio e aço limpas" className="rounded-2xl shadow-xl w-full" /></div>
                  <div>
                    <div className="flex items-center gap-4 mb-4"><i className="fas fa-dumpster text-3xl md:text-4xl text-brand-text-green"></i><h3 className="text-3xl md:text-4xl font-bold dark:text-white">Metal</h3></div>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">Latas de alumínio (refrigerante, cerveja) e latas de aço (milho, ervilha).</p>
                    <div>
                      <h4 className="text-xl font-bold mb-3 border-b-2 border-brand-light-green pb-2 dark:text-white">Padrão de Qualidade</h4>
                      <ul className="list-none space-y-4 text-md text-gray-700 dark:text-gray-400 mt-4">
                        <li className="flex items-start"><i className="fas fa-check-circle text-green-500 mr-3 mt-1 flex-shrink-0"></i><span>Enxágue as latas para remover <strong>restos de alimentos</strong> e deixe-as secar.</span></li>
                        <li className="flex items-start"><i className="fas fa-check-circle text-green-500 mr-3 mt-1 flex-shrink-0"></i><span><strong>Amasse as latas</strong> para otimizar o espaço de armazenamento e transporte.</span></li>
                        <li className="flex items-start"><i className="fas fa-times-circle text-red-500 mr-3 mt-1 flex-shrink-0"></i><span><strong>Não aceitamos</strong> clipes, esponjas de aço ou aerossóis.</span></li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="md:order-last"><img loading="lazy" width="500" height="400" src="https://placehold.co/500x400/A7F3D0/1F2937?text=Vidro" alt="Ilustração de garrafas e potes de vidro limpos" className="rounded-2xl shadow-xl w-full" /></div>
                  <div>
                    <div className="flex items-center gap-4 mb-4"><i className="fas fa-wine-bottle text-3xl md:text-4xl text-brand-text-green"></i><h3 className="text-3xl md:text-4xl font-bold dark:text-white">Vidro</h3></div>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">Garrafas de bebidas, potes de alimentos (azeitona, palmito) e frascos em geral.</p>
                    <div>
                      <h4 className="text-xl font-bold mb-3 border-b-2 border-brand-light-green pb-2 dark:text-white">Padrão de Qualidade</h4>
                      <ul className="list-none space-y-4 text-md text-gray-700 dark:text-gray-400 mt-4">
                        <li className="flex items-start"><i className="fas fa-check-circle text-green-500 mr-3 mt-1 flex-shrink-0"></i><span>Entregue os itens <strong>limpos, secos e sem tampas</strong>.</span></li>
                        <li className="flex items-start"><i className="fas fa-exclamation-triangle text-yellow-500 mr-3 mt-1 flex-shrink-0"></i><span><strong>Cuidado!</strong> Por segurança, entregue os vidros <strong>inteiros</strong>, não quebrados.</span></li>
                        <li className="flex items-start"><i className="fas fa-times-circle text-red-500 mr-3 mt-1 flex-shrink-0"></i><span><strong>Não aceitamos</strong> espelhos, lâmpadas, porcelana ou cerâmica.</span></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="sobre-nos" className="bg-white dark:bg-gray-900 py-20 dark:border-t dark:border-gray-700">
            <div className="container mx-auto px-6">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div><img loading="lazy" width="600" height="400" src="https://placehold.co/600x400/34D399/FFFFFF?text=Nossa+Miss%C3%A3o" alt="Equipe trabalhando em projeto de sustentabilidade" className="rounded-2xl shadow-xl" /></div>
                <div className="text-center md:text-left">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">Nossa Missão é Conectar para Transformar</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">A Recycle_me nasceu de um projeto de TCC com o objetivo de criar uma solução tecnológica e acessível para o desafio da reciclagem. Acreditamos que, ao conectar pessoas engajadas, comércios locais e empresas parceiras, podemos construir um ecossistema onde a sustentabilidade é a maior recompensa.</p>
                  <p className="text-gray-600 dark:text-gray-400">Cada garrafa plástica, cada folha de papel e cada lata de alumínio conta. Junte-se a nós nesse movimento!</p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      <footer className="bg-brand-dark text-white">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h3 className="text-lg font-bold mb-4">♻️ RECYCLE_ME</h3>
              <p className="text-gray-400">Reciclando o presente, garantindo o futuro.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Links Rápidos</h3>
              <ul className="space-y-2">
                <li><a href="#clube-recycleme" className="text-gray-400 hover:text-white transition-colors">O Clube</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Seja um Parceiro</a></li>
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

