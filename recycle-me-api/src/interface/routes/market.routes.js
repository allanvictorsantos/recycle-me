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
    const { name, tradeName, cnpj, email, password, cep, numero } = req.body;

    // --- Validação de Campos Obrigatórios ---
    if (!name || !cnpj || !email || !password || !cep || !numero) {
      return res.status(400).json({
        message: "Todos os campos são obrigatórios: nome, cnpj, email, senha, cep e número.",
      });
    }

    // --- Validação de E-mail Corporativo (Opcional, se quiser tirar pro TCC pode) ---
    const forbiddenDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'live.com', 'bol.com.br', 'uol.com.br', 'icloud.com'];
    const emailDomain = email.split('@')[1];

    // DICA: Se quiser aceitar gmail pra testar hoje, comente as linhas abaixo:
    // if (forbiddenDomains.includes(emailDomain)) {
    //    return res.status(400).json({ 
    //      message: 'Para cadastrar uma empresa, utilize um e-mail corporativo.' 
    //    });
    // }

    // --- GEOCODING (O GPS AUTOMÁTICO) ---
    let latitude = null;
    let longitude = null;
    let address = null;

    try {
      // Melhorei a string para o Google achar mais fácil
      const addressString = `${cep}, ${numero}, Brasil`;
      
      // CORREÇÃO 1: Nome exato da variável no Render
      const apiKey = process.env.Google_Maps_API_KEY; 

      if (!apiKey) {
         console.error("ERRO CRÍTICO: Chave da API do Google Maps não encontrada nas variáveis.");
      } else {
        console.log(`📡 Buscando GPS para: ${addressString}`);
        
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
          console.log(`✅ Localizado: Lat ${latitude}, Lng ${longitude}`);
        } else {
          console.warn(`⚠️ Google não achou o endereço. Status: ${response.data.status}`);
          // Fallback: Se não achar, tenta salvar null ou um valor padrão se preferir
        }
      }
    } catch (geoError) {
      console.error("Erro na conexão com Google Maps:", geoError.message);
    }
    
    // --- Salvar no Banco ---
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newMarket = await prisma.market.create({
      data: {
        name,      
        tradeName, 
        cnpj,
        email,     
        password: hashedPassword,
        cep,
        numero,
        address: address || `${cep}, ${numero}`, // Se o Google falhar, salva o que tem
        latitude,
        longitude,
        // CORREÇÃO 2: True para aparecer no mapa imediatamente na apresentação
        isVerified: true 
      },
    });

    const { password: _, ...marketWithoutPassword } = newMarket;

    res.status(201).json({
        message: "Cadastro realizado com sucesso!",
        market: marketWithoutPassword
    });

  } catch (dbError) {
    if (dbError.code === "P2002") {
        const target = dbError.meta?.target;
        if (target?.includes("cnpj")) return res.status(409).json({ message: "CNPJ já cadastrado." });
        if (target?.includes("email")) return res.status(409).json({ message: "E-mail já cadastrado." });
    }
    
    console.error("Erro no banco:", dbError);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
});

// --- Rota para LISTAR ---
router.get("/", async (req, res) => {
  try {
    const markets = await prisma.market.findMany({
      select: {
        id: true,
        name: true,
        tradeName: true,
        cnpj: true,
        cep: true,
        numero: true,
        address: true,
        latitude: true,
        longitude: true,
        isVerified: true
      },
    });
    res.status(200).json(markets);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar mercados." });
  }
});

export default router;