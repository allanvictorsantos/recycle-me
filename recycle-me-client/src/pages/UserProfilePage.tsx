import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

// Tipos Atualizados
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
  myCoupons: Coupon[]; // <--- Novo Array
}

// Componentes Visuais
const StatCard = ({ icon, value, label }: any) => (
  <div className="flex flex-col items-center p-3 text-center bg-gray-700/50 rounded-xl w-full border border-gray-600">
    <span className="text-2xl mb-1">{icon}</span>
    <span className="text-lg font-bold text-white">{value}</span>
    <span className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</span>
  </div>
);

// Sidebar Esquerda
const UserSidebar: React.FC<{ user: UserData; onLogout: () => void }> = ({ user, onLogout }) => (
  <div className="w-full lg:w-1/3 p-6 bg-gray-800 rounded-3xl shadow-xl text-white flex flex-col border border-gray-700 h-fit">
    <div className="flex flex-col items-center text-center">
      <div className="w-28 h-28 bg-gradient-to-br from-brand-green to-emerald-600 rounded-full flex items-center justify-center text-4xl font-bold mb-4 border-4 border-gray-700 text-white shadow-lg">
        {user.name.charAt(0).toUpperCase()}
      </div>
      <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
      <p className="text-xs text-brand-green font-bold uppercase tracking-widest border border-brand-green/30 px-3 py-1 rounded-full bg-brand-green/10">
        Nível {user.level} • {user.rank}
      </p>
    </div>

    <div className="mt-8 space-y-6 flex-grow">
      <div>
        <div className="flex justify-between text-xs mb-2 font-bold text-gray-400 uppercase">
          <span>XP Atual</span><span>{user.xp} / {user.xpNeeded}</span>
        </div>
        <div className="w-full bg-gray-900 rounded-full h-3 shadow-inner relative overflow-hidden">
          <div className="bg-brand-green h-3 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (user.xp / user.xpNeeded) * 100)}%` }}></div>
        </div>
      </div>
      <div className="flex gap-3 justify-between">
        <StatCard icon="🔥" value={user.streak} label="Dias Seg." />
        <StatCard icon="💎" value={user.points} label="EcoPoints" />
      </div>
    </div>

    <button onClick={onLogout} className="mt-8 w-full py-3 rounded-xl border border-red-900/50 text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors font-bold text-sm flex items-center justify-center gap-2">
      <i className="fas fa-sign-out-alt"></i> Sair da Conta
    </button>
  </div>
);

export default function UserProfilePage() {
  const { logout } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'activity' | 'coupons'>('activity'); // Abas

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
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        
        <UserSidebar user={userData} onLogout={logout} />

        <div className="w-full lg:w-2/3 space-y-8">
          
          {/* Banner de Saldo */}
          <div className="bg-gradient-to-r from-brand-green to-teal-700 p-8 rounded-3xl shadow-lg flex flex-col sm:flex-row justify-between items-center relative overflow-hidden">
             <div className="relative z-10 text-center sm:text-left">
                <p className="text-green-100 text-xs font-bold uppercase tracking-widest mb-1">Saldo Disponível</p>
                <h1 className="text-5xl font-black text-white tracking-tight">{userData.points} <span className="text-2xl font-medium opacity-80">pts</span></h1>
             </div>
             <Link to="/clube" className="relative z-10 mt-4 sm:mt-0 bg-white text-brand-dark px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-100 transition shadow-xl flex items-center gap-2">
                <i className="fas fa-shopping-bag"></i> Ir para o Clube
             </Link>
             <i className="fas fa-leaf text-[150px] text-white opacity-10 absolute -right-10 -bottom-10 transform rotate-12"></i>
          </div>

          {/* Área de Abas */}
          <div>
              <div className="flex gap-4 border-b border-gray-700 mb-6">
                  <button 
                    onClick={() => setActiveTab('activity')} 
                    className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'activity' ? 'text-brand-green border-b-2 border-brand-green' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    Histórico
                  </button>
                  <button 
                    onClick={() => setActiveTab('coupons')} 
                    className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'coupons' ? 'text-brand-green border-b-2 border-brand-green' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    Meus Cupons
                  </button>
              </div>

              {/* CONTEÚDO DA ABA: HISTÓRICO */}
              {activeTab === 'activity' && (
                <div className="bg-gray-800 p-6 rounded-3xl shadow-md border border-gray-700 animate-fadeIn">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><i className="fas fa-history text-gray-400"></i> Atividade Recente</h3>
                    <ul className="space-y-3">
                    {userData.recentActivity.length > 0 ? (
                        userData.recentActivity.map(activity => (
                        <li key={activity.id} className="flex justify-between items-center p-4 bg-gray-700/30 rounded-2xl border border-gray-700 hover:border-gray-600 transition-colors">
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center text-xl text-brand-green border border-brand-green/20"><i className="fas fa-recycle"></i></div>
                                <div>
                                    <p className="text-gray-200 font-bold text-sm">{activity.description}</p>
                                    <p className="text-xs text-gray-500 font-medium mt-1"><i className="fas fa-map-marker-alt mr-1"></i> {activity.marketName}</p>
                                </div>
                            </div>
                            <span className="text-xs text-gray-400 font-mono bg-gray-900 px-2 py-1 rounded-md">{activity.date}</span>
                        </li>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-8">Nenhuma reciclagem ainda.</p>
                    )}
                    </ul>
                </div>
              )}

              {/* CONTEÚDO DA ABA: CUPONS */}
              {activeTab === 'coupons' && (
                <div className="bg-gray-800 p-6 rounded-3xl shadow-md border border-gray-700 animate-fadeIn">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><i className="fas fa-ticket-alt text-gray-400"></i> Cupons Resgatados</h3>
                    <div className="grid gap-4">
                    {userData.myCoupons.length > 0 ? (
                        userData.myCoupons.map(coupon => (
                        <div key={coupon.id} className="flex flex-col sm:flex-row justify-between items-center p-5 bg-gray-700/30 rounded-2xl border-l-4 border-brand-green relative overflow-hidden group hover:bg-gray-700/50 transition-all">
                            <div className="absolute right-0 top-0 opacity-5 text-6xl transform translate-x-4 -translate-y-2 group-hover:scale-110 transition-transform"><i className="fas fa-gift"></i></div>
                            <div className="z-10 mb-4 sm:mb-0 text-center sm:text-left">
                                <h4 className="text-white font-bold text-lg">{coupon.title}</h4>
                                <p className="text-sm text-gray-400"><i className="fas fa-store mr-1"></i> {coupon.market}</p>
                                <p className="text-xs text-gray-500 mt-1">Resgatado em: {coupon.date}</p>
                            </div>
                            <div className="z-10 flex flex-col items-center bg-white text-gray-900 px-4 py-2 rounded-lg shadow-lg">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">CÓDIGO</span>
                                <span className="text-xl font-black tracking-wider font-mono">{coupon.code}</span>
                            </div>
                        </div>
                        ))
                    ) : (
                        <div className="text-center py-10">
                            <i className="fas fa-ticket-alt text-4xl text-gray-600 mb-3"></i>
                            <p className="text-gray-500 mb-4">Você ainda não tem cupons.</p>
                            <Link to="/clube" className="text-brand-green font-bold hover:underline">Ir para o Clube</Link>
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