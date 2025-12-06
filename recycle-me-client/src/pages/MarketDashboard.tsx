import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// --- DADOS MOCKADOS (Gráfico Bonito) ---
const dataGrafico = [
  { dia: 'Seg', kg: 45 },
  { dia: 'Ter', kg: 80 },
  { dia: 'Qua', kg: 112 },
  { dia: 'Qui', kg: 90 },
  { dia: 'Sex', kg: 145 },
  { dia: 'Sáb', kg: 70 },
  { dia: 'Dom', kg: 30 },
];

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
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const [tokenId, setTokenId] = useState('');
  const [transaction, setTransaction] = useState<any>(null);
  const [finalWeight, setFinalWeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  // Custom Tooltip do Gráfico
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 text-white p-3 rounded-lg shadow-xl border border-gray-700">
          <p className="text-sm font-bold mb-1">{label}</p>
          <p className="text-brand-green font-black text-lg">{payload[0].value} kg</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-8 font-sans transition-colors duration-300">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-8 animate-fadeIn">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 border-b border-gray-200 dark:border-gray-800 pb-6 gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Painel do Parceiro</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Visão geral de desempenho e operações.</p>
          </div>
          <div className="flex gap-3">
              <button onClick={() => navigate('/minhas-ofertas')} className="px-5 py-2.5 bg-brand-green text-white rounded-xl font-bold shadow-lg hover:bg-emerald-600 transition-all flex items-center gap-2 transform hover:-translate-y-0.5">
                <i className="fas fa-tags"></i> Gerenciar Ofertas
              </button>
              <button onClick={logout} className="px-5 py-2.5 border-2 border-red-100 text-red-500 rounded-xl font-bold hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20 transition-all flex items-center gap-2">
                <i className="fas fa-sign-out-alt"></i> Sair
              </button>
          </div>
        </div>

        {/* --- SEÇÃO DE ANALYTICS (NOVO LAYOUT) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* 1. Stats Cards (Empilhados na esquerda) */}
            <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4 h-full">
                {/* Card 1 */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border-l-4 border-brand-green flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Coletas Hoje</p>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white">{stats.dailyCount}</h3>
                    </div>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-brand-green text-xl">
                        <i className="fas fa-recycle"></i>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border-l-4 border-blue-500 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Reciclado</p>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white">{stats.totalWeight.toFixed(0)} <span className="text-sm text-gray-400 font-medium">kg</span></h3>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-500 text-xl">
                        <i className="fas fa-weight-hanging"></i>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border-l-4 border-purple-500 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">EcoPoints Gerados</p>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white">{stats.totalPoints}</h3>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-500 text-xl">
                        <i className="fas fa-star"></i>
                    </div>
                </div>
            </div>

            {/* 2. O Gráfico (Ocupa 2/3) */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-lg border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                <div className="flex justify-between items-center mb-6 relative z-10">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                        <i className="fas fa-chart-bar text-brand-green"></i> Volume Semanal
                    </h3>
                    <select className="bg-gray-100 dark:bg-gray-700 text-xs font-bold px-3 py-1 rounded-lg border-none outline-none text-gray-600 dark:text-gray-300 cursor-pointer">
                        <option>Esta Semana</option>
                        <option>Mês Passado</option>
                    </select>
                </div>

                {/* Área do Gráfico */}
                <div className="h-[250px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dataGrafico} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorKg" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10B981" stopOpacity={1}/>
                                    <stop offset="100%" stopColor="#059669" stopOpacity={0.6}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.1} />
                            <XAxis dataKey="dia" stroke="#9CA3AF" tick={{fontSize: 12, fontWeight: 'bold'}} axisLine={false} tickLine={false} dy={10} />
                            <YAxis stroke="#9CA3AF" tick={{fontSize: 11}} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                            <Bar dataKey="kg" fill="url(#colorKg)" radius={[8, 8, 8, 8]} barSize={40} animationDuration={1500} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                
                {/* Decoração de fundo */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-green/5 rounded-full blur-3xl"></div>
            </div>
        </div>

        {/* --- SEÇÃO OPERACIONAL (Validar + Histórico) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Esquerda: Terminal de Validação (Largo) */}
          <div className="lg:col-span-8 space-y-6">
            
            {(error || success) && (
              <div className={`p-4 rounded-2xl text-center font-bold animate-slideDown shadow-lg ${error ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                {error ? <i className="fas fa-exclamation-circle mr-2"></i> : <i className="fas fa-check-circle mr-2"></i>}
                {error || success}
              </div>
            )}

            {/* CARD PRINCIPAL DE AÇÃO */}
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden min-h-[450px] flex flex-col justify-center relative">
              
              {/* Fundo Decorativo */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-green via-emerald-500 to-teal-500"></div>

              {!transaction ? (
                <div className="p-10 text-center max-w-lg mx-auto w-full">
                  <div className="mb-8">
                    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl text-gray-400 animate-pulse-slow">
                        <i className="fas fa-qrcode"></i>
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Validar Coleta</h2>
                    <p className="text-gray-500">Digite o código numérico apresentado pelo cliente.</p>
                  </div>
                  
                  <form onSubmit={handleSearch} className="relative w-full">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-green to-teal-500 rounded-2xl opacity-30 group-focus-within:opacity-100 transition duration-500 blur"></div>
                        <input 
                          type="number" 
                          className="relative w-full text-center text-5xl font-black tracking-[0.2em] p-6 rounded-2xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none placeholder-gray-200 dark:placeholder-gray-700 transition-all"
                          placeholder="000"
                          value={tokenId}
                          onChange={(e) => setTokenId(e.target.value)}
                          autoFocus
                        />
                    </div>
                    <button 
                      type="submit" 
                      disabled={!tokenId || loading}
                      className="w-full mt-8 py-4 bg-brand-dark hover:bg-black text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 btn-glow-dark"
                    >
                      {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-search"></i>}
                      {loading ? 'Verificando...' : 'Buscar Código'}
                    </button>
                  </form>
                </div>
              ) : (
                // TELA DE CONFIRMAÇÃO (Com visual "Terminal POS")
                <div className="w-full h-full flex flex-col animate-fadeIn">
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-8 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-bold text-brand-green bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full uppercase tracking-wider">Cliente Encontrado</span>
                            <span className="text-sm font-mono text-gray-400">Token #{transaction.id}</span>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 leading-tight">{transaction.user.name}</h2>
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-medium">
                            <i className={`fas ${getMaterialIcon(transaction.materialType)}`}></i>
                            <span className="capitalize">{transaction.materialType}</span>
                        </div>
                    </div>

                    <div className="p-8 flex-grow flex flex-col justify-center items-center">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">PESO NA BALANÇA (KG)</p>
                        
                        <div className="flex items-center gap-6 mb-6">
                            <button onClick={() => adjustWeight(-0.5)} className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-red-100 hover:text-red-500 transition-colors text-2xl flex items-center justify-center text-gray-500"><i className="fas fa-minus"></i></button>
                            <div className="relative group">
                                <input 
                                    type="number" step="0.1" 
                                    value={finalWeight} onChange={(e) => setFinalWeight(e.target.value)} 
                                    className="w-48 text-center text-7xl font-black bg-transparent border-b-4 border-gray-200 focus:border-brand-green outline-none text-gray-900 dark:text-white p-2" 
                                />
                            </div>
                            <button onClick={() => adjustWeight(+0.5)} className="w-16 h-16 rounded-full bg-brand-green text-white hover:bg-emerald-600 transition-colors text-2xl flex items-center justify-center shadow-lg shadow-brand-green/30"><i className="fas fa-plus"></i></button>
                        </div>

                        <p className="text-brand-green font-bold text-lg animate-pulse">
                            Estimativa: +{Math.floor((parseFloat(finalWeight || '0') * 100))} EcoPoints
                        </p>
                    </div>

                    <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-4 bg-gray-50 dark:bg-gray-900/30">
                        <button onClick={() => { setTransaction(null); setError(null); }} className="flex-1 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-500 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancelar</button>
                        <button onClick={handleConfirm} disabled={loading} className="flex-[2] py-4 bg-brand-green text-white rounded-xl font-black shadow-xl hover:scale-[1.02] transition-transform btn-glow-green uppercase tracking-wider">
                            {loading ? 'Processando...' : 'CONFIRMAR'}
                        </button>
                    </div>
                </div>
              )}
            </div>
          </div>

          {/* Direita: Sidebar Histórico */}
          <div className="lg:col-span-4">
            <div className="bg-gray-900 text-white p-6 rounded-[2rem] shadow-xl border border-gray-700 h-[600px] flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/20 rounded-full blur-3xl"></div>
              
              <h3 className="font-bold text-lg mb-6 flex items-center gap-3 z-10">
                <i className="fas fa-history text-brand-green"></i> Últimas Entregas
              </h3>
              
              <div className="flex-grow overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-gray-700 z-10">
                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-50">
                        <i className="far fa-list-alt text-4xl mb-2"></i>
                        <p className="text-sm">Lista vazia hoje.</p>
                    </div>
                ) : (
                    history.map((item: any, index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-gray-800 rounded-2xl border border-gray-700 hover:border-brand-green/50 transition-all group">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold text-gray-300 group-hover:bg-brand-green group-hover:text-white transition-colors">
                                {item.user.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-sm text-white leading-tight">{item.user.split(' ')[0]} {item.user.split(' ')[1]}</p>
                                <p className="text-xs text-gray-400 mt-0.5 capitalize">{item.material} • {item.weight}</p>
                            </div>
                        </div>
                        <span className="text-brand-green font-bold text-sm">+{Math.floor(parseFloat(item.weight.replace('kg','')) * 100)} pts</span>
                    </div>
                    ))
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-800 text-center z-10">
                  <button className="text-xs font-bold text-gray-400 hover:text-white transition-colors">Ver histórico completo</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}