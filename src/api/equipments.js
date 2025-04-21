import api from "./axios";

export const equipmentService = {
    getEquipments: async (params = {}) => {
        const response = await api.get("/equipments", { params });
        return response.data;
    },

    getEquipment: async (id) => {
        const response = await api.get(`/equipments/${id}`);
        return response.data;
    },

    createEquipment: async (equipmentData) => {
        const response = await api.post("/equipments", equipmentData);
        return response.data;
    },

    updateEquipment: async (id, equipmentData) => {
        const response = await api.put(`/equipments/${id}`, equipmentData);
        return response.data;
    },

    deleteEquipment: async (id) => {
        const response = await api.delete(`/equipments/${id}`);
        return response.data;
    },
};