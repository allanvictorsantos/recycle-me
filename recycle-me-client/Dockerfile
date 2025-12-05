#/recycle-me-client/Dockerfile

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Expõe a porta do vite
EXPOSE 5173

# O "--host" é obrigatório par o Vite funcionar
CMD ["npm", "run", "dev", "--", "--host"]