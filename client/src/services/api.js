import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser    = (data) => API.post('/auth/login', data);
export const getMe        = ()     => API.get('/auth/me');

export const createUrl    = (data)         => API.post('/urls', data);
export const getUserUrls  = (params)       => API.get('/urls', { params });
export const deleteUrl    = (id)           => API.delete(`/urls/${id}`);
export const toggleUrl    = (id)           => API.patch(`/urls/${id}/toggle`);

export const getDashboardStats = ()   => API.get('/analytics/dashboard');
export const getUrlAnalytics   = (id) => API.get(`/analytics/url/${id}`);

export const verifyLinkPassword = (code, password) => {
  API.post(`${import.meta.env.VITE_BASE_URL}/verify/${code}`, { password });
}