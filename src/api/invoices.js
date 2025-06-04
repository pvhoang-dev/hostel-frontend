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

  createPayosPayment: async (invoiceIds) => {
    const response = await api.post(`/payment/create-link-payment`, {
      invoice_ids: invoiceIds,
    });
    return response.data;
  },
  
  verifyPayment: async (paymentData) => {
    // Ensure we have the required data
    if (!paymentData.orderCode || !paymentData.invoice_ids || !Array.isArray(paymentData.invoice_ids)) {
      return {
        success: false,
        message: "Thiếu thông tin cần thiết để xác thực thanh toán"
      };
    }
    
    // Send request to backend
    try {
      const response = await api.post(`/payment/receive-hook`, paymentData);
      return response.data;
    } catch (error) {
      console.error("Error verifying payment:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi khi xác thực thanh toán"
      };
    }
  }
};
