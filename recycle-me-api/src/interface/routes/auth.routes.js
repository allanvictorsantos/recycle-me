// Importa as ferramentas necessárias
import { Router } from "express";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

// Inicializa as ferramentas
const prisma = new PrismaClient();
const router = Router();

// Rota para login de USUÁRIO
// Endereço final: POST /auth/user
router.post("/user", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    const isPasswordValid = user
      ? await bcrypt.compare(password, user.password)
      : false;

    if (!user || !isPasswordValid) {
      return res.status(401).json({ message: "Email ou senha inválidos." });
    }

    res
      .status(200)
      .json({ message: "Login de usuário realizado com sucesso!", user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro interno no servidor.", error: error.message });
  }
});

// NO FUTURO: A rota de login do mercado virá aqui

// Rota para login de USUÁRIO mercado

// Rota para login de MERCADO (NOVO CÓDIGO)
// Endereço final: POST /auth/market
router.post("/market", async (req, res) => {
  try {
    const { cnpj, password } = req.body;

    const market = await prisma.market.findUnique({
      where: 
      { cnpj },
    });
    const isPasswordValid = market
      ? await bcrypt.compare(password, market.password)
      : false;

    if (!market || !isPasswordValid) {
      return res.status(401).json({ message: "CNPJ ou senha inválidos." });
    }
    res
      .status(200)
      .json({ message: "Login do mercado realizado com sucesso!", market });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro interno no servidor.", error: error.message });
  }
});

// Exporta o router configurado
export default router;
