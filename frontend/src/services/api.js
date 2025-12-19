import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "https://lendenclub-2.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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

export const userAPI = {
  getProfile: () => api.get("/user/profile"),

  updateProfile: (profileData) => api.put("/user/profile", profileData),

  changePassword: (currentPassword, newPassword) =>
    api.put("/user/change-password", { currentPassword, newPassword }),
};

export default api;
