import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Ícones corrigidos e padrão visual
const materials = [
  { id: 'vidro', label: 'Vidro', icon: 'fa-wine-bottle', color: 'text-green-500', bg: 'bg-green-100' },
  { id: 'papel', label: 'Papel', icon: 'fa-newspaper', color: 'text-blue-500', bg: 'bg-blue-100' },
  { id: 'plastico', label: 'Plástico', icon: 'fa-bottle-water', color: 'text-red-500', bg: 'bg-red-100' },
  { id: 'metal', label: 'Metal', icon: 'fa-magnet', color: 'text-yellow-600', bg: 'bg-yellow-100' }, // Ícone corrigido
  { id: 'eletronico', label: 'Eletrôn.', icon: 'fa-microchip', color: 'text-purple-500', bg: 'bg-purple-100' },
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
      setError('Erro ao criar pedido.');
    } finally {
      setLoading(false);
    }
  };

  // --- TICKET DE SUCESSO (COMPACTO) ---
  if (createdToken) {
    return (
      <div className="min-h-screen bg-brand-cream dark:bg-brand-dark flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 w-full max-w-xs rounded-3xl shadow-xl overflow-hidden relative animate-scaleIn">
          <div className="bg-brand-green p-4 text-center">
             <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm animate-bounce-slow">
               <i className="fas fa-check text-xl text-brand-green"></i>
             </div>
             <h2 className="text-lg font-black text-white">Confirmado!</h2>
             <p className="text-green-50 text-[10px]">Leve até: <span className="font-bold">{preSelectedMarket ? preSelectedMarket.name : 'Qualquer Ponto'}</span></p>
          </div>

          <div className="p-5 text-center">
             <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border-2 border-dashed border-brand-green/30 mb-4 relative">
                <span className="text-[9px] uppercase font-bold text-gray-400 block mb-1">Seu Código</span>
                <span className="text-4xl font-black text-brand-dark dark:text-white tracking-tighter">{createdToken}</span>
             </div>

             <div className="grid gap-2">
                {preSelectedMarket && (
                    <button onClick={() => navigate('/mapa', { state: { routeToMarket: preSelectedMarket } })} className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-700">
                      <i className="fas fa-location-arrow"></i> Ver Rota
                    </button>
                )}
                <button onClick={() => { setCreatedToken(null); setSelectedMaterial(''); setWeight(''); }} className="w-full py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg font-bold text-xs hover:bg-gray-200">
                  Novo Pedido
                </button>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // --- FORMULÁRIO ULTRA COMPACTO ---
  return (
    <div className="min-h-screen bg-brand-cream dark:bg-brand-dark p-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-5 border border-gray-100 dark:border-gray-800">
        
        {/* Cabeçalho Minimalista */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-brand-dark dark:text-white leading-tight">Nova Reciclagem</h1>
            <p className="text-[10px] text-gray-500">Olá, <span className="font-bold">{user?.name.split(' ')[0]}</span></p>
          </div>
          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <i className="fas fa-leaf text-brand-green text-sm"></i>
          </div>
        </div>

        {/* Local (Barra Fina) */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5 flex items-center gap-3 mb-5 border border-gray-100 dark:border-gray-700">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs text-white shadow-sm ${preSelectedMarket ? 'bg-brand-green' : 'bg-gray-400'}`}>
                <i className={`fas ${preSelectedMarket ? 'fa-store' : 'fa-map-marker-alt'}`}></i>
            </div>
            <div className="flex-1 overflow-hidden">
                <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">Entregar em</p>
                <p className="text-brand-dark dark:text-white font-bold text-xs truncate">
                  {preSelectedMarket ? preSelectedMarket.name : 'Qualquer ponto parceiro'}
                </p>
            </div>
            {preSelectedMarket && <button onClick={() => navigate('/mapa')} className="text-gray-400 hover:text-red-500"><i className="fas fa-times"></i></button>}
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* CARROSSEL HORIZONTAL (Stories Style) - Resolve o grid de 5 */}
          <div className="mb-6">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 ml-1">Selecione o Material</p>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
              {materials.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMaterial(m.id)}
                  className={`
                    flex-shrink-0 w-20 h-24 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 transition-all snap-start
                    ${selectedMaterial === m.id 
                      ? `border-brand-green bg-white shadow-md transform -translate-y-1` 
                      : 'border-transparent bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-gray-100'}
                  `}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${selectedMaterial === m.id ? `${m.bg} ${m.color}` : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}>
                    <i className={`fas ${m.icon}`}></i>
                  </div>
                  <span className={`text-[10px] font-bold ${selectedMaterial === m.id ? 'text-brand-dark' : ''}`}>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* BARRA DE AÇÃO (Input + Botão juntos) */}
          <div className="flex items-end gap-3">
            
            {/* Input de Peso */}
            <div className="flex-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Peso (kg)</label>
              <div className="relative mt-1">
                <input 
                  type="number" 
                  step="0.1"
                  placeholder="0.0"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full h-12 pl-4 pr-8 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-brand-green focus:bg-white dark:focus:bg-gray-900 outline-none font-bold text-lg text-brand-dark dark:text-white transition-all"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">kg</span>
              </div>
            </div>

            {/* Botão de Enviar */}
            <button 
              type="submit"
              disabled={!selectedMaterial || !weight || loading}
              className={`h-12 px-6 rounded-xl font-bold text-white shadow-lg transition-all flex items-center gap-2 ${
                !selectedMaterial || !weight 
                  ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500 shadow-none' 
                  : 'bg-brand-green hover:bg-emerald-500 hover:shadow-brand-green/30 hover:-translate-y-0.5 w-auto flex-1 justify-center'
              }`}
            >
              {loading ? <i className="fas fa-spinner fa-spin"></i> : (
                <>
                  <span>Gerar</span>
                  <i className="fas fa-arrow-right"></i>
                </>
              )}
            </button>
          </div>

          {error && <p className="mt-3 text-red-500 text-[10px] text-center font-bold bg-red-50 p-1.5 rounded-lg">{error}</p>}
        </form>
      </div>
    </div>
  );
}