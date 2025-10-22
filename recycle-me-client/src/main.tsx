import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';

import App from './App.tsx';
import HomePage from './pages/HomePage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import MapPage from './pages/MapPage.tsx';
import {ProtectedRoute} from './components/ProtectedRoute.tsx';

import './index.css';

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />, // O Layout (Header/Footer)
      children: [
        // --- ROTAS PÚBLICAS ---
        // (Renderizadas dentro do <Outlet> do App)
        { index: true, element: <HomePage /> }, // 'index: true' é o mesmo que 'path: "/"'
        { path: "login", element: <LoginPage /> },
        { path: "cadastro", element: <RegisterPage /> },
        
        // --- MUDANÇA PRINCIPAL AQUI ---
        // Em vez de "envelopar" a rota, criamos um "Grupo de Layout"
        // que usa o ProtectedRoute.
        {
          element: <ProtectedRoute />, // 1. O "Segurança" é o layout...
          children: [
            // 2. ...e o <Outlet> dele vai renderizar estas rotas filhas:
            { path: "mapa", element: <MapPage /> },
            
            // Se você tiver mais rotas protegidas, adicione-as aqui:
            // { path: "dashboard", element: <DashboardPage /> },
            // { path: "meu-perfil", element: <PerfilPage /> },
          ]
        },
        
        // (Opcional: Adicionar Rota 404 aqui)
        // { path: "*", element: <Pagina404 /> }
      ],
    },
  ],
  {
    // Sua configuração de basename está perfeita, mantenha!
    basename: "/recycle-me/", 
  }
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* O AuthProvider abraçando tudo está PERFEITO! */}
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
);