import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

// --- TIPAGEM (Conforme o que o Backend manda agora) ---
interface Activity {
  id: number;
  type: 'reciclagem' | 'quiz' | 'doacao';
  description: string;
  date: string;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  level: number;
  xp: number;
  xpNeeded: number; // Vem calculado do back
  points: number;
  streak: number;   // Vem do back
  rank: string;     // Vem calculado do back ("Ouro", "Prata")
  recentActivity: Activity[];
}

// --- SUB-COMPONENTES VISUAIS ---

interface StatCardProps {
  icon: string;
  value: string | number;
  label: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label }) => (
  <div className="flex flex-col items-center p-2 text-center bg-gray-700/50 rounded-lg w-full">
    <span className="text-2xl mb-1">{icon}</span>
    <span className="text-lg font-bold text-white">{value}</span>
    <span className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</span>
  </div>
);

interface GoalCardProps {
  title: string;
  progress: number;
  reward: string;
}

const GoalCard: React.FC<GoalCardProps> = ({ title, progress, reward }) => (
  <div className="p-4 bg-gray-700 rounded-lg transition-all hover:bg-gray-600 border border-gray-600 hover:border-brand-green/50">
    <h4 className="font-semibold text-md mb-2 text-gray-100">{title}</h4>
    <div className="w-full bg-gray-900 rounded-full h-2">
      <div
        className="bg-yellow-400 h-2 rounded-full transition-all duration-1000"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
    <div className="flex justify-between text-xs mt-2 text-gray-400">
      <span>{progress}% Completo</span>
      <span className="text-yellow-400 font-bold">+{reward}</span>
    </div>
  </div>
);

// Sidebar da Esquerda (Perfil)
const UserSidebar: React.FC<{ user: UserData; onLogout: () => void }> = ({ user, onLogout }) => (
  <div className="w-full lg:w-1/3 p-6 bg-gray-800 rounded-2xl shadow-xl text-white flex flex-col border border-gray-700">
    
    <div className="flex flex-col items-center text-center">
      {/* Avatar com inicial */}
      <div className="w-28 h-28 bg-gradient-to-br from-brand-green to-emerald-600 rounded-full flex items-center justify-center text-4xl font-bold mb-4 border-4 border-gray-700 text-white shadow-lg">
        {user.name.charAt(0).toUpperCase()}
      </div>
      <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
      <p className="text-xs text-brand-green font-bold uppercase tracking-widest border border-brand-green/30 px-2 py-1 rounded-full bg-brand-green/10">
        Nível {user.level} • {user.rank}
      </p>
    </div>

    <div className="mt-8 space-y-6 flex-grow">
      {/* Barra de Nível */}
      <div>
        <div className="flex justify-between text-xs mb-2 font-bold text-gray-400 uppercase">
          <span>XP Atual</span>
          <span>{user.xp} / {user.xpNeeded} XP</span>
        </div>
        <div className="w-full bg-gray-900 rounded-full h-3 shadow-inner">
          <div
            className="bg-brand-green h-3 rounded-full transition-all duration-1000 relative overflow-hidden"
            style={{ width: `${Math.min(100, (user.xp / user.xpNeeded) * 100)}%` }}
          >
             {/* Efeito de brilho na barra */}
             <div className="absolute top-0 left-0 bottom-0 right-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
        <p className="text-center text-xs text-gray-500 mt-2">Faltam {user.xpNeeded - user.xp} XP para o próximo nível</p>
      </div>

      {/* Stats Grid */}
      <div className="flex gap-2 justify-between">
        <StatCard icon="🔥" value={user.streak} label="Dias Seg." />
        <StatCard icon="💎" value={user.points} label="EcoPoints" />
        <StatCard icon="🏆" value={user.rank} label="Liga" />
      </div>
    </div>

    <button
      onClick={onLogout}
      className="mt-8 w-full py-3 rounded-xl border border-red-900/50 text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors font-bold text-sm"
    >
      <i className="fas fa-sign-out-alt mr-2"></i> Sair da Conta
    </button>
  </div>
);


// --- COMPONENTE PRINCIPAL ---
function UserProfilePage() {
  const { logout } = useAuth();
  
  // Estados reais
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- BUSCAR DADOS REAIS ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('recycleme_auth_token');
        const response = await axios.get('http://localhost:3000/profile/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(response.data);
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
        setError("Falha ao carregar seus dados.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <i className="fas fa-circle-notch fa-spin text-4xl text-brand-green mb-4"></i>
          <p>Carregando seu perfil...</p>
        </div>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error || !userData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
         <div className="bg-gray-800 p-8 rounded-xl text-center max-w-md">
            <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
            <h2 className="text-xl font-bold mb-2">Ops! Algo deu errado.</h2>
            <p className="text-gray-400 mb-6">{error || "Não foi possível encontrar seus dados."}</p>
            <Link to="/" className="bg-brand-green px-6 py-2 rounded-lg font-bold hover:opacity-90">Voltar para Home</Link>
         </div>
      </div>
    );
  }

  // --- SUCESSO: RENDERIZAÇÃO REAL ---
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8 lg:p-12">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Coluna Esquerda: Sidebar Fixa */}
        <UserSidebar user={userData} onLogout={logout} />

        {/* Coluna Direita: Conteúdo Scrollável */}
        <div className="w-full lg:w-3/4 space-y-8">
          
          {/* Banner de Saldo (Destaque) */}
          <div className="bg-gradient-to-r from-brand-green to-teal-700 p-6 rounded-2xl shadow-lg flex justify-between items-center relative overflow-hidden">
             <div className="relative z-10">
                <p className="text-green-100 text-sm font-bold uppercase mb-1">Seu Saldo Disponível</p>
                <h1 className="text-5xl font-black text-white tracking-tight">{userData.points} <span className="text-2xl font-medium opacity-80">pts</span></h1>
                <button className="mt-4 bg-white text-brand-green px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition shadow-md">
                   Usar em Descontos
                </button>
             </div>
             <i className="fas fa-leaf text-9xl text-white opacity-10 absolute -right-4 -bottom-4 transform rotate-12"></i>
          </div>

          {/* Desafios */}
          <div className="bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-700">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-bold text-white flex items-center gap-2"><i className="fas fa-bullseye text-yellow-500"></i> Missões da Semana</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GoalCard title="Reciclar 5kg de Vidro" progress={userData.points > 0 ? 40 : 0} reward="50 XP" />
              <GoalCard title="Visitar 2 Mercados" progress={50} reward="100 Pts" />
            </div>
          </div>

          {/* Histórico Real */}
          <div className="bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-700">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><i className="fas fa-history text-blue-400"></i> Histórico de Impacto</h3>
            
            <ul className="space-y-3">
              {userData.recentActivity && userData.recentActivity.length > 0 ? (
                userData.recentActivity.map(activity => (
                  <li key={activity.id} className="flex justify-between items-center p-4 bg-gray-700/50 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-green-900/50 flex items-center justify-center text-xl border border-green-700 text-green-400">
                        <i className="fas fa-recycle"></i>
                      </div>
                      <div>
                        <p className="text-gray-200 font-bold text-sm">{activity.description}</p>
                        <p className="text-xs text-green-400 font-mono mt-1">+ Pontos Recebidos</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 font-bold bg-gray-800 px-3 py-1 rounded-full">{activity.date}</span>
                  </li>
                ))
              ) : (
                <div className="text-center py-8">
                    <i className="fas fa-box-open text-4xl text-gray-600 mb-3"></i>
                    <p className="text-gray-500 text-sm">Você ainda não reciclou nada.</p>
                    <Link to="/reciclar" className="text-brand-green hover:underline text-sm font-bold mt-2 block">Começar agora</Link>
                </div>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;