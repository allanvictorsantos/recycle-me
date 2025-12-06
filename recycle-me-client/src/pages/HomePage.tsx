import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

// --- CONFIGURAÇÃO DOS VÍDEOS (CAMINHOS ABSOLUTOS) ---
const STEPS_DATA = [
    { 
        num: '01', 
        title: 'Gere seu Token', 
        text: 'No app, escolha o material, informe o peso e gere um código único.', 
        icon: 'fa-mobile-alt',
        // Caminho absoluto a partir da pasta public
        videoDesktop: '/video/gereseutoken.mp4', 
        videoMobile: '/video/gereseutoken2.mp4' 
    },
    { 
        num: '02', 
        title: 'Leve ao Ponto', 
        text: 'Vá até um mercado parceiro e mostre o código ao fiscal.', 
        icon: 'fa-map-marker-alt',
        videoDesktop: '/video/leveaumponto.mp4',
        videoMobile: '/video/leveaumponto2.mp4'
    },
    { 
        num: '03', 
        title: 'Ganhe Pontos', 
        text: 'O fiscal valida na hora e os EcoPoints caem na sua conta.', 
        icon: 'fa-coins',
        videoDesktop: '/video/ganhepontos.mp4',
        videoMobile: '/video/ganhepontos2.mp4'
    }
];

// DADOS DOS MATERIAIS
const MATERIALS_INFO = [
  { 
    id: 'plastico', 
    name: 'Plástico', 
    img: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?q=80&w=1974&auto=format&fit=crop', 
    icon: 'fa-bottle-water', 
    desc: 'Garrafas PET, embalagens, potes.',
    rules: {
      pode: ['Garrafas PET (Amassadas)', 'Embalagens de Shampoo', 'Potes de Alimentos (Limpos)', 'Tampinhas'],
      naoPode: ['Embalagens metalizadas (Biscoito)', 'Cabo de panela', 'Tomadas']
    }
  },
  { 
    id: 'papel', 
    name: 'Papel', 
    img: 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?q=80&w=1974&auto=format&fit=crop', 
    icon: 'fa-newspaper', 
    desc: 'Jornais, caixas, revistas.',
    rules: {
      pode: ['Jornais e Revistas', 'Caixas de Papelão (Desmontadas)', 'Folhas de caderno (Sem espiral)', 'Envelopes'],
      naoPode: ['Papel higiênico/Guardanapo sujo', 'Papel carbono', 'Fotografias', 'Fitas adesivas']
    }
  },
  { 
    id: 'vidro', 
    name: 'Vidro', 
    img: 'https://images.unsplash.com/photo-1558583055-d7ac00b1adca?q=80&w=1974&auto=format&fit=crop', 
    icon: 'fa-wine-bottle', 
    desc: 'Garrafas e potes inteiros.',
    rules: {
      pode: ['Garrafas de bebidas', 'Potes de conserva', 'Frascos de perfume', 'Copos (Não quebrados)'],
      naoPode: ['Espelhos', 'Lâmpadas', 'Cristais', 'Vidros de automóveis', 'Box de banheiro']
    }
  },
  { 
    id: 'eletronicos', 
    name: 'Eletrônicos', 
    img: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=2001&auto=format&fit=crop', 
    icon: 'fa-microchip', 
    desc: 'Celulares, cabos, baterias.',
    rules: {
      pode: ['Celulares e Carregadores', 'Notebooks e Tablets', 'Impressoras', 'Fios e Cabos'],
      naoPode: ['Pilhas vazadas', 'Lâmpadas fluorescentes (Tóxico)', 'Toners de impressora']
    }
  }
];

function HomePage() {
  const location = useLocation();
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('mobile');
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (location.state?.scrollToId) {
      const element = document.getElementById(location.state.scrollToId);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);

  // Rotação automática dos passos
  useEffect(() => {
      const interval = setInterval(() => {
          setActiveStep((prev) => (prev + 1) % STEPS_DATA.length);
      }, 8000);
      return () => clearInterval(interval);
  }, []);

  return (
    <main className="bg-white dark:bg-gray-900 transition-colors duration-300 font-sans overflow-hidden relative">
      
      {/* === MODAL DE REGRAS === */}
      {selectedMaterial && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn" onClick={() => setSelectedMaterial(null)}>
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 relative transform transition-all scale-100" onClick={e => e.stopPropagation()}>
                <div className="h-40 relative">
                    <img src={selectedMaterial.img} className="w-full h-full object-cover" alt={selectedMaterial.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                        <h2 className="text-3xl font-black text-white flex items-center gap-3 drop-shadow-md">
                            <i className={`fas ${selectedMaterial.icon} text-brand-green`}></i> {selectedMaterial.name}
                        </h2>
                    </div>
                    <button onClick={() => setSelectedMaterial(null)} className="absolute top-4 right-4 w-10 h-10 bg-black/40 text-white rounded-full hover:bg-red-500 transition-colors flex items-center justify-center backdrop-blur-md border border-white/20"><i className="fas fa-times"></i></button>
                </div>
                <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-green-600 font-black uppercase tracking-widest text-xs mb-4 flex items-center gap-2 border-b border-green-100 pb-2"><i className="fas fa-check-circle"></i> O que aceitamos</h3>
                        <ul className="space-y-3">
                            {selectedMaterial.rules.pode.map((rule: string, i: number) => (
                                <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2 font-medium">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 shrink-0"></span> {rule}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-red-500 font-black uppercase tracking-widest text-xs mb-4 flex items-center gap-2 border-b border-red-100 pb-2"><i className="fas fa-times-circle"></i> O que NÃO aceitamos</h3>
                        <ul className="space-y-3">
                            {selectedMaterial.rules.naoPode.map((rule: string, i: number) => (
                                <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2 font-medium">
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 shrink-0"></span> {rule}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 text-center border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 font-medium flex justify-center items-center gap-2"><i className="fas fa-lightbulb text-yellow-500"></i> Dica: Limpe seus recicláveis antes de entregar.</p>
                </div>
            </div>
        </div>
      )}

      {/* === HERO SECTION === */}
      <section id="inicio" className="relative w-full h-[600px] md:h-[700px]">
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectFade]}
          effect="fade"
          loop={true}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          pagination={{ clickable: true, dynamicBullets: true }}
          navigation={{ nextEl: '.swiper-button-next-custom', prevEl: '.swiper-button-prev-custom' }}
          className="h-full w-full group"
        >
          <SwiperSlide>
            <div className="relative w-full h-full">
              <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1913&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover" alt="Mãos com Terra" />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/70 to-transparent flex items-center">
                <div className="container mx-auto px-6 md:px-12">
                  <div className="max-w-2xl text-white space-y-8 fade-in-up">
                    <h1 className="text-5xl md:text-7xl font-black leading-none tracking-tight drop-shadow-lg animate-float-slow">
                      Seu lixo vale <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-emerald-300 filter drop-shadow-md">Muito Mais.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-200 font-medium leading-relaxed max-w-lg drop-shadow-md fade-in-up delay-200">
                      Transforme garrafas e papéis em descontos reais. Junte-se ao ecossistema que recompensa quem cuida do planeta.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 fade-in-up delay-300">
                      <Link to="/cadastro" className="px-10 py-4 rounded-full bg-brand-green text-white font-bold text-lg shadow-lg shadow-brand-green/30 hover:shadow-brand-green/50 hover:scale-105 transition-all text-center btn-glow-green relative overflow-hidden group">
                        <span className="relative z-10">Começar Agora</span>
                        <div className="absolute inset-0 h-full w-full scale-0 rounded-full group-hover:scale-150 group-hover:bg-white/20 transition-all duration-500 ease-out pointer-events-none"></div>
                      </Link>
                      <Link to="/mapa" className="px-10 py-4 rounded-full border-2 border-white text-white font-bold text-lg hover:bg-white hover:text-gray-900 transition-all text-center backdrop-blur-sm bg-white/10">
                        Ver Pontos de Coleta
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="relative w-full h-full">
              <img src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=2070&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover" alt="Central de Reciclagem" />
              <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center text-center">
                <div className="container px-6">
                  <div className="max-w-3xl mx-auto text-white space-y-8 fade-in-up">
                    <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-white/30 shadow-xl animate-float-slow">
                      <i className="fas fa-graduation-cap text-5xl text-brand-green"></i>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black drop-shadow-lg fade-in-up">Domine a Reciclagem</h2>
                    <p className="text-xl text-gray-200 font-medium fade-in-up delay-200">
                      Não sabe o que pode ser reciclado? Nós te ensinamos com guias rápidos e práticos.
                    </p>
                    <div className="pt-6 fade-in-up delay-300">
                        <button className="px-10 py-3 rounded-full border-2 border-brand-green text-brand-green font-bold text-lg hover:bg-brand-green hover:text-white transition-all uppercase tracking-wider shadow-lg shadow-brand-green/10">EM BREVE</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
           <div className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-brand-green hover:border-brand-green hover:scale-110 transition-all cursor-pointer opacity-0 group-hover:opacity-100"><i className="fas fa-chevron-left text-2xl"></i></div>
           <div className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-brand-green hover:border-brand-green hover:scale-110 transition-all cursor-pointer opacity-0 group-hover:opacity-100"><i className="fas fa-chevron-right text-2xl"></i></div>
        </Swiper>
      </section>

      {/* === O CLUBE === */}
      <section id="clube-recycleme" className="py-24 bg-brand-dark relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-green/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-pulse-slow delay-1000"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black text-white drop-shadow-lg">O Clube <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-teal-400">Recycle_me</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg font-medium">Mais que um app, um estilo de vida. Veja o que você ganha ao fazer parte.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1: Gamificação (AGORA COM BOTÃO EM BREVE) */}
            <div className="group bg-gray-800/60 backdrop-blur-xl border border-gray-700/50 p-10 rounded-[2.5rem] hover:border-brand-green/50 transition-all duration-500 hover:-translate-y-3 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-green/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 flex flex-col h-full">
                  <div className="w-24 h-24 bg-gradient-to-br from-brand-green to-emerald-800 rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-brand-green/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <i className="fas fa-trophy text-4xl text-white drop-shadow"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-brand-green transition-colors">Gamificação Real</h3>
                  <p className="text-gray-400 leading-relaxed font-medium mb-6 flex-grow">Suba de nível, mantenha sua ofensiva diária e conquiste badges exclusivos para mostrar no seu perfil.</p>
                  
                  {/* BOTÃO EM BREVE (TRAVADO) */}
                  <div className="w-full py-3 bg-gray-700/50 text-gray-300 rounded-xl font-bold text-center uppercase tracking-wider border border-gray-600/50 cursor-not-allowed flex items-center justify-center gap-2 backdrop-blur-md transition-all group-hover:border-brand-green/30 group-hover:text-brand-green/70">
                       <i className="fas fa-lock text-sm"></i> Em Breve
                  </div>
              </div>
            </div>

            {/* Card 2: Marketplace (Link Ativo) */}
            <Link to="/clube" className="group bg-gray-800/80 backdrop-blur-xl border-2 border-blue-500/30 p-10 rounded-[2.5rem] hover:border-blue-500 transition-all duration-500 hover:-translate-y-4 shadow-2xl shadow-blue-900/20 relative overflow-hidden block cursor-pointer">
               <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
               <div className="relative z-10 flex flex-col h-full">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-blue-500/40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <i className="fas fa-shopping-bag text-4xl text-white drop-shadow"></i>
                  </div>
                  <h3 className="text-3xl font-black text-white mb-3 group-hover:text-blue-400 transition-colors">Marketplace</h3>
                  <p className="text-gray-300 leading-relaxed font-medium mb-8 flex-grow">Seus pontos valem dinheiro! Troque por vouchers no iFood, Uber, Amazon e muito mais.</p>
                  <div className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-center uppercase tracking-wider shadow-lg group-hover:bg-blue-500 transition-colors flex items-center justify-center gap-2">ACESSAR LOJA <i className="fas fa-arrow-right"></i></div>
               </div>
            </Link>

            {/* Card 3: Impacto Visual (AGORA COM BOTÃO EM BREVE) */}
            <div className="group bg-gray-800/60 backdrop-blur-xl border border-gray-700/50 p-10 rounded-[2.5rem] hover:border-purple-500/50 transition-all duration-500 hover:-translate-y-3 shadow-2xl relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
               <div className="relative z-10 flex flex-col h-full">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-700 rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-purple-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <i className="fas fa-chart-pie text-4xl text-white drop-shadow"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors">Impacto Visual</h3>
                  <p className="text-gray-400 leading-relaxed font-medium mb-6 flex-grow">Acompanhe métricas detalhadas. Saiba quantos litros de água e energia você economizou este ano.</p>
                  
                  {/* BOTÃO EM BREVE (TRAVADO) */}
                  <div className="w-full py-3 bg-gray-700/50 text-gray-300 rounded-xl font-bold text-center uppercase tracking-wider border border-gray-600/50 cursor-not-allowed flex items-center justify-center gap-2 backdrop-blur-md transition-all group-hover:border-purple-500/30 group-hover:text-purple-300/70">
                       <i className="fas fa-lock text-sm"></i> Em Breve
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* === COMO FUNCIONA (AGORA COM VÍDEOS DINÂMICOS) === */}
      <section id="como-funciona" className="py-24 bg-gray-50 dark:bg-gray-800 transition-colors duration-300 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row gap-20 items-center">
            
            {/* ÁREA DO SHOWCASE (MOCKUPS COM VÍDEO) */}
            <div className="w-full lg:w-1/2 flex flex-col items-center relative">
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-brand-green/40 blur-[100px] transition-all duration-700 rounded-full ${viewMode === 'mobile' ? 'opacity-100 scale-100' : 'opacity-50 scale-125'}`}></div>

                {/* Toggle Mobile/Desktop */}
                <div className="flex bg-white dark:bg-gray-800 p-1.5 rounded-full mb-10 shadow-md relative z-20 border border-gray-100 dark:border-gray-700">
                    <button onClick={() => setViewMode('mobile')} className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-3 ${viewMode === 'mobile' ? 'bg-brand-green text-white shadow-lg' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}><i className="fas fa-mobile-alt text-lg"></i> Mobile</button>
                    <button onClick={() => setViewMode('desktop')} className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-3 ${viewMode === 'desktop' ? 'bg-brand-green text-white shadow-lg' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}><i className="fas fa-laptop text-lg"></i> Desktop</button>
                </div>

                <div className="h-[600px] w-full flex items-center justify-center relative z-10">
                    
                    {/* MOCKUP CELULAR */}
                    <div className={`transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) absolute ${viewMode === 'mobile' ? 'opacity-100 scale-100 z-10 translate-y-0' : 'opacity-0 scale-75 z-0 translate-y-10 pointer-events-none'}`}>
                        <div className="relative mx-auto border-gray-900 dark:border-gray-700 bg-gray-900 border-[14px] rounded-[3rem] h-[630px] w-[320px] shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/10">
                            <div className="h-[32px] w-[3px] bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg"></div>
                            <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
                            <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
                            <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
                            
                            <div className="rounded-[2.5rem] overflow-hidden w-full h-full bg-white dark:bg-gray-800 relative group cursor-pointer">
                                {/* VÍDEO MOBILE */}
                                <video 
                                    key={activeStep} 
                                    src={STEPS_DATA[activeStep].videoMobile} 
                                    autoPlay 
                                    muted 
                                    loop 
                                    playsInline 
                                    className="w-full h-full object-cover transition-opacity duration-500 animate-fadeIn"
                                />
                                <div className="absolute inset-0 bg-black/10 mix-blend-multiply"></div>
                            </div>
                        </div>
                    </div>

                    {/* MOCKUP NOTEBOOK */}
                    <div className={`transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) absolute w-full max-w-[600px] ${viewMode === 'desktop' ? 'opacity-100 scale-100 z-10 translate-y-0' : 'opacity-0 scale-75 z-0 translate-y-10 pointer-events-none'}`}>
                        <div className="relative mx-auto border-gray-800 dark:border-gray-700 bg-gray-800 border-[12px] rounded-t-2xl h-[360px] w-full shadow-xl flex flex-col justify-start overflow-hidden ring-1 ring-white/10">
                            <div className="absolute top-[-6px] left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
                            
                            <div className="rounded-lg overflow-hidden w-full h-full bg-white relative group cursor-pointer">
                                {/* VÍDEO DESKTOP */}
                                <video 
                                    key={activeStep} 
                                    src={STEPS_DATA[activeStep].videoDesktop} 
                                    autoPlay 
                                    muted 
                                    loop 
                                    playsInline 
                                    className="w-full h-full object-cover transition-opacity duration-500 animate-fadeIn"
                                />
                                <div className="absolute inset-0 bg-black/10 mix-blend-multiply"></div>
                            </div>
                        </div>
                        <div className="relative mx-auto bg-gray-900 dark:bg-gray-700 rounded-b-2xl h-[24px] max-w-[700px] w-full shadow-2xl"></div>
                    </div>
                </div>
            </div>

            {/* LISTA DE PASSOS (CLICÁVEIS) */}
            <div className="w-full lg:w-1/2 space-y-12">
              <div className="space-y-4">
                  <span className="text-brand-green font-bold uppercase tracking-widest text-sm pl-2 border-l-4 border-brand-green">Passo a Passo</span>
                  <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight drop-shadow-sm">Reciclar nunca foi tão <span className="relative z-10 whitespace-nowrap text-brand-green">simples<svg className="absolute bottom-0 left-0 w-full h-3 text-brand-green/30 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 10 Q 25 0 50 10 T 100 10 V 10 H 0 Z" fill="currentColor"/></svg></span>.</h2>
              </div>
              <div className="space-y-6">
                {STEPS_DATA.map((step, i) => (
                    <div 
                        key={i} 
                        onClick={() => setActiveStep(i)} // CLIQUE AQUI MUDA O VÍDEO
                        className={`flex gap-6 group p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer relative overflow-hidden ${activeStep === i ? 'bg-white dark:bg-gray-800 border-brand-green/50 shadow-xl scale-105' : 'bg-transparent border-transparent hover:bg-white/50 dark:hover:bg-gray-800/50 hover:border-gray-200'}`}
                    >
                      {activeStep === i && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-green"></div>}
                      <div className="absolute right-0 top-0 text-8xl font-black text-gray-100 dark:text-gray-800/50 -z-10 -mr-4 -mt-4 transition-transform group-hover:scale-110 group-hover:text-brand-green/10">{step.num}</div>
                      <div className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold transition-all shadow-sm group-hover:rotate-6 ${activeStep === i ? 'bg-brand-green text-white' : 'bg-brand-green/10 text-brand-green group-hover:bg-brand-green group-hover:text-white'}`}><i className={`fas ${step.icon}`}></i></div>
                      <div>
                          <h3 className={`text-xl font-bold transition-colors mb-2 ${activeStep === i ? 'text-brand-green' : 'text-gray-800 dark:text-white group-hover:text-brand-green'}`}>{step.title}</h3>
                          <p className="text-gray-600 dark:text-gray-300 font-medium leading-relaxed">{step.text}</p>
                      </div>
                    </div>
                ))}
              </div>
              <Link to="/cadastro" className="inline-flex items-center gap-3 px-10 py-4 bg-brand-green text-white rounded-full font-bold text-lg shadow-lg shadow-brand-green/30 hover:shadow-brand-green/40 hover:-translate-y-1 transition-all btn-glow-green relative overflow-hidden group">
                <span className="relative z-10">Começar agora <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i></span>
                <div className="absolute inset-0 h-full w-full scale-0 rounded-full group-hover:scale-150 group-hover:bg-white/20 transition-all duration-500 ease-out pointer-events-none"></div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* === O QUE ACEITAMOS (MODAL) === */}
      <section id="o-que-reciclar" className="py-24 bg-white dark:bg-gray-900 transition-colors duration-300 border-t border-gray-100 dark:border-gray-800 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white drop-shadow-sm">O que aceitamos?</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium max-w-2xl mx-auto">Focamos nos materiais de maior impacto ambiental.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {MATERIALS_INFO.map((item, idx) => (
              <div key={idx} onClick={() => setSelectedMaterial(item)} className="group/card relative rounded-[2.5rem] overflow-hidden h-80 md:h-[420px] cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-4 border-white dark:border-gray-800 ring-1 ring-gray-100 dark:ring-gray-700 isolate transform-gpu">
                <div className="absolute top-0 -left-[100%] w-1/2 h-full z-20 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 transition-all duration-1000 group-hover/card:left-[150%] pointer-events-none"></div>
                <img src={item.img} alt={item.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110 scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-transparent group-hover/card:via-gray-900/70 transition-colors flex flex-col justify-end p-8 text-white z-10">
                   <div className="bg-white/20 backdrop-blur-md w-16 h-16 rounded-3xl flex items-center justify-center mb-6 transform group-hover/card:-translate-y-3 transition-all duration-500 border border-white/40 shadow-lg animate-float-slow"><i className={`fas ${item.icon} text-3xl drop-shadow-lg`}></i></div>
                   <h3 className="text-3xl font-black mb-3 transform group-hover/card:-translate-y-2 transition-transform duration-500 drop-shadow-lg">{item.name}</h3>
                   <p className="text-gray-200 text-base font-medium opacity-0 group-hover/card:opacity-100 transform translate-y-8 group-hover/card:translate-y-0 transition-all duration-500 delay-100 leading-snug">Clique para ver regras</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}

export default HomePage;