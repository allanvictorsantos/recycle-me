// Importa as ferramentas necessárias
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

// Inicializa as ferramentas
const prisma = new PrismaClient();
const router = Router();

// Rota para CRIAR um novo Mercado (Cadastro)
// Endereço final: POST /markets
router.post('/', async (req, res) => {
  try {
    const { name, cnpj, password, address, latitude, longitude } = req.body;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newMarket = await prisma.market.create({
      data: {
        name,
        cnpj,
        password: hashedPassword,
        address,
        latitude,
        longitude,
      },
    });

    res.status(201).json(newMarket);
  } catch (error) {
    // Tratamento de erro específico para CNPJ duplicado
    if (error.code === 'P2002' && error.meta?.target?.includes('cnpj')) {
      return res.status(409).json({ message: "Este CNPJ já está cadastrado." });
    }
    res.status(500).json({ message: "Não foi possível criar o mercado.", error: error.message });
  }
});
// Rota para LISTAR todos os Mercados
// Endereço final: GET /markets
router.get('/', async (req, res) => {
  try {
    // 1. Pede ao Prisma para buscar TODOS os mercados
    const markets = await prisma.market.findMany({
      // 2. 'select' para escolher APENAS os campos que queremos enviar
      // NUNCA envie a senha, mesmo que hasheada!
      select: {
        id: true,
        name: true,
        address: true,
        latitude: true,
        longitude: true,
        cnpj: true, // Útil para o front-end identificar
      }
    });

    // 3. Envia a lista de mercados com status 200 OK
    res.status(200).json(markets);

  } catch (error) {
    res.status(500).json({ message: "Não foi possível buscar os mercados.", error: error.message });
  }
});

// Exporta o router configurado
export default router;