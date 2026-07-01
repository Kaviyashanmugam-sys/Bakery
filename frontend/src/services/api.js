import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Attach the stored JWT to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("bakery_admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401 (expired/invalid token)
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("bakery_admin_token");
      localStorage.removeItem("bakery_admin_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
