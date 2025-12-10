import axios from 'axios';

// Criamos a nossa instância centralizada do axios
const api = axios.create({
  // Definimos o endereço base da nossa "cozinha" (o back-end)
  // CORREÇÃO: Uso da variável de ambiente para funcionar no Local e no Render
  baseURL: import.meta.env.VITE_API_URL,
});

// Exportamos o "assistente" pronto para ser usado em outras partes da aplicação
export default api;