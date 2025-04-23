import api from "./axios";

export const serviceUsageService = {
  getServiceUsages: async (params) => {
    const response = await api.get("/room-service-usages", { params });
    return response.data;
  },

  getServiceUsage: async (id) => {
    const response = await api.get(`/room-service-usages/${id}`);
    return response.data;
  },

  createServiceUsage: async (data) => {
    const response = await api.post("/room-service-usages", data);
    return response.data;
  },

  updateServiceUsage: async (id, data) => {
    const response = await api.put(`/room-service-usages/${id}`, data);
    return response.data;
  },

  deleteServiceUsage: async (id) => {
    const response = await api.delete(`/room-service-usages/${id}`);
    return response.data;
  },
};
