import api from "./axios";

export const notificationService = {
  getNotifications: async (params = {}) => {
    const response = await api.get("/notifications", { params });
    return response.data;
  },

  getNotification: async (id) => {
    const response = await api.get(`/notifications/${id}`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.post("/notifications/mark-all-as-read");
    return response.data;
  },
};
