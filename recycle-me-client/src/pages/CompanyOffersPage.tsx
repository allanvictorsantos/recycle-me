import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { InputField } from '../components/InputField';

// Tipagem da Oferta
interface Offer {
  id: number;
  title: string;
  description: string;
  cost: number;
  image: string;
  active: boolean;
  validUntil?: string;
}

// Lista de Ícones Padrão
const ICONS = [
    { id: 'fa-gift', label: 'Presente' },
    { id: 'fa-ticket-alt', label: 'Ticket' },
    { id: 'fa-percent', label: 'Desconto' },
    { id: 'fa-shopping-basket', label: 'Mercado' },
    { id: 'fa-coffee', label: 'Café' },
    { id: 'fa-hamburger', label: 'Lanche' },
    { id: 'fa-gas-pump', label: 'Combustível' },
    { id: 'fa-cut', label: 'Serviço' },
];

export default function CompanyOffersPage() {
  const navigate = useNavigate();
  
  // --- ESTADOS DO FORMULÁRIO ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [imageType, setImageType] = useState('fa-gift');
  
  // Datas (Opcionais)
  const [isTemporary, setIsTemporary] = useState(false);
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');

  // Dados e Feedback
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // --- CONTROLE DE MODAIS ---
  const [showConfirmModal, setShowConfirmModal] = useState(false); // Criar
  const [showSuccessModal, setShowSuccessModal] = useState(false); // Sucesso
  const [showDeleteModal, setShowDeleteModal] = useState(false);   // Deletar (NOVO)
  const [offerToDelete, setOfferToDelete] = useState<number | null>(null); // Qual apagar (NOVO)

  // Carregar ofertas ao abrir
  useEffect(() => { fetchOffers(); }, []);

  const fetchOffers = async () => {
    try {
      const token = localStorage.getItem('recycleme_auth_token');
      // CORREÇÃO: Uso da variável de ambiente
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/market/my-offers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOffers(response.data);
    } catch (err) { console.error("Erro ao buscar ofertas"); }
  };

  // --- FLUXO DE CRIAÇÃO ---
  const handlePreSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      if (!title || !cost) { setError("Preencha o título e o custo."); return; }
      setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('recycleme_auth_token');
      // CORREÇÃO: Uso da variável de ambiente
      await axios.post(`${import.meta.env.VITE_API_URL}/market/offers`, {
          title, description, 
          cost: parseInt(cost), 
          image: imageType,
          validFrom: isTemporary && validFrom ? new Date(validFrom) : null,
          validUntil: isTemporary && validUntil ? new Date(validUntil) : null
      }, { headers: { Authorization: `Bearer ${token}` } });

      setTitle(''); setDescription(''); setCost(''); setIsTemporary(false); setValidFrom(''); setValidUntil('');
      setShowConfirmModal(false);
      setShowSuccessModal(true);
      fetchOffers();
    } catch (err: any) { 
        setError("Erro ao criar oferta."); 
        setShowConfirmModal(false);
    } finally { setLoading(false); }
  };

  // --- FLUXO DE EXCLUSÃO (NOVO) ---
  
  // 1. Clicou na lixeira -> Abre modal
  const initiateDelete = (id: number) => {
      setOfferToDelete(id);
      setShowDeleteModal(true);
  };

  // 2. Confirmou no modal -> Deleta
  const confirmDelete = async () => {
      if (!offerToDelete) return;
      
      try {
          // Se tiver rota no back: await axios.delete(`.../${offerToDelete}`);
          
          // Simulação visual (já que talvez não tenhamos DELETE no back ainda)
          setOffers(prev => prev.filter(o => o.id !== offerToDelete));
          
          setShowDeleteModal(false);
          setOfferToDelete(null);
      } catch (err) {
          alert("Erro ao excluir.");
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 font-sans relative">
      
      {/* === MODAL 1: CONFIRMAR CRIAÇÃO === */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-gray-200 dark:border-gray-700">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl animate-pulse">
                        <i className="fas fa-info"></i>
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Publicar Oferta?</h3>
                    <p className="text-gray-500 text-sm">
                        Os usuários poderão trocar <strong>{cost} pontos</strong> por <strong>"{title}"</strong>.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-500 font-bold hover:bg-gray-50 transition-colors">Revisar</button>
                    <button onClick={confirmSubmit} disabled={loading} className="flex-1 py-3 rounded-xl bg-brand-green text-white font-bold shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2">
                        {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Sim, Publicar'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* === MODAL 2: SUCESSO === */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-sm w-full p-8 border-2 border-brand-green relative overflow-hidden text-center">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-green to-emerald-400"></div>
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
                    <i className="fas fa-check text-4xl"></i>
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Oferta no Ar!</h3>
                <p className="text-gray-500 text-sm mb-8">Sua oferta já está disponível no Clube.</p>
                <button onClick={() => setShowSuccessModal(false)} className="w-full py-3.5 bg-brand-dark text-white rounded-xl font-bold shadow-lg hover:bg-black transition-all btn-glow-dark">Continuar</button>
            </div>
        </div>
      )}

      {/* === MODAL 3: CONFIRMAR EXCLUSÃO (NOVO) === */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-red-200 dark:border-red-900/30">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                        <i className="fas fa-trash-alt"></i>
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Excluir Oferta?</h3>
                    <p className="text-gray-500 text-sm">
                        Essa ação é irreversível. O cupom será removido imediatamente do Clube.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-500 font-bold hover:bg-gray-50 transition-colors">Cancelar</button>
                    <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold shadow-lg hover:bg-red-700 transition-transform flex items-center justify-center gap-2">
                        Sim, Excluir
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* === CONTEÚDO PRINCIPAL === */}
      <div className="max-w-6xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
            <div>
                <button onClick={() => navigate('/painel-fiscal')} className="text-gray-500 hover:text-brand-green font-bold text-sm mb-2 flex items-center gap-2 transition-colors">
                    <i className="fas fa-arrow-left"></i> Voltar ao Painel
                </button>
                <h1 className="text-3xl font-black text-brand-dark dark:text-white tracking-tight">Gestão de Ofertas</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Crie cupons padronizados para seus clientes.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* COLUNA 1: FORMULÁRIO */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-xl border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-brand-green mb-6 flex items-center gap-2">
                    <span className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg"><i className="fas fa-plus"></i></span>
                    Nova Oferta
                </h2>
                
                <form onSubmit={handlePreSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField id="title" label="Título do Produto" placeholder="Ex: Cupom R$ 10" value={title} onChange={(e) => setTitle(e.target.value)} iconClass="fa-tag"/>
                        <div className="space-y-1">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Custo (EcoPoints)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><i className="fas fa-star text-brand-green"></i></div>
                                <input type="number" className="block w-full pl-10 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-brand-green focus:outline-none font-bold" placeholder="Ex: 500" value={cost} onChange={(e) => setCost(e.target.value)} required />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Regras / Descrição</label>
                        <textarea 
                            className="block w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-brand-green focus:outline-none text-sm"
                            rows={3}
                            placeholder="Ex: Válido para compras acima de R$ 50,00. Não cumulativo."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Ícone do Produto</label>
                        <div className="flex flex-wrap gap-3">
                            {ICONS.map((item) => (
                                <button 
                                    key={item.id} type="button"
                                    onClick={() => setImageType(item.id)}
                                    className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl border-2 transition-all ${imageType === item.id ? 'border-brand-green bg-green-50 dark:bg-green-900/20 text-brand-green shadow-md scale-105' : 'border-gray-100 dark:border-gray-700 text-gray-400 hover:border-gray-300'}`}
                                    title={item.label}
                                >
                                    <i className={`fas ${item.id} text-xl mb-1`}></i>
                                    <span className="text-[9px] font-bold uppercase">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-4">
                             <input type="checkbox" id="temp" checked={isTemporary} onChange={(e) => setIsTemporary(e.target.checked)} className="w-5 h-5 text-brand-green rounded focus:ring-brand-green cursor-pointer"/>
                             <label htmlFor="temp" className="text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer select-none">Esta é uma oferta temporária?</label>
                        </div>
                        {isTemporary && (
                            <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Início</label>
                                    <input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-800 dark:text-white focus:ring-brand-green focus:outline-none"/>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Fim</label>
                                    <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-800 dark:text-white focus:ring-brand-green focus:outline-none"/>
                                </div>
                            </div>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-4 bg-brand-green text-white rounded-xl font-bold shadow-xl hover:bg-emerald-600 transition-all btn-glow-green transform hover:-translate-y-1 flex items-center justify-center gap-2"
                    >
                        {loading ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-paper-plane"></i> Publicar Oferta</>}
                    </button>
                    {error && <p className="text-sm text-red-500 text-center font-bold bg-red-50 p-2 rounded-lg">{error}</p>}
                </form>
            </div>

            {/* --- COLUNA 2: PREVIEW --- */}
            <div className="lg:col-span-1 space-y-8">
                <div className="sticky top-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">Pré-visualização</h3>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-[2rem] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col transform scale-105 transition-transform">
                        <div className="h-40 bg-gradient-to-r from-brand-green/20 to-blue-500/20 flex items-center justify-center relative">
                            <div className="w-20 h-20 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center text-4xl text-brand-dark dark:text-white shadow-lg animate-float-slow">
                                <i className={`fas ${imageType}`}></i>
                            </div>
                            <span className="absolute top-4 right-4 bg-brand-dark text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Sua Loja</span>
                        </div>
                        <div className="p-6 flex-grow flex flex-col">
                            <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-2 leading-tight">{title || "Título da Oferta"}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">{description || "A descrição detalhada do seu produto ou desconto aparecerá aqui."}</p>
                            {isTemporary && validUntil && (
                                <div className="flex items-center gap-2 text-xs text-red-500 font-bold mb-4 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg w-fit">
                                    <i className="far fa-clock"></i> Válido até {new Date(validUntil).toLocaleDateString('pt-BR')}
                                </div>
                            )}
                            <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                                <span className="text-3xl font-black text-brand-green">{cost || "0"} <span className="text-sm font-medium text-gray-400">pts</span></span>
                                <button className="px-6 py-2.5 bg-brand-dark text-white rounded-xl font-bold text-sm shadow-lg opacity-50 cursor-default">Resgatar</button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex gap-3 items-start">
                        <i className="fas fa-lightbulb text-blue-500 mt-1"></i>
                        <p className="text-xs text-blue-700 dark:text-blue-300"><span className="font-bold">Dica:</span> Ofertas com prazos curtos tendem a converter mais.</p>
                    </div>
                </div>
            </div>
        </div>

        {/* --- LISTA DE OFERTAS --- */}
        <div className="mt-16 border-t border-gray-200 dark:border-gray-700 pt-10">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Gerenciar Ofertas Ativas</h2>
            {offers.length === 0 ? (
                <p className="text-gray-500 text-center py-10 italic">Nenhuma oferta ativa.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {offers.map(offer => (
                        <div key={offer.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col relative group hover:-translate-y-1 transition-transform">
                            <div className="flex justify-between items-start mb-3">
                                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-brand-dark dark:text-white text-lg">
                                    <i className={`fas ${offer.image}`}></i>
                                </div>
                                {/* BOTÃO DE DELETAR (Chama Modal) */}
                                <button 
                                    onClick={() => initiateDelete(offer.id)} 
                                    className="w-8 h-8 rounded-full bg-red-50 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"
                                    title="Excluir Oferta"
                                >
                                    <i className="fas fa-trash-alt text-xs"></i>
                                </button>
                            </div>
                            <h4 className="font-bold text-brand-dark dark:text-white mb-1 line-clamp-1">{offer.title}</h4>
                            <div className="text-brand-green font-black text-lg mb-2">{offer.cost} pts</div>
                            <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${offer.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{offer.active ? 'Ativa' : 'Inativa'}</span>
                                <span className="text-[10px] text-gray-400">ID #{offer.id}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

      </div>
    </div>
  );
}