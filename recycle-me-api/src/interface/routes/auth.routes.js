import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// Rota para login de USUÁRIO (sem JWT)
router.post('/user', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    const isPasswordValid = user ? await bcrypt.compare(password, user.password) : false;

    if (!user || !isPasswordValid) {
      return res.status(401).json({ message: "Email ou senha inválidos." });
    }
    
    // Removemos a senha da resposta por segurança
    const { password: _, ...userWithoutPassword } = user;

    // Enviamos uma resposta de sucesso simples
    res.status(200).json({ 
      message: "Login de usuário realizado com sucesso!", 
      user: userWithoutPassword,
    });

  } catch (error) {
    res.status(500).json({ message: "Erro interno no servidor.", error: error.message });
  }
});

// Rota para login de MERCADO (sem JWT)
router.post('/market', async (req, res) => {
  try {
    const { cnpj, password } = req.body;
    const market = await prisma.market.findUnique({ where: { cnpj } });
    const isPasswordValid = market ? await bcrypt.compare(password, market.password) : false;

    if (!market || !isPasswordValid) {
      return res.status(401).json({ message: "CNPJ ou senha inválidos." });
    }

    const { password: _, ...marketWithoutPassword } = market;
    
    res.status(200).json({ 
      message: "Login do mercado realizado com sucesso!", 
      market: marketWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro interno no servidor.", error: error.message });
  }
});

export default router;

