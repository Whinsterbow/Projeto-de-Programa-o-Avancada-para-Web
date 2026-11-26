
import axios from "axios";

export const TOKEN_KEY = "biblioteca_token";
export const USUARIO_KEY = "biblioteca_usuario";

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000",

  headers: {
    "Content-Type": "application/json",
  },

  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (
      error.response?.status === 401 &&
      error.config?.headers?.Authorization &&
      error.config?.url !== "/usuarios/login"
    ) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USUARIO_KEY);

      window.dispatchEvent(
        new Event("biblioteca:logout")
      );
    }

    return Promise.reject(error);
  }
);

export default api;
