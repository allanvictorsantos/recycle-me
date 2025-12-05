#/recycle-me-api/Dockerfile

FROM node:20-alpine

WORKDIR /app

# Copia os arquivos de depedência
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o resto do código 
COPY . .

# Gera o cliente do prisma (essencial)
RUN npx prisma generate

# Expõe a porta (3000)
EXPOSE 3000

# Inicia o servidor
CMD ["npm", "run", "dev"]