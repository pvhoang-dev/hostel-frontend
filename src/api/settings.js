import api from "./axios";

export const settingService = {
  getSettings: async (params = {}) => {
    const response = await api.get("/system-settings", { params });
    return response.data;
  },

  getSetting: async (id) => {
    const response = await api.get(`/system-settings/${id}`);
    return response.data;
  },

  createSetting: async (settingData) => {
    const response = await api.post("/system-settings", settingData);
    return response.data;
  },

  updateSetting: async (id, settingData) => {
    const response = await api.put(`/system-settings/${id}`, settingData);
    return response.data;
  },

  deleteSetting: async (id) => {
    const response = await api.delete(`/system-settings/${id}`);
    return response.data;
  },
};
