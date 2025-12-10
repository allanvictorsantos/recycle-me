import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const materials = [
  { id: 'vidro', label: 'Vidro', icon: 'fa-wine-bottle' },
  { id: 'papel', label: 'Papel', icon: 'fa-newspaper' },
  { id: 'plastico', label: 'Plástico', icon: 'fa-bottle-water' },
  { id: 'metal', label: 'Metal', icon: 'fa-can-food' },
  { id: 'eletronico', label: 'Eletrônico', icon: 'fa-microchip' },
];

export default function RecycleRequestPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth(); 

  const preSelectedMarket = location.state?.preSelectedMarket;

  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [weight, setWeight] = useState('');
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterial || !weight) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('recycleme_auth_token');
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/transactions/create`, 
        { 
          materialType: selectedMaterial, 
          weightInKg: weight,
          marketId: preSelectedMarket?.id 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCreatedToken(response.data.token);
    } catch (err: any) {
      setError('Erro ao criar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // --- TELA DE SUCESSO (COMPACTADA) ---
  if (createdToken) {
    return (
      <div className="min-h-screen bg-brand-cream dark:bg-brand-dark flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden relative animate-scaleIn">
          <div className="bg-brand-green p-5 text-center relative">
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg animate-bounce-slow">
               <i className="fas fa-check text-3xl text-brand-green"></i>
             </div>
             <h2 className="text-xl font-black text-white tracking-tight">Pedido Confirmado!</h2>
             <p className="text-green-100 text-xs font-medium mt-1">
                Leve até: <span className="font-bold text-white underline decoration-white/50 underline-offset-4">{preSelectedMarket ? preSelectedMarket.name : 'Qualquer Ponto'}</span>
             </p>
          </div>

          <div className="p-6 text-center">
             <p className="text-gray-500 text-xs mb-4">Mostre este código numérico ao fiscal.</p>
             <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border-2 border-dashed border-brand-green/50 mb-6 relative group cursor-pointer hover:bg-green-50 dark:hover:bg-gray-700 transition-colors">
                <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-900 text-brand-green text-[10px] font-bold px-2 py-0.5 uppercase tracking-widest border border-brand-green/20 rounded-full shadow-sm">Seu Token</span>
                <span className="text-5xl font-black text-gray-800 dark:text-white tracking-tighter group-hover:scale-110 transition-transform block">{createdToken}</span>
             </div>

             <div className="space-y-2">
                {preSelectedMarket && (
                    <button 
                      onClick={() => navigate('/mapa', { state: { routeToMarket: preSelectedMarket } })}
                      className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 text-sm flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-location-arrow"></i> Ver Rota
                    </button>
                )}
                <button 
                  onClick={() => { setCreatedToken(null); setSelectedMaterial(''); setWeight(''); }}
                  className="w-full py-3 bg-brand-dark text-white rounded-xl font-bold shadow-md hover:bg-black text-sm btn-glow-dark"
                >
                  Nova Reciclagem
                </button>
                {!preSelectedMarket && (
                    <button onClick={() => navigate('/mapa')} className="w-full py-2 text-gray-500 dark:text-gray-400 font-bold hover:text-brand-green text-xs rounded-xl transition-colors">Voltar ao Mapa</button>
                )}
             </div>
          </div>
        </div>
      </div>
    );
  }

  // --- FORMULÁRIO (COMPACTADO) ---
  return (
    <div className="min-h-screen bg-brand-cream dark:bg-brand-dark p-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-5 border border-gray-100 dark:border-gray-800">
        
        <div className="text-center mb-5">
          <div className="inline-block p-2 bg-green-100 dark:bg-green-900/30 rounded-full mb-2">
             <i className="fas fa-recycle text-xl text-brand-green"></i>
          </div>
          <h1 className="text-xl font-bold text-brand-dark dark:text-white">O que vamos reciclar?</h1>
          <p className="text-xs text-gray-500">Olá <span className="font-bold text-brand-green">{user?.name.split(' ')[0]}</span>!</p>
        </div>

        {preSelectedMarket ? (
            <div className="bg-brand-green/10 border border-brand-green/20 p-3 rounded-lg flex items-center gap-3 mb-4 animate-fadeIn">
                <div className="w-8 h-8 bg-brand-green text-white rounded-full flex items-center justify-center text-sm shadow-md">
                    <i className="fas fa-store"></i>
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Local de Entrega</p>
                    <p className="text-brand-dark dark:text-white font-bold text-xs truncate">{preSelectedMarket.name}</p>
                </div>
                <button onClick={() => navigate('/mapa')} className="text-[10px] text-gray-400 hover:text-red-500 font-bold underline cursor-pointer whitespace-nowrap">Alterar</button>
            </div>
        ) : (
             <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg text-center mb-4 text-[10px] text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center gap-2">
                <i className="fas fa-info-circle"></i> Entregar em qualquer ponto parceiro.
             </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* GRID MAIS COMPACTO PARA MATERIAIS */}
          <div className="grid grid-cols-5 gap-2">
            {materials.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMaterial(m.id)}
                className={`
                  flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-200 h-20 group
                  ${selectedMaterial === m.id 
                    ? 'border-brand-green bg-green-50 dark:bg-green-900/20 text-brand-green shadow-sm scale-105 ring-1 ring-brand-green' 
                    : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}
                `}
              >
                <i className={`fas ${m.icon} text-lg mb-1 group-hover:scale-110 transition-transform`}></i>
                <span className="text-[9px] font-bold leading-none">{m.label}</span>
              </button>
            ))}
          </div>

          {/* PESO COMPACTO */}
          <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-xl border border-transparent focus-within:border-brand-green/30 transition-colors flex items-center justify-between">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Peso Estimado:</label>
            <div className="flex items-center">
              <input 
                type="number" 
                step="0.1"
                placeholder="0.0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-20 p-1 text-right text-2xl font-black bg-transparent border-b border-gray-300 focus:border-brand-green outline-none text-brand-dark dark:text-white transition-colors placeholder-gray-300"
                required
              />
              <span className="text-gray-400 font-bold text-sm ml-1 mt-2">kg</span>
            </div>
          </div>

          {error && <p className="text-red-500 text-xs text-center font-bold bg-red-50 p-2 rounded-lg border border-red-100">{error}</p>}

          <button 
            type="submit"
            disabled={!selectedMaterial || !weight || loading}
            className={`w-full py-3 rounded-xl text-white font-bold text-sm shadow-md transition-all transform hover:-translate-y-0.5 ${
              !selectedMaterial || !weight ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500 shadow-none' : 'bg-brand-green btn-glow-green hover:scale-[1.01]'
            }`}
          >
            {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Gerar Token'}
          </button>
        </form>
      </div>
    </div>
  );
}