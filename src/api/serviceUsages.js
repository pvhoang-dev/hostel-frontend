import api from "./axios";

export const serviceUsageService = {
  getServiceUsages: async (params = {}) => {
    const response = await api.get("/room-service-usages", { params });
    return response.data;
  },

  getServiceUsage: async (id) => {
    const response = await api.get(`/room-service-usages/${id}`);
    return response.data;
  },

  createServiceUsage: async (serviceUsageData) => {
    const response = await api.post("/room-service-usages", serviceUsageData);
    return response.data;
  },

  updateServiceUsage: async (id, serviceUsageData) => {
    const response = await api.put(
      `/room-service-usages/${id}`,
      serviceUsageData
    );
    return response.data;
  },

  deleteServiceUsage: async (id) => {
    const response = await api.delete(`/room-service-usages/${id}`);
    return response.data;
  },
};
