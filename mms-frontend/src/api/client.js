import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:8000/api/', // backend URL
});

// Add JWT token automatically
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
