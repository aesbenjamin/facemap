import axios from 'axios';

// Get the API URL from environment variable or use Railway's public domain if in production
const API_URL = process.env.REACT_APP_API_URL || 
                (process.env.NODE_ENV === 'production' ? 
                 'https://facemap-production.up.railway.app' : 
                 'http://localhost:5000');

console.log('API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api; 