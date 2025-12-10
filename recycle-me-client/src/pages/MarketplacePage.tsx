import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom'; // 1. Adicionado useLocation

export default function MarketplacePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation(); // 2. Inicializa o hook para saber "onde estou"

    const [offers, setOffers] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [currentPoints, setCurrentPoints] = useState(0);

    // Estados para os Modais
    const [selectedOffer, setSelectedOffer] = useState<any>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('recycleme_auth_token');

                // CORREÇÃO: Uso da variável de ambiente
                const resOffers = await axios.get(`${import.meta.env.VITE_API_URL}/market/offers`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                setOffers(resOffers.data);

                if (token && user) {
                    // CORREÇÃO: Uso da variável de ambiente
                    const resProfile = await axios.get(`${import.meta.env.VITE_API_URL}/profile/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setCurrentPoints(resProfile.data.points);
                }

            } catch (e) {
                console.error("Erro ao carregar dados:", e);
            }
        };
        fetchData();
    }, [user]);

    const initiateRedeem = (offer: any) => {
        if (!user) {
            // 3. MUDANÇA AQUI: Se não tá logado, manda pro login COM MEMÓRIA de onde veio
            if (window.confirm("Faça login para resgatar essa oferta.")) {
                navigate('/login', { state: { from: location } });
            }
            return;
        }
        setSelectedOffer(offer);
        setShowConfirmModal(true);
    };

    const handleConfirmRedeem = async () => {
        if (!selectedOffer) return;
        setIsProcessing(true);

        try {
            const token = localStorage.getItem('recycleme_auth_token');
            // CORREÇÃO: Uso da variável de ambiente
            await axios.post(`${import.meta.env.VITE_API_URL}/market/redeem`, { offerId: selectedOffer.id }, { headers: { Authorization: `Bearer ${token}` } });

            setShowConfirmModal(false);
            setShowSuccessModal(true);

            setCurrentPoints(prev => prev - selectedOffer.cost);

        } catch (err: any) {
            alert(err.response?.data?.message || "Erro ao resgatar.");
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredOffers = offers.filter(o =>
        o.title.toLowerCase().includes(search.toLowerCase()) ||
        o.market.tradeName?.toLowerCase().includes(search.toLowerCase()) ||
        o.market.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 font-sans relative">

            {/* MODAL DE CONFIRMAÇÃO */}
            {showConfirmModal && selectedOffer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-gray-200 dark:border-gray-700 transform transition-all scale-100">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                                <i className="fas fa-question"></i>
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Confirmar Resgate?</h3>
                            <p className="text-gray-500 text-sm">
                                Você vai trocar <span className="font-bold text-brand-dark dark:text-white">{selectedOffer.cost} pts</span> por: <br />
                                <span className="text-brand-green font-bold">{selectedOffer.title}</span>
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-500 font-bold hover:bg-gray-50 transition-colors">Cancelar</button>
                            <button
                                onClick={handleConfirmRedeem}
                                disabled={isProcessing}
                                className="flex-1 py-3 rounded-xl bg-brand-green text-white font-bold shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
                            >
                                {isProcessing ? <i className="fas fa-spinner fa-spin"></i> : 'Sim, Resgatar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE SUCESSO */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-sm w-full p-8 border-2 border-brand-green relative overflow-hidden text-center">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-green to-emerald-400"></div>

                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
                            <i className="fas fa-check text-4xl"></i>
                        </div>

                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Resgate Realizado!</h3>
                        <p className="text-gray-500 text-sm mb-8">Seu cupom já está disponível na sua carteira digital.</p>

                        <div className="space-y-3">
                            <button onClick={() => navigate('/perfil')} className="w-full py-3.5 bg-brand-dark text-white rounded-xl font-bold shadow-lg hover:bg-black transition-all btn-glow-dark">
                                Ver Meus Cupons
                            </button>
                            <button onClick={() => { setShowSuccessModal(false); }} className="w-full py-3 text-gray-400 hover:text-gray-600 font-bold text-sm">
                                Continuar na Loja
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-black text-brand-dark dark:text-white mb-4">Clube de <span className="text-brand-green">Vantagens</span></h1>
                    <p className="text-gray-500 dark:text-gray-400">Troque seus EcoPoints por descontos em nossos parceiros.</p>

                    {/* SALDO E LOGIN */}
                    <div className="inline-flex items-center gap-2 bg-brand-dark text-white px-6 py-2 rounded-full mt-6 shadow-lg">
                        <span className="text-sm font-medium">Seu Saldo:</span>
                        {user ? (
                            <span className="text-xl font-bold text-brand-green">{currentPoints} pts</span>
                        ) : (
                            // 4. MUDANÇA AQUI: Link de login também leva memória
                            <Link
                                to="/login"
                                state={{ from: location }}
                                className="text-sm font-bold text-brand-green hover:underline"
                            >
                                Faça login para ver
                            </Link>
                        )}
                    </div>
                </div>

                {/* BARRA DE BUSCA */}
                <div className="max-w-md mx-auto mb-10 relative">
                    <i className="fas fa-search absolute left-4 top-3.5 text-gray-400"></i>
                    <input
                        type="text"
                        placeholder="Buscar oferta ou nome da loja..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-brand-dark dark:text-white focus:ring-2 focus:ring-brand-green focus:outline-none shadow-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* GRID DE OFERTAS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOffers.map(offer => (
                        <div key={offer.id} className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 border border-gray-100 dark:border-gray-700 flex flex-col">
                            <div className="h-32 bg-gradient-to-r from-brand-green/10 to-blue-500/10 flex items-center justify-center relative">
                                <div className="w-16 h-16 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center text-3xl text-brand-dark dark:text-white shadow-md">
                                    <i className={`fas ${offer.image || 'fa-gift'}`}></i>
                                </div>
                                <span className="absolute top-4 right-4 bg-brand-dark text-white text-xs font-bold px-3 py-1 rounded-full">
                                    {offer.market.tradeName || offer.market.name}
                                </span>
                            </div>

                            <div className="p-6 flex-grow flex flex-col">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{offer.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-grow">{offer.description || "Sem descrição."}</p>

                                {offer.validUntil && (
                                    <div className="flex items-center gap-2 text-xs text-red-500 font-bold mb-4 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg w-fit">
                                        <i className="far fa-clock"></i> Válido até {new Date(offer.validUntil).toLocaleDateString()}
                                    </div>
                                )}

                                <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <span className="text-2xl font-black text-brand-green">{offer.cost} <span className="text-sm font-medium text-gray-400">pts</span></span>

                                    <button
                                        onClick={() => initiateRedeem(offer)}
                                        disabled={Boolean(!user || currentPoints < offer.cost)} className={`px-6 py-2 rounded-xl font-bold text-sm transition-colors shadow-lg ${(!user || currentPoints >= offer.cost)
                                                ? 'bg-brand-dark text-white hover:bg-black btn-glow-dark'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                    >
                                        {!user ? 'Login Necessário' : (currentPoints >= offer.cost ? 'Resgatar' : 'Saldo Insuficiente')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}