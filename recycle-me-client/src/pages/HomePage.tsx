import { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom'; // Importamos useLocation e Link
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

function HomePage() {
  const location = useLocation();

  // Efeito para o Swiper (Carrossel)
  useEffect(() => {
    // É uma boa prática verificar se o elemento existe antes de inicializar
    const swiperEl = document.querySelector('.swiper-container');
    let swiper: Swiper | null = null;
    if (swiperEl) {
      swiper = new Swiper('.swiper-container', {
        modules: [Navigation, Pagination, Autoplay],
        loop: true,
        autoplay: { delay: 7000, disableOnInteraction: false },
        pagination: { el: '.swiper-pagination-custom', clickable: true },
        navigation: {
          nextEl: '.swiper-button-next-custom',
          prevEl: '.swiper-button-prev-custom',
        },
      });
    }
    
    // Limpeza: Destrói a instância do Swiper quando o componente é desmontado
    return () => {
      swiper?.destroy();
    };
  }, []); // O array vazio [] garante que este efeito rode apenas UMA VEZ.

  // NOVO: Efeito que "ouve" por recados de rolagem
  useEffect(() => {
    // Verifica se recebemos um "post-it" (state) com um recado (scrollToId)
    if (location.state?.scrollToId) {
      const element = document.getElementById(location.state.scrollToId);
      if (element) {
        // Se encontramos o elemento, rolamos a tela até ele
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]); // Este efeito roda toda vez que a localização (URL ou state) muda.

  return (
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
                          <Link to="/mapa" className="px-6 sm:px-8 py-3 text-sm sm:text-base whitespace-nowrap rounded-full bg-brand-green text-white font-bold shadow-lg hover:scale-105 transform transition-all duration-300 btn-glow-green">Encontrar Pontos de Coleta</Link>
                          <Link to="/cadastro" className="btn-fill-green px-6 sm:px-8 py-3 text-sm sm:text-base whitespace-nowrap rounded-full bg-white text-brand-dark font-bold shadow-lg hover:scale-105 transform transition-transform"><span>Cadastre-se</span></Link>
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
      
      <div className="border-b-2 border-gray-200 dark:border-gray-700 my-8 md:my-16"></div>

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
  );
}

export default HomePage;

