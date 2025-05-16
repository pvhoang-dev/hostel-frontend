import api from "./axios";

export const authService = {
  login: async (username, password) => {
    const response = await api.post("/login", { username, password });
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/logout");
    return response.data;
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },
};
