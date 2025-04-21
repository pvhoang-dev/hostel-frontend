import api from "./axios";

export const contractService = {
  getContracts: async (params = {}) => {
    const response = await api.get("/contracts", { params });
    return response.data;
  },

  getContract: async (id) => {
    const response = await api.get(`/contracts/${id}`);
    return response.data;
  },

  createContract: async (contractData) => {
    const response = await api.post("/contracts", contractData);
    return response.data;
  },

  updateContract: async (id, contractData) => {
    const response = await api.put(`/contracts/${id}`, contractData);
    return response.data;
  },

  deleteContract: async (id) => {
    const response = await api.delete(`/contracts/${id}`);
    return response.data;
  },
}; 