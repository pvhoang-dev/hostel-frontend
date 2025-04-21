import api from "./axios";

export const paymentMethodService = {
  getPaymentMethods: async (params = {}) => {
    const response = await api.get("/payment-methods", { params });
    return response.data;
  },

  getPaymentMethod: async (id) => {
    const response = await api.get(`/payment-methods/${id}`);
    return response.data;
  },

  createPaymentMethod: async (paymentMethodData) => {
    const response = await api.post("/payment-methods", paymentMethodData);
    return response.data;
  },

  updatePaymentMethod: async (id, paymentMethodData) => {
    const response = await api.put(`/payment-methods/${id}`, paymentMethodData);
    return response.data;
  },

  deletePaymentMethod: async (id) => {
    const response = await api.delete(`/payment-methods/${id}`);
    return response.data;
  },
};
