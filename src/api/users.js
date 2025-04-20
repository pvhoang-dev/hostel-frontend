import api from "./axios";

export const userService = {
  getUsers: async (params = {}) => {
    const response = await api.get("/users", { params });
    return response.data;
  },

  getUser: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post("/users", userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  changePassword: async (id, passwordData) => {
    const response = await api.post(
      `/users/${id}/change-password`,
      passwordData
    );
    return response.data;
  },
};
