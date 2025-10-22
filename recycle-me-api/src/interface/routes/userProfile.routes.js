import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { isAuthenticated } from '../../middlewares/isAuthenticated.js';

const prisma = new PrismaClient();
const router = Router();

// Rota para buscar os dados do usuário autenticado
// Endereço final: GET /profile/me (lembre-se do prefixo que vamos adicionar no server.js)
router.get('/me', isAuthenticated, async (req, res) => {
  try {
    // 1. O middleware isAuthenticated já validou o token e nos deu o req.userId.
    const userId = req.userId;

    // 2. Usamos o userId para buscar o usuário no banco de dados.
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    // 3. Verificação de segurança: se o usuário não for encontrado (ex: foi deletado), retorna um erro.
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    // 4. Removemos a senha da resposta antes de enviá-la.
    const { password: _, ...userWithoutPassword } = user;

    // 5. Enviamos os dados do usuário com sucesso.
    res.status(200).json(userWithoutPassword);

  } catch (error) {
    res.status(500).json({ message: "Erro interno ao buscar o perfil do usuário.", error: error.message });
  }
});

export default router;

