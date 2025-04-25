import axios from 'axios';

// Acessar a configuração injetada durante o runtime (criada pelo entrypoint do Docker)
declare global {
  interface Window {
    ENV?: {
      API_URL: string;
    };
  }
}

// Determinar a URL da API baseado no ambiente
// 1. Usar a config de runtime (prioridade 1)
// 2. Usar a variável de ambiente do build (prioridade 2)
// 3. Usar o endereço interno do Railway se estiver em produção (prioridade 3)
// 4. Fallback para localhost (desenvolvimento)
let API_URL = 'http://localhost:5000'; // Default para desenvolvimento

if (window.ENV?.API_URL) {
  // 1. Configuração de runtime tem prioridade
  API_URL = window.ENV.API_URL;
  console.log('Usando API URL da configuração de runtime:', API_URL);
} else if (process.env.REACT_APP_API_URL) {
  // 2. Variável de ambiente do build
  API_URL = process.env.REACT_APP_API_URL;
  console.log('Usando API URL da variável de ambiente do build:', API_URL);
} else if (process.env.NODE_ENV === 'production') {
  // 3. Endereço interno do Railway
  API_URL = 'http://facemap.railway.internal:5000';
  console.log('Usando endereço interno do Railway:', API_URL);
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