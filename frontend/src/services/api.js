import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost/project/warung-adjie/backend/index.php?route=";

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user?.access_token;
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
  } catch {
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const BACKEND_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('index.php?route=', '') : "http://localhost/project/warung-adjie/backend/";

export default BASE_URL;
export { api };