import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { isAuthenticated } from '../../middlewares/isAuthenticated.js';

const prisma = new PrismaClient();
const router = Router();

router.use(isAuthenticated);

// 1. EMPRESA: CRIAR OFERTA (COM VALIDADE)
router.post('/offers', async (req, res) => {
  try {
    if (req.user.type !== 'market') return res.status(403).json({ message: "Apenas parceiros podem criar ofertas." });
    
    const { title, description, cost, image, validFrom, validUntil } = req.body;

    const offer = await prisma.offer.create({
      data: {
        title,
        description,
        cost: parseInt(cost),
        image: image || 'fa-gift',
        marketId: req.user.id,
        active: true,
        validFrom: validFrom ? new Date(validFrom) : null,
        validUntil: validUntil ? new Date(validUntil) : null
      }
    });

    res.status(201).json(offer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao criar oferta." });
  }
});

// 2. PÚBLICO: LISTAR OFERTAS
router.get('/offers', async (req, res) => {
  try {
    const offers = await prisma.offer.findMany({
      where: { active: true },
      include: { 
        market: { select: { name: true, tradeName: true } } 
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: "Erro ao listar ofertas." });
  }
});

// 3. EMPRESA: LISTAR MINHAS OFERTAS
router.get('/my-offers', async (req, res) => {
    try {
      if (req.user.type !== 'market') return res.status(403).json({ message: "Acesso negado." });
      const offers = await prisma.offer.findMany({
        where: { marketId: req.user.id },
        orderBy: { createdAt: 'desc' }
      });
      res.json(offers);
    } catch (error) {
      res.status(500).json({ message: "Erro ao listar." });
    }
});

// 4. USUÁRIO: COMPRAR OFERTA (CORRIGIDO)
router.post('/redeem', async (req, res) => {
  try {
    if (req.user.type !== 'user') return res.status(403).json({ message: "Apenas usuários podem resgatar." });
    
    const { offerId } = req.body;

    const result = await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      const offer = await prisma.offer.findUnique({ where: { id: parseInt(offerId) } });
      
      if (!offer || !offer.active) throw new Error("Oferta indisponível");

      // Validação de Data
      const now = new Date();
      if (offer.validFrom && new Date(offer.validFrom) > now) throw new Error("Esta oferta ainda não começou.");
      if (offer.validUntil && new Date(offer.validUntil) < now) throw new Error("Esta oferta expirou.");

      if (user.points < offer.cost) throw new Error("Saldo insuficiente.");

      // Desconta pontos
      await prisma.user.update({
        where: { id: user.id },
        data: { points: { decrement: offer.cost } }
      });

      const generatedCode = `#${offer.id}-${Date.now().toString().slice(-4)}`; 
      
      // CRIAÇÃO DO RESGATE (CORRIGIDA)
      const redemption = await prisma.redemption.create({
        data: {
            userId: user.id,
            offerId: offer.id,
            costAtTime: offer.cost,
            couponCode: generatedCode // <--- AQUI ESTAVA O ERRO (era 'code', agora é 'couponCode')
        }
      });

      return redemption;
    });

    res.json({ message: "Resgate realizado!", cupom: result });

  } catch (error) {
    const status = error.message === "Saldo insuficiente." || error.message.includes("oferta") ? 400 : 500;
    res.status(status).json({ message: error.message || "Erro no resgate." });
  }
});

export default router;