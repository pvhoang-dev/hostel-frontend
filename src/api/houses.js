import api from "./axios";

export const houseService = {
  getHouses: async (params = {}) => {
    const response = await api.get("/houses", { params });
    return response.data;
  },

  getHouse: async (id) => {
    const response = await api.get(`/houses/${id}`);
    return response.data;
  },

  createHouse: async (houseData) => {
    const response = await api.post("/houses", houseData);
    return response.data;
  },

  updateHouse: async (id, houseData) => {
    const response = await api.put(`/houses/${id}`, houseData);
    return response.data;
  },

  deleteHouse: async (id) => {
    const response = await api.delete(`/houses/${id}`);
    return response.data;
  },
}; 