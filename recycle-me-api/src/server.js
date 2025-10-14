// FASE 1: Importações
import express from "express";
import cors from 'cors'; 
import userRoutes from './interface/routes/user.routes.js';
import authRoutes from './interface/routes/auth.routes.js';
import marketRoutes from './interface/routes/market.routes.js'; // NOVO: Importamos o marketRoutes

// FASE 2: Instanciação e Configurações Gerais
const app = express();
const port = 3000;
app.use(express.json());
app.use(cors());

// FASE 3: Plugando as Rotas
app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/markets', marketRoutes); // NOVO: Plugamos o marketRoutes com o prefixo /markets

// Rota de teste
app.get("/", (req, res) => {
  console.log("Recebi uma requisição GET na raiz /");
  res.send("API Recycle_me está no ar!!");
});

// FASE 4: Inicialização
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});