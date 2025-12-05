import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { isAuthenticated } from '../../middlewares/isAuthenticated.js';

const prisma = new PrismaClient();
const router = Router();

router.use(isAuthenticated);

// ==================================================
// 0. ROTA DE STATS
// ==================================================
router.get('/market/stats', async (req, res) => {
  try {
    if (req.user.type !== 'market') return res.status(403).json({ message: "Acesso negado." });

    const myCollections = await prisma.collection.findMany({
        where: { 
            marketId: req.user.id,
            status: 'COMPLETED'
        }
    });

    const totalWeight = myCollections.reduce((acc, curr) => acc + (curr.weightInKg || 0), 0);
    const totalPoints = myCollections.reduce((acc, curr) => acc + (curr.pointsEarned || 0), 0);
    
    const today = new Date().toDateString();
    const dailyCount = myCollections.filter(c => new Date(c.updatedAt).toDateString() === today).length;

    res.json({ dailyCount, totalWeight, totalPoints });
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar estatísticas." });
  }
});

// ==================================================
// 1. CRIAR PEDIDO
// ==================================================
router.post('/create', async (req, res) => {
  try {
    const { materialType, weightInKg, marketId } = req.body;
    
    if (req.user.type !== 'user') {
      return res.status(403).json({ message: "Apenas usuários comuns podem criar pedidos." });
    }

    const transaction = await prisma.collection.create({
      data: {
        materialType,
        weightInKg: parseFloat(weightInKg),
        status: 'PENDING',
        userId: req.user.id,
        marketId: marketId ? parseInt(marketId) : null 
      }
    });

    res.status(201).json({
      message: "Pedido criado!",
      token: transaction.id,
      details: transaction
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao criar pedido." });
  }
});

// ==================================================
// 2. LER PEDIDO (Com trava de mercado exclusivo)
// ==================================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.type !== 'market') return res.status(403).json({ message: "Acesso restrito." });
    if (req.user.isVerified === false) return res.status(403).json({ message: "Conta não verificada." });

    const transaction = await prisma.collection.findUnique({
      where: { id: parseInt(id) },
      include: { user: { select: { name: true, email: true } } }
    });

    if (!transaction) return res.status(404).json({ message: "Código inválido." });
    if (transaction.status === 'COMPLETED') return res.status(400).json({ message: "Pedido já validado." });

    // --- TRAVA DE EXCLUSIVIDADE ---
    // Se o pedido tem dono (marketId) e não sou eu, bloqueia.
    if (transaction.marketId && transaction.marketId !== req.user.id) {
        return res.status(403).json({ 
            message: "Este pedido é exclusivo para outro ponto de coleta." 
        });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar pedido." });
  }
});

// ==================================================
// 3. FINALIZAR (Com trava de mercado exclusivo)
// ==================================================
router.patch('/:id/confirm', async (req, res) => {
  try {
    const { id } = req.params;
    const { finalWeight } = req.body;

    if (req.user.type !== 'market') return res.status(403).json({ message: "Acesso negado." });
    if (!req.user.isVerified) return res.status(403).json({ message: "Conta não verificada." });

    const checkTransaction = await prisma.collection.findUnique({ where: { id: parseInt(id) } });
    
    if (!checkTransaction) return res.status(404).json({ message: "Pedido não encontrado." });
    if (checkTransaction.status === 'COMPLETED') return res.status(400).json({ message: "Token já utilizado!" });

    // --- TRAVA DE EXCLUSIVIDADE ---
    if (checkTransaction.marketId && checkTransaction.marketId !== req.user.id) {
        return res.status(403).json({ 
            message: "Você não pode validar este pedido (Destinado a outro local)." 
        });
    }

    const POINTS_PER_KG = 100;
    const pointsToGive = Math.floor(finalWeight * POINTS_PER_KG);

    const result = await prisma.$transaction(async (prisma) => {
      const updatedCollection = await prisma.collection.update({
        where: { id: parseInt(id) },
        data: {
          status: 'COMPLETED',
          weightInKg: parseFloat(finalWeight),
          pointsEarned: pointsToGive,
          marketId: req.user.id // Grava quem atendeu
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
      message: "Coleta validada!",
      pointsGenerated: pointsToGive
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao processar." });
  }
});

export default router;