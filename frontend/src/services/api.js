import axios from "axios";

const API_URL = "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  register: (username, password) =>
    api.post("/auth/register", { username, password }),

  login: (username, password) =>
    api.post("/auth/login", { username, password }),
};

export const transactionAPI = {
  transfer: (receiverId, amount) =>
    api.post("/transaction/transfer", { receiverId, amount }),

  getTransactions: () => api.get("/transaction/transactions"),

  getBalance: () => api.get("/transaction/balance"),
};

export default api;
