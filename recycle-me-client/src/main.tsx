import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

// Nossas importações de Contexto e Layout
import { AuthProvider } from './context/AuthContext';
import App from './App'; 
import { ProtectedRoute } from './components/ProtectedRoute'; 

// Páginas Existentes
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MapPage from './pages/MapPage';
import UserProfilePage from './pages/UserProfilePage';

// --- NOVAS PÁGINAS (O Coração do TCC) ---
import MarketDashboard from './pages/MarketDashboard';   // Painel do Fiscal
import RecycleRequestPage from './pages/RecycleRequestPage'; // Tela "Quero Reciclar"

import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rota "Mãe" com o Layout Principal (App.tsx) */}
          <Route path="/" element={<App />}>

            {/* === ROTAS PÚBLICAS === */}
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="cadastro" element={<RegisterPage />} />
            <Route path="mapa" element={<MapPage />} />

            {/* === ROTAS PROTEGIDAS (Só acessa se estiver logado) === */}
            <Route element={<ProtectedRoute />}>
              
              {/* Perfil do Usuário */}
              <Route path="perfil" element={<UserProfilePage />} />
              
              {/* Rota do Usuário: Gerar Token de Reciclagem */}
              <Route path="reciclar" element={<RecycleRequestPage />} />

              {/* Rota da Empresa: Painel do Fiscal */}
              <Route path="painel-fiscal" element={<MarketDashboard />} />

            </Route>

            {/* Rota 404 (Página não encontrada) */}
            <Route path="*" element={
              <main className="container mx-auto p-8 text-center">
                <h1 className="text-4xl font-bold dark:text-white">Erro 404</h1>
                <p className="text-gray-500 dark:text-gray-400 my-4">Página não encontrada.</p>
                <Link to="/" className="text-brand-green hover:underline">Voltar para a Home</Link>
              </main>
            } />

          </Route> 
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);