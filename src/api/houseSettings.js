import api from "./axios";

export const houseSettingService = {
  getHouseSettings: async (params = {}) => {
    const response = await api.get("/house-settings", { params });
    return response.data;
  },

  getHouseSetting: async (id) => {
    const response = await api.get(`/house-settings/${id}`);
    return response.data;
  },

  createHouseSetting: async (houseSettingData) => {
    const response = await api.post("/house-settings", houseSettingData);
    return response.data;
  },

  updateHouseSetting: async (id, houseSettingData) => {
    const response = await api.put(`/house-settings/${id}`, houseSettingData);
    return response.data;
  },

  deleteHouseSetting: async (id) => {
    const response = await api.delete(`/house-settings/${id}`);
    return response.data;
  },
};
