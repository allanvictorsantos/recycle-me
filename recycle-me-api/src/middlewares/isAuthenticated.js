import jwt from 'jsonwebtoken';

export function isAuthenticated(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token não fornecido." });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return res.status(401).json({ message: "Erro no formato do token." });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ message: "Token mal formatado." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token inválido ou expirado." });
    }

    // --- O UPGRADE AQUI ---
    // Agora salvamos o objeto completo com TIPO e VERIFICAÇÃO
    // Isso permite saber se é 'user' ou 'market' nas rotas
    req.user = {
      id: decoded.id,
      type: decoded.type,         // 'user' ou 'market'
      isVerified: decoded.isVerified,
      name: decoded.name
    };
    
    // Mantemos o req.userId por compatibilidade com códigos antigos, se houver
    req.userId = decoded.id; 

    return next();
  });
}