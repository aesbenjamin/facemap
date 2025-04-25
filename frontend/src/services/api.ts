import axios from 'axios';

// Acessar a configuração injetada durante o runtime (criada pelo entrypoint do Docker)
declare global {
  interface Window {
    ENV?: {
      API_URL: string;
    };
  }
}

// No ambiente de produção, devemos usar o proxy reverso através do nosso próprio servidor
// em vez de tentar acessar diretamente o backend via HTTP
let API_URL = '/api'; // Usar o proxy definido no nginx.conf

// Em desenvolvimento, podemos usar o endereço direto
if (process.env.NODE_ENV === 'development') {
  API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  console.log('Ambiente de desenvolvimento, usando URL direto:', API_URL);
} else {
  console.log('Ambiente de produção, usando proxy reverso em: /api');
}

console.log('API URL configurada:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adicionar interceptor para debug
api.interceptors.request.use(
  (config) => {
    const url = config.baseURL ? `${config.baseURL}${config.url || ''}` : config.url;
    console.log('Fazendo requisição para:', url);
    return config;
  },
  (error) => {
    console.error('Erro na requisição:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('Resposta recebida com sucesso');
    return response;
  },
  (error) => {
    console.error('Erro na resposta:', error.message, error.response?.status);
    return Promise.reject(error);
  }
);

export default api; 