// FASE 1: Importações
import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import cors from 'cors'; 

import userRoutes from './interface/routes/user.routes.js';
import authRoutes from './interface/routes/auth.routes.js';
import marketRoutes from './interface/routes/market.routes.js';
import userProfileRoutes from './interface/routes/userProfile.routes.js'; 
import transactionRoutes from './interface/routes/transaction.routes.js';

// --- NOVO: Importamos as rotas do Marketplace ---
import marketplaceRoutes from './interface/routes/marketplace.routes.js';

// FASE 2: Instanciação e Configurações Gerais
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());
  
// FASE 3: Plugando as Rotas
app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/markets', marketRoutes);
app.use('/profile', userProfileRoutes);
app.use('/transactions', transactionRoutes);

// --- NOVO: Plugamos a rota de ofertas e resgates ---
// Tudo que for /market/offers ou /market/redeem vai cair aqui
app.use('/market', marketplaceRoutes);

// Rota de teste
app.get("/", (req, res) => {
  console.log("Recebi uma requisição GET na raiz /");
  res.send("API Recycle_me está no ar!!");
});

// FASE 4: Inicialização
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});