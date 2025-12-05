import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { isAuthenticated } from '../../middlewares/isAuthenticated.js';

const prisma = new PrismaClient();
const router = Router();

// GET /profile/me
router.get('/me', isAuthenticated, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        // 1. Coletas (Histórico de Impacto)
        collections: {
          where: { status: 'COMPLETED' },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { market: true }
        },
        // 2. Resgates (Meus Cupons) --- NOVO ---
        redemptions: {
            orderBy: { createdAt: 'desc' },
            include: { 
                offer: { include: { market: true } } // Traz dados da oferta e da loja
            }
        }
      }
    });

    if (!user) return res.status(404).json({ message: "Usuário não encontrado." });

    // Lógica de Gamificação
    const xpNeeded = user.level * 1000;
    let rank = "Bronze";
    if (user.points > 500) rank = "Prata";
    if (user.points > 1500) rank = "Ouro";
    if (user.points > 5000) rank = "Diamante";

    // Formata Histórico de Reciclagem
    const recentActivity = user.collections.map(coleta => ({
      id: coleta.id,
      type: 'reciclagem',
      description: `Reciclou ${coleta.weightInKg}kg de ${coleta.materialType}`,
      marketName: coleta.market ? coleta.market.name : "Ponto Parceiro",
      date: new Date(coleta.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    }));

    // Formata Meus Cupons --- NOVO ---
    const myCoupons = user.redemptions.map(redemption => ({
        id: redemption.id,
        title: redemption.offer.title,
        market: redemption.offer.market.tradeName || redemption.offer.market.name,
        code: redemption.code,
        cost: redemption.costAtTime,
        date: new Date(redemption.createdAt).toLocaleDateString('pt-BR')
    }));

    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      ...userWithoutPassword,
      xpNeeded,
      rank,
      streak: 12, // Mock
      recentActivity,
      myCoupons // <--- Enviando para o front
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar perfil.", error: error.message });
  }
});

export default router;