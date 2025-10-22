// Importa as ferramentas necessárias
import { Router } from "express";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

// Inicializa as ferramentas
const prisma = new PrismaClient();
const router = Router();

// --- Rota para CRIAR um novo Mercado (Cadastro) ---
// Endereço final: POST /markets
router.post("/", async (req, res) => {
  try {
    const { name, cnpj, password, cep, numero } = req.body;

    // --- MUDANÇA: VALIDAÇÃO NO BACKEND ("Segurança na Porta") ---
    // Verificamos se algum dos campos essenciais para um mercado está faltando.
    if (!name || !cnpj || !password || !cep || !numero) {
      // Retorna um erro 400 (Bad Request) informando o que faltou.
      return res
        .status(400)
        .json({
          message:
            "Todos os campos são obrigatórios: nome, cnpj, senha, cep e número.",
        });
    } // A lógica de hashear a senha continua perfeita
    // --- FIM DA VALIDAÇÃO ---

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newMarket = await prisma.market.create({
      data: {
        name,
        cnpj,
        password: hashedPassword,
        cep,
        numero,
      },
    });

    // Removemos a senha da resposta por segurança
    const { password: _, ...marketWithoutPassword } = newMarket;

    res.status(201).json(marketWithoutPassword);
  } catch (error) {
    // Seu tratamento de erro para CNPJ duplicado está perfeito
    if (error.code === "P2002" && error.meta?.target?.includes("cnpj")) {
      return res.status(409).json({ message: "Este CNPJ já está cadastrado." });
    }
    res
      .status(500)
      .json({
        message: "Não foi possível criar o mercado.",
        error: error.message,
      });
  }
});

// --- Rota para LISTAR todos os Mercados ---
// (Esta rota não precisa de mudanças, continua perfeita)
router.get("/", async (req, res) => {
  try {
    const markets = await prisma.market.findMany({
      select: {
        id: true,
        name: true,
        cnpj: true,
        cep: true,
        numero: true,
        address: true,
        latitude: true,
        longitude: true,
      },
    });

    res.status(200).json(markets);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Não foi possível buscar os mercados.",
        error: error.message,
      });
  }
});

// Exporta o router configurado
export default router;
