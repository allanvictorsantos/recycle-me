import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // 1. Importamos o navigate
import { useAuth } from '../context/AuthContext';

// Helper de ícones
const getMaterialIcon = (material: string) => {
  switch (material?.toLowerCase()) {
    case 'vidro': return 'fa-wine-bottle';
    case 'papel': return 'fa-newspaper';
    case 'plastico': return 'fa-bottle-water';
    case 'metal': return 'fa-can-food';
    default: return 'fa-box';
  }
};

export default function MarketDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate(); // 2. Inicializamos o hook
  
  const [tokenId, setTokenId] = useState('');
  const [transaction, setTransaction] = useState<any>(null);
  const [finalWeight, setFinalWeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Stats Reais
  const [stats, setStats] = useState({ dailyCount: 0, totalWeight: 0, totalPoints: 0 });
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('recycleme_auth_token');
            const response = await axios.get('http://localhost:3000/transactions/market/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data);
        } catch (e) { console.log("Erro ao carregar stats"); }
    };
    fetchStats();
  }, [success]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenId) return;
    setLoading(true); setError(null); setTransaction(null); setSuccess(null);
    try {
      const token = localStorage.getItem('recycleme_auth_token');
      const response = await axios.get(`http://localhost:3000/transactions/${tokenId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransaction(response.data);
      setFinalWeight((response.data.weightInKg || 0).toString());
    } catch (err: any) {
      setError(err.response?.data?.message || 'Pedido não encontrado.');
    } finally { setLoading(false); }
  };

  const handleConfirm = async () => {
    if (!transaction || !finalWeight || parseFloat(finalWeight) <= 0) {
        setError("Peso inválido."); return;
    }
    setLoading(true); setError(null);
    try {
      const token = localStorage.getItem('recycleme_auth_token');
      await axios.patch(`http://localhost:3000/transactions/${transaction.id}/confirm`, 
        { finalWeight: parseFloat(finalWeight) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(`Sucesso! Pontos enviados.`);
      
      setHistory(prev => [{
          id: transaction.id, user: transaction.user.name, material: transaction.materialType, 
          weight: `${finalWeight}kg`, time: 'Agora' 
      }, ...prev]);

      setTransaction(null); setTokenId(''); setFinalWeight('');
    } catch (err: any) { 
        setError(err.response?.data?.message || 'Erro ao validar.'); 
    } finally { setLoading(false); }
  };

  const adjustWeight = (amount: number) => {
    setFinalWeight((prev) => {
        const current = parseFloat(prev || '0');
        const next = Math.max(0.1, current + amount);
        return next.toFixed(1);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-8 font-sans">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-8 animate-fadeIn">
        <div className="flex justify-between items-end mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
          <div>
            <h1 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight">Painel do Parceiro</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gerencie coletas e impulsione a reciclagem.</p>
          </div>
          <div className="flex gap-3">
              {/* --- 3. BOTÃO CONECTADO AGORA --- */}
              <button 
                onClick={() => navigate('/minhas-ofertas')} 
                className="text-sm font-bold text-white bg-brand-dark px-4 py-2 rounded-lg hover:bg-black transition-colors shadow-md flex items-center gap-2"
              >
                <i className="fas fa-tags"></i> Criar Ofertas
              </button>
              
              <button onClick={logout} className="text-sm font-bold text-red-500 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                Sair
              </button>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-5 transition-transform hover:-translate-y-1">
            <div className="p-4 bg-green-100 text-green-600 rounded-2xl"><i className="fas fa-recycle text-3xl"></i></div>
            <div><p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Coletas Hoje</p><p className="text-3xl font-black text-gray-800 dark:text-white">{stats.dailyCount}</p></div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-5 transition-transform hover:-translate-y-1">
            <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl"><i className="fas fa-weight-hanging text-3xl"></i></div>
            <div><p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Kg Recebidos</p><p className="text-3xl font-black text-gray-800 dark:text-white">{stats.totalWeight.toFixed(1)} <span className="text-sm text-gray-400">kg</span></p></div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-5 transition-transform hover:-translate-y-1">
            <div className="p-4 bg-purple-100 text-purple-600 rounded-2xl"><i className="fas fa-star text-3xl"></i></div>
            <div><p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Pts Distribuídos</p><p className="text-3xl font-black text-gray-800 dark:text-white">{stats.totalPoints}</p></div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* --- ESQUERDA: VALIDAÇÃO (8 colunas) --- */}
          <div className="lg:col-span-8 space-y-6">
            
            {(error || success) && (
              <div className={`p-4 rounded-xl text-center font-bold animate-slideDown shadow-md ${error ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                {error ? <i className="fas fa-exclamation-triangle mr-2"></i> : <i className="fas fa-check-circle mr-2"></i>}
                {error || success}
              </div>
            )}

            {/* CONTAINER DE BUSCA */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 relative overflow-hidden min-h-[400px] flex flex-col justify-center items-center">
              
              {!transaction ? (
                <div className="text-center w-full max-w-md">
                  <div className="mb-6">
                    <span className="inline-block p-3 rounded-full bg-gray-100 dark:bg-gray-700 mb-3"><i className="fas fa-qrcode text-2xl text-gray-400"></i></span>
                    <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-1">Validar Coleta</h2>
                    <p className="text-gray-500 text-sm">Insira o código de entrega.</p>
                  </div>
                  
                  <form onSubmit={handleSearch} className="relative w-full">
                    <input 
                      type="number" 
                      className="w-full text-center text-6xl font-black tracking-widest p-6 border-2 border-gray-200 dark:border-gray-600 rounded-3xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:outline-none focus:border-brand-green focus:ring-4 focus:ring-green-500/20 transition-all placeholder-gray-200"
                      placeholder="000"
                      value={tokenId}
                      onChange={(e) => setTokenId(e.target.value)}
                      autoFocus
                    />
                    <button 
                      type="submit" 
                      disabled={!tokenId || loading}
                      className="w-full mt-6 py-5 bg-brand-dark hover:bg-black text-white rounded-2xl font-bold text-xl shadow-lg transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-search"></i>}
                      {loading ? 'Buscando...' : 'BUSCAR'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="animate-fadeIn w-full max-w-lg">
                   <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-2xl border-2 border-brand-green/30 relative">
                        {/* Header do Cliente */}
                        <div className="bg-gradient-to-b from-brand-green/10 to-transparent p-8">
                            <div className="flex justify-between items-start mb-4">
                                <span className="flex items-center gap-2 text-xs font-bold text-brand-green uppercase tracking-wider bg-white dark:bg-gray-900 px-3 py-1.5 rounded-full shadow-sm">
                                    <i className="fas fa-user-check"></i> Identificado
                                </span>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full">
                                    #{transaction.id}
                                </span>
                            </div>
                            <h3 className="text-3xl md:text-4xl font-black text-gray-800 dark:text-white leading-tight mb-3 truncate">
                                {transaction.user.name}
                            </h3>
                            <div className="inline-flex items-center gap-2 bg-brand-green text-white px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wider shadow-sm">
                                <i className={`fas ${getMaterialIcon(transaction.materialType)}`}></i>
                                {transaction.materialType}
                            </div>
                        </div>

                        <div className="p-6 pt-2">
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 mb-6 border border-gray-100 dark:border-gray-700 relative">
                                <label className="block text-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
                                    <i className="fas fa-balance-scale"></i> Confirmar Peso Real
                                </label>
                                
                                <div className="flex items-center justify-between gap-4">
                                <button onClick={() => adjustWeight(-0.5)} className="w-14 h-14 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-400 hover:text-brand-dark hover:border-brand-dark transition-all flex items-center justify-center text-xl shadow-sm active:scale-95"><i className="fas fa-minus"></i></button>
                                <div className="flex-1 relative text-center flex justify-center items-baseline">
                                    <input type="number" step="0.1" value={finalWeight} onChange={(e) => setFinalWeight(e.target.value)} className="w-32 text-center text-5xl font-black bg-transparent focus:border-b-2 focus:border-brand-green outline-none dark:text-white p-2 z-10" />
                                    <span className="text-xl font-bold text-gray-400 ml-1">KG</span>
                                </div>
                                <button onClick={() => adjustWeight(+0.5)} className="w-14 h-14 rounded-full bg-brand-green text-white hover:bg-green-600 transition-all flex items-center justify-center text-xl shadow-lg active:scale-95"><i className="fas fa-plus"></i></button>
                                </div>
                                <div className="text-center mt-4 animate-pulse"><span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">Estimativa:</span><span className="text-lg font-black text-brand-green">+{Math.floor((parseFloat(finalWeight || '0') * 100))} Pts</span></div>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => { setTransaction(null); setError(null); }} className="flex-1 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl text-gray-500 font-bold hover:bg-gray-100 transition-all uppercase tracking-wider text-xs">Cancelar</button>
                                <button onClick={handleConfirm} disabled={loading} className="flex-[2] py-4 bg-brand-green text-white rounded-2xl font-bold hover:scale-[1.02] transition-transform shadow-lg btn-glow-green flex items-center justify-center gap-2 uppercase tracking-wider text-xs">{loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check"></i>} CONFIRMAR</button>
                            </div>
                        </div>
                    </div>
                </div>
              )}
            </div>
          </div>

          {/* --- DIREITA: SIDEBAR (4 colunas) --- */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Histórico com Altura Fixa e Scroll */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 h-[500px] flex flex-col">
              <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2 uppercase text-xs tracking-wider border-b pb-2 border-gray-100 dark:border-gray-700 shrink-0">
                <i className="fas fa-clock text-brand-green"></i> Histórico Recente
              </h3>
              <div className="space-y-3 overflow-y-auto flex-grow pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                {history.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm py-10">Nenhuma coleta realizada hoje.</p>
                ) : (
                    history.map((item: any, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-transparent hover:border-brand-green/30 transition-colors group">
                        <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-brand-dark font-bold shadow-sm group-hover:bg-brand-green group-hover:text-white transition-colors">
                            {item.user.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-gray-800 dark:text-white leading-none truncate w-[100px]">{item.user.split(' ')[0]}</p>
                            <p className="text-[10px] text-gray-400 uppercase font-bold mt-1">{item.material} • {item.weight}</p>
                        </div>
                        </div>
                        <span className="text-xs font-black text-green-600 whitespace-nowrap">+{Math.floor(parseFloat(item.weight.replace('kg','')) * 100)}</span>
                    </div>
                    ))
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}