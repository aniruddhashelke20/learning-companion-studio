import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5050/api' });
api.interceptors.request.use((config) => { const token = localStorage.getItem('learnlog_token'); if (token) config.headers.Authorization = `Bearer ${token}`; return config; });
export default api;
export const track = (eventName, details = {}) => api.post('/events', { eventName, ...details }).catch(() => {});
