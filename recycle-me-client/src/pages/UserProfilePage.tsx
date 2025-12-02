import React from 'react'; // Removido useState e useEffect
import { useAuth } from '../context/AuthContext'; // Para buscar o token e fazer logout
import { Link } from 'react-router-dom'; // Para links futuros

// --- INTERFACES (Definindo os Tipos para TypeScript) ---
// (Estes são os tipos do código que você forneceu)

interface UserData {
  id?: number; // Adicionado ID, o backend geralmente envia
  name: string;
  email: string;
  avatar?: string; // Avatar é opcional
  level: number;
  xp: number;
  xpNeeded: number;
  streak: number;
  rank: string;
  points: number;
  recentActivity?: Activity[]; // Atividade recente pode não vir sempre
}

interface Activity {
  id: number;
  type: 'reciclagem' | 'quiz' | 'doacao';
  description: string;
  date: string;
}

interface StatCardProps {
  icon: string;
  value: string | number;
  label: string;
}

interface GoalCardProps {
  title: string;
  progress: number;
  reward: string;
}

// --- COMPONENTES INTERNOS (Layout do código que você forneceu) ---
// (StatCard, GoalCard - Mantidos exatamente iguais)

const StatCard: React.FC<StatCardProps> = ({ icon, value, label }) => (
  <div className="flex flex-col items-center p-2 text-center">
    <span className="text-3xl mb-1">{icon}</span>
    <span className="text-xl font-bold text-white">{value}</span>
    <span className="text-xs text-gray-400 uppercase">{label}</span>
  </div>
);

const GoalCard: React.FC<GoalCardProps> = ({ title, progress, reward }) => (
  <div className="p-4 bg-gray-700 rounded-lg transition-all hover:bg-gray-600">
    <h4 className="font-semibold text-lg mb-2 text-gray-100">{title}</h4>
    <div className="w-full bg-gray-600 rounded-full h-2.5 dark:bg-gray-900">
      <div
        className="bg-yellow-400 h-2.5 rounded-full"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
    <div className="flex justify-between text-sm mt-2 text-gray-400">
      <span>{progress}% Completo</span>
      <span className="text-yellow-400 font-bold">{reward}</span>
    </div>
  </div>
);

// Sidebar com Logout (Botão de Sair adicionado)
const UserSidebar: React.FC<{ user: UserData; onLogout: () => void }> = ({ user, onLogout }) => (
  <div className="w-full lg:w-1/3 p-6 bg-gray-800 rounded-lg shadow-xl text-white flex flex-col">
    <div className="flex flex-col items-center text-center">
      {/* Avatar do Usuário */}
      <div className="w-32 h-32 bg-brand-green rounded-full flex items-center justify-center text-5xl font-bold mb-4 border-4 border-gray-600 dark:border-gray-900 text-white shadow-md">
        {/* Pega a primeira letra do nome se não houver avatar */}
        {user.avatar || (user.name ? user.name.charAt(0).toUpperCase() : 'U')}
      </div>
      <h2 className="text-3xl font-bold mb-1">{user.name}</h2>
      <p className="text-sm text-brand-green font-medium">Nível {user.level} Reciclador</p>
    </div>

    <div className="mt-8 space-y-4 flex-grow">
      {/* Barra de Progresso do Nível */}
      <div>
        <div className="flex justify-between text-sm mb-1 font-medium text-gray-300">
          <span>XP Total: {user.xp}</span>
          <span>Próximo Nível: {user.xpNeeded} XP</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5 dark:bg-gray-900">
          <div
            className="bg-brand-green h-2.5 rounded-full"
            style={{ width: `${(user.xp / user.xpNeeded) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Estatísticas de Gamificação */}
      <div className="flex justify-around pt-4 border-t border-gray-700">
        <StatCard icon="🔥" value={user.streak} label="Ofensiva" />
        <StatCard icon="🏆" value={user.rank} label="Ranking" />
        <StatCard icon="✨" value={user.points} label="Pontos" />
      </div>
    </div>

    {/* Botão de Logout */}
    <button
      onClick={onLogout}
      className="mt-8 w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
    >
      Sair da Conta
    </button>
  </div>
);


// --- Componente PRINCIPAL da Página de Usuário ---
function UserProfilePage() {
  // --- MUDANÇA: Removidos estados de loading, error, e userData (useState) ---
  
  // Apenas pegamos o logout, pois esta página é protegida
  const { logout } = useAuth(); 

  // --- MUDANÇA: useEffect para buscar dados foi REMOVIDO ---

  // --- MUDANÇA: Dados mockados agora são usados diretamente ---
  const userData: UserData = {
    name: 'Usuário de Exemplo', // Nome de exemplo
    email: 'user@example.com', // Email de exemplo
    avatar: 'A',
    level: 5,
    xp: 550,
    xpNeeded: 1000,
    streak: 15,
    rank: 'Ouro',
    points: 1250,
    recentActivity: [
      { id: 1, type: 'reciclagem', description: 'Reciclagem de 5kg de Plástico', date: '22/10' },
      { id: 2, type: 'quiz', description: 'Completou Quiz de Vidro', date: '21/10' },
      { id: 3, type: 'doacao', description: 'Doou 50 pontos para a causa', date: '20/10' },
    ],
  };

  // --- MUDANÇA: Renderização Condicional (loading, error, !userData) REMOVIDA ---
  // O componente agora renderiza diretamente os dados mockados

  // --- Renderização Principal (Layout que você forneceu, com dados MOCKADOS) ---
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8 lg:p-12">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Lado Esquerdo: Perfil e Estatísticas (com dados mockados) */}
        <UserSidebar user={userData} onLogout={logout} />

        {/* Lado Direito: Atividades e Metas */}
        <div className="w-full lg:w-3/4 space-y-8">
          {/* Card de Metas/Desafios (Estilo Duolingo) */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h3 className="text-2xl font-bold text-brand-green mb-4">Desafios de Reciclagem</h3>
            <p className="text-gray-300 mb-4">Complete desafios para ganhar mais XP e Pontos!</p>
            
            <div className="space-y-3">
              <GoalCard 
                title="Meta Semanal: 10kg de Papel" 
                progress={70}
                reward="50 XP" 
              />
              <GoalCard 
                title="Desafio de Vidro (Nível 2)" 
                progress={30} 
                reward="100 Pontos" 
              />
            </div>
          </div>

          {/* Card de Atividades Recentes (com dados mockados) */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h3 className="text-2xl font-bold mb-4">Atividade Recente</h3>
            <ul className="space-y-3">
              {userData.recentActivity && userData.recentActivity.length > 0 ? (
                userData.recentActivity.map(activity => (
                  <li key={activity.id} className="flex justify-between items-center p-3 bg-gray-700 rounded-md">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">
                        {activity.type === 'reciclagem' && '♻️'}
                        {activity.type === 'quiz' && '🧠'}
                        {activity.type === 'doacao' && '💚'}
                      </span>
                      <p className="text-gray-200">{activity.description}</p>
                    </div>
                    <span className="text-sm text-gray-400">{activity.date}</span>
                  </li>
                ))
              ) : (
                <li className="text-center text-gray-400 p-3">Nenhuma atividade recente.</li>
              )}
              <li className="text-center pt-3 text-brand-green cursor-pointer hover:underline">
                Ver todo o histórico
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;

