// src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем токен к каждому запросу
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Обработка ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (username, password) => 
    api.post('/auth/login', { username, password })
      .then(res => {
        localStorage.setItem('authToken', res.data.token);
        return res.data;
      }),
};

export const newsAPI = {
  getAll: () => api.get('/news').then(res => res.data),
  create: (data) => api.post('/news', data).then(res => res.data),
  update: (id, data) => api.put(`/news/${id}`, data).then(res => res.data),
  delete: (id) => api.delete(`/news/${id}`).then(res => res.data),
  bulkCreate: (items) => api.post('/news/bulk', items).then(res => res.data),
};

export const settingsAPI = {
  get: () => api.get('/settings').then(res => res.data),
  update: (data) => api.post('/settings', data).then(res => res.data),
};

export default api;