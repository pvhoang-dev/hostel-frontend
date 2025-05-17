import api from "./axios";

export const userService = {
  getUsers: async (params = {}) => {
    const response = await api.get("/users", { params });
    return response.data;
  },

  getUser: async (id, params = {}) => {
    const response = await api.get(`/users/${id}`, { params });
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
      `/users/change-password/${id}/`,
      passwordData
    );
    return response.data;
  },

  getManagersForTenant: async (tenantId) => {
    const response = await api.get(`/tenant/${tenantId}/managers`);
    return response.data;
  },

  getTenantsForManager: async (managerId) => {
    const response = await api.get(`/manager/${managerId}/tenants`);
    return response.data;
  },
};
