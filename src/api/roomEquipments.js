import api from "./axios";

export const roomEquipmentService = {
  getRoomEquipments: async (params = {}) => {
    const response = await api.get("/room-equipments", { params });
    return response.data;
  },

  getRoomEquipment: async (id) => {
    const response = await api.get(`/room-equipments/${id}`);
    return response.data;
  },

  createRoomEquipment: async (roomEquipmentData) => {
    const response = await api.post("/room-equipments", roomEquipmentData);
    return response.data;
  },

  updateRoomEquipment: async (id, roomEquipmentData) => {
    const response = await api.put(`/room-equipments/${id}`, roomEquipmentData);
    return response.data;
  },

  deleteRoomEquipment: async (id) => {
    const response = await api.delete(`/room-equipments/${id}`);
    return response.data;
  },
};
