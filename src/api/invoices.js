import api from "./axios";

export const invoiceService = {
  getInvoices: async (params = {}) => {
    const response = await api.get("/invoices", { params });
    return response.data;
  },

  getInvoice: async (id) => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  createInvoice: async (invoiceData) => {
    const response = await api.post("/invoices", invoiceData);
    return response.data;
  },

  updateInvoice: async (id, invoiceData) => {
    const response = await api.put(`/invoices/${id}`, invoiceData);
    return response.data;
  },

  deleteInvoice: async (id) => {
    const response = await api.delete(`/invoices/${id}`);
    return response.data;
  },

  updatePaymentStatus: async (id, paymentData) => {
    const response = await api.post(`/invoices/${id}/update-payment`, paymentData);
    return response.data;
  },

  createPayosPayment: async (invoiceIds, paymentData) => {
    const response = await api.post(`/payment/create-link-payment`, {
      invoice_ids: invoiceIds,
      ...paymentData
    });
    return response.data;
  },
  
  verifyPayment: async (paymentData) => {
    const response = await api.post(`/payment/receive-hook`, paymentData);
    return response.data;
  }
};
