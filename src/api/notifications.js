import api from "./axios";

export const notificationService = {
  getNotifications: async (params = {}) => {
    const response = await api.get("/notifications", { params });
    return response.data;
  },

  getNotificationsAll: async (params = {}) => {
    const finalParams = { ...params, viewAll: true };
    const response = await api.get("/notifications", { params: finalParams });
    return response.data;
  },

  getNotification: async (id) => {
    const response = await api.get(`/notifications/${id}`);
    return response.data;
  },

  markAllAsRead: async (params = {}) => {
    const response = await api.post("/notifications/mark-all-as-read", params);
    return response.data;
  },

  createNotification: async (data) => {
    const response = await api.post("/notifications", data);
    return response.data;
  },

  updateNotification: async (id, data) => {
    const response = await api.put(`/notifications/${id}`, data);
    return response.data;
  },

  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
};
