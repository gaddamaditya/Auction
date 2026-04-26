import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
  console.warn(
    "VITE_API_URL is not set. Add it to Frontend/.env — e.g. VITE_API_URL=http://localhost:5000"
  );
}

const api = axios.create({
  baseURL: baseURL || "/",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auction_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
