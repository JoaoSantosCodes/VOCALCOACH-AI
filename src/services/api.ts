import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3003',
  timeout: 10000,
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Serviços de usuário
export const userService = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: { name: string; email: string; password: string }) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: { name?: string; email?: string }) => api.put('/auth/profile', data),
  getStats: () => api.get('/stats'),
  getMetrics: () => api.get('/stats/metrics'),
};

// Serviços de exercícios
export const exerciseService = {
  getExercises: () => api.get('/exercises'),
  getExercise: (id: string) => api.get(`/exercises/${id}`),
  getNextLesson: () => api.get('/exercises/next'),
  saveExercise: (data: any) => api.post('/exercises', data),
  updateExercise: (id: string, data: any) => api.put(`/exercises/${id}`, data),
  saveProgress: (data: { exerciseId: string; score: number }) => api.post('/exercises/progress', data),
};

export default api;