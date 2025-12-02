// Importa as ferramentas necessárias
import { Router } from "express";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

// Inicializa as ferramentas
const prisma = new PrismaClient();
const router = Router();

// --- Rota para CRIAR um novo usuário (Cadastro) ---
// Endereço final: POST /users
router.post("/", async (req, res) => {
  console.log("Recebi uma requisição POST em /users");
  console.log("Corpo da requisição:", req.body);
  
  try {
    const { name, email, password } = req.body;

    // --- VALIDAÇÃO DE CAMPOS ---
    if (!name || !email || !password) {
      return res.status(400).json({
          message: "Todos os campos são obrigatórios: nome, email e senha.",
        });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Criação do usuário com INICIALIZAÇÃO DA GAMIFICAÇÃO
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // Garante que todo usuário comece do zero
        points: 0,      // Saldo EcoPoints
        xp: 0,          // Experiência
        level: 1,       // Nível inicial
        isCertified: false // Ainda não passou no Quiz
      },
    });

    // Removemos a senha da resposta
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json(userWithoutPassword);

  } catch (error) {
    // Tratamento de erro para email duplicado
    if (error.code === "P2002" && error.meta?.target?.includes("email")) {
      return res.status(409).json({ message: "Este email já está cadastrado." });
    }

    res.status(500).json({
      message: "Não foi possível criar o usuário.",
      error: error.message,
    });
  }
});

// Exporta o router configurado
export default router;