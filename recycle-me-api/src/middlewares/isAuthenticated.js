import jwt from 'jsonwebtoken';

// Este é o nosso "segurança". É uma função que recebe a requisição (req),
// a resposta (res) e um "passe livre" para o próximo passo (next).
export function isAuthenticated(req, res, next) {
  // --- PASSO 1: Procurar pelo crachá (token) ---
  const authHeader = req.headers.authorization;

  // Se o cabeçalho 'authorization' não existir, o usuário nem tentou se identificar.
  if (!authHeader) {
    return res.status(401).json({ message: "Token não fornecido." });
  }

  // --- PASSO 2: Verificar se o crachá está no formato correto ---
  // O padrão é "Bearer [token]". Precisamos separar essas duas partes.
  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return res.status(401).json({ message: "Erro no formato do token." });
  }

  const [scheme, token] = parts;

  // Verificamos se a primeira parte é realmente "Bearer"
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ message: "Token mal formatado." });
  }

  // --- PASSO 3: Verificar a validade da assinatura do crachá ---
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    // Se a assinatura for inválida ou o token tiver expirado, o 'err' existirá.
    if (err) {
      return res.status(401).json({ message: "Token inválido ou expirado." });
    }

    // --- PASSO 4: Carimbar a requisição e liberar a passagem ---
    // SUCESSO! O crachá é válido.
    // 'decoded' contém o que guardamos no token (userId, email, etc.)
    // Nós "carimbamos" a requisição, adicionando o ID do usuário a ela.
    req.userId = decoded.userId; 
    
    // Usamos o "passe livre" para deixar a requisição continuar para a sua rota final.
    return next();
  });
}
