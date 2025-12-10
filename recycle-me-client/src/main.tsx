import React from 'react';
import ReactDOM from 'react-dom/client';
// 1. ADICIONEI O 'Navigate' AQUI NAS IMPORTAÇÕES 👇
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';

// Contexto e Layout
import { AuthProvider } from './context/AuthContext';
import App from './App'; 
import { ProtectedRoute } from './components/ProtectedRoute'; 

// Páginas
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MapPage from './pages/MapPage';
import UserProfilePage from './pages/UserProfilePage';
import MarketDashboard from './pages/MarketDashboard';
import RecycleRequestPage from './pages/RecycleRequestPage';
import CompanyOffersPage from './pages/CompanyOffersPage';
import MarketplacePage from './pages/MarketplacePage';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rota "Mãe" com o Layout Principal (App.tsx) */}
          <Route path="/" element={<App />}>

            {/* ===================================================== */}
            {/* 🟢 CORREÇÃO DO INDEX.HTML (ADICIONE ESTA LINHA) 👇    */}
            {/* ===================================================== */}
            <Route path="index.html" element={<Navigate to="/" replace />} />

            {/* ===================================================== */}
            {/* 🟢 ÁREA PÚBLICA (QUALQUER UM ACESSA)                 */}
            {/* ===================================================== */}
            
            {/* Home Page (Início) */}
            <Route index element={<HomePage />} />
            
            <Route path="login" element={<LoginPage />} />
            <Route path="cadastro" element={<RegisterPage />} />
            <Route path="mapa" element={<MapPage />} />
            <Route path="clube" element={<MarketplacePage />} />

            {/* ===================================================== */}
            {/* 🔒 ÁREA PROTEGIDA (SÓ COM LOGIN)                       */}
            {/* ===================================================== */}
            <Route element={<ProtectedRoute />}>
              
              {/* Rotas do Usuário */}
              <Route path="perfil" element={<UserProfilePage />} />
              <Route path="reciclar" element={<RecycleRequestPage />} />

              {/* Rotas da Empresa */}
              <Route path="painel-fiscal" element={<MarketDashboard />} />
              <Route path="minhas-ofertas" element={<CompanyOffersPage />} />

            </Route>

            {/* Rota 404 */}
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