import axios from 'axios';
let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';
if (baseUrl && !baseUrl.endsWith('/api')) {
  baseUrl = baseUrl.endsWith('/') ? `${baseUrl}api` : `${baseUrl}/api`;
}
const api = axios.create({ baseURL: baseUrl });
api.interceptors.request.use((config) => { const token = localStorage.getItem('learnlog_token'); if (token) config.headers.Authorization = `Bearer ${token}`; return config; });
export default api;
export const track = (eventName, details = {}) => api.post('/events', { eventName, ...details }).catch(() => {});
