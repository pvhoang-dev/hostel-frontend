import api from "./axios";

export const storageService = {
  getStorages: async (params = {}) => {
    const response = await api.get("/storages", { params });
    return response.data;
  },

  getStorage: async (id) => {
    const response = await api.get(`/storages/${id}`);
    return response.data;
  },

  createStorage: async (storageData) => {
    const response = await api.post("/storages", storageData);
    return response.data;
  },

  updateStorage: async (id, storageData) => {
    const response = await api.put(`/storages/${id}`, storageData);
    return response.data;
  },

  deleteStorage: async (id) => {
    const response = await api.delete(`/storages/${id}`);
    return response.data;
  },
};
