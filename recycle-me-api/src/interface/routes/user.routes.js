// Importa as ferramentas necessárias
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

// Inicializa as ferramentas
const prisma = new PrismaClient();
const router = Router();

// Rota para CRIAR um novo usuário (Cadastro)
// Endereço final: POST /users
router.post('/', async (req, res) => {
  console.log("Recebi uma requisição POST em /users");
  console.log("Corpo da requisição:", req.body);
  try {
    const { name, email, password } = req.body;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({
      message: "Não foi possível criar o usuário.",
      error: error.message,
    });
  }
});

// NO FUTURO: Rotas para buscar, atualizar e deletar usuários virão aqui.

// Exporta o router configurado
export default router;