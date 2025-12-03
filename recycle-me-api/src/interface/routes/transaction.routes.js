import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
// Importamos o SEU middleware oficial atualizado
import { isAuthenticated } from '../../middlewares/isAuthenticated.js';

const prisma = new PrismaClient();
const router = Router();

// Aplicamos a proteção em TODAS as rotas deste arquivo
router.use(isAuthenticated);

// ==================================================
// 0. ROTA DE STATS (Para o Dashboard do Fiscal)
// ==================================================
router.get('/market/stats', async (req, res) => {
  try {
    if (req.user.type !== 'market') return res.status(403).json({ message: "Acesso negado." });

    // Busca todas as coletas JÁ FEITAS por este mercado
    const myCollections = await prisma.collection.findMany({
        where: { 
            marketId: req.user.id,
            status: 'COMPLETED'
        }
    });

    // Calcula totais
    const totalWeight = myCollections.reduce((acc, curr) => acc + (curr.weightInKg || 0), 0);
    const totalPoints = myCollections.reduce((acc, curr) => acc + (curr.pointsEarned || 0), 0);
    
    // Coletas de hoje
    const today = new Date().toDateString();
    const dailyCount = myCollections.filter(c => new Date(c.updatedAt).toDateString() === today).length;

    res.json({
        dailyCount,
        totalWeight,
        totalPoints
    });

  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar estatísticas." });
  }
});

// ==================================================
// 1. ROTA DO USUÁRIO: CRIAR PEDIDO (GERAR TOKEN)
// ==================================================
router.post('/create', async (req, res) => {
  try {
    const { materialType, weightInKg } = req.body;
    
    if (req.user.type !== 'user') {
      return res.status(403).json({ message: "Apenas usuários comuns podem criar pedidos de reciclagem." });
    }

    const transaction = await prisma.collection.create({
      data: {
        materialType,
        weightInKg: parseFloat(weightInKg),
        status: 'PENDING',
        userId: req.user.id,
      }
    });

    res.status(201).json({
      message: "Pedido criado com sucesso!",
      token: transaction.id,
      details: transaction
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao criar pedido." });
  }
});

// ==================================================
// 2. ROTA DO FISCAL: LER PEDIDO
// ==================================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.type !== 'market') {
      return res.status(403).json({ message: "Acesso restrito a Pontos de Coleta." });
    }
    
    if (req.user.isVerified === false) {
       return res.status(403).json({ message: "Sua conta ainda está em análise. Você não pode validar coletas." });
    }

    const transaction = await prisma.collection.findUnique({
      where: { id: parseInt(id) },
      include: { user: { select: { name: true, email: true } } }
    });

    if (!transaction) return res.status(404).json({ message: "Código inválido." });

    // Aviso se já foi usado
    if (transaction.status === 'COMPLETED') {
        return res.status(400).json({ message: "Este pedido já foi validado anteriormente." });
    }

    res.json(transaction);

  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar pedido." });
  }
});

// ==================================================
// 3. ROTA DO FISCAL: FINALIZAR E PONTUAR
// ==================================================
router.patch('/:id/confirm', async (req, res) => {
  try {
    const { id } = req.params;
    const { finalWeight } = req.body;

    if (req.user.type !== 'market') return res.status(403).json({ message: "Acesso negado." });
    if (!req.user.isVerified) return res.status(403).json({ message: "Conta não verificada." });

    // --- BLINDAGEM DE SEGURANÇA ---
    const checkTransaction = await prisma.collection.findUnique({ where: { id: parseInt(id) } });
    if (!checkTransaction) return res.status(404).json({ message: "Pedido não encontrado." });
    if (checkTransaction.status === 'COMPLETED') return res.status(400).json({ message: "ERRO: Token já utilizado!" });
    // -----------------------------

    const POINTS_PER_KG = 100;
    const pointsToGive = Math.floor(finalWeight * POINTS_PER_KG);

    const result = await prisma.$transaction(async (prisma) => {
      const updatedCollection = await prisma.collection.update({
        where: { id: parseInt(id) },
        data: {
          status: 'COMPLETED',
          weightInKg: parseFloat(finalWeight),
          pointsEarned: pointsToGive,
          marketId: req.user.id
        }
      });

      await prisma.user.update({
        where: { id: updatedCollection.userId },
        data: {
          points: { increment: pointsToGive },
          xp: { increment: pointsToGive }
        }
      });

      return updatedCollection;
    });

    res.json({
      message: "Coleta validada e pontos transferidos!",
      pointsGenerated: pointsToGive
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao processar." });
  }
});

export default router;