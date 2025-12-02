// Importa as ferramentas necessárias
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

// Inicializa as ferramentas
const prisma = new PrismaClient();
const router = Router();

// --- Rota de Login Unificada ---
// Endereço: POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { type, email, cnpj, password } = req.body;

    // Validação básica de entrada
    if (!type || !password || (type === 'pf' && !email) || (type === 'pj' && !cnpj)) {
      return res.status(400).json({ message: "Dados de login incompletos." });
    }

    let userOrMarket;
    let entityId;
    let entityType;
    let isVerified = true; // Usuário PF nasce verificado por padrão
    let name = '';

    if (type === 'pf') {
      // Lógica para login de Pessoa Física (Usuário)
      userOrMarket = await prisma.user.findUnique({ where: { email } });
      
      if (!userOrMarket) {
        return res.status(401).json({ message: "Email não encontrado." });
      }
      
      entityId = userOrMarket.id;
      entityType = 'user'; // Vamos padronizar para 'user' no token
      name = userOrMarket.name;

    } else if (type === 'pj') {
      // Lógica para login de Pessoa Jurídica (Mercado)
      userOrMarket = await prisma.market.findUnique({ where: { cnpj } });
      
       if (!userOrMarket) {
        return res.status(401).json({ message: "CNPJ não encontrado." });
      }
      
      entityId = userOrMarket.id;
      entityType = 'market'; // Padronizar para 'market'
      name = userOrMarket.name;
      
      // Importante: Pegar o status de verificação do banco
      isVerified = userOrMarket.isVerified; 

    } else {
      return res.status(400).json({ message: "Tipo de conta inválido." });
    }

    // Comparar a senha enviada com a senha hasheada no banco
    const isPasswordValid = await bcrypt.compare(password, userOrMarket.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Senha incorreta." });
    }

    // Se tudo estiver correto, gerar o Token JWT
    const token = jwt.sign(
      { 
        id: entityId, 
        type: entityType, // 'user' ou 'market'
        name: name,
        isVerified: isVerified // Fundamental para a segurança do Front
      },
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    // Enviar o token E os dados do usuário como resposta
    // (Isso ajuda o React a redirecionar sem precisar decodificar o token manualmente)
    res.status(200).json({ 
      token,
      user: {
        id: entityId,
        name: name,
        type: entityType,
        isVerified: isVerified,
        email: email || null,
        cnpj: cnpj || null
      }
    });

  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ message: "Ocorreu um erro interno no servidor.", error: error.message });
  }
});

// Exporta o router configurado
export default router;