import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';

import App from './App.tsx';
import HomePage from './pages/HomePage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import MapPage from './pages/MapPage.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx'; // 1. Importamos nosso segurança

import './index.css';

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,
      children: [
        { path: "/", element: <HomePage /> },
        { path: "/login", element: <LoginPage /> },
        { path: "/cadastro", element: <RegisterPage /> },
        {
          // 2. MUDANÇA PRINCIPAL AQUI:
          // A rota "/mapa" agora é "envelopada" pelo nosso componente de segurança.
          path: "/mapa",
          element: (
            <ProtectedRoute>
              <MapPage />
            </ProtectedRoute>
          ),
        },
      ],
    },
  ],
  {
    basename: "/recycle-me/",
  }
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
);

