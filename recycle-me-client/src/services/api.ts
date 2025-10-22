import axios from 'axios';

// Criamos a nossa instância centralizada do axios
const api = axios.create({
  // Definimos o endereço base da nossa "cozinha" (o back-end)
  baseURL: 'http://localhost:3000',
});

// Exportamos o "assistente" pronto para ser usado em outras partes da aplicação
export default api;

