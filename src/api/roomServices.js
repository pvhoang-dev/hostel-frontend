import api from "./axios";

export const roomServiceService = {
  getRoomServices: async (params = {}) => {
    const response = await api.get("/room-services", { params });
    return response.data;
  },

  getRoomService: async (id) => {
    const response = await api.get(`/room-services/${id}`);
    return response.data;
  },

  createRoomService: async (roomServiceData) => {
    const response = await api.post("/room-services", roomServiceData);
    return response.data;
  },

  updateRoomService: async (id, roomServiceData) => {
    const response = await api.put(`/room-services/${id}`, roomServiceData);
    return response.data;
  },

  deleteRoomService: async (id) => {
    const response = await api.delete(`/room-services/${id}`);
    return response.data;
  },
};
