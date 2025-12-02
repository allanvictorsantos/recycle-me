// Importa as ferramentas necessárias
import { Router } from "express";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import axios from "axios";

// Inicializa as ferramentas
const prisma = new PrismaClient();
const router = Router();

// --- Rota para CRIAR um novo Mercado (Cadastro) ---
// Endereço final: POST /markets
router.post("/", async (req, res) => {
  try {
    // 1. ADICIONADO: Campo 'email' e 'tradeName' na extração
    const { name, tradeName, cnpj, email, password, cep, numero } = req.body;

    // --- Validação de Campos Obrigatórios ---
    // 2. ADICIONADO: 'email' na validação
    if (!name || !cnpj || !email || !password || !cep || !numero) {
      return res.status(400).json({
        message: "Todos os campos são obrigatórios: nome, cnpj, email, senha, cep e número.",
      });
    }

    // --- 3. NOVA SEGURANÇA: Validação de E-mail Corporativo ---
    const forbiddenDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'live.com', 'bol.com.br', 'uol.com.br', 'icloud.com'];
    const emailDomain = email.split('@')[1];

    if (forbiddenDomains.includes(emailDomain)) {
       return res.status(400).json({ 
         message: 'Para cadastrar uma empresa, utilize um e-mail corporativo (ex: contato@suaempresa.com.br). E-mails pessoais não são permitidos.' 
       });
    }

    // --- CHAMADA PARA A API DO GOOGLE GEOCODING (Mantida igual) ---
    let latitude = null;
    let longitude = null;
    let address = null;

    try {
      const addressString = `${cep}, ${numero}, Brasil`;
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;

      if (!apiKey) {
         console.error("ERRO: Chave da API do Google Maps não configurada.");
      } else {
        console.log(`Buscando coordenadas para: ${addressString}`);
        const response = await axios.get(
          "https://maps.googleapis.com/maps/api/geocode/json",
          {
            params: {
              address: addressString,
              key: apiKey,
            },
          }
        );

        if (response.data.status === "OK" && response.data.results.length > 0) {
          const location = response.data.results[0].geometry.location;
          latitude = location.lat;
          longitude = location.lng;
          address = response.data.results[0].formatted_address;
        } else {
          console.warn(`Aviso: Google Geocoding não encontrou resultados.`);
        }
      }
    } catch (geoError) {
      console.error("Erro ao chamar a API do Google Geocoding:", geoError.message);
    }
    
    // --- Hashing da Senha e Criação no Prisma ---
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Salvamos TODOS os dados com a trava de segurança
    const newMarket = await prisma.market.create({
      data: {
        name,       // Razão Social
        tradeName,  // Nome Fantasia (opcional)
        cnpj,
        email,      // Novo campo obrigatório
        password: hashedPassword,
        cep,
        numero,
        address,
        latitude,
        longitude,
        isVerified: false // IMPORTANTE: Nasce bloqueado (Invisível no mapa)
      },
    });

    // Removemos a senha da resposta
    const { password: _, ...marketWithoutPassword } = newMarket;

    // Mensagem customizada para avisar sobre a análise
    res.status(201).json({
        message: "Cadastro realizado! Sua conta está em análise de compliance e será ativada em até 24h.",
        market: marketWithoutPassword
    });

  } catch (dbError) {
    // Tratamento de erro de duplicidade (CNPJ ou EMAIL)
    if (dbError.code === "P2002") {
        const target = dbError.meta?.target;
        if (target?.includes("cnpj")) {
            return res.status(409).json({ message: "Este CNPJ já está cadastrado." });
        }
        if (target?.includes("email")) {
            return res.status(409).json({ message: "Este e-mail já está cadastrado." });
        }
    }
    
    console.error("Erro ao criar mercado no banco:", dbError);
    res.status(500).json({
        message: "Não foi possível criar o mercado.",
        error: dbError.message,
      });
  }
});

// --- Rota para LISTAR (Atualizada para retornar isVerified) ---
router.get("/", async (req, res) => {
  try {
    const markets = await prisma.market.findMany({
      select: {
        id: true,
        name: true,
        tradeName: true, // Útil para mostrar no mapa
        cnpj: true,
        cep: true,
        numero: true,
        address: true,
        latitude: true,
        longitude: true,
        isVerified: true // O Front precisa saber disso para filtrar ou mostrar ícone de "Verificado"
      },
    });
    res.status(200).json(markets);
  } catch (error) {
    console.error("Erro ao buscar mercados:", error);
    res.status(500).json({
        message: "Não foi possível buscar os mercados.",
        error: error.message,
      });
  }
});

export default router;