import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { isAuthenticated } from '../../middlewares/isAuthenticated.js';

const prisma = new PrismaClient();
const router = Router();

// GET /profile/me
router.get('/me', isAuthenticated, async (req, res) => {
  try {
    // 1. Buscamos o usuário E TAMBÉM suas coletas (Join)
    const user = await prisma.user.findUnique({
      where: { id: req.userId }, // O middleware garante que temos esse ID
      include: {
        collections: {
          where: { status: 'COMPLETED' }, // Só queremos as validadas
          orderBy: { createdAt: 'desc' }, // As mais recentes primeiro
          take: 5 // Pegamos só as últimas 5 para o perfil
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    // 2. Lógica de Gamificação (Calculada na hora)
    // Exemplo: Cada nível precisa de 1000 XP * Nível Atual
    const xpNeeded = user.level * 1000;
    
    // Exemplo: Define Rank baseado nos pontos totais
    let rank = "Bronze";
    if (user.points > 500) rank = "Prata";
    if (user.points > 1500) rank = "Ouro";
    if (user.points > 5000) rank = "Diamante";
    if (user.points > 10000) rank = "Mítico";

    // 3. Formatamos o histórico para ficar bonito no Front
    // O front espera: { type, description, date }
    const recentActivity = user.collections.map(coleta => ({
      id: coleta.id,
      type: 'reciclagem', // Ícone de reciclagem
      description: `Reciclou ${coleta.weightInKg}kg de ${coleta.materialType}`,
      date: new Date(coleta.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    }));

    // 4. Removemos a senha
    const { password: _, ...userWithoutPassword } = user;

    // 5. Enviamos o pacote completo!
    res.status(200).json({
      ...userWithoutPassword,
      xpNeeded,
      rank,
      streak: 12, // Hardcoded por enquanto (Feature futura: ofensiva diária)
      recentActivity
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar perfil.", error: error.message });
  }
});

export default router;