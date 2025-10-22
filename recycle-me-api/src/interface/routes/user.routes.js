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

    // --- MUDANÇA: VALIDAÇÃO NO BACKEND ("Segurança na Porta") ---
    // Verificamos se algum dos campos essenciais está faltando ou veio vazio.
    if (!name || !email || !password) {
      // Retorna um erro 400 (Bad Request) informando o que faltou.
      return res
        .status(400)
        .json({
          message: "Todos os campos são obrigatórios: nome, email e senha.",
        });
    }
    // --- FIM DA VALIDAÇÃO ---

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Removemos a senha da resposta por segurança, mesmo hasheada.
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    // Tratamento de erro para email duplicado (comum com Prisma)
    if (error.code === "P2002" && error.meta?.target?.includes("email")) {
      return res
        .status(409)
        .json({ message: "Este email já está cadastrado." });
    }

    res.status(500).json({
      message: "Não foi possível criar o usuário.",
      error: error.message,
    });
  }
});

// NO FUTURO: Rotas para buscar, atualizar e deletar usuários virão aqui.

// Exporta o router configurado
export default router;
