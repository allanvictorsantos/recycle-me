import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
// Import dos Gráficos
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Activity {
  id: number;
  type: 'reciclagem';
  description: string;
  marketName?: string;
  date: string;
}

interface Coupon {
    id: number;
    title: string;
    market: string;
    code: string;
    cost: number;
    date: string;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  level: number;
  xp: number;
  xpNeeded: number;
  points: number;
  streak: number;
  rank: string;
  recentActivity: Activity[];
  myCoupons: Coupon[];
}

// DADOS MOCKADOS PARA O GRÁFICO (Simulação de Histórico)
const chartData = [
  { mes: 'Jan', pts: 200 },
  { mes: 'Fev', pts: 450 },
  { mes: 'Mar', pts: 300 },
  { mes: 'Abr', pts: 800 },
  { mes: 'Mai', pts: 1200 },
  { mes: 'Jun', pts: 1500 }, // Mês atual
];

const StatCard = ({ icon, value, label }: any) => (
  <div className="flex flex-col items-center p-4 text-center bg-gray-800/50 rounded-2xl w-full border border-gray-700 shadow-sm hover:border-brand-green/50 transition-colors">
    <span className="text-2xl mb-2">{icon}</span>
    <span className="text-xl font-black text-white">{value}</span>
    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{label}</span>
  </div>
);

const UserSidebar: React.FC<{ user: UserData; onLogout: () => void }> = ({ user, onLogout }) => (
  <div className="w-full lg:w-1/3 p-8 bg-gray-800 rounded-[2.5rem] shadow-2xl text-white flex flex-col border border-gray-700 h-fit relative overflow-hidden">
    {/* Efeito de fundo */}
    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-brand-green/10 to-transparent"></div>

    <div className="flex flex-col items-center text-center relative z-10">
      <div className="w-32 h-32 bg-gradient-to-br from-brand-green to-emerald-600 rounded-full flex items-center justify-center text-5xl font-bold mb-4 border-4 border-gray-700 text-white shadow-xl ring-4 ring-brand-green/20">
        {user.name.charAt(0).toUpperCase()}
      </div>
      <h2 className="text-2xl font-black mb-1 tracking-tight">{user.name}</h2>
      <div className="flex gap-2 mt-2">
         <span className="text-[10px] font-bold uppercase tracking-widest bg-brand-dark px-3 py-1 rounded-full border border-gray-600">Nível {user.level}</span>
         <span className="text-[10px] font-bold uppercase tracking-widest bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full border border-yellow-500/30">{user.rank}</span>
      </div>
    </div>

    <div className="mt-10 space-y-8 flex-grow">
      <div>
        <div className="flex justify-between text-xs mb-2 font-bold text-gray-400 uppercase tracking-wide">
          <span>Progresso do Nível</span><span>{user.xp} / {user.xpNeeded} XP</span>
        </div>
        <div className="w-full bg-gray-900 rounded-full h-3 shadow-inner relative overflow-hidden">
          <div className="bg-gradient-to-r from-brand-green to-emerald-400 h-3 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (user.xp / user.xpNeeded) * 100)}%` }}></div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <StatCard icon="🔥" value={user.streak} label="Dias Seguidos" />
        <StatCard icon="💎" value={user.points} label="EcoPoints" />
      </div>
    </div>

    <button onClick={onLogout} className="mt-10 w-full py-4 rounded-xl border-2 border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all font-bold text-sm flex items-center justify-center gap-2 group">
      <i className="fas fa-sign-out-alt group-hover:translate-x-1 transition-transform"></i> Sair da Conta
    </button>
  </div>
);

export default function UserProfilePage() {
  const { logout } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'activity' | 'coupons'>('activity');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('recycleme_auth_token');
        const response = await axios.get('http://localhost:3000/profile/me', { headers: { Authorization: `Bearer ${token}` } });
        setUserData(response.data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-brand-green"><i className="fas fa-spinner fa-spin text-4xl"></i></div>;
  if (!userData) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Erro ao carregar perfil.</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8 lg:p-12 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        <UserSidebar user={userData} onLogout={logout} />

        <div className="w-full lg:w-2/3 space-y-8">
          
          {/* Banner de Saldo */}
          <div className="bg-gradient-to-r from-brand-green to-teal-800 p-10 rounded-[2.5rem] shadow-2xl flex flex-col sm:flex-row justify-between items-center relative overflow-hidden border border-white/10">
             <div className="relative z-10 text-center sm:text-left">
                <p className="text-green-100 text-xs font-black uppercase tracking-[0.2em] mb-2">Saldo Disponível</p>
                <h1 className="text-6xl font-black text-white tracking-tighter drop-shadow-md">{userData.points} <span className="text-3xl font-medium opacity-70">pts</span></h1>
             </div>
             <Link to="/clube" className="relative z-10 mt-6 sm:mt-0 bg-white text-brand-dark px-8 py-4 rounded-2xl font-black text-sm hover:scale-105 transition-transform shadow-xl flex items-center gap-3 group">
                <i className="fas fa-shopping-bag text-lg group-hover:text-brand-green transition-colors"></i>
                IR PARA O CLUBE
             </Link>
             {/* Decoração de Fundo */}
             <i className="fas fa-leaf text-[180px] text-white opacity-10 absolute -right-10 -bottom-12 transform rotate-12 mix-blend-overlay"></i>
             <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
          </div>

          {/* --- GRÁFICO DE EVOLUÇÃO (O "Wow Factor") --- */}
          <div className="bg-gray-800 p-8 rounded-[2.5rem] shadow-lg border border-gray-700">
             <div className="flex justify-between items-end mb-6">
                <div>
                    <h3 className="text-xl font-black mb-1 flex items-center gap-3 text-white">
                        <span className="bg-gray-700 p-2 rounded-lg"><i className="fas fa-chart-area text-brand-green"></i></span>
                        Sua Evolução
                    </h3>
                    <p className="text-gray-400 text-xs">Seu crescimento nos últimos 6 meses.</p>
                </div>
             </div>
             
             <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorPts" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.3} />
                        <XAxis dataKey="mes" stroke="#9CA3AF" tick={{fontSize: 12, fontWeight: 'bold'}} axisLine={false} tickLine={false} dy={10} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                            itemStyle={{ color: '#10B981', fontWeight: 'bold' }}
                            cursor={{stroke: '#10B981', strokeWidth: 1, strokeDasharray: '5 5'}}
                        />
                        <Area type="monotone" dataKey="pts" stroke="#10B981" strokeWidth={4} fillOpacity={1} fill="url(#colorPts)" />
                    </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Área de Abas (Histórico e Cupons) */}
          <div>
              <div className="flex gap-6 border-b border-gray-700 mb-6 px-4">
                  <button 
                    onClick={() => setActiveTab('activity')} 
                    className={`pb-4 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'activity' ? 'text-brand-green border-b-4 border-brand-green' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    <i className="fas fa-history mr-2"></i> Histórico
                  </button>
                  <button 
                    onClick={() => setActiveTab('coupons')} 
                    className={`pb-4 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'coupons' ? 'text-brand-green border-b-4 border-brand-green' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    <i className="fas fa-ticket-alt mr-2"></i> Meus Cupons
                  </button>
              </div>

              {/* CONTEÚDO: HISTÓRICO */}
              {activeTab === 'activity' && (
                <div className="bg-gray-800 p-2 rounded-[2rem] shadow-inner border border-gray-700 animate-fadeIn min-h-[200px]">
                    <ul className="space-y-1">
                    {userData.recentActivity.length > 0 ? (
                        userData.recentActivity.map(activity => (
                        <li key={activity.id} className="flex justify-between items-center p-5 hover:bg-gray-700/50 rounded-3xl transition-colors group cursor-default">
                            <div className="flex items-center space-x-5">
                                <div className="w-12 h-12 rounded-2xl bg-green-900/30 flex items-center justify-center text-xl text-brand-green border border-brand-green/20 group-hover:scale-110 transition-transform"><i className="fas fa-recycle"></i></div>
                                <div>
                                    <p className="text-white font-bold text-sm">{activity.description}</p>
                                    <p className="text-xs text-gray-400 font-medium mt-1 flex items-center gap-1">
                                        <i className="fas fa-map-marker-alt text-gray-500"></i> {activity.marketName}
                                    </p>
                                </div>
                            </div>
                            <span className="text-xs text-gray-400 font-bold bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-700">{activity.date}</span>
                        </li>
                        ))
                    ) : (
                        <div className="text-center py-12 flex flex-col items-center opacity-50">
                            <i className="fas fa-leaf text-4xl text-gray-600 mb-3"></i>
                            <p className="text-gray-400">Nenhuma reciclagem ainda.</p>
                        </div>
                    )}
                    </ul>
                </div>
              )}

              {/* CONTEÚDO: CUPONS */}
              {activeTab === 'coupons' && (
                <div className="bg-gray-800 p-6 rounded-[2rem] shadow-inner border border-gray-700 animate-fadeIn min-h-[200px]">
                    <div className="grid gap-4">
                    {userData.myCoupons.length > 0 ? (
                        userData.myCoupons.map(coupon => (
                        <div key={coupon.id} className="flex flex-col sm:flex-row justify-between items-center p-6 bg-gray-700/30 rounded-3xl border-l-8 border-brand-green relative overflow-hidden group hover:bg-gray-700/50 transition-all shadow-lg">
                            <div className="absolute right-0 top-0 opacity-[0.03] text-8xl transform translate-x-4 -translate-y-2 group-hover:scale-110 transition-transform pointer-events-none"><i className="fas fa-gift"></i></div>
                            
                            <div className="z-10 mb-4 sm:mb-0 text-center sm:text-left">
                                <h4 className="text-white font-black text-xl mb-1">{coupon.title}</h4>
                                <p className="text-sm text-gray-400 flex items-center gap-2 justify-center sm:justify-start">
                                    <i className="fas fa-store text-brand-green"></i> {coupon.market}
                                </p>
                                <p className="text-[10px] text-gray-500 mt-2 uppercase font-bold tracking-wider">Resgatado em: {coupon.date}</p>
                            </div>
                            
                            <div className="z-10 flex flex-col items-center bg-white text-gray-900 px-6 py-3 rounded-xl shadow-xl transform group-hover:scale-105 transition-transform">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">SEU CÓDIGO</span>
                                <span className="text-2xl font-black tracking-wider font-mono text-brand-dark select-all">{coupon.code}</span>
                            </div>
                        </div>
                        ))
                    ) : (
                        <div className="text-center py-12 flex flex-col items-center">
                            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-2xl text-gray-500 mb-4"><i className="fas fa-ticket-alt"></i></div>
                            <p className="text-gray-400 mb-6">Você ainda não tem cupons.</p>
                            <Link to="/clube" className="bg-brand-green text-white px-6 py-2 rounded-full font-bold hover:bg-emerald-600 transition-colors">
                                Ir para o Clube
                            </Link>
                        </div>
                    )}
                    </div>
                </div>
              )}
          </div>

        </div>
      </div>
    </div>
  );
};