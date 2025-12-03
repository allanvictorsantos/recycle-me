import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
  const { user } = useAuth(); 

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
      const response = await axios.post('http://localhost:3000/transactions/create', 
        { 
          materialType: selectedMaterial, 
          weightInKg: weight 
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

  // --- NOVA TELA DE SUCESSO (O TICKET) ---
  if (createdToken) {
    return (
      <div className="min-h-screen bg-brand-cream dark:bg-brand-dark flex items-center justify-center p-4">
        {/* Cartão Principal com Efeito de Ticket */}
        <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden relative animate-scaleIn">
          
          {/* Topo Verde */}
          <div className="bg-brand-green p-6 text-center relative">
             <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg animate-bounce-slow">
               <i className="fas fa-check text-4xl text-brand-green"></i>
             </div>
             <h2 className="text-2xl font-black text-white tracking-tight">Pedido Confirmado!</h2>
             <p className="text-green-100 text-sm font-medium">Vá até o ponto de coleta</p>
          </div>

          {/* Corpo do Ticket */}
          <div className="p-8 text-center">
             <p className="text-gray-500 text-sm mb-6">Mostre este código numérico ao fiscal para validar sua entrega.</p>
             
             {/* O Código Gigante */}
             <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border-2 border-dashed border-brand-green/50 mb-8 relative">
                <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-900 text-brand-green text-xs font-bold px-3 py-1 uppercase tracking-widest border border-brand-green/20 rounded-full">
                    Seu Token
                </span>
                <span className="text-7xl font-black text-gray-800 dark:text-white tracking-tighter">
                  {createdToken}
                </span>
             </div>

             {/* Botões de Ação */}
             <div className="space-y-3">
                <button 
                  onClick={() => { setCreatedToken(null); setSelectedMaterial(''); setWeight(''); }}
                  className="w-full py-3.5 bg-brand-dark text-white rounded-xl font-bold shadow-lg hover:bg-black hover:-translate-y-1 transition-all btn-glow-dark"
                >
                  Nova Reciclagem
                </button>
                
                <button 
                  onClick={() => navigate('/mapa')} 
                  className="w-full py-3 text-gray-500 dark:text-gray-400 font-bold hover:text-brand-green hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  Voltar ao Mapa
                </button>
             </div>
          </div>

          {/* Efeito de "Picote" do Ticket (Decorativo) */}
          <div className="absolute top-[150px] -left-3 w-6 h-6 bg-brand-cream dark:bg-brand-dark rounded-full"></div>
          <div className="absolute top-[150px] -right-3 w-6 h-6 bg-brand-cream dark:bg-brand-dark rounded-full"></div>

        </div>
      </div>
    );
  }

  // --- FORMULÁRIO (Layout limpo e padronizado) ---
  return (
    <div className="min-h-screen bg-brand-cream dark:bg-brand-dark p-4 flex items-center justify-center">
      <div className="max-w-lg w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100 dark:border-gray-800">
        
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-green-100 dark:bg-green-900/30 rounded-full mb-3">
             <i className="fas fa-recycle text-2xl text-brand-green"></i>
          </div>
          <h1 className="text-2xl font-bold text-brand-dark dark:text-white">O que vamos reciclar?</h1>
          <p className="text-sm text-gray-500">Olá <span className="font-bold text-brand-green">{user?.name.split(' ')[0]}</span>! Selecione o material abaixo.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Grid de Materiais */}
          <div className="grid grid-cols-3 gap-3">
            {materials.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMaterial(m.id)}
                className={`
                  flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 h-28
                  ${selectedMaterial === m.id 
                    ? 'border-brand-green bg-green-50 dark:bg-green-900/20 text-brand-green shadow-md scale-105' 
                    : 'border-transparent bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-200'}
                `}
              >
                <i className={`fas ${m.icon} text-2xl mb-2`}></i>
                <span className="text-xs font-bold">{m.label}</span>
              </button>
            ))}
          </div>

          {/* Peso */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 text-center">Peso Estimado</label>
            <div className="flex items-center justify-center relative max-w-[200px] mx-auto">
              <input 
                type="number" 
                step="0.1"
                placeholder="0.0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full p-2 text-center text-4xl font-black bg-transparent border-b-2 border-gray-300 focus:border-brand-green outline-none text-brand-dark dark:text-white transition-colors"
                required
              />
              <span className="text-gray-400 font-bold text-xl ml-2 mt-2">kg</span>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center font-bold bg-red-50 p-2 rounded-lg">{error}</p>}

          <button 
            type="submit"
            disabled={!selectedMaterial || !weight || loading}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all transform hover:-translate-y-1 ${
              !selectedMaterial || !weight ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500 shadow-none' : 'bg-brand-green btn-glow-green'
            }`}
          >
            {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Gerar Token'}
          </button>

        </form>
      </div>
    </div>
  );
}