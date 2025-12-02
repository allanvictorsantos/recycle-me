import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
// Importamos o SEU middleware oficial atualizado
import { isAuthenticated } from '../../middlewares/isAuthenticated.js';

const prisma = new PrismaClient();
const router = Router();

// Aplicamos a proteção em TODAS as rotas deste arquivo de uma vez
router.use(isAuthenticated);

// ==================================================
// 1. ROTA DO USUÁRIO: CRIAR PEDIDO (GERAR TOKEN)
// ==================================================
router.post('/create', async (req, res) => {
  try {
    const { materialType, weightInKg } = req.body;
    
    // Verificação baseada no Token atualizado
    if (req.user.type !== 'user') {
      return res.status(403).json({ message: "Apenas usuários comuns podem criar pedidos de reciclagem." });
    }

    const transaction = await prisma.collection.create({
      data: {
        materialType,
        weightInKg: parseFloat(weightInKg),
        status: 'PENDING',
        userId: req.user.id, // ID vem do middleware
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

    // Verifica permissão de Mercado
    if (req.user.type !== 'market') {
      return res.status(403).json({ message: "Acesso restrito a Pontos de Coleta." });
    }
    
    // Trava de Segurança (Conta em Análise)
    if (req.user.isVerified === false) {
       return res.status(403).json({ message: "Sua conta ainda está em análise. Você não pode validar coletas." });
    }

    const transaction = await prisma.collection.findUnique({
      where: { id: parseInt(id) },
      include: { user: { select: { name: true, email: true } } }
    });

    if (!transaction) return res.status(404).json({ message: "Código inválido." });

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

    const POINTS_PER_KG = 100;
    const pointsToGive = Math.floor(finalWeight * POINTS_PER_KG);

    // Transação atômica no banco (Segurança total)
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